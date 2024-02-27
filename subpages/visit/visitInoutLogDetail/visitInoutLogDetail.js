const network = require("../../../utils/network");
const api = require("../../../const/api");
const app = getApp();
const dateUtil = require('../../../utils/dateUtil');
var that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeNames: ['1']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    app.loading(),that.showLoading(!1);
    if(!options.visitInfo){
      wx.showToast({
        title: '关键信息获取失败',
        icon:"none",
        duration:3000
      })
      setTimeout(function(){
        wx.navigateBack({
          delta: 0,
        })
      },1000)
    }
    var visitInfo = JSON.parse(options.visitInfo)
    if(visitInfo.avlCnt >= 0){
      visitInfo.perCent = visitInfo.expCnt - visitInfo.avlCnt + '/' + visitInfo.avlCnt
    }else if(visitInfo.avlCnt == -2){
      visitInfo.perCent = visitInfo.expCnt - 0 + '/' + 0
    }
    that.setData({
      visitInfo:visitInfo
    })
    that.queryVisitInoutInfos()
  },
  queryVisitInoutInfos:function(){
    that.showLoading(!0)
    var param = {}
    param.pageNum = 1
    param.pageSize = 100
    param.visitDate = that.data.visitInfo.visitDate
    param.visitSeqId = that.data.visitInfo.visitSeqId
    console.log('查询访客出入日志请求参数',param)
    network.RequestMQ.request({
      url:api.queryVisitInoutLogs,
      data:param,
      success:function(res){
        console.log(res)
        if(res.data.data != null){
          that.setData({
            visitInoutLogs:res.data.data
          })
        }else{
          that.setData({
            more:false
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '查询访客出入记录失败',
          icon:'none',
          duration:3000
        })
        that.setData({
          more:false
        })
      },
      complete:function(){
        that.showLoading(!1)
      }
    })
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
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