const app = getApp(),
api = require("../../const/api"),
storage = require("../../const/storage"),
dateUtil = require("../../utils/dateUtil"),
netWork = require("../../utils/network");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    'isLoading':true,
    'bgColor':'#F3F5F5'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     app.loading(), this.showLoading(!1);

     let objId=options.objId;
     let apptDate=options.apptDate;
     let apptTimeId=options.apptTimeId;
     let apptTimeDesc=options.apptTimeDesc;

    // objId = '001';
    // apptDate = '20200926';
    // apptTimeId = '01';
    // apptTimeDesc='15:00~16:00';

    this.objId=objId;
    this.apptBeginDate = apptDate;
    this.apptEndDate = apptDate;
    this.apptTimeId=apptTimeId;
    
    this.setData({'apptDate':apptDate,'apptLongDate': dateUtil.convertShortDateToLang(apptDate), 'apptTimeDesc': apptTimeDesc});
    this.requestApptTimeOrdInfo();
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
  returnLastPage:function(){
    wx.navigateBack({
      delta: 1
    })

  },
  requestApptTimeOrdInfo: function () {
    this.showLoading(!0);
    var data = {
      'CUSTID': app.globalData.userInfo.CUSTID,
      // 'CUSTID': '6000000013',
      'OBJID': this.objId,
      'APPTBEGINDATE': this.apptBeginDate,
      'APPTENDDATE': this.apptEndDate,
      'APPTTIMEID':this.apptTimeId
    };
    var that = this;
    netWork.RequestMQ.request({
      url: api.queryApptTimeOrdLog,
      method: 'POST',
      data: data,
      success: (res) => {
        if (res.data.RESPCODE == '000') {
          that.setData({ 'APPTORDLOGDTOS': res.data.APPTORDLOGDTOS,'APPTOBJDTLDOMAINS':res.data.APPTOBJDTLDOMAINS,'isLoading': false });
        } else {
          //接口返回错误
          wx.showToast({
            title: res.data.ERRDESC + '[' + res.data.RESPCODE + ']',
            icon: 'none'
          })
        }
      }, fail: function (res) {
        wx.showToast({
          title: res && res.data && res.data.ERRDESC ? res.data.ERRDESC : "网络繁忙,请稍后再试",
          icon: 'none'
        })
      },
      complete: function () {
        that.showLoading(!1);
        if (that.data.APPTORDLOGDTOS.length == 0) {
          that.setData({ 'bgColor': 'white' });
        } else {
          that.setData({ 'bgColor': '#F3F5F5' });
        }
      }
    });
  }
})