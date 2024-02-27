const devConfig = require('./DevConfig.js');
var devStat = -1;
var isComplete = false;
var devId=''
class HGJACManager {
	constructor() {

	}

	// 扫描设备
	scanDevices(callback) {
		scanDevices(callback);
  }
  

	//执行指令
	execuCmd( deviceObj, callback) {
		let deviceId = deviceObj.deviceId;
		let param = deviceObj.param;
    let cmdId = deviceObj.cmdId;
    let devsn = deviceObj.devsn
     let paramLen = ("0000"+param.length)//长度  固定包头0506
     devId = deviceId
     execuCmd(cmdId,	"0506"+str2Hex(paramLen.substring(paramLen.length-4) +param),deviceId,devsn,callback)

  //    var timer = setInterval(function () {
  //      console.log("execuCmd:"+cmdId+"   devStat:"+devStat)
  //     if(devStat==-1){
  //       execuCmd(cmdId,	"0506"+str2Hex(paramLen.substring(paramLen.length-4) +param),deviceId,devsn,callback)
  //       clearInterval(timer); 
  //     }
      
  // }, 500);


  }
  getConnectStat(){
    return devStat;
  }

	hex2Str(hex){
		return hex2Str(hex)}
	stringParseInt(string){return stringParseInt(string)}
  str2Hex(str){
    return str2Hex(str)
  }

  closedDev( callback){
    if(devId!=''){
      wx.closeBLEConnection({
        deviceId: devId,
        success:callback
      })
    }
  
  }
}


/**
 * 
 * @param {传输数据} str 
 */
function str2Hex(str){
	let hexStr=""

	for(var i=0;i<str.length;i++){
		// console.log("str2Hex  o: "+str[i]+"  r:"+str[i].charCodeAt(i).toString(16))

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
function stringParseInt(string) {
	var stringNumber = string.replace(/[^0-9]+/g, '');
	if (stringNumber !== "") {
		return parseInt(stringNumber);
	}
	return NaN;
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
var startTime = null;
function execuCmd(cmdId, data, deviceId, devSn,callback) {
  var time = -1;
    doormasterSDKLog.execuTimeStart();
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
    // console.log(" execuCmd=" + data);
  
    doormasterSDKLog.execuCmd("deviceId", deviceId);
    doormasterSDKLog.execuCmd("data",cmdId, data);
    doormasterSDKLog.execuCmd("data len",cmdId, data.length);
    // console.log(`deviceId: ${deviceId}, ekey: ${ekey}`);
    if (typeof callback != "function") {
      ret.errCode = 16;
      ret.errMsg = "参数callback不是一个函数"; // parameter callback is not a function
  
      doormasterSDKLog.execuCmd("execuCmd失败",cmdId, data);
  
      doormasterSDKLog.execuTimeEnd(startTime);
      time = -1;
      callback(ret);
      return;
    } else if (typeof deviceId != "string" || deviceId === '') {
      // 无设备id，重新搜索
      console.log("第二次搜索, devSn=" );
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
              execuCmd(cmdId, data, deviceId, devSn,callback)
            }
          }
        }
      });
  
      return;
    } else if (typeof data != "string" || data === '') {
      ret.errCode = 18;
      ret.errMsg = "data不能为空"; // ekey is not a string type or is empty
    
      doormasterSDKLog.execuCmd("execuCmd失败",cmdId, JSON.stringify(ret));
      doormasterSDKLog.execuTimeEnd(startTime);
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
    // console.log('---createBLEConnection--p data :', data);
    var blueConfig = devConfig.devConfig("XIMO")
  
    //BLE蓝牙连接
    wx.createBLEConnection({
      deviceId: deviceId,
      success: function (res) {
        /**
         * 监听特定BLE设备连接状态变化
         */
        devStat=0
        isComplete=false
        wx.onBLEConnectionStateChange(function (res) {
        	// 该方法回调中可以用于处理连接意外断开等异常情况
        	console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`);
        
        	doormasterSDKLog.execuCmd("execuCmd",cmdId, res.connected ? "已连接" : "已断开");
  
        	if ( !res.connected) {
        		// doormasterSDKLog.openDoor("开门结果", JSON.stringify(ret));
        		doormasterSDKLog.execuCmd("execuCmd结果",cmdId, JSON.stringify(ret));
            devStat=-1
        		time = -1;
        		ret.errCode = 119;
            ret.errMsg = "连接断开  " +`device ${res.deviceId} state has changed, connected: ${res.connected}`;
            console.log("isComplete",isComplete)
            if(!isComplete&&cmdId=="15"){ //重连
              // setTimeout(function(){
              //   console.log("ReExecuCmd")
              //   execuCmd(cmdId, data, deviceId, devSn,callback)
              // },500)
              callback(ret);
              return;
            }

          
        	 
        	}
        });
        // let serviceCode = getServiceCode(cmdId)
        // let characteristicsCode = ""
        console.log('---getBLEDeviceServices--p data :', data);
        // 获取指定设备的所有服务
        wx.getBLEDeviceServices({
          deviceId: deviceId,
          success: function (res) {
           var serID =  blueConfig.ServiceUUIDS 
            // 筛选指定的服务UUID
            for (var i = 0; i < res.services.length; i++) {
              if (res.services[i].uuid.toLowerCase().indexOf(serID) != -1 ) {
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
              var nCharticID = blueConfig.notifyChartic
              var wCharticID = blueConfig.writeChartic
                for (var i = 0; i < res.characteristics.length; i++) {
                  if (res.characteristics[i].uuid.toLowerCase().indexOf(nCharticID) != -1) {
                    notifyCharacter = res.characteristics[i].uuid;
                  } else if (res.characteristics[i].uuid.toLowerCase().indexOf(wCharticID) != -1) {
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
               
                wx.setBLEMTU({
                  deviceId: deviceId,
                  mtu: devConfig.PLen+3,
                  success:function (res) {
                    console.log('---setBLEMTU-- succ:', res);
                  },
                  fail:function (res) {
                    console.log('---setBLEMTU-- fail:', res);
                  },
                })
                // 向蓝牙设备发送PLen字节16进制数据，超过PLen字节数据，分包续传
                var data = writData;
                console.log('---getBLEDeviceCharacteristics--l data:', data);
  
                var buffer_size = (data.length) > devConfig.PLen*2 ? 
                (Math.ceil((data.length) / (devConfig.PLen*2)) *devConfig.PLen): devConfig.PLen;
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
                  if (buffer_size == devConfig.PLen) {
                    count = 1;
                  } else {
                    count = Math.ceil((data.length) / (devConfig.PLen*2));
                  }
                  var send_data_array = new Array();
                  for (let i = 0; i < count; i++) {
                    var start_buffer = i * devConfig.PLen;
                    var end_buffer = (i + 1) * devConfig.PLen;
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
                          doormasterSDKLog.execuCmd("",cmdId,"写入特征值成功");
                          doormasterSDKLog.execuCmd("",cmdId,"开始接收返回数据。。。");

                          readDevice(ret,deviceId,serviceId,notifyCharacter,cmdId,callback);
                          return
                        }
                      },
                      fail: function (res) {
                        ret.errCode = res.errCode; // 3
                        ret.errMsg = res.errMsg || 'writeBLECharacteristicValue fail'+"  cmdId:"+cmdId;
                        
                        doormasterSDKLog.execuCmd("写入失败",cmdId, JSON.stringify(ret));
                        doormasterSDKLog.execuTimeEnd(startTime);
                        time = -1;
                        callback(ret);
                      },
                    })
                  }
                }, 300);
    //             setTimeout(function(){
    //               console.log('---readBLECharacteristicValue-');
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
    //             },3000)
              }})
          }
        });
      },
      fail:function(error){
        console.log('---createBLEConnection--error :', error);

        doormasterSDKLog.execuCmd("execuCmd失败",cmdId, "连接失败");
        callback(ret)
      }
    });
  
  }
  function readDevice(ret,deviceId,serviceId,notifyCharacter,cmdId,callback) {
    let completeReceive=false
    var dataLen = -1
    let startRecieve =false
    // 必须在这里的回调才能获取
    wx.onBLECharacteristicValueChange(function (res) {
      var value = ab2hex(res.value);
      // if (ekey.toLowerCase().indexOf(value) > -1 || value.length > 10) return;
      doormasterSDKLog.execuCmd("设备回给小程序的响应值", res.characteristicId);
      doormasterSDKLog.execuCmd("设备回给小程序的响应值", value);
      // value是写入特征值成功后，设备回给小程序的响应值，数据包以 0506 +8位长度 开头， 134  110
     
      doormasterSDKLog.execuCmd("readDevice",cmdId,  ret.receiveData+value);
      if(!startRecieve&&'0506'==value.substring(0,4)){
        var len =hex2Str(value.substring(4,12))
        dataLen=stringParseInt(len)*2
        ret.receiveData = value
        startRecieve = true
      }else{
        ret.receiveData = ret.receiveData+value
      }
      if(ret.receiveData.length==dataLen+12){
        ret.errCode = 0;
        ret.errMsg = "写入成功  cmdId ："+cmdId;
        completeReceive =true;
        doormasterSDKLog.execuCmd("readDevice",cmdId,  "*******全部收完*****");
        isComplete=true
        callback(ret); 
        
        wx.closeBLEConnection({
          deviceId: deviceId,
          success:function(res){
             devStat=-1
          }
        })
      }
    });
  
// wx.readBLECharacteristicValue({
//   characteristicId: notifyCharacter,
//   deviceId: deviceId,
//   serviceId: serviceId,
//   success (res) {

//     console.log('readBLECharacteristicValue:', res)
//   }
// })

    setTimeout(function () {
      if(!completeReceive){
          ret.errCode = 130;
          ret.errMsg = "接收数据超时（20S），cmdId ："+cmdId;
          callback(ret);
          isComplete=true
          wx.closeBLEConnection({
            deviceId: deviceId,
            success:function(res){
              
              devStat=-1
           }
          })
        }
    }, 20000); 


  
    // ret.errCode = 0;
    // ret.errMsg = "写入成功  cmdId ："+cmdId;
    // if('0506'==value.substring(0,4)){
    //   var len =hex2Str(value.substring(4,12))
    //   ret.receiveDataLen=stringParseInt(len)*2
    //   ret.receiveData =value
    // }else{
    //   var curLen = ret.receiveData.length
    //   if(curLen<ret.receiveDataLen+12){
    //     ret.receiveData =ret.receiveData+value
    //   }
    // }
    // if(ret.receiveData.length==ret.receiveDataLen+12){
    //   ret.errCode = 0;
    //   ret.errMsg = "写入成功  cmdId ："+cmdId;
    //   callback(ret);
    //   return
    // }else{
    //   setTimeout(function () {
    //     if(ret.receiveData.length==ret.receiveDataLen+12){
    //       ret.errCode = 0;
    //       ret.errMsg = "写入成功  cmdId ："+cmdId;
    //       callback(ret);}else{
    //         ret.errCode = 130;
    //         ret.errMsg = "接收数据超时（10S），写入失败  cmdId ："+cmdId;
    //         callback(ret);
    //       }
    //   }, 10000);
    // }

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
			console.log("---getBluetoothAdapterState--success:", res)
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
						console.log("---openBluetoothAdapter--success:", res);
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
            wx.showModal({
              title: '提示',
              content: ret.errMsg,
              showCancel: false,
           
            })
						// wx.showToast({
						// 	title: ,
						// 	icon: "none",
						// 	duration: 5000
						// });
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
				console.log("---startBluetoothDevicesDiscovery--success: ", res);
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
				console.log('---startBluetoothDevicesDiscovery--complete:', res)
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
				console.log('---getBluetoothDevices--success:', res);
				doormasterSDKLog.scan("扫描到的所有设备列表", JSON.stringify(res.devices));
				var devArr = [];
				let systemInfo = wx.getSystemInfoSync();
				let platform = systemInfo.platform.toLowerCase();
        // doormasterSDKLog.scan("当前平台", platform);
        let actUUIDS = devConfig.devConfig("XIMO").ScanUUIDs
				//根据广播UUID进行设备列表筛选
				for (var i = 0; i < res.devices.length; i++) {
					if (!('advertisServiceUUIDs' in res.devices[i])) {
						delete res.devices[i];
						continue;
					}
					for (let j = 0; j < res.devices[i].advertisServiceUUIDs.length; j++) {
            for(let x =0;x<actUUIDS.length;x++){
						if (res.devices[i].advertisServiceUUIDs[j].toUpperCase().indexOf(actUUIDS[x]) != -1) {
              doormasterSDKLog.scan("扫描到的所有设备列表", res.devices[i].name);

							let devSn = res.devices[i].name;
							if (platform.indexOf("ios") > -1) {
								// ios手机
								if (devSn.indexOf("1234567890") > -1) {
									devSn = res.devices[i].localName;
								}
							}
							if (devSn.indexOf("-") >= 0 && res.devices[i].RSSI != 127) {
                doormasterSDKLog.scan("根据广播UUID过滤后的设备列表", devSn);

								// RSSI值一般为负值，如果为127，则说明该设备出现了信号异常，要过滤掉，一般127出现在扫描情况之下 //devSn.split("-")[1]
								devArr.push({
									"deviceId": res.devices[i].deviceId,
									"name": devSn.split("-")[1],
									"RSSI": res.devices[i].RSSI
								});
              }
              break;
            }
            break;
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
 * 自定义Log对象
 */
function Log() {

}

Log.prototype = {
	scan: function (tag, content) {
		content = content === undefined ? "" : content;
		console.log("【SDK扫描】" + "[" + new Date().pattern("yyyy-MM-dd hh:mm:ss") + "]" + tag + (content ? (": " + content) : ""));
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
	execuTimeStart: function () {
		console.log("【SDK】" + "[" + new Date().pattern("yyyy-MM-dd hh:mm:ss") + "]" + " 开始");
	},
	execuTimeEnd: function (startTime) {
		var endDate = new Date();
		console.log("【SDK】" + "[" + endDate.pattern("yyyy-MM-dd hh:mm:ss") + "]" + " 结束" + ", 耗时：" + (endDate.getTime() -
			startTime) + "ms");
	}
};
let doormasterSDKLog = new Log();

module.exports = new HGJACManager();