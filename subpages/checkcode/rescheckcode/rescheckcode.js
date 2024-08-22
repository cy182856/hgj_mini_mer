var that = null,
app = getApp(),
api = require('../../../const/api');
import storage from "../../../utils/storageUtils";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showResult:false,
    visitPass:"",

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this,app.loading(),
    that.showLoading(!1);
    wx.setNavigationBarTitle({
      title: options.title
    })
    that.setData({
      checkType:options.checkType
    })
    if(options.checkType == 'R'){
       that.scanCode()
     }
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
  scanCode:function(){
    wx.scanCode({
      onlyFromCamera: true,
      success:function(res){
        that.showLoading(!0)
         wx.request({
            url: api.checkResQrCode,
            header: {
              'content-type': 'application/json',
              'token':new storage().getToken().toString()
            },
            data:{
                checkCodeParam:res.result
            },
            success: function (ree) {
              console.log('访客验证返回:', ree);
              var proName = ree.data.proName;
              var cstName = ree.data.cstName;
              if (ree.data.ERRCODE == "01010000") {
                that.setData({
                    errDesc:'验证成功！',
                    checkSuccess:true,
                    proName:proName,
                    cstName:cstName,
                    showResult:true
                })
              } else {
                that.setData({
                    errDesc:ree.data.ERRDESC,
                    checkSuccess:false,    
                    showResult:true
                })
              }
            },          
          });   
      },
      complete:function(){
        console.log('扫码完成')
      },
      fail:function(){
        wx.navigateBack({
          delta: 0
        })
      }
    })
  },

  backToPrePage:function(){
    wx.navigateBack({
      delta: 0,
    })
  },

})