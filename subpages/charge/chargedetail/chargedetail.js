var that = null;
const app = getApp(),
api = require("../../../const/api"),
network = require("../../../utils/network");

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new app.userInfo(),app.loading(),that = this, that.showLoading(!0);
    if(!options.coopId || !options.deviceSn){
      wx.showToast({
        title: '查询充电桩详情关键信息缺失',
        icon:'none',
        duration:3000
      })
      setTimeout(function(){
        wx.navigateBack({
          delta:1
        });
      },3000)
      return false;
    }
    that.setData({
      isIphoneX:app.globalData.iphoneX,
      coopId:options.coopId ,
      deviceSn: options.deviceSn,
      userInfo: getApp().globalData.userInfo
    })
    let queryParams = {
      coopId:that.data.coopId ,
      deviceSn: that.data.deviceSn
    };
    that.queryChargeDatail(queryParams);
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
  copyDeviceSn: function (e) {
    let deviceSn = e.currentTarget.dataset.item;
    wx.setClipboardData({
      data: deviceSn,
      success: function (res) {
        wx.getClipboardData({
          // 这个api是把拿到的数据放到电脑系统中的
          success: function(res) {
            console.log(res.data) // data
          }
        })
      }
    })
  },
  queryChargeDatail: function(params){
    that.showLoading(!0);
    network.RequestMQ.request({
      url:api.queryChargeDetail,
      data:params,
      success:function(res){
        console.log(res)
        that.setData({
          padding_bottom:that.data.isIphoneX ? '176' : '140',
          chargeDetail: res.data.chargeDevInfoVo,
          chargeRule:res.data.chargeRuleVo
        })
      },
      fail:function(){
        wx.showToast({
          title: '获取充电桩详情失败',
          icon:'none',
          duration:2000
        })
        setTimeout(function(){
          wx.navigateBack({
            delta:1
          });
        },3000)
      },
      complete:function(){
        that.showLoading(!1);
      }
    })
  }
})