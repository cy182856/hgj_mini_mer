import Toast from '../../../../miniprogram_npm/@vant/weapp/dialog/dialog';
const app = getApp(),
api = require("../../../../const/api"),
userInfo = require("../../../../model/userInfo"),
storage = require("../../../../const/storage"),
netWork = require("../../../../utils/network"),
respCode = require("../../../../const/respCode");
Page({

  /**
   * 页面的初始数据
   */
  data: {
      repairLogList:[],
      pageNum:1,
      pageSize:10,
      pages:10,
      totalNum:1,
  },

  loadMore(event){
    var pageNum = this.data.pageNum + 1;
    this.setData({
      pageNum:pageNum,
    });
    this.queryForPage('loadMore');
  },


  queryForPage(type){
    var that = this;
    this.showLoading(1);
    var datas = this.data;
    var pageNum = datas.pageNum;
    var pageSize = datas.pageSize;
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var data = {};
    data['pageNum'] = pageNum;
    data['pageSize'] = pageSize;
    var that = this;
    netWork.RequestMQ.request({
      url:api.queryJieDan,
      method:'POST',
      data:{custId:custId,pageNum:pageNum,pageSize:pageSize},
      success:res=>{
        // debugger;
        // console.log(res);
        var datas = res.data;
        if(datas.RESPCODE == '000'){
          console.log('do orders success'+datas);
          var logList = datas.queryRepairLogResult.repairDtos;
          let totalNum = datas.queryRepairLogResult.totalNum;
          var pages = parseInt(datas.queryRepairLogResult.pages);
          if(that.data.repairLogList != null){
            that.data.repairLogList.push.apply(that.data.repairLogList,logList);
          }
          that.setData({
            repairLogList:type == 'loadMore'?that.data.repairLogList:logList,
            pages:pages,
            totalNum:totalNum
          })
        }
      },
      fail:res=>{
        that.showLoading(0);
        Toast.alert({
          message:res.data.ERRDESC
        }).then(()=>{
          that.setData({repairLogList:[]})
        })
      },
      complete:res=>{
        that.showLoading(0);
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),this.showLoading(0);
    var assign = wx.getStorageSync(storage.STORAGE.USER_INFO).REPAIRASSIGN;
    if(assign == 'A'){
      Toast.alert({message:'当前是派单模式，无法进行接单业务'}).then(()=>{
        // wx.navigateTo({
        //   url: '../orders/orders',
        // })
      })
      return;
    }
    // this.queryForPage();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.setData({
    //   pageNum:1,
    //   repairLogList:[],
    // });
    // this.queryForPage();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      pageNum:1,
      repairLogList:[],
    });
    this.queryForPage();
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