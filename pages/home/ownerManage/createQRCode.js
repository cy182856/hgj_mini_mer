// pages/family/members/createQRCode.js
let network = require("../../../utils/network")
let api = require("../../../const/api")
const app = getApp();
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    houseSeqId:"",
    imgUrl:'',
    commanyShortName: "",
    areaName: '',
    qrExpTime:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      commanyShortName: options.shortName,
      areaName: options.showBuildingRoom,
      houseSeqId: options.houseSeqId,
    })
    wx.setNavigationBarTitle({
      title: '绑定二维码',
    })
    // const eventChannel = that.getOpenerEventChannel()
    // eventChannel.on('QRIMGUrlEvent', function (data) {
    //   console.log(data.data)
    //   that.setData({
       
    //     imgUrl: data.data.imgUrl,
    //     qrExpTime:that.getExpTime(data.data.qrcodeExpTime)
    //   })
    // })
    this.getQrcodeImage()
  },

  getQrcodeImage() {
    console.log(this.data.houseSeqId)
    var that = this
    network.RequestMQ.request({
      url:api.queryQrcodeImage,
      method: "POST",
      data: {
        "houseSeqId": that.data.houseSeqId,
      },
      success:function(a){
        that.setData({
          imgUrl: a.data.imgUrl,
          qrExpTime:that.getExpTime(a.data.qrcodeExpTime)
        })
      },
      fail:function(a){
        
      },
      complete:function(a){
        
      }
    })
  },
   getExpTime(time) {
    var times = (new Date()).getTime()+time*1000
    var expDate = new Date(times)
    //获取年份  
    var Y = expDate.getFullYear();
    //获取月份  
    var M = (expDate.getMonth() + 1 < 10 ? '0' + (expDate.getMonth() + 1) : expDate.getMonth() + 1);
    //获取当日日期 
    var D = expDate.getDate() < 10 ? '0' + expDate.getDate() : expDate.getDate(); 
    return Y+"年"+M+"月"+D+"日 " + [expDate.getHours(), expDate.getMinutes()].map(formatNumber).join(":")
  },

  // formatNumber:function(n) {
  //   n = n.toString()
  //   return n[1] ? n : '0' + n
  // },

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