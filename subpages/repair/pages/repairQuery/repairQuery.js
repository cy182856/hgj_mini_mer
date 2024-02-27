// pages/repair/repairQuery/repairQuery.js
const api = require('../../../../const/api'),
 app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      repairLogList:[],
      pageNum:1,
      pageSize:5,
      pages:10,
      totalNum:1,
      obj:null,
      cstCode:'',
      proNum:'',
      wxOpenId:'',
      navList: ['全部', '已提交', '处理中', '已完工'],
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
    var repairStatus = datas.nav_type;
    var data = {};
    data['pageNum'] = pageNum;
    data['pageSize'] = pageSize;
    //data['cstCode'] = app.storage.getCstCode();
    //data['wxOpenId'] = app.storage.getWxOpenId();
    //data['proNum'] = app.storage.getProNum();   
    data['repairStatus'] = repairStatus;
    var that = this;
    app.req.postRequest(api.repairQuery,data).then(res=>{
        // console.log("回调用",res);
        this.showLoading(0);
        if(res.data.respCode == 'EEE'){
          app.alert.alert(res.data.errDesc);
          return;
        }
        if(res.data.respCode == '000'){
          //var logList = res.data.repairDtos;
          var logList = res.data.repairLogList;
          let totalNum = res.data.totalNum;
          // let totalNum = datas.queryRepairLogResult.totalNum;
          var pages = parseInt(res.data.pages);
          that.data.repairLogList.push.apply(that.data.repairLogList,logList);
          // if(res.data.repairDtos && res.data.repairDtos.length > 0){
          //   that.data.repairLogList.push.apply(that.data.repairLogList,res.data.repairDtos);
          // }
          that.setData({
            pages:pages,
            repairLogList:type == 'loadMore'?that.data.repairLogList:logList,
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
    //this.setData({obj:app.storage.getLoginInfo()})
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
      repairLogList:new Array()
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