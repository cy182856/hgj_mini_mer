var that = null;
const api = require('../../../const/api'),
netWork = require('../../../utils/network'),
app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    visitInoutLogs:new Array()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),this.showLoading(!0),that = this;
    that.queryVisitInoutLogs(options)
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
  queryVisitInoutLogs:function(data){
    if(!data
      || !data.visitDate  
      || data.visitDate == ''
      || !data.visitSeqId 
      || data.visitSeqId  == ''){
        wx.showToast({
          title: '获取访客出入信息异常',
          icon:'none'
        })
        setTimeout(function(){
          wx.navigateBack({
            delta: 0,
          })
        },1000)
      }
      that.showLoading(!0)
      netWork.RequestMQ.request({
        url : api.queryVisitInoutLogs,
        data:data,
        success:function(res){
          if(res.data.data!=null
            && res.data.data.length >0){
              that.setData({
                visitInoutLogs:res.data.data
              })
            }
        },
        fail:function(res){

        },
        complete:function(){
          that.showLoading(!1)
        }
      })
  }
})