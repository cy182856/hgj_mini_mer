// subpages/acmanager/acConnect.js
let network = require("../../utils/network")
let api = require("../../const/api")
let storage = require("../../const/storage")
const parseData  = require("./../../sdk/ParseACRespData.js")
const cmdID  = require("./../../sdk/DevCmdID.js")
const HGJACManager = require('../../sdk/HGJACManager.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scanDevicesArray: [],
    blutoothDevList: [],
    GLOBALDEVVER:"1.0"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
 
  },

  testData(){
    var that =this
    // that.data.blutoothDevList.push({DEVSN:"XM01",deviceId:"22222",location:"1号们",STAT:1,connected:false})
    // that.data.blutoothDevList.push({DEVSN:"XM02",deviceId:"22222",location:"2号们",STAT:1,connected:false})
    // that.data.blutoothDevList.push({DEVSN:"XM03",deviceId:"22222",location:"3号们",STAT:1,connected:false})
    // that.data.blutoothDevList.push({DEVSN:"XM04",deviceId:"22222",location:"4号们",STAT:1,connected:false})
    // that.data.blutoothDevList.push({DEVSN:"XM05",deviceId:"22222",location:"5号们",STAT:1,connected:false})
    // that.data.blutoothDevList.push({DEVSN:"XM06",deviceId:"22222",location:"6号们",STAT:1,connected:false})
    // that.data.blutoothDevList.push({DEVSN:"XM07",deviceId:"22222",location:"7号们",STAT:1,connected:false})
    // that.data.blutoothDevList.push({DEVSN:"XM08",deviceId:"22222",location:"7号们",STAT:1,connected:false})
    // that.data.blutoothDevList.push({DEVSN:"XM09",deviceId:"22222",location:"7号们",STAT:1,connected:false})
    // that.data.blutoothDevList.push({DEVSN:"XM010",deviceId:"22222",location:"2号门东边",STAT:1,connected:false})
    // that.data.blutoothDevList.push({DEVSN:"XM011",deviceId:"22222",location:"11号们",STAT:1,connected:false})

    // that.setData({
    //   blutoothDevList:that.dat a.blutoothDevList
    // }) 20-2-4=14 +20 +19 =53
    var value = "";
    var data =["0506303035343031202020202020202020202020","3120203130313030303030303030363676312e30","2e303230323131313237313532303330303030"]
 
    var data1 ="0506303737383135333034383030303036302020303735360000000000000000000216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b4e303030"
  var data2="0506303737383135333034383030303036302020303735360000000000000000000216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b02166e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249dea36e8b0216145249de145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b02a36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b0216145349dea36e8b4e303030"
   var ret = parseData.parseData(data1,cmdID.RECORD)
   console.log(ret)
//   var  ret = {
// 		errCode: 115,
// 		errMsg: "execuCmd失败: ",
// 		oriData:data,
// 		receiveData: "",
// 		receiveDataLen:-1
//   };
//   for(var i = 0;i<data.length;i++){
// var value = data[i]
// console.log("value.start: "+value)
//     if('0506'==value.substring(0,4)){
//       var len =HGJACManager.hex2Str(value.substring(4,12))
//       console.log("data.length: "+len)
// 			ret.receiveDataLen=HGJACManager.stringParseInt(len)*2
//       ret.receiveData =value
      
//       console.log("data.length: "+ret.receiveDataLen)
// 		}else{
// 			var curLen = ret.receiveData.length
// 			if(curLen<ret.receiveDataLen+12){
// 				ret.receiveData =ret.receiveData+value
// 			}
// 			ret.receiveData =ret.receiveData+value
// 		}
// 		if(ret.receiveData.length==ret.receiveDataLen+12){
// 			ret.errCode = 0;
// 			ret.errMsg = "写入成功  cmdId ：";
// 		console.log("SUCC",ret)
// 		}else{
// 			setTimeout(function () {
// 				if(ret.receiveData.length==ret.receiveDataLen+12){
// 					ret.errCode = 0;
// 					ret.errMsg = "写入成功  cmdId ：";
//           console.log("SUCC",ret);}else{
// 						ret.errCode = 130;
// 						ret.errMsg = "接收数据超时（10S），写入失败  cmdId ：";
// 						console.log("ERROR",ret)
// 					}
// 			}, 10000);
// 		}
  // }
},
 

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  //  this.testData()
   this.scanDevices()
  },
 
  onTapConnectDev(e) {
    console.log("onTapConnectDev", e)
    var selIndex = e.currentTarget.dataset.bindex
    var selDev = JSON.stringify(this.data.blutoothDevList[selIndex])
    var selItem = 'blutoothDevList[' + selIndex + '].connected';
    this.setData({
      [selItem]: true
    })
    wx.navigateTo({
      url: './acDevice?SELDEV=' + selDev+"&GLOBALDEVVER="+this.data.GLOBALDEVVER,
    })
    // wx.navigateTo({
    //   url: '../../sdk/testDev?SELDEV=' + selDev,
    // })
  },
  queryDeviceName() {
    var that = this
    // if(this.data.scanDevicesArray.length>0){
    var devsn = ""
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    this.data.scanDevicesArray.forEach(function(value,index,array){
      console.log("scanDevicesArray queryDeviceName() ",value)
      // that.data.blutoothDevList.push({name:value.name,deviceId:value.deviceId,location:"南门",stat:'I',connected:false})
      value.CUSTID=custId
      value.STAT='I'
      value.DEVSN=value.name
      value.COOPID="XIMO"
      value.ACDEVNAME ="未设置"
          if(devsn==""){
            devsn=value.name
          }else{
            devsn=devsn+"|"+value.name
          }
      　　　　
      　　});
    // devsn.push("XM_TEST01")
    // devsn.push("XM_TEST02")
    // devsn.push("XM_TEST03")
   // var devsn1 = "XM_TEST01|XM_TEST02|XM_TEST03"
    
    network.RequestMQ.request({
      url: api.queryAcDevSn,
      method: "POST",
      data: {
        "CUSTID": custId,
        "STAT": '',
        "DEVSNS": devsn
      },
      success: function (a) {
        console.log("queryAcDevSn s ")
        console.log("queryAcDevSn s ", a)
        let searchDevs  = a.data.ACDEVSNDTO
        that.data.GLOBALDEVVER = a.data.GLOBALDEVVER
        that.data.scanDevicesArray.forEach(function(value,index,array){
          console.log("scanDevicesArray  queryDeviceName ",value)

          let tempItem = value
          if(searchDevs&&searchDevs!=null&&searchDevs.length>0){
            for(let x=0;x<searchDevs.length;x++){
              if(searchDevs[x].DEVSN.indexOf(value.name)!=-1){
        
                tempItem = searchDevs[x]
                tempItem.deviceId=value.deviceId
                break;
              }
            }
          }

           that.data.blutoothDevList.push(tempItem)
          　　
          　}　);
          console.log("scanDevicesArray searchDevs",that.data.blutoothDevList)
      that.setData({
        blutoothDevList: that.data.blutoothDevList
      })
      },
      fail: function (a) {
      
        console.log("scanDevicesArray fail")
        that.data.scanDevicesArray.forEach(function(value,index,array){
          console.log("scanDevicesArray fail",value)
          let doorName="未知位置"
          let devStat ="I"
  
           that.data.blutoothDevList.push({DEVSN:value.name,deviceId:value.deviceId,location:doorName,STAT:devStat,connected:false})
          　　
          　}　);
      
      that.setData({
        blutoothDevList: that.data.blutoothDevList
      })
      console.log("queryAcDevSn ret ", that.data.blutoothDevLis)
      },
      complete: function (a) {
        console.log("queryAcDevSn param", this.data)

    
      }
    })

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

  },
  // 扫描设备
  scanDevices: function () {
    var that =this
    wx.showLoading({
      title: '正在扫描中',
    });
    HGJACManager.scanDevices((result) => {
      wx.hideLoading();
      let title = "";
      if (result.errCode === 0) {
        title = "扫描完成，有" + result.data.length + "台设备";
      } else {
        title = result.errMsg;
      }
      if(result.errCode==11||result.errCode==12){

      }else{
        wx.showToast({
          title: title,
          icon: "none"
        });
      }
  
      if (result.errCode === 0) {
        that.setData({
          scanDevicesArray: result.data,
          scanDevicesIndex: 0
        });
        if(result.data!=null&&result.data.length>0){
          that.queryDeviceName()
        }
        // that.data.scanDevicesArray.forEach(function(value,index,array){
        //   console.log("scanDevicesArray fail",value)
        //   let doorName="未知位置"
        //   let devStat ="I"
  
        //    that.data.blutoothDevList.push({DEVSN:value.name,deviceId:value.deviceId,location:doorName,STAT:devStat,connected:false})
        //   　　
        //   　}　);
      
      // that.setData({
      //   blutoothDevList: that.data.blutoothDevList
      // })
      }
      // this.queryDeviceName()
    });
  },

    
})