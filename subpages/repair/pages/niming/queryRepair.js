import Toast from '../../../../miniprogram_npm/@vant/weapp/dialog/dialog';

const api = require('../../../../const/api'),
 app = getApp();

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
      obj:null,
      custId:'',
      wxOpenId:'',
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
    let custId = datas.custId;
    let wxOpenId = datas.wxOpenId;
    var pageNum = datas.pageNum;
    var pageSize = datas.pageSize;
    if(!custId||!wxOpenId){
      this.showLoading(0);
      Toast.alert({message:'关键信息缺失，请稍后再试'});
      return;
    }
    var data = {};
    data['pageNum'] = pageNum;
    data['pageSize'] = pageSize;
    data['custId'] = custId;
    data['wxOpenId'] = wxOpenId;
    var that = this;
    app.req.postRequest(api.annonyQuery,data).then(res=>{
        // console.log("回调用",res);
        this.showLoading(0);
        if(res.data.respCode == 'EEE'){
          app.alert.alert(res.data.errDesc);
          return;
        }
        if(res.data.respCode == '000'){
          var logList = res.data.repairDtos;
          let totalNum = res.data.totalNum;
          var pages = parseInt(res.data.pages);
          that.data.repairLogList.push.apply(that.data.repairLogList,logList);
          that.setData({
            pages:pages,
            repairLogList:type == 'loadMore'?that.data.repairLogList:logList,
            totalNum:totalNum
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),this.showLoading(0);
    let custId = options['custId'];
    let wxOpenId = options['wxOpenId'];
    this.setData({
      custId:custId,
      wxOpenId:wxOpenId,
    })
    
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