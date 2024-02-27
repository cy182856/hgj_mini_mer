// pages/mine/mineComment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    score: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let count = getApp().globalData.userInfo.RATECNT;
    let totalScore = getApp().globalData.userInfo.RATESCORE;
    console.log("globalData",getApp().globalData.userInfo)

    console.log(totalScore/count)
    console.log("toPrecision",(5/3).toFixed(1) )
    this.setData({
      userInfo: getApp().globalData.userInfo,
      score: count==0?0:((totalScore/count).toFixed(1))
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

  }
})