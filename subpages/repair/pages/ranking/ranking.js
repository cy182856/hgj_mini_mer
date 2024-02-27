// subpages/repair/pages/ranking/ranking.js
import Toast from '../../../../miniprogram_npm/@vant/weapp/toast/toast';
const app = getApp();
const api = require('../../../../const/api');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currFlag: 0,
    lastMonthShow: false,
    nextMonthShow: false,
    currMonthId: "",
    currMonthDesc: "",
    pageNum: 1,
    totalNum: 0,
    pageSize: 5,
    nextPage: true,
    huMonthScoreDtos: "",
    bottomText: "点击/下拉加载更多"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading();
    //获取当前月份
    this.initMonth();
  },

  initMonth: function(){
    let date = new Date();
    let year=date.getFullYear(); 
    let month=date.getMonth()+1;
    if(month < 10){
      month = "0"+month;
    }
    let currMonthId = year+month.toString();
    let currMonthDesc = year+'年'+month+'月';
    this.setData({
      currMonthId: currMonthId,
      currMonthDesc: currMonthDesc,
      lastMonthShow: true
    });
    this.queryRanking();
  },

  lastMonth: function(){
    let currMonthId = this.data.currMonthId;
    let year = currMonthId.substr(0,4);
    let month = currMonthId.substr(4) - 1;
    if(month == 0){
      year = year-1;
      month = 12;
    }
    let currMonthDesc = year+"年"+month+"月";
    if(month < 10){
      month = "0"+month;
    }
    currMonthId =  year + month.toString();

    let currFlag = this.data.currFlag;
    currFlag--;
    let lastMonthShow = true;
    let nextMonthShow  = true;
    if(currFlag < -2){
      lastMonthShow =  false;
    }
    if(currFlag>=0){
      nextMonthShow =  false;
    }

    this.setData({
      currFlag: currFlag,
      nextMonthShow: nextMonthShow,
      lastMonthShow: lastMonthShow,
      currMonthId: currMonthId,
      currMonthDesc: currMonthDesc,
      pageNum: 1,
      totalNum: 0
    });
    this.queryRanking();

  },
  nextMonth: function(){
    let currMonthId = this.data.currMonthId;
    let year = currMonthId.substr(0,4);
    let month = parseInt(currMonthId.substr(4)) + 1;
    if(month > 12){
      year = parseInt(year)+1;
      month = 1;
    }
    let currMonthDesc = year+"年"+month+"月";
    if(month < 10){
      month = "0"+month;
    }
    currMonthId =  year + month.toString();

    let currFlag = this.data.currFlag;
    currFlag++;
    let lastMonthShow = true;
    let nextMonthShow  = true;
    if(currFlag < -2){
      lastMonthShow =  false;
    }
    if(currFlag>=0){
      nextMonthShow =  false;
    }
    
    this.setData({
      currMonthId: currMonthId,
      currMonthDesc: currMonthDesc,
      pageNum: 1,
      totalNum: 0,
      currFlag: currFlag,
      nextMonthShow: nextMonthShow,
      lastMonthShow: lastMonthShow
    });
    this.queryRanking();
  },

  queryRanking: function(){
    let monthId = this.data.currMonthId;
    let pageNum = this.data.pageNum;
    let condition = {monthId : monthId, pageNum : pageNum};
    this.showLoading(true);
    app.req.postRequest(api.queryRanking, condition).then(value => {
      this.showLoading(false);
      console.log(value.data);
      if(value.data.respCode != '000'){
        console.log("查询共建家园排名失败");
        Toast('['+value.data.respCode+']'+value.data.errDesc);
        return;
      }
      let huMonthScoreDtos = value.data.huMonthScoreDtos;
      let totalNum = value.data.totalNum;
      let pageSize = value.data.pageSize;
      this.setData({
        huMonthScoreDtos: huMonthScoreDtos,
        totalNum: totalNum,
        pageSize: pageSize
      });

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

  toNextPage: function(){
    let pageNum = this.data.pageNum;
    pageNum++;
    let pageSize = this.data.pageSize;
    let totalNum = this.data.totalNum;
    if(!hasNextPage(pageNum, pageSize, totalNum)){
      this.setData({
        bottomText: "已到最底"
      });
      return;
    }

    let monthId = this.data.currMonthId;
    let condition = {monthId : monthId, pageNum : pageNum};
    this.showLoading(true);
    app.req.postRequest(api.queryRanking, condition).then(value => {
      this.showLoading(false);
      if(value.data.respCode != '000'){
        console.log("查询共建家园排名失败");
        return;
      }
      let huMonthScoreDtosTmp = value.data.huMonthScoreDtos;
      let huMonthScoreDtosCurr = this.data.huMonthScoreDtos;
      let huMonthScoreDtos = huMonthScoreDtosCurr.concat(huMonthScoreDtosTmp);
      console.log(huMonthScoreDtos);
      let totalNum = value.data.totalNum;
      this.setData({
        huMonthScoreDtos: huMonthScoreDtos,
        totalNum: totalNum,
        pageNum: pageNum,
        pageSize: pageSize
      });
    });
  },

  scrolltolower:function(){
    this.onReachBottom();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.toNextPage();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

function hasNextPage(pageNum, pageSize, totalNum){
  let maxPageNum = totalNum/pageSize+1;
  return maxPageNum > pageNum;
}