const stringUtil = require("../../utils/stringUtil");
let network = require("../../utils/network")
let api = require("../../const/api")
let storage = require("../../const/storage")
const DM_BLUETOOTH_SDK = require('../../sdk/HGJACManager.js');
const parseUtil = require("../../sdk/ParseACRespData.js");
const CMDID = require("../../sdk/DevCmdID.js");
const { tenThousandths2Percent } = require("../../utils/stringUtil");
const HGJACManager = require("../../sdk/HGJACManager.js");
// subpages/acmanager/acRecordList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTimePopup:false,
    upDiaShow:false,
    minHour: 0,
    maxHour: 23,
    minDate: new Date(2021, 10, 1).getTime(),
    maxDate: new Date().getTime(),
    currentDate: new Date().getTime(),
    showDate:new Date().getTime(),
    currentDateStr:"",
    filter(type, options) {
      if (type === 'minute') {
        return options.filter((option) => option % 10 === 0);
      }

      return options;
    },
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      }
      if (type === 'month') {
        return `${value}月`;
      }
      if (type === 'day') {
        return `${value}日`;
      }
      if (type === 'hour') {
        return `${value}时`;
      }
      if (type === 'minute') {
        return `${value}分`;
      }
      return value;
    },
    currentDev:'',
    recordData:'no data',
    devList:[],
    hourList:["不选","00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"],
    selectHour :"不选",
    startTime:'',
    showQueryBlock:true,
    querTime:'',
    queryCond:'',
    recordCount:0,
    upLoading:true,
    upRet:'导出中',
    OnceQueryTime: 0, //单个包查询次数，处理断开重连
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var selDev = JSON.parse(options.SELDEV)
    console.log("recordList",selDev)
      var curDate = new Date();
      let dataStr = stringUtil.formatTime(curDate,"Y-M-D")

      var newDate =  curDate.setMonth(curDate.getMonth()-12);
      // let showTime =new Date()
      //  let dataStr = showTime.getFullYear()+"-"+(showTime.getUTCMonth())+"-"+showTime.getUTCDate()+" "+showTime.getHours()+":"+(showTime.getMinutes()<10?"00":showTime.getMinutes())
      this.setData({
        minDate:newDate,
        currentDev:selDev,
        currentDateStr:dataStr
      })
      //  this.testParse()
      // this.sendRecordToSer()
  },
  onInputSelTime(event){
 
    // console.log(dataStr)
    // this.setData({
    //   currentDate:event.detail ,
  
    // });
  },
  onDateConfirm(event){
    console.log("onDateConfirm",event)
    let confirmTime =new Date(event.detail)
    let dataStr = stringUtil.formatTime(confirmTime,"Y-M-D")
     console.log(dataStr)
     this.setData({
       currentDate:event.detail ,
       currentDateStr:dataStr,
       showTimePopup :false
     });
    //  let paramData = "153048000060  41101000020211214163505";
    //  let paramData = "153048000060  6081316000020211222160902"
    // this. queryRecord(0)
  },
  onHourChange(e){
    let index = e.currentTarget.dataset.index;
    console.log("building: " + index)
    this.selectComponent('#hour').toggle();
   
    this.setData({
      selectHour: this.data.hourList[index],
     
     
    })
  },

  onQueryRecordList(e){
    // this.testParse()
    // wx.showLoading({
    //   title: '查询中。。。',
    // })
    this.data.startTime = new Date().getTime()

    let tquerTime =""
    if(this.data.selectHour=="不选"){
      tquerTime="4"+stringUtil.formatTime(new Date(this.data.currentDate),'MD')
    }else{
      tquerTime="6"+stringUtil.formatTime(new Date(this.data.currentDate),'MD')+this.data.selectHour
    }
    console.log(this.data.currentDate)
    this.setData({
      showQueryBlock:false,
      querTime:tquerTime,
      queryCond :stringUtil.formatTime(new Date(this.data.currentDate),'Y-M-D')+(this.data.selectHour=="不选"?'':" "+this.data.selectHour+"时"),
      devList:[],
      upDiaShow:true,
      upRet:'导出中',
      recordCount:0,
      upLoading:true,
      
    })

     console.log(this.data.querTime)
  
    this. queryRecord(0)
  },
  onShowQueryBloc(){
    this.setData({
      showQueryBlock:true
    })
  },
  testParse(){
    var data ="05 06 30 33 34 36 31 35 33 30 34 38 30 30 30 30 36 30 20 20 30 33 32 34 00 00 00 00 00 00 00 00 00 01 11 16 44 49 8b 6e a3 de 01 11 16 44 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 45 49 8b 6e a3 de 01 11 16 50 49 8b 6e a3 de 01 11 16 50 49 8b 6e a3 de 01 11 16 50 49 8b 6e a3 de 01 11 16 50 49 8b 6e a3 de 01 11 16 50 49 8b 6e a3 de 01 11 16 50 49 8b 6e a3 de 01 11 16 50 49 8b 6e a3 de 01 11 16 50 49 8b 6e a3 de 01 11 16 50 49 8b 6e a3 de 01 11 16 50 49 8b 6e a3 de 01 11 16 51 49 8b 6e a3 de 01 11 16 51 49 8b 6e a3 de 01 11 16 51 49 8b 6e a3 de 01 11 16 51 49 8b 6e a3 de 01 11 16 51 49 8b 6e a3 de 01 11 16 51 49 8b 6e a3 de 01 11 16 51 49 8b 6e a3 de 01 11 16 51 49 8b 6e a3 de 01 11 16 51 49 8b 6e a3 de 01 11 16 51 49 8b 6e a3 de 01 11 16 51 49 8b 6e a3 de 4e 30 30 30"
    var data2 = data.replace(/\s*/g,"");
    console.log(data2)

   var decodeData = parseUtil.parseData(data2,CMDID.RECORD)
    if(decodeData.code==0){
      let content = decodeData.content
      let isLeft = content.isLeft
     var  temprecord = content.record
       console.log("queryRecord",temprecord)

      var recordList = this.parseRecord(temprecord,0)
      // console.log("recordList",recordList)
        this.setData({
          devList:this.data.devList.concat(recordList)
        })
    //  this. sendRecordToSer(recordList)
    }
  },
sendRecordToSer(records,index,isLeft){
var that = this
var param ={CUSTID:that.data.currentDev.CUSTID,ACDEVID:that.data.currentDev.ACDEVID,ADENTERLOGS:JSON.stringify(records)}
console.log("insertAdEnterLog",param)
  network.RequestMQ.request({
    url: api.insertAdEnterLog,
    method: "POST",
    data: param,
    success: function (a) {
      console.log("insertAdEnterLog succ", a)
      if(a.data.RESPCODE=="000"){
        that.setData({
          recordCount:that.data.recordCount+records.length
        })
        if(isLeft =='Y'){
          let next = index+1
          that.queryRecord(next)
        }else{
          let endTime = new Date().getTime()
          console.log("QueryTime",endTime-that.data.startTime)
          console.log("QueryTime index ",index)

          that.setData({
            upLoading:false,
            upRet:"完成"
          })
        }
      }else{
         that.showErrorMsg("上传数据处理异常！")
      }
      
    },
    fail: function (a) {
      that.showErrorMsg("上传数据异常！")
      console.log("insertAdEnterLog complete p", a)
    },
    complete: function (a) {
      console.log("insertAdEnterLog complete p", this.data)
    }
  })
},

  queryRecord(index){
    var that =this
    let offset = "0000"+index
    let neDate = new Date()
    that.data.OnceQueryTime ++
    console.log("OnceQueryTime", that.data.OnceQueryTime )
    let paramData = "15"+this.data.currentDev.CUSTID+"  "+ that.data.querTime+offset.substr(offset.length-4)+stringUtil.formatTime(new Date(),'YMDhms')
    console.log("queryRecord",paramData)
    var devObj = {deviceId:this.data.currentDev.deviceId,param:paramData,cmdId:CMDID.RECORD,devsn:this.data.currentDev.DEVSN}
    setTimeout(function () { DM_BLUETOOTH_SDK.execuCmd(devObj,(result)=>{
      var decodeData =""
      let temprecord=""
      if(result.errCode == 0){
        that.data.OnceQueryTime=0
        decodeData = parseUtil.parseData(result.receiveData,CMDID.RECORD)
        if(decodeData.code==0){
          let content = decodeData.content
          let isLeft = content.IsLeft
           temprecord = content.record
           console.log("queryRecord isLeft ",isLeft)
           console.log("queryRecord",temprecord)
          let respCode = content.RespCode
          if(respCode=="000"){
            var recordList = that.parseRecord(temprecord,index)
            console.log("recordList",recordList)
              // that.setData({
              //   devList:that.data.devList.concat(recordList)
              // })
              if(recordList.length>0){
                that.sendRecordToSer(recordList,index,isLeft)
                
              }else{
                that.setData({
                  upLoading:false,
                  upRet:"完成"
                })
              }
          }else{
            that.showErrorMsg("【"+respCode+"】数据返回异常！")
          } 
      }else{
        that.showErrorMsg("【"+decodeData.code+"】数据解析异常！")
      }
    } else{
     
      if(that.data.OnceQueryTime<3&&result.errCode==119){
        that.queryRecord(index)
      }else{
        that.showErrorMsg("【"+result.errCode+"】查询失败！")
      }
   
    }
    })},200)
   
    
  },
  showErrorMsg(msg){
    // wx.hideLoading({
    //   success: (res) => {
       
    //   },
    // })
    wx.showToast({
      title: msg,
      icon:'none'
    })
    this.setData({
      upLoading:false,
      upRet:"导出失败"
    })
  },
parseRecord(records,index){
    var recordList=[]
    for(var x=0;x<records.length;x=x+18){
      let rcd = records.substr(x,18)
      let date = rcd.substr(0,4)   
      let time = rcd.substr(4,4)   
      let ENTER_TYPE  =parseUtil.hex2Str(rcd.substr(8,2) )  
      let acCardId =rcd.substr(10,8).toUpperCase()
      let acHuId=""
      if(ENTER_TYPE=="Q"){
        acHuId = parseUtil.hex2Str(acCardId).toUpperCase()
        acCardId=""
      }
      if(ENTER_TYPE=="Q"||ENTER_TYPE=="I"){
        let item = {id:(index+1)*x+time,ENTERDATE:date,ENTERTIME:time,ENTERTYPE:ENTER_TYPE ,ICCARDID:acCardId ,ACHUID:acHuId}
        recordList.push(item)
      }
      
    }
  
   return recordList
},

  onDateCancel(){
    let showTime =new Date()
    let dataStr = showTime.getFullYear()+"-"+(showTime.getUTCMonth())+"-"+showTime.getUTCDate()+" "+showTime.getHours()+":"+(showTime.getMinutes()<10?"00":showTime.getMinutes())
    this.setData({showTimePopup :false})
  },
  ontapShowPopup(){
    this.setData({showTimePopup :true})
  },
  onClickConfirm(){
    this.setData({
      upDiaShow:false
    })
    HGJACManager.closedDev(function(){

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
    console.log("acRecordList onUnload")
    HGJACManager.closedDev()
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