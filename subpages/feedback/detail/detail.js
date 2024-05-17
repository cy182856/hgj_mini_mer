const api = require('../../../const/api'),
      app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList:[],
    obj:null,
    id:''
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),this.showLoading(1);
    console.log('投诉详情详细页:',options);
    var that = this;
    //获取详情数据
    var d = {};
    d['cstCode'] = app.storage.getCstCode();
    d['wxOpenId'] = app.storage.getWxOpenId();
    d['proNum'] = app.storage.getProNum();
    d['id'] = options['id'];
    this.setData({
      id:options['id']
    });
    app.req.postRequest(api.feedbackQuery,d).then(res=>{
      console.log('投诉详情详细数据:',res);
      var respData = res.data;
      that.showLoading(0);
      if(respData.respCode == '000'){
        var obj = respData.feedbackList[0];    
        // 图片
        var fileList = respData.fileList;
        that.setData({
          obj:obj,
          //comObj:respData,
          fileList:fileList,
          items: this.data.items,
        });
      }else{
        var desc = res.data.errDesc;
         if(!desc){
           desc = '网络异常,请稍后再试'
         }
        app.alert.alert(desc);
      }
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