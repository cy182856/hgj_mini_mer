const app = getApp(),
  heo = require('../../../model/heoinfo');
var that = null;
import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum:1,
    pageSize:12,
    heoPraiseListDtos:new Array(),
    isHideLoadMore:true,
    iphoneX:app.globalData.iphoneX,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),heo.heoinfo.init(),this.showLoading(!1),that = this;
    that.setData({
      heoDate:options.heoDate,
      heoSeqId:options.heoSeqId,
      pageNum:1,
      pageSize:12,
    })
    heo.heoinfo.queryHeoPraiseList();
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
    wx.showNavigationBarLoading() 
    that.setData({
      pageNum:1,
      isRefreshing:true,
      isLoadingMoreData: false,
      hasMoreData:true,
      isHideLoadMore:false,
      heoPraiseListDtos:new Array()
    })
    heo.heoinfo.queryHeoPraiseList();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() 
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('onReachBottom')
    if (this.data.isRefreshing || this.data.isLoadingMoreData || !this.data.hasMoreData) {
      return;
    }
    that.setData({
      pageNum:parseInt(that.data.pageNum ) + 1,
      isLoadingMoreData: true
    })
    heo.heoinfo.queryHeoPraiseList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})