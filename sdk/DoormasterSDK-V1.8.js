/**
 * 1. 获取本机蓝牙适配器状态 wx.getBluetoothAdapterState
 * 2. 初始化蓝牙适配器 wx.openBluetoothAdapter()
 * 3. 启动蓝牙发现 wx.wx.startBluetoothDevicesDiscovery()
 * 4. 获取扫描到的所有设备 wx.getBluetoothDevices()
 * 
 * 
 * 参数：
 * @callback function 回调函数，用于接收返回值
 * 
 * 返回值：
 * ret:{isBluetoothAvailable:true, isBluetoothSearching:true, scanList:[]}
 * isBluetoothAvailable boolean 蓝牙适配器状态，true表示初始化蓝牙适配器成功
 * isBluetoothSearching boolean 蓝牙搜索状态，true表示开启蓝牙发现成功
 * scanList array 搜索的设备列表
 */
var startTime = null;

function scanDevices(callback) {
	let systemInfo = wx.getSystemInfoSync();
	let platform = systemInfo.platform.toLowerCase();
	doormasterSDKLog.scan("当前平台", platform);
	startTime = new Date().getTime();
	doormasterSDKLog.scanTimeStart();
	if (typeof callback != "function") {
		doormasterSDKLog.scan("扫描回调", "参数回调不是一个函数");
		doormasterSDKLog.scanTimeEnd(startTime);
		return;
	};
	//scanList格式如下：
	//[{RSSI:-xx, advertisServiceUUIDs:[], deviceId:'', name:''},{...}]
	//注意：Android系统的deviceId是设备的mac地址，iOS系统的deviceId是设备的UUID
	var ret = {
		isBluetoothAvailable: false,
		isBluetoothSearching: false,
		scanList: [],
	};

	/**
	 * 获取蓝牙适配器状态
	 * 
	 */
	wx.getBluetoothAdapterState({
		success: function (res) {
			// console.log("---getBluetoothAdapterState--success:", res)
			ret.isBluetoothAvailable = res.available;
			ret.isBluetoothSearching = res.discovering;
		},
		fail: function (res) {
			// console.log("---getBluetoothAdapterState--fail:", res)
			// console.log("扫描结果=====", res);
			ret.errCode = 10;
			ret.errMsg = "获取蓝牙适配器失败";
		},
		complete: function (res) {
			/**
			 * 初始化蓝牙
			 */
			if (!ret.isBluetoothAvailable) {
				wx.openBluetoothAdapter({
					success: function (res) {
						// console.log("---openBluetoothAdapter--success:", res);
						ret.isBluetoothAvailable = true;
						startBluetoothDiscoveryAndScanDevice(ret, callback);
					},
					fail: function (res) {
						// console.log("---openBluetoothAdapter--fail:", res);
						// console.log("扫描结果=====", res);
						var systemInfo = wx.getSystemInfoSync();
						doormasterSDKLog.scan("当前手机系统", JSON.stringify(systemInfo.system));
						if (systemInfo.platform.indexOf("ios") > -1 && (stringParseInt(systemInfo.system) > 1200 || stringParseInt(systemInfo.system) > 120)) {
							ret.errCode = 11;
							// console.log("ios系统版本高于12");
							ret.errMsg = "请打开手机蓝牙，并打开设置-微信-允许“微信”访问蓝牙，再杀掉微信，重新打开微信";
						} else {
							ret.errCode = 12;
							ret.errMsg = "初始化蓝牙失败，请打开手机蓝牙，再杀掉微信，重新打开微信";
						}
						wx.showToast({
							title: ret.errMsg,
							icon: "none",
							duration: 5000
						});
						doormasterSDKLog.scan("初始化蓝牙失败", JSON.stringify(res));
						doormasterSDKLog.scanTimeEnd(startTime);
						callback(ret); //蓝牙初始化失败，直接返回，不进行后续搜索操作
						return;
					}
				});
			} else {
				startBluetoothDiscoveryAndScanDevice(ret, callback);
			}
		}
	});
}

function startBluetoothDiscoveryAndScanDevice(ret, callback) {
	/**
	 * 开启蓝牙发现
	 */
	if (!ret.isBluetoothSearching) {
		wx.startBluetoothDevicesDiscovery({
			services: [],
			allowDuplicatesKey: true,
			success: function (res) {
				// console.log("---startBluetoothDevicesDiscovery--success: ", res);
				ret.isBluetoothSearching = res.isDiscovering;
			},
			fail: function (res) {
				// console.log('---startBluetoothDevicesDiscovery--fail:', res);
				// 刷新页面后，开启蓝牙发现失败，暂时忽略10008错误
				// if (res.errCode != 10008) {
				//   callback(ret);
				// }
			},
			complete: function (res) {
				// console.log('---startBluetoothDevicesDiscovery--complete:', res)
				if (res.errCode === 0 || res.errCode === 10008) {
					scanBluetoothDevice(ret, callback);
				} else {
					// console.log("结果=====", res);
					ret.errCode = 13;
					ret.errMsg = "开始搜寻附近的蓝牙外围设备失败";
					doormasterSDKLog.scan("开始搜寻附近的蓝牙外围设备失败", JSON.stringify(res));
					doormasterSDKLog.scanTimeEnd(startTime);
					callback(ret);
				}
			}
		});
	} else {
		scanBluetoothDevice(ret, callback);
	}
}

function scanBluetoothDevice(ret, callback) {
	/**
	 * 获取扫描到的所有设备
	 * 3s时间扫描设备，如果改成1s，可以让蓝牙打开门禁时间在安卓上是4s以内，ios上是3s左右，这里我先设置3.5s
	 * 针对普通门禁，时间设置为1s，如果针对指纹锁，则设置为2.5s
	 */
	setTimeout(function () {
		wx.getBluetoothDevices({
			success: function (res) {
				//{devices: Array[11], errMsg: "getBluetoothDevices:ok"}
				// console.log('---getBluetoothDevices--success:', res);
				// console.log('---getBluetoothDevices--success:', res);
				doormasterSDKLog.scan("扫描到的所有设备列表", JSON.stringify(res.devices));
				var devArr = [];
				let systemInfo = wx.getSystemInfoSync();
				let platform = systemInfo.platform.toLowerCase();
				// doormasterSDKLog.scan("当前平台", platform);
				//根据广播UUID进行设备列表筛选
				for (var i = 0; i < res.devices.length; i++) {
					if (!('advertisServiceUUIDs' in res.devices[i])) {
						delete res.devices[i];
						continue;
					}
					for (let j = 0; j < res.devices[i].advertisServiceUUIDs.length; j++) {
						if (res.devices[i].advertisServiceUUIDs[j].toUpperCase().indexOf('FEF5') != -1) {
							let devSn = res.devices[i].name;
							if (platform.indexOf("ios") > -1) {
								// ios手机
								if (devSn.indexOf("1234567890") > -1) {
									devSn = res.devices[i].localName;
								}
							}
							if (devSn.indexOf("-") >= 0 && res.devices[i].RSSI != 127) {
								// RSSI值一般为负值，如果为127，则说明该设备出现了信号异常，要过滤掉，一般127出现在扫描情况之下 //devSn.split("-")[1]
								devArr.push({
									"deviceId": res.devices[i].deviceId,
									"name": devSn.split("-")[1],
									"RSSI": res.devices[i].RSSI
								});
							}
						}
					}
				}
				doormasterSDKLog.scan("根据广播UUID过滤后的设备列表", JSON.stringify(devArr));
				devArr.sort(function (a, b) {
					return b.RSSI - a.RSSI
				});

				// console.log("sort===", devArr);
				doormasterSDKLog.scan("排序后的设备列表", JSON.stringify(devArr));
				ret.errCode = 0;
				ret.scanList = devArr;
				doormasterSDKLog.scanTimeEnd(startTime);
				// callback(ret);
				callback({
					errCode: 0,
					scanList: devArr,
					data: devArr,
					errMsg: "完成"
				});
			},
			fail: function (res) {
				// console.log('---getBluetoothDevices--fail:', res);
				doormasterSDKLog.scan("扫描设备失败", JSON.stringify(res));
				doormasterSDKLog.scanTimeEnd(startTime);
				ret.errCode = 14;
				ret.errMsg = "当前蓝牙适配器不可用";
				callback(ret);
			},
			complete: function (res) {
				wx.stopBluetoothDevicesDiscovery({
					success(res) {
						// console.log(res);
						doormasterSDKLog.scan("关闭蓝牙搜索成功");
					}
				});
			}
		});
	}, 3500);
}

/**
 * 
 * 参数：
 * @deviceId String 参考scanDevices方法
 * @ekey String 发送到设备的开门指令
 * @callback function 回调函数，用于处理返回值
 * 
 * 返回值：
 * ret{errCode:'', errMsg:'', receiveData:''}
 * errCode: 错误码, 0表示开门成功
 * errMsg: 错误信息，Ok表示开门成功
 * receiveData: 接收的设备消息，消息内容为ac1c8表示开门成功
 */
function openDoor(deviceId, ekey, callback, devSn) {
	console.log("第一次开门, devSn: " + devSn);
	let time = 0;
	let timer = setInterval(() => {
		if (time < 0) {
			clearInterval(timer);
			timer = null;
		} else {
			time++;
			if (time === 15) {
				var ret = {
					errCode: 15,
					errMsg: "设备没响应，请重试",
					receiveData: ""
				};
				callback(ret);
			}
		}
	}, 1500);
	startTime = new Date().getTime();
	doormasterSDKLog.openTimeStart();
	var ret = {
		errCode: 15,
		errMsg: "设备没响应，开门失败",
		receiveData: ""
	};
	if (deviceId) {
		deviceId = deviceId.trim();
	}
	doormasterSDKLog.openDoor("deviceId", deviceId);
	doormasterSDKLog.openDoor("ekey", ekey);
	// console.log(`deviceId: ${deviceId}, ekey: ${ekey}`);
	if (typeof callback != "function") {
		ret.errCode = 16;
		ret.errMsg = "参数callback不是一个函数"; // parameter callback is not a function
		doormasterSDKLog.openDoor("开门失败", JSON.stringify(ret));
		doormasterSDKLog.openTimeEnd(startTime);
		time = -1;
		callback(ret);
		return;
	} else if (typeof deviceId != "string" || deviceId === '') {
		// 无设备id，重新搜索
		console.log("第二次搜索, devSn=" + devSn);
		scanDevices((res) => {
			if (res.errCode === 0) {
				let scanDevList = res.scanList;
				if (scanDevList.length === 0) {
					wx.showToast({
						"icon": "none",
						"title": "设备不在附近"
					});
					ret.errCode = 17;
					ret.errMsg = "设备不在附近"; // deviceId is not a string type or is empty
					time = -1;
					callback(ret);
				} else {
					for (let i = 0; i < scanDevList.length; i++) {
						if (scanDevList[i]["name"] === devSn) {
							deviceId = scanDevList[i]["deviceId"];
							break;
						}
					}
					if (!deviceId) {
						wx.showToast({
							"icon": "none",
							"title": "设备不在附近"
						});
						ret.errCode = 17;
						ret.errMsg = "设备不在附近"; // deviceId is not a string type or is empty
						time = -1;
						callback(ret);
					} else {
						console.log("重新开门, devSn: " + devSn);
						openDoor(deviceId, ekey, callback, devSn);
					}
				}
			}
		});
		// ret.errCode = 17;
		// ret.errMsg = "deviceId不能为空"; // deviceId is not a string type or is empty
		// doormasterSDKLog.openDoor("开门失败", JSON.stringify(ret));
		// doormasterSDKLog.openTimeEnd(startTime);
		// callback(ret);
		return;
	} else if (typeof ekey != "string" || ekey === '') {
		ret.errCode = 18;
		ret.errMsg = "ekey不能为空"; // ekey is not a string type or is empty
		doormasterSDKLog.openDoor("开门失败", JSON.stringify(ret));
		doormasterSDKLog.openTimeEnd(startTime);
		time = -1;
		callback(ret);
		return;
	}

	var serviceId = '';
	var characteristics = [];
	var notifyCharacter = '';
	var writeCharacter = '';
	var readCharacter = '';
	var deviceId = deviceId.toUpperCase();

	//BLE蓝牙连接
	wx.createBLEConnection({
		deviceId: deviceId,
		success: function (res) {
			/**
			 * 监听特定BLE设备连接状态变化
			 */
			wx.onBLEConnectionStateChange(function (res) {
				// 该方法回调中可以用于处理连接意外断开等异常情况
				// console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`);
				doormasterSDKLog.openDoor("设备连接状态", res.connected ? "已连接" : "已断开");

				if (ret.errCode == 15 && !res.connected) {
					doormasterSDKLog.openDoor("开门结果", JSON.stringify(ret));
					time = -1;
					callback(ret);
				}
			});

			// 获取指定设备的所有服务
			wx.getBLEDeviceServices({
				deviceId: deviceId,
				success: function (res) {

					// 筛选指定的服务UUID
					for (var i = 0; i < res.services.length; i++) {
						if (res.services[i].uuid.toLowerCase().indexOf('0886') != -1 ||
							res.services[i].uuid.toLowerCase().indexOf('ffe0') != -1) {
							serviceId = res.services[i].uuid;
							break;
						}
					}

					/**
					 * 获取指定服务下的所有特征值
					 */
					wx.getBLEDeviceCharacteristics({
						deviceId: deviceId,
						serviceId: serviceId,
						success: function (res) {
							// console.log('---getBLEDeviceCharacteristics--success:', res);
							for (var i = 0; i < res.characteristics.length; i++) {
								if (res.characteristics[i].uuid.toLowerCase().indexOf('878b') != -1) {
									notifyCharacter = res.characteristics[i].uuid;
								} else if (res.characteristics[i].uuid.toLowerCase().indexOf('878c') != -1) {
									writeCharacter = res.characteristics[i].uuid;
									readCharacter = res.characteristics[i].uuid;
								}
							}

							/**
							 * 启用低功耗蓝牙设备特征值变化时的 notify 功能
							 */
							wx.notifyBLECharacteristicValueChange({
								deviceId: deviceId,
								serviceId: serviceId,
								characteristicId: notifyCharacter,
								state: true,
								success: function (res) {
								}
							});

							// 向蓝牙设备发送20字节16进制数据，超过20字节数据，分包续传
							var data = ekey;
							var buffer_size = (data.length) > 20 ? (data.length) / 2 : 20;
							var buffer = new ArrayBuffer(buffer_size);
							var dataView = new DataView(buffer);
							for (let i = 0; i < (data.length) / 2; i++) {
								var subData = data.slice(2 * i, 2 * i + 2);
								dataView.setUint8(i, parseInt('0x' + subData));
							}

							/**
							 * 写入特征值下的二进制数据
							 * 
							 */
							setTimeout(function () {
								var count = 0;
								if (buffer_size == 20) {
									count = 1;
								} else {
									count = 2;
								}
								var send_data_array = new Array();
								for (let i = 0; i < count; i++) {
									var start_buffer = i * 20;
									var end_buffer = (i + 1) * 20;
									if (end_buffer > buffer.byteLength) {
										end_buffer = buffer.byteLength;
									}
									var buffer_content = buffer.slice(start_buffer, end_buffer);
									if (buffer_content.byteLength > 0) {
										send_data_array.push(buffer_content);
									}
								}

								var send_index = 0;
								send_bledata_device(send_index, send_data_array);

								function send_bledata_device(send_index, send_data_array) {
									doormasterSDKLog.openDoor("第" + (send_index + 1) + "次发送数据", "deviceId=" + deviceId + "，serviceId=" +
										serviceId + "，send_index=" + send_index);
									// console.log("----deviceId=" + deviceId + "--serviceId=" + serviceId + "--send_index=" + send_index);                 
									wx.writeBLECharacteristicValue({
										deviceId: deviceId,
										serviceId: serviceId,
										characteristicId: writeCharacter,
										value: send_data_array[send_index],
										success: function (res) {
											// console.log('---writeBLECharacteristicValue-success:', res);
											console.log('writeBLECharacteristicValue success', res.errMsg)
											doormasterSDKLog.openDoor("第" + (send_index + 1) + "次写入特征值成功");
											if (send_index < (send_data_array.length - 1)) {
												setTimeout(function () {
													send_index += 1;
													send_bledata_device(send_index, send_data_array);
												}, 250);
											} else {
												// ret.errCode = 0;
												// callback(ret);
												readDevice(ret,deviceId,serviceId,writeCharacter);
											}
										},
										fail: function (res) {
											ret.errCode = res.errCode; // 3
											ret.errMsg = res.errMsg || 'writeBLECharacteristicValue fail';
											// console.log('---writeBLECharacteristicValue-fail', ret);
											// doormasterSDKLog.openDoor("第" + (send_index + 1) + "次写入特征值失败", JSON.stringify(ret));
											// console.log("开门结果=====", res);
											doormasterSDKLog.openDoor("开门失败", JSON.stringify(ret));
											doormasterSDKLog.openTimeEnd(startTime);
											time = -1;
											callback(ret);
										},
									})
								}
							}, 500);

					
						},

						fail: function (res) {
							ret.errCode = res.errCode; // 2
							ret.errMsg = 'getBLEDeviceCharacteristics fail';
							doormasterSDKLog.openDoor("开门失败", JSON.stringify(ret));
							doormasterSDKLog.openTimeEnd(startTime);
							time = -1;
							callback(ret);
						},
					})
				},
			})
		},
		fail: function (res) {
			ret.errCode = res.errCode; // 1
			ret.errMsg = res.errMsg || 'createBLEConnection fail';
			// console.log("status: createBLEConnection fail");
			// console.log("创建蓝牙连接失败, res", res);
			doormasterSDKLog.openDoor("开门失败", JSON.stringify(ret));
			doormasterSDKLog.openTimeEnd(startTime);
			// console.log("开门结果=====", res);
			time = -1;
			callback(ret);
		},
	});
}

function readDevice(ret,deviceId,serviceId,notifyCharacter,cmdId,callback) {
	// 必须在这里的回调才能获取
	wx.onBLECharacteristicValueChange(function (res) {
		var value = ab2hex(res.value);
		// if (ekey.toLowerCase().indexOf(value) > -1 || value.length > 10) return;
		doormasterSDKLog.execuCmd("设备回给小程序的响应值", res.characteristicId);
		doormasterSDKLog.execuCmd("设备回给小程序的响应值", value);
		// value是写入特征值成功后，设备回给小程序的响应值，最后两位如果是c8，证明开门成功，否则开门失败，凡是能通过小程序蓝牙开门的，都是这样的，c8转成10进制就是200
		// if (value.indexOf("c8") > -1) {
		// 	ret.errCode = 0;
		// 	ret.errMsg = "写入成功："+cmdId+" "+value;
		// 	// if (devSn) {
		// 	// 	addBluetoothOpenDoorRecord(devSn, 19, "微信小程序蓝牙开门");
		// 	// }
		// } else {
		// 	ret.errCode = 100;
		// 	ret.errMsg = "写入数据失败:  "+cmdId;
		// }
		// doormasterSDKLog.openDoor("设备回给小程序的响应结果", JSON.stringify(ret));
		// doormasterSDKLog.openTimeEnd(startTime);
		// console.log("开门结果=====", res);
		// time = -1;0506303032303033333034383030303036302020303031303030
		ret.errCode = 0;
		ret.errMsg = "写入成功  cmdId ："+cmdId;
		if('0506'==value.substring(0,4)){
			var len =hex2Str(value.substring(4,12))
			ret.receiveDataLen=stringParseInt(len)*2
			ret.receiveData =value
		}else{
			var curLen = ret.receiveData.length
			if(curLen<ret.receiveDataLen+12){
				ret.receiveData =ret.receiveData+value
			}
		}
		if(ret.receiveData.length==ret.receiveDataLen+12){
			ret.errCode = 0;
			ret.errMsg = "写入成功  cmdId ："+cmdId;
			callback(ret);
			return
		}else{
			setTimeout(function () {
				if(ret.receiveData.length==ret.receiveDataLen+12){
					ret.errCode = 0;
					ret.errMsg = "写入成功  cmdId ："+cmdId;
					callback(ret);}else{
						ret.errCode = 130;
						ret.errMsg = "接收数据超时（10S），写入失败  cmdId ："+cmdId;
						callback(ret);
					}
			}, 10000);
		}
		// callback(ret);
	});

	// wx.readBLECharacteristicValue({
	// 	// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
	// 	deviceId: deviceId,
	// 	// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
	// 	serviceId: serviceId,
	// 	// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
	// 	characteristicId: notifyCharacter,
	// 	success(res) {
	// 		console.log('---readBLECharacteristicValue-success:', res);
	// 	}
	// });
}

function ab2hex(buffer) {
	let hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function (bit) {
			return ('00' + bit.toString(16)).slice(-2);
		}
	)
	return hexArr.join('');
}

// 根据参数来确定是升序还是降序
function sortBy(attr, rev) {
	// 第二个参数没有传递，默认升序排列
	if (rev == undefined) {
		rev = 1;
	} else {
		rev = rev ? 1 : -1;
	}
	return function (a, b) {
		var n1 = a[attr];
		var n2 = b[attr];
		if (n1 < n2) {
			return rev * -1;
		}
		if (n1 > n2) {
			return rev * 1;
		}
		return 0;
	}
}

function stringParseInt(string) {
	var stringNumber = string.replace(/[^0-9]+/g, '');
	if (stringNumber !== "") {
		return parseInt(stringNumber);
	}
	return NaN;
}

/**
 * 自定义Log对象
 */
function Log() {

}

Log.prototype = {
	scan: function (tag, content) {
		content = content === undefined ? "" : content;
		console.log("【SDK扫描】" + "[" + new Date().pattern("yyyy-MM-dd hh:mm:ss") + "]" + tag + (content ? (": " + content) : ""));
	},
	openDoor: function (tag, content) {
		content = content === undefined ? "" : content;
		console.log("【SDK开门】" + "[" + new Date().pattern("yyyy-MM-dd hh:mm:ss") + "]" + tag + (content ? (": " + content) : ""));
	},
	execuCmd: function (tag,cmdId, content) {
		content = content === undefined ? "" : content;
		console.log("【SDK执行任务】"+cmdId+"  [" + new Date().pattern("yyyy-MM-dd hh:mm:ss") + "]" + tag + (content ? (": " + content) : ""));
	},
	scanTimeStart: function () {
		console.log("【SDK扫描】" + "[" + new Date().pattern("yyyy-MM-dd hh:mm:ss") + "]" + " 开始");
	},
	scanTimeEnd: function (startTime) {
		var endDate = new Date();
		console.log("【SDK扫描】" + "[" + endDate.pattern("yyyy-MM-dd hh:mm:ss") + "]" + " 结束" + ", 耗时：" + (endDate.getTime() -
			startTime) + "ms");
	},
	openTimeStart: function () {
		console.log("【SDK】" + "[" + new Date().pattern("yyyy-MM-dd hh:mm:ss") + "]" + " 开始");
	},
	openTimeEnd: function (startTime) {
		var endDate = new Date();
		console.log("【SDK】" + "[" + endDate.pattern("yyyy-MM-dd hh:mm:ss") + "]" + " 结束" + ", 耗时：" + (endDate.getTime() -
			startTime) + "ms");
	}
};

let doormasterSDKLog = new Log();

/** * 对Date的扩展，将 Date 转化为指定格式的String * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
    可以用 1-2 个占位符 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) * eg: * (new
    Date()).pattern("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423      
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04      
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04      
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04      
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18      
 */
Date.prototype.pattern = function (formatStr) {
	var o = {
		"M+": this.getMonth() + 1, //月份         
		"d+": this.getDate(), //日         
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时         
		"H+": this.getHours(), //小时         
		"m+": this.getMinutes(), //分         
		"s+": this.getSeconds(), //秒         
		"q+": Math.floor((this.getMonth() + 3) / 3),
		/* 季度 */
		"S": this.getMilliseconds() //毫秒         
	};
	var week = {
		"0": "/u65e5",
		"1": "/u4e00",
		"2": "/u4e8c",
		"3": "/u4e09",
		"4": "/u56db",
		"5": "/u4e94",
		"6": "/u516d"
	};
	if (/(y+)/.test(formatStr)) {
		formatStr = formatStr.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if (/(E+)/.test(formatStr)) {
		formatStr = formatStr.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") :
			"") + week[this.getDay() + ""]);
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(formatStr)) {
			formatStr = formatStr.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return formatStr;
};
/*
// 添加蓝牙开门记录
function addBluetoothOpenDoorRecord(devSn, eventType, desc) {
	if (devSn === undefined) return;
	var loginInfo = uni.getStorageSync("loginInfo");
	var accessToken = loginInfo.accessToken;
	console.log("token", accessToken);
	if (accessToken === undefined) return;
	// 登录过
	var time = getCurrentTime();
	// var record = [{"devSn": devSn, "eventType": eventType, "desc": desc, "eventTime": time}];
	var platform = uni.getSystemInfoSync().platform.toLowerCase();
	var terminalOsType = platform.indexOf("ios") > -1 ? 2 : 1;
	// var record = [{
	// 		"devSn": "3759239441",
	// 		"eventType": 19,
	// 		"terminalApplyType": 2,
	// 		"terminalOsType": terminalOsType,
	// 		"eventTime": "2019-11-16 16:46:55"
	// 	},
	// 	{
	// 		"devSn": "3759239441",
	// 		"eventType": 19,
	// 		"terminalApplyType": 2,
	// 		"terminalOsType": terminalOsType,
	// 		"eventTime": "2019-11-16 16:46:55"
	// 	}
	// ];
	var record = [{
		"devSn": devSn,
		"eventType": eventType,
		"terminalApplyType": 2,
		"terminalOsType": terminalOsType,
		"eventTime": time
	}, ];
	uni.request({
		url: loginInfo.baseUrl + "/appBluetoothSdk/addEventLog?accessToken=" + accessToken,
		data: record,
		header: {
			// 'content-type': 'application/json; charset=UTF-8', 
			'content-type': 'application/json',
		},
		method: "POST",
		success: (res) => {
			console.log("添加蓝牙开门记录---", res);
			var data = res.data;
			if (data.code === 0) {
				console.log("添加蓝牙开门记录成功");
			} else {
				console.log("添加蓝牙开门记录失败, errCode=", data.code);
			}
		},
		fail: (err) => {
			console.log("添加蓝牙开门记录失败, fail=", err);
		}
	});
}
*/
// 获取当前时间 返回YYYY-MM-DD HH:MM:SS
function getCurrentTime() {
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();
	return [year, month, day].join('-') + ' ' + [hour, minute, second].join(':');
}

// 蓝牙sdk登录，上传蓝牙开门记录
function login(account, baseUrl, appId, appSecret) {
	console.log("开始蓝牙登录");
	var loginInfo = {
		"baseUrl": baseUrl,
		"appId": appId,
		"appSecret": appSecret
	};
	uni.setStorageSync("loginInfo", loginInfo);
	uni.request({
		url: baseUrl + "/appUserSdk/login",
		data: {
			"account": account,
			"appId": appId,
			"appSecret": appSecret,
			"accountType": 1
		},
		// header: {
		// 	'content-type': 'application/x-www-form-urlencoded', 
		// },
		// method: "POST",
		success: (res) => {
			console.log("蓝牙登录返回，res---", res);
			var data = res.data;
			if (data.code === 0) {
				loginInfo.accessToken = data.data.accessToken;
				uni.setStorageSync("loginInfo", loginInfo);
				console.log("蓝牙登录成功，loginInfo===", loginInfo);
			} else {
				uni.showToast({
					title: data.msg
				})
				console.log("蓝牙登录失败，code-", data.code);
			}

		},
		fail: (err) => {
			uni.showToast({
				title: err
			});
		}
	})
}



function execuCmd(cmdId, data, deviceId, callback) {
var time = -1;
	doormasterSDKLog.openTimeStart();
	var ret = {
		errCode: 115,
		errMsg: "execuCmd失败: "+cmdId,
		oriData:data,
		receiveData: "",
		receiveDataLen:-1
	};
	if (deviceId) {
		deviceId = deviceId.trim();
	}
	console.log(" execuCmd=" + data);

	doormasterSDKLog.execuCmd("deviceId", deviceId);
	doormasterSDKLog.execuCmd("data",cmdId, data);
	// console.log(`deviceId: ${deviceId}, ekey: ${ekey}`);
	if (typeof callback != "function") {
		ret.errCode = 16;
		ret.errMsg = "参数callback不是一个函数"; // parameter callback is not a function

		doormasterSDKLog.execuCmd("execuCmd失败",cmdId, data);

		doormasterSDKLog.openTimeEnd(startTime);
		time = -1;
		callback(ret);
		return;
	} else if (typeof deviceId != "string" || deviceId === '') {
		// 无设备id，重新搜索
		console.log("第二次搜索, devSn=" + devSn);
		scanDevices((res) => {
			if (res.errCode === 0) {
				let scanDevList = res.scanList;
				if (scanDevList.length === 0) {
					wx.showToast({
						"icon": "none",
						"title": "设备不在附近"
					});
					ret.errCode = 17;
					ret.errMsg = "设备不在附近"; // deviceId is not a string type or is empty
					time = -1;
					callback(ret);
				} else {
					for (let i = 0; i < scanDevList.length; i++) {
						if (scanDevList[i]["name"] === devSn) {
							deviceId = scanDevList[i]["deviceId"];
							break;
						}
					}
					if (!deviceId) {
						wx.showToast({
							"icon": "none",
							"title": "设备不在附近"
						});
						ret.errCode = 17;
						ret.errMsg = "设备不在附近"; // deviceId is not a string type or is empty
						time = -1;
						callback(ret);
					} else {
						console.log("devSn: " + devSn);
						execuCmd(cmdId, data, deviceId, callback)
					}
				}
			}
		});

		return;
	} else if (typeof data != "string" || data === '') {
		ret.errCode = 18;
		ret.errMsg = "data不能为空"; // ekey is not a string type or is empty
	
		doormasterSDKLog.execuCmd("execuCmd失败",cmdId, JSON.stringify(ret));
		doormasterSDKLog.openTimeEnd(startTime);
		time = -1;
		callback(ret);
		return;
	}

	var serviceId = '';
	var characteristics = [];
	var notifyCharacter = '';
	var writeCharacter = '';
	var readCharacter = '';
	var deviceId = deviceId.toUpperCase();
	console.log('---createBLEConnection--p data :', data);

	//BLE蓝牙连接
	wx.createBLEConnection({
		deviceId: deviceId,
		success: function (res) {
			/**
			 * 监听特定BLE设备连接状态变化
			 */
			// wx.onBLEConnectionStateChange(function (res) {
			// 	// 该方法回调中可以用于处理连接意外断开等异常情况
			// 	console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`);
			
			// 	doormasterSDKLog.execuCmd("execuCmd",cmdId, res.connected ? "已连接" : "已断开");

			// 	if ( !res.connected) {
			// 		// doormasterSDKLog.openDoor("开门结果", JSON.stringify(ret));
			// 		doormasterSDKLog.execuCmd("execuCmd结果",cmdId, JSON.stringify(ret));
				
			// 		time = -1;
			// 		ret.errCode = 119;
			// 		ret.errMsg = "连接断开  " +`device ${res.deviceId} state has changed, connected: ${res.connected}`;
					
			// 		callback(ret);
			// 	}
			// });
			// let serviceCode = getServiceCode(cmdId)
			// let characteristicsCode = ""
			console.log('---getBLEDeviceServices--p data :', data);
			// 获取指定设备的所有服务
			wx.getBLEDeviceServices({
				deviceId: deviceId,
				success: function (res) {

					// 筛选指定的服务UUID
					for (var i = 0; i < res.services.length; i++) {
						if (res.services[i].uuid.toLowerCase().indexOf("0886b765") != -1 ) {
							serviceId = res.services[i].uuid;
							break;
						}
					}
	/**
					 * 获取指定服务下的所有特征值
					 */
					console.log('---getBLEDeviceCharacteristics--p data :', data);
					var writData = data

					wx.getBLEDeviceCharacteristics({
						deviceId: deviceId,
						serviceId: serviceId,
						success: function (res) {
						console.log('---getBLEDeviceCharacteristics--success:', res);
							for (var i = 0; i < res.characteristics.length; i++) {
								if (res.characteristics[i].uuid.toLowerCase().indexOf('878b') != -1) {
									notifyCharacter = res.characteristics[i].uuid;
								} else if (res.characteristics[i].uuid.toLowerCase().indexOf('878c') != -1) {
									writeCharacter = res.characteristics[i].uuid;
									readCharacter = res.characteristics[i].uuid;
								}
							}

							/**
							 * 启用低功耗蓝牙设备特征值变化时的 notify 功能
							 */
							wx.notifyBLECharacteristicValueChange({
								deviceId: deviceId,
								serviceId: serviceId,
								characteristicId: notifyCharacter,
								state: true,
								success: function (res) {
								}
							});
							console.log('---getBLEDeviceCharacteristics--p writData :', writData);

							// 向蓝牙设备发送20字节16进制数据，超过20字节数据，分包续传
							var data = writData;
							console.log('---getBLEDeviceCharacteristics--l data:', data);

							var buffer_size = (data.length) > 20 ? 
							(Math.ceil((data.length) / 20) *20): 20;
							var buffer = new ArrayBuffer(buffer_size);
							var dataView = new DataView(buffer);
							for (let i = 0; i < (data.length) / 2; i++) {
								var subData = data.slice(2 * i, 2 * i + 2);
								dataView.setUint8(i, parseInt('0x' + subData));
							}

							/**
							 * 写入特征值下的二进制数据
							 * 
							 */
							setTimeout(function () {
								var count = 0;
								if (buffer_size == 20) {
									count = 1;
								} else {
									count = Math.ceil((data.length) / 20);
								}
								var send_data_array = new Array();
								for (let i = 0; i < count; i++) {
									var start_buffer = i * 20;
									var end_buffer = (i + 1) * 20;
									if (end_buffer > buffer.byteLength) {
										end_buffer = buffer.byteLength;
									}
									var buffer_content = buffer.slice(start_buffer, end_buffer);
									if (buffer_content.byteLength > 0) {
										send_data_array.push(buffer_content);
									}
								}

								var send_index = 0;
								send_bledata_device(send_index, send_data_array);

								function send_bledata_device(send_index, send_data_array) {
									// doormasterSDKLog.openDoor("第" + (send_index + 1) + "次发送数据", "deviceId=" + deviceId + "，serviceId=" +
									// 	serviceId + "，send_index=" + send_index);
										doormasterSDKLog.execuCmd("第" + (send_index + 1) + "次发送数据",cmdId, "deviceId=" + deviceId + "，serviceId=" +
										serviceId + "，send_index=" + send_index);

									// console.log("----deviceId=" + deviceId + "--serviceId=" + serviceId + "--send_index=" + send_index);                 
									wx.writeBLECharacteristicValue({
										deviceId: deviceId,
										serviceId: serviceId,
										characteristicId: writeCharacter,
										value: send_data_array[send_index],
										success: function (res) {
											// console.log('---writeBLECharacteristicValue-success:', res);
											doormasterSDKLog.execuCmd("",cmdId,"第" + (send_index + 1) + "次写入特征值成功");
											if (send_index < (send_data_array.length - 1)) {
												setTimeout(function () {
													send_index += 1;
													send_bledata_device(send_index, send_data_array);
												}, 250);
											} else {
												// ret.errCode = 0;
												// callback(ret);
												readDevice(ret,deviceId,serviceId,writeCharacter,cmdId,callback);
												return
											}
										},
										fail: function (res) {
											ret.errCode = res.errCode; // 3
											ret.errMsg = res.errMsg || 'writeBLECharacteristicValue fail'+"  cmdId:"+cmdId;
											
											doormasterSDKLog.execuCmd("写入失败",cmdId, JSON.stringify(ret));
											doormasterSDKLog.openTimeEnd(startTime);
											time = -1;
											callback(ret);
										},
									})
								}
							}, 500);
						}})
				}
			});
		},
		fail:function(error){
			doormasterSDKLog.execuCmd("execuCmd失败",cmdId, "连接失败");
			callback(ret)
		}
	});

}
/**
 * 
 * @param {传输数据} str 
 */
function str2Hex(str){
	let hexStr=""

	for(var i=0;i<str.length;i++){
		console.log("str2Hex  o: "+str[i]+"  r:"+str[i].charCodeAt(i).toString(16))

		if(hexStr==""){
			hexStr = str.charCodeAt(i).toString(16)
		}else{
			hexStr += str.charCodeAt(i).toString(16)
		}
	}
	// console.log("str2Hex  o: "+str+"  r:"+hexStr)
	return hexStr;
}
function hex2Str(hex){
	let hexArr = hex.split("")
	let str=""

	for(var i=0;i<hexArr.length/2;i++){
			let temp = "0x"+hexArr[i*2]+hexArr[i*2+1]
			let charValue = String.fromCharCode(temp);
			str += charValue
	}
	console.log("hex2Str  o: "+hex+"  r:"+str)
	return str;
}

// module.exports = {
//   scanDevices: scanDevices,
//   login: login,
//   openDoor: openDoor
// }
class DMBluetoothSDKServer {
	constructor() {

	}

	// 扫描设备
	scanDevices(callback) {
		scanDevices(callback);
	}

	// 开门
	// openDoor(deviceObj, callback) {
	// 	let deviceId = deviceObj.deviceId;
	// 	let ekey = deviceObj.ekey;
	// 	openDoor(deviceId, ekey, callback);
	// }

	//
	execuCmd( deviceObj, callback) {
		let deviceId = deviceObj.deviceId;
		let param = deviceObj.param;
		let cmdId = deviceObj.cmdId;
		 let paramLen = ("0000"+param.length)
		execuCmd(cmdId,	"0506"+str2Hex(paramLen.substring(paramLen.length-4) +param),deviceId,callback)

	}

	hex2Str(hex){
		return hex2Str(hex)}
	stringParseInt(string){return stringParseInt(string)}
	// // 登录
	// login(account, baseUrl, appId, appSecret) {
	// 	login(account, baseUrl, appId, appSecret);
	// }
}
module.exports = new DMBluetoothSDKServer();