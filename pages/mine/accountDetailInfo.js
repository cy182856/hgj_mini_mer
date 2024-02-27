// pages/mine/accountDetailInfo.js
let network = require("../../utils/network")
let api = require("../../const/api")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    canModify: false,

    phoneNum:'',
    wxId: '',
    swichStat: "Y",

    newPhone:"",
    newWxId: "",
    newSwitchStat:"",
    postNames:"",
    isLoading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let POSPEPOSTVOLIST = getApp().globalData.userInfo.POSPEPOSTVOLIST
    let tempNames = Array()
    if(POSPEPOSTVOLIST&&POSPEPOSTVOLIST.length>0){
      tempNames = POSPEPOSTVOLIST
    }
    this.setData({
      userInfo: getApp().globalData.userInfo,
      phoneNum: getApp().globalData.userInfo.POMP,
      newPhone: getApp().globalData.userInfo.POMP,
      wxId: getApp().globalData.userInfo.USERID,
      newWxId:getApp().globalData.userInfo.USERID,
      swichStat: getApp().globalData.userInfo.ISINFOPUB,
      newSwitchStat: getApp().globalData.userInfo.ISINFOPUB,
      postNames:tempNames
    })
    console.log(tempNames)
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

  onInputPhoneNum: function(e) {
    console.log(e.detail.value)
    this.data.newPhone = e.detail.value
  },
  onInputWxId: function(e) {
    console.log(e.detail.value)
    this.data.newWxId = e.detail.value
  },
  onSwitchChange: function(e) {
    console.log("onSwitchChange",e.detail)
    if (e.detail) {
      this.setData({
        newSwitchStat: "Y"
      })
    }
    else {
      this.setData({
        newSwitchStat: "N"
      })
    }
  },

  onModify() {
    this.setData({
      canModify: true,
    })
  },
  onSave() {
    var that = this
    var params = {"custId": that.data.userInfo.CUSTID, "poSeqId": that.data.userInfo.POSEQID,}
    if (this.data.phoneNum != this.data.newPhone) {
      if (this.data.newPhone.length != 11) {
        wx.showToast({
          title: '手机号码不正确',
          icon: 'none'
        })
        return
      }
      console.log("newPhone",this.data.newPhone)
      console.log("phoneNum",this.data.phoneNum)
      params["poMp"] = this.data.newPhone
    }
    if (this.data.wxId != this.data.newWxId) {
      if (this.data.newWxId.length == 0) {
        wx.showToast({
          title: '微信ID不能为空',
          icon: 'none'
        })
        return
      }
      params["poWxId"] = this.data.newWxId
    }
    if (this.data.swichStat != this.data.newSwitchStat) {
      params["isInfoPub"] = this.data.newSwitchStat
    }
    console.log("isInfoPub",params.hasOwnProperty("isInfoPub"))
    console.log("poWxId",params.hasOwnProperty("poWxId"))
    console.log("poMp",params.hasOwnProperty("poMp"))
    if(!params.hasOwnProperty("isInfoPub")&&!params.hasOwnProperty("poWxId")&&!params.hasOwnProperty("poMp")){
      wx.showToast({
        title: '没有修改内容！',
      })
      return
    }
    console.log(params)
    that.setData({
      isLoading:true
    })
    network.RequestMQ.request({
      url:api.updateManagerInfo,
      method: "POST",
      data: params,
      success:function(a){
        getApp().globalData.userInfo.POMP = that.data.newPhone
        that.data.phoneNum = that.data.newPhone
        getApp().globalData.userInfo.USERID = that.data.newWxId
        that.data.wxId = that.data.newWxId
        getApp().globalData.userInfo.ISINFOPUB = that.data.newSwitchStat
        that.data.swichStat = that.data.newSwitchStat
        that.setData({
          canModify: false,
        })
      },
      fail:function(a){
        wx.showToast({
          title: a.data.ERRDESC,
          icon: 'none'
        })
      },
      complete:function(a){
        that.setData({
          isLoading:false
        })
      }
    })
  },
  onCancel() {
    this.data.newPhone = ""
    this.data.newWxId = ""
    this.setData({
      canModify: false,
      newPhone: this.data.phoneNum,
      newWxId: this.data.wxId,
      newSwitchStat: this.data.swichStat
    })
  }
})