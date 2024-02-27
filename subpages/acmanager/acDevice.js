// subpages/acmanager/acDevice.js

let stringUtil = require("../../utils/stringUtil")
let dateUtil = require("../../utils/dateUtil")
let network = require("../../utils/network")
let api = require("../../const/api")
let storage = require("../../const/storage")
const DM_BLUETOOTH_SDK = require('../../sdk/HGJACManager.js');
const parseUtil = require("../../sdk/ParseACRespData.js");
const CMDID = require("../../sdk/DevCmdID.js");
Page({

  /**
   * 页面的初始数据
   * {name:'密钥验证',stat:"Y"},
   */
  data: {
    // stat 0 不需要更新 1 需要更新 2 正在更新中
    actData: [
      //   {
      //   name: '固件版本',
      //   value: "等待",
      //   stat: "1",
      //   cmdId:CMDID.INQ
      // }, 
      {
        name: '设备初始化',
        value: "等待初始化",
        stat: "1",
        cmdId: CMDID.INIT,
        loading: false
      }, {
        name: '时钟同步',
        value: "等待同步",
        stat: "1",
        cmdId: CMDID.CLOCK,
        loading: false
      }, {
        name: '楼号列表更新',
        value: "等待同步",
        stat: "1",
        cmdId: CMDID.BUILD,
        loading: false
      }, {
        name: '黑名单更新',
        value: "等待同步",
        stat: "1",
        cmdId: CMDID.LOSS,
        loading: false
      }
    ],
    upDateData: [
      //   {
      //   name: '固件版本',
      //   value: "",
      //   stat: "1",
      //   cmdId:CMDID.INQ
      // }, 
      {
        name: '密钥更新',
        value: "",
        stat: "1",
        cmdId: CMDID.KEY,
        loading: false
      }, {
        name: '时钟同步',
        value: "",
        stat: "0",
        cmdId: CMDID.CLOCK,
        loading: false
      }, {
        name: '楼号列表更新',
        value: "",
        stat: "1",
        cmdId: CMDID.BUILD,
        loading: false
      }, {
        name: '黑名单更新',
        value: "",
        stat: "1",
        cmdId: CMDID.LOSS,
        loading: false
      }
    ],
    currentDev: '',
    isActive: false,
    activing: false,
    actText: '设备未激活，请先进行激活操作',
    actBtnText: "激活", //激活中  已激活  激活失败
    acLoading: false,
    gloablVer: '',
    needUpdata: false,
    writeRet: "",
    writeData: "",
    openTag: "O", //O  打开页面，C 点击按钮
    devTime: '', //设备内置时间
    curTime: '', //连接设备时间
    devTimeOffset: '', //设备时间偏差
    conectStat: "1", // 1 正在连接 2 已连接，查询到设备信息 3 连接失败
    devUpdata: false,
    // interruptPro: false,
    upDataLoss: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var selDev = JSON.parse(options.SELDEV)
    // selDev.deviceId="7c:df:a1:a4:47:de"
    // var selDev = {DEVSN:"XM001",deviceId:"111222",location:"doorName",STAT:"I"}
    this.setData({
      currentDev: selDev,
      gloablVer: options.GLOBALDEVVER
    })
    if (options.GLOBALDEVVER) {
      this.compareVer(options.GLOBALDEVVER)
    }
    console.log("selDev:", selDev)
    // this.initDev()
    this.queryDeviceName('S')
    // this.reLoadStat("S")
    // this.downData(CMDID.INIT);
    // this.downData(CMDID.BUILD)
  },

  reLoadStat(tag) {
    if (this.data.currentDev.STAT == 'N') {
      var DEVSYNBM = this.data.currentDev.DEVSYNBM
      var tupdata = false;
      if (DEVSYNBM.length >= 3) {
        var bm1 = DEVSYNBM.charAt(0)
        var bm2 = DEVSYNBM.charAt(1)
        var bm3 = DEVSYNBM.charAt(2)
        if (bm1 == "1" || bm2 == "1" || bm3 == "1") {
          tupdata = true
        }

        this.data.upDateData[0].stat = bm3
        this.data.upDateData[2].stat = bm2
        this.data.upDateData[3].stat = bm1


        this.setData({
          upDateData: this.data.upDateData,
          needUpdata: tupdata
        })

        // this.setLoading(2,this.data.upDateData)
      }
      if (tag == "S") {
        if(this.data.needUpdata){
          this.setData({needUpdata:false})
        }
        this.connectedDev()
        
      }

    }
  },

  onTapRecordList() {
    var that = this
    wx.navigateTo({
      url: './acRecordList?SELDEV=' + JSON.stringify(that.data.currentDev),
    })
  },
  setActiveText(loading, activing, acText, actBText) {

    var active = {
      acLoading: loading,
      activing: activing,
      actText: acText,
      actBtnText: actBText,
    }
    this.setData(active)
  },
  onTapActive() {
    this.setActiveText(true, true, "正在激活...", "激活中")
    this.data.openTag = "C"
    // var that = this
    this.connectedDev() //let deviceId = deviceObj.deviceId;

  },
  setLoadingByCmdId(cmdID) {
    let index = 0
    switch (cmdID) {
      case CMDID.KEY:
        index = 0
        break;
      case CMDID.CLOCK:
        index = 1
        break;
      case CMDID.BUILD:
        index = 2
        break;
      case CMDID.LOSS:
      case CMDID.FIND:
        index = 3
        break;
    }
    this.setLoading(index)
  },
  setLoading(curIndex) {
    var data = []
    if (this.data.currentDev.STAT == "I") {
      data = this.data.actData
    } else if (this.data.currentDev.STAT == "N") {

      data = this.data.upDateData
    }
    for (var x = 0; x < data.length; x++) {
      if (data[x].loading) {
        data[x].loading = false
      }
    }
    if (curIndex != -1) {
      data[curIndex].loading = true
      data[curIndex].value = ""
    }

    if (this.data.currentDev.STAT == "I") {
      this.setData({
        actData: data
      })
    } else if (this.data.currentDev.STAT == "N") {
      this.setData({
        upDateData: data
      })
    }
  },

  connectedDev() {

    var deviceId = this.data.currentDev.deviceId;
    // that.getDevInfo();
    if (deviceId == undefined || deviceId == null || deviceId.length < 12) {
      this.scanDevices()
    } else {
      var deviceId = this.data.currentDev.deviceId.toUpperCase();
      this.connectDev(deviceId)

    }
  },
  connectDev() {
    this.getDevInfo();
  },
  ab2hex(buffer) {
    let hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2);
      }
    )
    return hexArr.join('');
  },
  // 扫描设备
  scanDevices: function () {
    var that = this
    wx.showLoading({
      title: '正在扫描中',
    });
    DM_BLUETOOTH_SDK.scanDevices((result) => {
      wx.hideLoading();
      if (result.errCode === 0) {
        if (result.data != null && result.data.length > 0) {
          let curretDevSN = that.data.currentDev.DEVSN
          for (let i = 0; i < result.data.length; i++) {
            if (curretDevSN == result.data[i].name) {
              that.data.currentDev.deviceId = result.data[i].deviceId
              that.connectDev(result.data[i].deviceId)
            }
          }
        }
      }

    });
  },
  /**
   * 获取非敏感信息
   */
  getDevInfo() {
    //  CmdId = INQ  CoopId
    let coopId = this.data.currentDev.COOPID + "         "
    let paramData = CMDID.INQ + coopId.substr(0, 9);
    var that = this
    var devObj = {
      deviceId: this.data.currentDev.deviceId,
      param: paramData,
      cmdId: CMDID.INQ,
      devsn: this.data.currentDev.DEVSN
    }
    DM_BLUETOOTH_SDK.execuCmd(devObj, (result) => {
      console.log("execuCmd  getDevInfo：", result)
      var decodeData = ""
      if (result.errCode == 0) {
        decodeData = parseUtil.parseData(result.receiveData, CMDID.INQ)
        if (decodeData.code == 0) {
          let content = decodeData.content
          console.log("execuCmd  getDevInfo：", content)
          if (content.RespCode == "000") {
            let devSn = content.devSn
            if (devSn == that.data.currentDev.DEVSN) {
              if (this.data.openTag == "C") {
                that.initDev()
              }else{
                var DEVSYNBM = that.data.currentDev.DEVSYNBM
               
                if (DEVSYNBM.length >= 3) {
                  var bm1 = DEVSYNBM.charAt(0)
                  var bm2 = DEVSYNBM.charAt(1)
                  var bm3 = DEVSYNBM.charAt(2)
                  if (bm1 == "1" || bm2 == "1" || bm3 == "1") {
                    that.setData({
                      needUpdata: true
                    })
                  }
              }
            }
            } else {
              wx.showModal({
                title: '提示',
                content: '设备SN号不匹配！',
                showCancel: false
              })
              that.setData({
                needUpdata: false
              })
            }
            // that.compareVer(content.ver);


            let connTime = stringUtil.formatTime(new Date(), 'Y-M-D h:m:s')

            let cDevTime = content.DevTime
            let timeOffset = 0
            if (cDevTime.length == 14) {
              cDevTime = content.DevTime.substr(0, 4) + "-" + content.DevTime.substr(4, 2) + "-" + content.DevTime.substr(6, 2) + " " + content.DevTime.substr(8, 2) + ":" + content.DevTime.substr(10, 2) + ":" + content.DevTime.substr(12, 2)
              let devDate = dateUtil.parseDate(cDevTime)
              console.log("devDate", devDate)
              timeOffset = Math.abs(devDate.getTime() - new Date().getTime());

            }

            if (timeOffset > 5 * 60 * 1000) {
              that.data.upDateData[1].stat = '1'
            } else {
              that.data.upDateData[1].stat = '0'
            }
            var upData = {
              devTime: cDevTime,
              conectStat: '2',
              curTime: connTime,
              upDateData: that.data.upDateData
            }
            that.setData(upData)

          }
        } else {
          wx.showToast({
            title: "Error：" + content.code,
            icon: "error"
          })
          that.setData({
            conectStat: '3'
          })
        }
      } else {
        wx.showToast({
          title: "获取信息失败：" + result.errCode,
          icon: "none"
        })
        that.setData({
          conectStat: '3'
        })
      }


    })

  },

  //设备数据初始化
  initDev() {
    // this.updateTime()
    this.setLoading(0)
    this.downData(CMDID.INIT)

  },
  updataBitmap(cmdId) {
    var that = this
    var seq = "1"
    switch (cmdId) {
      case CMDID.BUILD:
        seq = "2";
        break;
      case CMDID.LOSS:
        seq = "1";
        break;
      case CMDID.FIND:
        seq = "1";
        break;
      case CMDID.KEY:
        seq = "3";
        break;
    }
    var dataParam = {
      "DEVSYNSEQ": seq,
      "ACDEVID": this.data.currentDev.ACDEVID,
      "DEVSN": this.data.currentDev.DEVSN,
    }
    console.log("updataBitmap", dataParam)
    network.RequestMQ.request({
      url: api.acInit,
      method: "POST",
      data: {
        "CMDID": "INITUPD",
        "DATA": JSON.stringify(dataParam)
      },
      success: function (a) {
        console.log("downData", a)
        if (a.data.RESPCODE == "000") {
          if (cmdId == CMDID.KEY) {
            that.setNetErrorData(cmdId, "更新成功", "0")
            that.updateTime()
          } else if (cmdId == CMDID.BUILD) {
            that.setNetErrorData(cmdId, "更新成功", "0")
            that.updateLossName()
          } else {
            that.setNetErrorData(cmdId, "更新成功", "0")
            that.setLoading(-1)
            wx.showToast({
              title: '同步完成',
            })
          }
        } else {
          that.setNetErrorData(cmdId, "同步失败", "1")
        }
      },
      fail: function (a) {
        that.setNetErrorData(cmdId, "下载失败", "1")
      },
      complete: function (a) {
        console.log("downData param", this.data)
      }
    })
  },
  /**
   * 
   * @param {type} type "03" 初始化  “07” 下载密钥 "INITUPD"  更新数据 05 时钟同步 BUILD 楼号列表 LOSS/ FIND 挂失解挂
   */
  downData(type) {

    var that = this;
    // console.log(that.data.selectArea.areaId)
    var data = {}
    if (type == CMDID.INIT || type == CMDID.KEY || type == "INITUPD" || type == CMDID.CLOCK) {
      data = {
        "DEVSN": this.data.currentDev.DEVSN,
        "ACDEVID": this.data.currentDev.ACDEVID
      }
    } else if (type == CMDID.BUILD || type == CMDID.LOSS || type == CMDID.FIND) {
      data = {
        "ACDEVID": this.data.currentDev.ACDEVID
      }
    }
    network.RequestMQ.request({
      url: api.acInit,
      method: "POST",
      data: {
        "CMDID": type,
        "DATA": JSON.stringify(data)
      },
      success: function (a) {
        console.log("downData", a)
        if (a.data.RESPCODE == "000") {
          let initParam = a.data.DATA
          setTimeout(function () {
            that.installDataToDEV(type, initParam), 300
          })
        } else {
          that.setNetErrorData(type, "下载失败", "1")


        }
      },
      fail: function (a) {
        that.setNetErrorData(type, "下载失败", "1")

      },
      complete: function (a) {
        console.log("downData param", this.data)
      }
    })
  },
  setNetErrorData(type, msg, stat) {
    switch (type) {
      case CMDID.INIT:
        this.data.actData[0].stat = stat
        this.data.actData[0].value = msg
        if (stat == "1") {
          // this.setData({actBtnText:"激活失败",activing:false})
          this.setActiveText(false, false, "激活失败", "激活")
        } else if (stat == '0') {
          // this.setData({actBtnText:"同步数据",activing:true})
          this.setActiveText(false, true, "同步数据中。。。", "激活")
        }
        break;
      case CMDID.KEY:
        this.data.upDateData[0].stat = stat
        this.data.upDateData[0].value = msg
        break;

      case CMDID.CLOCK:
        if (this.data.currentDev.STAT == 'I') {
          this.data.actData[1].stat = stat
          this.data.actData[1].value = msg
          if (stat == "1") {
            // this.setData({actBtnText:"同步失败",activing:true})
            this.setActiveText(false, true, "同步失败", "激活")
          }
        } else if (this.data.currentDev.STAT == 'N') {
          this.data.upDateData[1].stat = stat
          this.data.upDateData[1].value = msg
        }

        break;
      case CMDID.BUILD:
        if (this.data.currentDev.STAT == 'I') {
          this.data.actData[2].stat = stat
          this.data.actData[2].value = msg
          if (stat == "1") {
            this.setActiveText(false, true, "同步失败", "激活")
          }
        } else if (this.data.currentDev.STAT == 'N') {
          this.data.upDateData[2].stat = stat
          this.data.upDateData[2].value = msg
        }

        // this.downData("LOSS")
        break;
      case CMDID.LOSS:
        if (this.data.currentDev.STAT == 'I') {
          this.data.actData[3].stat = stat
          this.data.actData[3].value = msg
          if (stat == "1") {
            this.setActiveText(false, true, "同步失败", "激活")
          }
        } else if (this.data.currentDev.STAT == 'N') {
          this.data.upDateData[3].stat = stat
          this.data.upDateData[3].value = msg
        }
        break;
      case CMDID.FIND:
        if (this.data.currentDev.STAT == 'I') {
          this.data.actData[3].stat = stat
          this.data.actData[3].value = msg
          if (stat == "1") {
            this.setActiveText(false, true, "同步失败", "激活")
          } else if (stat == '0') {
            this.setActiveText(false, true, "同步成功", "激活")
          }
        } else if (this.data.currentDev.STAT == 'N') {
          this.data.upDateData[3].stat = stat
          this.data.upDateData[3].value = msg
        }
        this.queryDeviceName("R")
        break;
    }
    this.setData({
      actData: this.data.actData,
      upDateData: this.data.upDateData
    })
  },
  //检查固件版本 v1.0.0 devVer 设备版本号
  compareVer(devVer) {
    let curDevVer = devVer ? devVer : '0.0'
    if (devVer.charAt(0) == 'v' || devVer.charAt(0) == 'V') {
      curDevVer = devVer.substring(1)
    }
    let plus = ['0', '0', '0']
    let devVerArr = curDevVer.split(".").concat(plus)
    var curVer = this.data.currentDev.DEVVER ? this.data.currentDev.DEVVER : '0.0'

    let remoteVer = curVer.split(".").concat(plus)
    var needUpdata = false

    for (let x = 0; x < 3; x++) {
      if (parseInt(devVerArr[x]) < parseInt(remoteVer[x])) {
        needUpdata = true
        break
      }
    }

    this.setData({
      devUpdata: needUpdata
    })
    // this.data.actData[0].value=devVer
    // this.data.upDateData[0].value=devVer

    if (needUpdata) {
      // this.data.actData[0].stat="0"
      //固件更新
      this.updateFirmware()
    } else {
      // this.data.actData[0].stat="1"
      console.log("compareVer no update")
      if (this.data.openTag == "C") {
        this.initDev()
      }

    }
    // this.setData({
    //   actData:this.data.actData,
    //   upDateData: this.data.upDateData
    // })
  },
  onTapItem(e) {
    let item = e.currentTarget.dataset.bitem;
    console.log("onTapItem", item)

    if (item.stat == "1") {
      this.setLoadingByCmdId(item.cmdId)
      this.downData(item.cmdId)
      this.setData({
        needUpdata: false
      })
    }
  },

  updateFirmware() {
    var that = this
    console.log("compareVer updateFirmware")
    wx.showModal({
      title: '提示',
      content: '您的设备需要更新固件',
      confirmText: '去更新',
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: './acFirmware?GLOBALDEVVER=' + that.data.gloablVer,
          })
        } else if (res.cancel) {
          that.downKey()
          console.log('用户点击取消')
        }
      }
    })



  },

  //时钟同步 'Y', 'M', 'D', 'h', 'm', 's'
  updateTime() {
    this.setLoading(1)
    this.downData(CMDID.CLOCK)



  },
  //密钥下载  初始化完成后不需要做，特殊情况调用
  downKey() {
    // let isNeed = this.data.currentDev.DEVSYNBM.charAt(2)
    // if(isNeed=='0'){ //不需更新
    //   this.updateTime()  
    // }else{
    this.setLoading(0)
    this.downData(CMDID.KEY)
    // }
  },
  installDataToDEV(type, data) {
    var that = this
    switch (type) {
      case CMDID.INIT:
        var devObj = {
          deviceId: this.data.currentDev.deviceId,
          param: data,
          cmdId: CMDID.INIT,
          devsn: that.data.currentDev.DEVSN
        }
        setTimeout(function () {
          DM_BLUETOOTH_SDK.execuCmd(devObj, (result) => {
            console.log("execuCmd", result)
            var decodeData = ""
            if (result.errCode == 0) {
              decodeData = parseUtil.parseData(result.receiveData, CMDID.INIT)
              console.log("execuCmd INIT ", decodeData)
              if (decodeData.code == 0) {
                let content = decodeData.content
                if (content.RespCode == "000") {
                  if (that.data.currentDev.STAT == "I")
                    that.downData("INITUPD")
                } else {
                  that.setNetErrorData(CMDID.INIT, "初始化失败", "1")
                  // that.setData({actBtnText:"激活失败",activing:false})
                }
              } else {
                that.setNetErrorData(CMDID.INIT, "初始化失败", "1")
                // that.setData({actBtnText:"激活失败",activing:false})
              }
            }else{
              that.setNetErrorData(CMDID.INIT, "初始化失败", "1")
              wx.showToast({
                title: '初始化失败:'+result.errCode,
                icon:'none'
              })
            }
          })
        }, 500)
        break;
      case CMDID.KEY:
        var devObj = {
          deviceId: this.data.currentDev.deviceId,
          param: data,
          cmdId: CMDID.KEY,
          devsn: that.data.currentDev.DEVSN
        }
        // setTimeout( function(){ 
        DM_BLUETOOTH_SDK.execuCmd(devObj, (result) => {
          console.log("execuCmd", result)
          var decodeData = ""
          if (result.errCode == 0) {
            decodeData = parseUtil.parseData(result.receiveData, CMDID.KEY)
            console.log("execuCmd KEY ", decodeData)
            if (decodeData.code == 0) {
              let content = decodeData.content
              if (content.RespCode == "000") {
                // if(that.data.currentDev.STAT=="I")
                that.updataBitmap(CMDID.KEY)
              } else {
                that.setNetErrorData(CMDID.KEY, "密钥更新失败", "1")
              }
            } else {
              that.setNetErrorData(CMDID.KEY, "密钥更新失败", "1")
            }
          }else{
            that.setNetErrorData(CMDID.KEY, "密钥更新失败", "1")
            wx.showToast({
              title: '密钥更新失败:'+result.errCode,
              icon:'none'
            })
          }
        })
        break;
      case "INITUPD":
        that.setNetErrorData(CMDID.INIT, "初始化成功", "0")
        that.updateTime()
        that.setData({
          actBtnText: "同步中"
        })
        break;
      case CMDID.CLOCK:
        let initParam = ""
        let tempData = JSON.parse(data);
        let cropId = tempData.CoopId
        let coopLen = cropId.length
        for (let x = 0; x < 9 - coopLen; x++) {
          cropId = cropId + " "
        }
        initParam = CMDID.CLOCK + cropId + tempData.DateTime;

        var devObj = {
          deviceId: this.data.currentDev.deviceId,
          param: initParam,
          cmdId: CMDID.CLOCK,
          devsn: this.data.currentDev.DEVSN
        }
        setTimeout(function () {
          DM_BLUETOOTH_SDK.execuCmd(devObj, (result) => {
            console.log("execuCmd", result)
            var decodeData = ""
            if (result.errCode == 0) {
              decodeData = parseUtil.parseData(result.receiveData, CMDID.CLOCK)
              if (decodeData.code == 0) {
                let content = decodeData.content
                if (content.RespCode == "000") {
                  that.setNetErrorData(CMDID.CLOCK, "同步成功", "0")

                  // if(that.data.currentDev.STAT=="I")
                  that.updateBuilding()
                }
              } else {

                that.setNetErrorData(CMDID.CLOCK, "同步失败", "1")
              }
            } else {
              that.setNetErrorData(CMDID.CLOCK, "同步失败", "1")
             
              wx.showToast({
                title: '同步失败:'+result.errCode,
                icon:'none'
              })
            }

          })
        }, 500)

        break;
      case CMDID.BUILD:
        if (data == null) {
          that.setNetErrorData(CMDID.BUILD, "无需更新", "0")
          // if(that.data.currentDev.STAT=="I")
          that.updateLossName()
        } else {
          var devObj = {
            deviceId: this.data.currentDev.deviceId,
            param: data,
            cmdId: CMDID.BUILD,
            devsn: this.data.currentDev.DEVSN
          }
          setTimeout(function () {
            DM_BLUETOOTH_SDK.execuCmd(devObj, (result) => {
              console.log("execuCmd", result)
              var decodeData = ""
              if (result.errCode == 0) {
                decodeData = parseUtil.parseData(result.receiveData, CMDID.BUILD)
                if (decodeData.code == 0) {
                  let content = decodeData.content
                  if (content.RespCode == "000") {
                    that.setNetErrorData(CMDID.BUILD, "更新成功", "0")
                    // if(that.data.currentDev.STAT=="I")
                    //更新位图
                    that.updataBitmap(CMDID.BUILD)
                  }
                } else {
                  that.setNetErrorData(CMDID.BUILD, "更新失败", "1")
                }
              }else{
                that.setNetErrorData(CMDID.BUILD, "楼号更新失败", "1")
             
                wx.showToast({
                  title: '楼号更新失败:'+result.errCode,
                  icon:'none'
                })
              }
            })
          }, 500)
        }

        // this.downData("LOSS")
        break;
      case CMDID.LOSS:
        let lossData = JSON.parse(data)
        if (lossData == null || lossData.length == 0) {
          // that.setNetErrorData(CMDID.LOSS,"无需更新","0")
          that.data.upDataLoss = false
          that.updateFindName()
        } else {
          let index = 0
          let count = lossData.length
          that.data.upDataLoss = true
          that.writeLossFindData2DEV(index, count, lossData, CMDID.LOSS)
        }


        break;
      case CMDID.FIND:
        let findData = JSON.parse(data)

        if (findData == null || findData.length == 0) {
          that.setNetErrorData(CMDID.FIND, "无需更新", "0")
          that.setLoading(-1)
          if (that.data.upDataLoss) {
            that.updataBitmap(CMDID.FIND)
          }

        } else {
          let index = 0
          let count = findData.length
          that.writeLossFindData2DEV(index, count, findData, CMDID.FIND)
        }

        break;
    }
  },
  writeLossFindData2DEV(index, count, data, cmdId) {
    console.log("writeLossFindData2DEV i= ", index)
    console.log("writeLossFindData2DEV c= ", count)

    var that = this
    var devObj = {
      deviceId: that.data.currentDev.deviceId,
      param: data[index],
      cmdId: cmdId,
      devsn: that.data.currentDev.DEVSN
    }
    setTimeout(function () {
      DM_BLUETOOTH_SDK.execuCmd(devObj, (result) => {
        console.log("execuCmd", result)
        var decodeData = ""
        if (result.errCode == 0) {
          decodeData = parseUtil.parseData(result.receiveData, cmdId)
          if (decodeData.code == 0) {
            let content = decodeData.content
            if (content.RespCode == "000") {
              index++
              if (index < count) {
                that.writeLossFindData2DEV(index, count, data, cmdId)
              } else if (index == count) {
                console.log("writeLossFindData2DEV i= c ", cmdId)

                if (cmdId == CMDID.LOSS) {
                  that.updateFindName()
                } else {
                  that.updataBitmap(CMDID.FIND)
                  // wx.showToast({
                  //   title: '初始化完成',
                  //   icon:'success'
                  // })
                }

              }
            } else {
              that.setNetErrorData(cmdId, "更新失败", "1")
            }
          } else {
            that.setNetErrorData(cmdId, "更新失败", "1")
          }
        }else{
          that.setNetErrorData(cmdId, "更新失败", "1")
             
          wx.showToast({
            title: '更新失败 cmdId:'+cmdId+" errCode:"+result.errCode,
            icon:'none'
          })
        }
      })
    }, 500)
  },
  //楼号列表更新
  updateBuilding() {
    console.log("updateBuilding")
    this.setLoading(2)
    if (this.data.currentDev.STAT == 'I') {

      this.downData(CMDID.BUILD)
    } else {
      // this.setLoading(2)
      let isNeed = this.data.currentDev.DEVSYNBM.charAt(1)
      if (isNeed == '0') { //不需更新
        this.updateLossName()
      } else {
        this.downData(CMDID.BUILD)
      }
    }

  },
  //黑名单更新
  updateLossName() {
    console.log("updateLossName")
    if (this.data.currentDev.STAT == 'I') {
      this.setLoading(3)
      this.downData(CMDID.LOSS)
    } else {
      let isNeed = this.data.currentDev.DEVSYNBM.charAt(0)
      if (isNeed == '0') { //不需更新
        // 流程结束
        this.setLoading(-1)
        this.queryDeviceName("R")
      } else {
        this.setLoading(3)
        this.downData(CMDID.LOSS)
      }
    }
  },
  //黑名单更新
  updateFindName() {
    console.log("updateFindName")
    // this.setLoading(3)
    this.downData(CMDID.FIND)
  },
  onTapUpdata() {
    this.data.openTag = "C"
    var step = -1
    for (var i = 0; i < this.data.upDateData.length; i++) {
      var item = this.data.upDateData[i]
      if (item.stat == "1") {
        step = i
        break;
      }
    }
    this.setData({
      needUpdata: false
    })
    switch (step) {
      // case 0:
      //   this.updateFirmware()
      //   break;
      case 0:
        this.downKey();
        break;
      case 1:
        this.updateTime();
        break;
      case 2:
        this.updateBuilding();
        break;
      case 3:
        this.updateLossName()
        break;
    }

    // this.downData("LOSS")
  },
  onTapConnect() {
    if (this.data.conectStat == "3") {
      this.connectDev()
    }
  },
  queryDeviceName(TAG) {
    var that = this

    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    network.RequestMQ.request({
      url: api.queryAcDevSn,
      method: "POST",
      data: {
        "CUSTID": custId,
        "STAT": '',
        "DEVSNS": that.data.currentDev.DEVSN
      },
      success: function (a) {

        console.log("queryAcDevSn s ", a)
        let searchDevs = a.data.ACDEVSNDTO
        if (searchDevs && searchDevs.length > 0) {

          that.setData({
            currentDev: searchDevs[0]
          })
          that.reLoadStat(TAG)
        } else {
          wx.showModal({
            title: '提示',
            content: '设备SN号无记录！',
            showCancel: false,
            success (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1,
                })
              } }
          })
        }

      },
      fail: function (a) {
        console.log("scanDevicesArray fail")
        wx.showModal({
          title: '提示',
          content: '设备SN号无记录！',
          showCancel: false,
          success (res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1,
              })
            } }
        })
      },
      complete: function (a) {
        console.log("queryAcDevSn param", this.data)
      }
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("acDevice onUnload")
    DM_BLUETOOTH_SDK.closedDev()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})