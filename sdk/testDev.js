// sdk/testDev.js
const HGJACManager = require('./HGJACManager.js');
const parseUtil = require("./ParseACRespData.js");
const CMDID = require("./DevCmdID.js");
const stringUtil = require('../utils/stringUtil.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    writeRet:"",
    writeData:"",
    decodeData:"",
    currentDev:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var selDev = JSON.parse(options.SELDEV)
    this.setData({
      currentDev: selDev
     
    })
  },
 /*************************测试Demo ***************/
 onCLickINQ(){
  var that=this
  let paramData = "01XIMO     ";
  var devObj = {deviceId:this.data.currentDev.deviceId,param:paramData,cmdId:CMDID.INQ}
  this.setData({writeData:paramData,writeRet:""})
  HGJACManager.execuCmd(devObj,(result) => {
    console.log("execuCmd",result)
    var decodeData =""
    if(result.errCode ==0){
      decodeData = parseUtil.parseData(result.receiveData,CMDID.INQ)
    }
    that.setData({writeRet:result,decodeData:decodeData})
  })
},
onCLickINIT(){
  var that=this
  var initdata ={"ReqTime":"20211126145146","AcQrMkey":"38DC6B8C5304F56FD3ECA498418F3043","Md5Str":"381d1f3453f39b09","AcIcKey":"A95B7F0BB51445A262946A483F7E892D","AcDevId":"001","CoopId":"XIMO","DevSn":"XM_TEST01","AcQrBkey":"FBB9627C54371186D617BA1C8DF24E18","IcSecNo":"01","CustId":"3048000060","CmdId":"INIT"}
  // let paramData = "03XIMO     "+"09XM_TEST01"+"3048000060  "+"001"+"38DC6B8C5304F56FD3ECA498418F3043"+"FBB9627C54371186D617BA1C8DF24E18"+"A95B7F0BB51445A262946A483F7E892D"+"01"+"20211126145146";
//"03XIMO     1010009769193048000060  03434C2DA9CA88CEEA3D79FC9F7B43F607A2623B3EBC4191AD69C73A0E988F24C8AFBB61DFB483182897FE4931E272C93C70820211227162530cdaf665695bba2c6"

  let paramData =  "03XIMO     1010009769193048000060  03434C2DA9CA88CEEA3D79FC9F7B43F607A2623B3EBC4191AD69C73A0E988F24C8AFBB61DFB483182897FE4931E272C93C7082021122714580713dc5ddca024a0d1";
  // let paramData =  "013403XIMO     1010009769193048000060  0342623B3EBC4191AD69C73A0E988F24C8AFBB61DFB483182897FE4931E272C93C70820220216142624bc15c4944b95dfdb"
  var devObj = {deviceId:this.data.currentDev.deviceId,param:paramData,cmdId:CMDID.INIT}
  this.setData({writeData:paramData,writeRet:""})
  HGJACManager.execuCmd(devObj,(result) => {
    console.log("execuCmd",result)
    var decodeData =""
    if(result.errCode ==0){
      decodeData = parseUtil.parseData(result.receiveData,CMDID.INIT)
    }
  
    that.setData({writeRet:result,decodeData:decodeData})
  })
},
onCLickKEY(){
  var that=this
  // let paramData = "07"+"3048000060  "+"001"+"38DC6B8C5304F56FD3ECA498418F3043"+"FBB9627C54371186D617BA1C8DF24E18"+"A95B7F0BB51445A262946A483F7E892D"+"20211126145146";
  let paramData = "03XIMO     1010009769193048000060  03434C2DA9CA88CEEA3D79FC9F7B43F607A2623B3EBC4191AD69C73A0E988F24C8AFBB61DFB483182897FE4931E272C93C70820211227151622fec40d7bef1bcd6b";
  var devObj = {deviceId:this.data.currentDev.deviceId,param:paramData,cmdId:CMDID.KEY}
  this.setData({writeData:paramData,writeRet:""})
  HGJACManager.execuCmd(devObj,(result) => {
    console.log("execuCmd",result)
    var decodeData =""
    if(result.errCode ==0){
      decodeData = parseUtil.parseData(result.receiveData,CMDID.KEY)
    }
    that.setData({writeRet:result,decodeData:decodeData})
  })

},
onCLickCLOCK(){
  //this.downData("05");
  var that=this
  var time =  stringUtil.formatTime(new Date(),"YMDhms")
  let paramData = "05XIMO     "+time;
  console.log("execuCmd",paramData)
  var devObj = {deviceId:this.data.currentDev.deviceId,param:paramData,cmdId:CMDID.CLOCK}
  this.setData({writeData:paramData,writeRet:""})
  HGJACManager.execuCmd(devObj,(result) => {
    console.log("execuCmd",result)
    var decodeData =""
    if(result.errCode ==0){
      decodeData = parseUtil.parseData(result.receiveData,CMDID.CLOCK)
    }
    that.setData({writeRet:result,decodeData:decodeData})
  })
},
onCLickBuild(){
  //this.downData("05"); "093048000060  001000801030406202112161754259d3639ba160999dd"
  var that=this
  let paramData = "093048000060  034001201020304050620211229101328ef9d6c9dbceb4d1f";
  var devObj = {deviceId:this.data.currentDev.deviceId,param:paramData,cmdId:CMDID.BUILD}
  this.setData({writeData:paramData,writeRet:""})
  HGJACManager.execuCmd(devObj,(result) => {
    console.log("execuCmd",result)
    var decodeData =""
    if(result.errCode ==0){
      decodeData = parseUtil.parseData(result.receiveData,CMDID.BUILD)
    }
    that.setData({writeRet:result,decodeData:decodeData})
  })
},
onCLickLOSS(){
  //this.downData("05");
  var that=this
  let paramData = "113048000060  008DEA36E8B202201201406370321f4f95c7cc8cb";
  var devObj = {deviceId:this.data.currentDev.deviceId,param:paramData,cmdId:CMDID.LOSS}
  this.setData({writeData:paramData,writeRet:""})
  HGJACManager.execuCmd(devObj,(result) => {
    console.log("execuCmd",result)
    var decodeData =""
    if(result.errCode ==0){
      decodeData = parseUtil.parseData(result.receiveData,CMDID.LOSS)
    }
    that.setData({writeRet:result,decodeData:decodeData})
  })
},
onCLickFIND(){
  //this.downData("05");
  var that=this
  let paramData = "133048000060  008DEA36E8B20220120140637a1afa157525b7ed8";
  var devObj = {deviceId:this.data.currentDev.deviceId,param:paramData,cmdId:CMDID.FIND}
  this.setData({writeData:paramData,writeRet:""})
  HGJACManager.execuCmd(devObj,(result) => {
    console.log("execuCmd",result)
    var decodeData =""
    if(result.errCode == 0){
      decodeData = parseUtil.parseData(result.receiveData,CMDID.FIND)
    }
    that.setData({writeRet:result,decodeData:decodeData})
  })
},

onCLickRecord(){
  //this.downData("05");
  var that=this
  let paramData = "153048000060  41101000020211214163505";
  // let paramData = "153048000060  6"+stringUtil.formatTime(new Date(this.data.currentDate),'MDh')+offset.substr(offset.length-4)+stringUtil.formatTime(new Date(),'YMDhms')
  var devObj = {deviceId:this.data.currentDev.deviceId,param:paramData,cmdId:CMDID.RECORD}
  this.setData({writeData:paramData,writeRet:""})
  this.queryRecord(0)
},
queryRecord(index){
  var that =this
  let offset = "0000"+index
  // let neDate = new Date()
  let paramData = "153048000060  6110100"+offset.substr(offset.length-4)+stringUtil.formatTime(new Date(),'YMDhms')
  // let paramData = "153048000060  41101000020211214163505";
  console.log("queryRecord",paramData)
  var devObj = {deviceId:this.data.currentDev.deviceId,param:paramData,cmdId:CMDID.RECORD}
  HGJACManager.execuCmd(devObj,(result)=>{
    var decodeData =""
    let temprecord=""
    if(result.errCode == 0){
      decodeData = parseUtil.parseData(result.receiveData,CMDID.RECORD)
      if(decodeData.code==0){
        let content = decodeData.content
        let isLeft = content.IsLeft
         temprecord = content.record
         console.log("queryRecord isLeft =",isLeft)
        if(isLeft =='Y'){
          let next = index+1
          setTimeout( function(){ that.queryRecord(next)},500)
         
        }
      }
    }
    
    that.setData({writeRet:result,decodeData:that.data.recordData+temprecord})
  })
  
},

/****************************************/
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