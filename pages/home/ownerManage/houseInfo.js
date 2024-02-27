// pages/home/ownerManage/houseInfo.js
let network = require("../../../utils/network")
let api = require("../../../const/api")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    houseInfo: {},
    showBuildingRoom:"",
    showStat:"",
    PROPTYPE: "B",
    isEdit:false,
    isNeedFollow:'N',
    remark:'',
    isModifyInfo:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var usrInfo = getApp().globalData.userInfo
    console.log("usrInfo",usrInfo)
    that.setData({
      PROPTYPE:usrInfo.PROPTYPE
    })
   
    wx.setNavigationBarTitle({
      title: (usrInfo.PROPTYPE=="B"?"业主":"管理员")+'管理',
    })
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptHouseInfo', function(data) {
      console.log(data.data)
      let roomDetail = ""
      if (data.data.areaId != "000") {
        roomDetail = data.data.areaName + "-"
      }
      roomDetail = roomDetail + data.data.buildingName + "-" + data.data.houseNo
 
      that.setData({
        houseInfo : data.data,
        userInfo: getApp().globalData.userInfo,
        showBuildingRoom: roomDetail,
        showStat: data.data.statDesc,
        isNeedFollow: data.data.isNeedFollow,
        remark:data.data.houseRemark
      })
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
  onTapCreateQRCode() {
    wx.navigateTo({
      url: './createQRCode?shortName=' + this.data.userInfo.SHORTNAME + '&showBuildingRoom=' + this.data.showBuildingRoom + "&houseSeqId=" + this.data.houseInfo.houseSeqId,
    })
  },
  modifyFollowInfo(){
    var that = this
    wx.showLoading({
      title: '正在修改',
    })
    network.RequestMQ.request({
      url:api.updHouseInfo,
      method: "POST",
      data: {
        "custId": that.data.houseInfo.custId,
        "houseSeqId": that.data.houseInfo.houseSeqId,
        "isNeedFollow":that.data.isNeedFollow,
        "houseRemark":that.data.remark
      },
      
      success:function(a){
       
        that.setData({
          isEdit:false,
         
        })
        const eventChannel = that.getOpenerEventChannel()
        eventChannel.emit('RefreshEvent', { data: 'M' })
        console.log("updHouseInfo",a)
   
      },
      fail:function(a){
        console.log("updHouseInfo","fail")
      },
      complete:function(a){
        console.log("updHouseInfo","complete")
        wx.hideLoading({
          success: (res) => {},
        })
      }
    })
  },
  ontapModify(){
    if(this.data.isEdit){
      this.modifyFollowInfo()

    
    }else{
      this.setData({
        isEdit:true
      })
    }
  },
  onFollowChange({ detail }){
    console.log("onFollowChange",detail)
   this.setData({
     isNeedFollow:detail?'Y':'N'
   })
  },
  inputRemark({detail}){
    console.log("onFollowChange",detail)
    this.setData({
      remark:detail
    })
  },
  ontapCancle(){
    this.setData({
      isEdit:false,
      isNeedFollow: this.data.houseInfo.isNeedFollow,
      remark:this.data.houseInfo.houseRemark
    })
  }
})