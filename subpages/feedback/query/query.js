const api = require('../../../const/api.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      feedbackList:[],
      pageNum:1,
      pageSize:10,
      pages:10,
      totalNum:1,
      obj:null,
      cstCode:'',
      proNum:'',
      wxOpenId:'',
      // navList: ['全部', '已提交', '处理中', '已完工'],
      nav_type: 0
  },

  changeType: function (e) {
    let {
      index
    } = e.currentTarget.dataset;
    if (this.data.nav_type=== index || index === undefined) {
      return false;
    } else {
      this.setData({
        nav_type: index
      })
    }
    this.setData({
      pageNum:1,
    });
    this.queryForPage();
  },

  loadMore(event){
    var pageNum = this.data.pageNum + 1;
    this.setData({
      pageNum:pageNum,
    });
    this.queryForPage('loadMore');
  },

  queryForPage(type){
    this.showLoading(1);
    var datas = this.data;
    var pageNum = datas.pageNum;
    var pageSize = datas.pageSize;
    var data = {};
    data['pageNum'] = pageNum;
    data['pageSize'] = pageSize;
    data['cstCode'] = app.storage.getCstCode();
    data['wxOpenId'] = app.storage.getWxOpenId();
    data['proNum'] = app.storage.getProNum();   
    var that = this;
    app.req.postRequest(api.feedbackQuery,data).then(res=>{
        // console.log("回调用",res);
        this.showLoading(0);
        if(res.data.respCode == 'EEE'){
          app.alert.alert(res.data.errDesc);
          return;
        }
        if(res.data.respCode == '000'){
          var logList = res.data.feedbackList;
          let totalNum = res.data.totalNum;
          var pages = parseInt(res.data.pages);
          that.data.feedbackList.push.apply(that.data.feedbackList,logList);  
          that.setData({
            pages:pages,
            feedbackList:type == 'loadMore'?that.data.feedbackList:logList,
            totalNum:totalNum,
            isRefreshing:false
          });
        }else{
          var desc = res.data.errDesc;
          if(!desc){
            desc = '网络异常，请稍后再试';
          }
          app.alert.alert(desc);
        }
    });
  },

  costDetail: function (event) {
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),this.showLoading(0);
    this.setData({obj:app.storage.getLoginInfo()})
    this.queryForPage();
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
    this.setData({
      pageNum:1,
      loading:false,
      isRefreshing:true,
      feedbackList:new Array()
    })
    this.queryForPage()
    wx.stopPullDownRefresh({
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let totalNum = this.data.totalNum;
    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;
    if(pageNum * pageSize < totalNum){
      this.loadMore();
    }else{
      wx.showToast({
        title: '已经到底了',
        icon:'none'
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})