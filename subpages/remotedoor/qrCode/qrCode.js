var that = null;
const app = getApp(),
api = require("../../../const/api"),
network = require("../../../utils/network");
import { toBarcode, toQrcode } from '../../../utils/codeUtil/codeUtil';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnName:'jia-closeeye',
    showCode:'none'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),that = this, that.showLoading(!0);
    var windowW = app.globalData.windowW;
    let userInfo = getApp().globalData.userInfo
    console.log(userInfo)
    that.setData({
      windowW:windowW,
      usrName:userInfo.PONAME == null ? ' ' : userInfo.PONAME,
      shortName:'********'
    })
    that.createCode()
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
  createCode:function(){
    that.showLoading(!0);
    network.RequestMQ.request({
      url:api.querySmartCodeInfo,
      success:function(res){
        toQrcode('qrcode', res.data.codeStr, 400, 400);
        that.setData({
          showCode:'none'
      })
      that.setData({
        showCode:'block'
      })
      },
      fail:function(res){
        console.log(res)
        wx.showToast({
          icon:'none',
          duration:3000,
          title: res.data.ERRDESC ? res.data.ERRDESC : '获取智能开门码失败，请稍后重试。',
          success:function(){
            setTimeout(function(){
              wx.navigateBack({
                delta: 0,
              })
            },1000)
          }
        })
      },
      complete:function(c){
        that.showLoading(!1);
      }
    })
  },
  controlHouseInfo:function(){
    let userInfo = app.globalData.userInfo
    let deptName = userInfo.DEPTNAME == null ? ' ' : userInfo.DEPTNAME
    let shortName = userInfo.SHORTNAME == null ? ' ' : userInfo.SHORTNAME 
    if(that.data.btnName == 'jia-closeeye'){
      that.setData({
        btnName:'jia-openeye',
        shortName:shortName + deptName
      })
    }else{
      that.setData({
        btnName:'jia-closeeye',
        shortName:'********'
      })
    }
  },
  refreshPassCode:function(){
    that.setData({
      showCode:'none'
    })
    setTimeout(function(){
      that.setData({
        showCode:'block'
      })
    },300)
  },
  showTip:function(){
    that.setData({
      showTip:true,
      showCode:'none'
    })
  },
  closeTip:function(){
    that.setData({
      showTip:false,
      showCode:'block'
    })
  }
})