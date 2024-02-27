import Toast from '../../../../miniprogram_npm/@vant/weapp/dialog/dialog';
const app = getApp(),
      api = require("../../../../const/api"),
      userInfo = require("../../../../model/userInfo"),
      storage = require("../../../../const/storage"),
      netWork = require("../../../../utils/network"),
      respCode = require("../../../../const/respCode"),
      dateUtils = require('../../../../utils/dateUtil');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    multProcStat: '',
    repairLogList:[],
    pageNum:1,
    pageSize:10,
    pages:10,
    totalNum:1,

    option2: [
      { text: '全部', value: '' },
      { text: '待处理', value: 'A' },//01
      { text: '维修中', value: 'B' },//03,05
      { text: '已完成', value: 'C' },//07,09,11
      { text: '已取消', value: 'D' },//19
    ],



    date:'选择报修日期范围',
    show: false,
    minDate: new Date(2020, 0, 1).getTime(),
    defaultDate:[],
    beginDate:'',
    endDate:'',
  },

  onDisplay() {
    console.log('show');
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  formatDate(date) {
    date = new Date(date);
    var month = date.getMonth();
    if(month <= 9){
      month = (month+1) == 10 ?(month+1):'0'+(month+1);
    }else{
      month = month +1;
    }
    var day = date.getDate();

    if(day <= 9){
      day = '0' + day; 
    }
    return `${date.getFullYear()}.${month}.${day}`;
  },

  // 日期条件的变更确定
  onConfirm(event) {
    const [start, end] = event.detail;
    var beginDate = this.formatDate(start);
    var endDate = this.formatDate(end);
    this.setData({
      show: false,
      beginDate:beginDate,
      endDate:endDate,
      // date: `${this.formatDate(start)} - ${this.formatDate(end)}`,
      date:beginDate + '-' +endDate,
      pageNum:1,
    });
    this.queryForPage();
  },


  // 加载更多
  loadMore(event){
    var pageNum = this.data.pageNum + 1;
    this.setData({
      pageNum:pageNum,
    });
    this.queryForPage('loadMore');
  },

  // 查询
  queryForPage(type){
    this.showLoading(1);
    var datas = this.data;
    var pageNum = datas.pageNum;
    var pageSize = datas.pageSize;
    var multProcStat = datas.multProcStat;

    var beginDate = datas.beginDate.replace('.','').replace('.','');
    var endDate = datas.endDate.replace('.','').replace('.','');
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var data = {};
    data['pageNum'] = pageNum;
    data['pageSize'] = pageSize;
    var that = this;
    netWork.RequestMQ.request({
      url:api.queryRepair,
      method:'POST',
      data:{
        custId:custId,
        pageNum:pageNum,
        pageSize:pageSize,
        multProcStat:multProcStat,
        startRepairDate:beginDate,
        endRepairDate:endDate,
      },
      success:res=>{
        var datas = res.data;
        that.showLoading(0);
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
  // 切换状态并重新查询
  change(value){
    console.log(value);
    this.setData({
      multProcStat:value.detail,
      pageNum:1,
    });
    this.queryForPage();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      app.loading(),this.showLoading(0);
      //默认查前一个月的数据
      var begin = dateUtils.parseDate(dateUtils.getDaysAgo(28));
      var end = new Date().getTime();
      this.data.defaultDate.push(begin.getTime());
      this.data.defaultDate.push(end);
      console.log(this.data);
      var beginDate = this.formatDate(begin);
      var endDate = this.formatDate(end);
      this.setData({
        defaultDate:this.data.defaultDate,
        beginDate:beginDate,
        endDate:endDate,
        date:beginDate + '-' +endDate,
      })
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