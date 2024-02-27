const network = require("../../../utils/network");
const api = require("../../../const/api");
const app = getApp();
const dateUtil = require('../../../utils/dateUtil');
const common = require('../../../model/common');
var that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curYear: new Date().getFullYear(), 
    curMonth: new Date().getMonth() + 1,
    today: new Date().getDate(),
    prev: !0,
    next: !0,
    header: true,           
    week_title: true,    
    title_type: 'cn',  
    cellSize:100,
    isIphoneX:!1,
    visitLogs:[],
    selDateShow:!1,
    showCanlendarText:!0,
    select_height:580,
    visitTypes:[{type : '',typeDesc:'请选择'},
      {type:'I',typeDesc:'入场'},
      {type:'O',typeDesc:'离场'}],
    selectVisitType:{type:'',typeDesc:'请选择'},
    checkBtnClass:[
      {name:"last-week",class:"not-check-btn"},
      {name:"current-week",class:"not-check-btn"},
      {name:"last-month",class:"not-check-btn"},
      {name:"current-month",class:"not-check-btn"}
    ],
    propOperInfos:new Array(),
    visitInoutLogs:new Array(),
    selectPropOperInfo:{poName:'请选择',poSeqId:''},
    //分页数据处理
    pageNum: 1,
    pageSize:10,
    loading: false,//是否正在加载
    more: false, //是否还有数据
    showSelectCondition:!0,
    selCondition:'请选择查询条件',
    iconName:'jia-shouqi',
    displayOverlay:'none',
    selStartDate:'',
    selEndDate:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    app.loading(),common.common.init(),that.showLoading(!1);
    this.setData({
      selStartDate:dateUtil.getDaysAgo(6,2),
      selEndDate:dateUtil.getCurrentDate("yyyyMMdd"),
      showStartDate:dateUtil.convertShortDateToOther(dateUtil.getDaysAgo(6,2),'.'),
      showEndDate:dateUtil.getCurrentDate("yyyy.MM.dd"),
      isIphoneX:app.globalData.iphoneX,
      windowH : app.globalData.windowH
    });
    common.common.queryPropOperInfo();
  },

  onPropOperChange:function(e){
    let index = e.currentTarget.dataset.index;
    that.setData({
      selectPropOperInfo:that.data.propOperInfos[index]
    })
    this.selectComponent('#propOper').toggle();
  },

  onVisitTypeChange:function(e){
    let index = e.currentTarget.dataset.index;
    that.setData({
      selectVisitType:that.data.visitTypes[index]
    })
    this.selectComponent('#visitType').toggle();
  },
  checkDateArea:function(e){
    var checkBtnClass = this.data.checkBtnClass;
    var checkBtn = e.target.dataset.id;
    var startDate = '',
    endDate = '';
    var that = this;
    var checkClick = this.data.showCanlendarText;
    for (var index in checkBtnClass) {
      if(checkBtnClass[index].name === checkBtn){
        if(checkBtnClass[index].class =="check-btn" ){
          checkBtnClass[index].class = "not-check-btn";
          checkClick = true;
        }else{
          checkBtnClass[index].class = "check-btn";
          checkClick = false;
          var res = {};
          switch (index){
            case "0": 
              res = dateUtil.getPreWeek();
              break;
            case "1":
              res = dateUtil.getCurrentWeek();
              break;
            case "2":
              res = dateUtil.getPreMonth();
              break;
            case "3":
              res = dateUtil.getCurrentMonth();
              break;
          }
          startDate = res.begin;
          endDate = res.end;
        }
      }else{
        checkBtnClass[index].class = "not-check-btn"
      }
    }
    if(startDate == ''){
      startDate = dateUtil.getDaysAgo(6)
    }
    if(endDate == ''){
      endDate = dateUtil.getCurrentDate("yyyy-MM-dd")
    }
    this.setData({
      selStartDate:dateUtil.convertLongDateToShort(startDate),
      selEndDate:dateUtil.convertLongDateToShort(endDate),
      curYear: startDate.substring(0,4), 
      curMonth: endDate.substring(5,7),
      showStartDate:dateUtil.convertShortDateToOther(dateUtil.convertLongDateToShort(startDate),'.'),
      showEndDate:dateUtil.convertShortDateToOther(dateUtil.convertLongDateToShort(endDate),'.'),
      checkBtnClass:checkBtnClass,
      showCanlendarText:checkClick
    })
  },
  calendarChange:function(e){
    this.setData({
      selDateShow: !this.data.selDateShow,
      curYear: this.data.selStartDate ? this.data.selStartDate.substring(0,4) : new Date().getFullYear(), 
      curMonth: this.data.selEndDate ? this.data.selEndDate.substring(4,6) :  new Date().getMonth() + 1
    })
  },
  confirmDate:function(e){
    var startDate = dateUtil.convertShortDateToLang(e.detail.startDate),
    endDate = dateUtil.convertShortDateToLang(e.detail.endDate);
    console.log(dateUtil.getDateDiff(endDate,startDate))
    if(dateUtil.getDateDiff(endDate, startDate)>31){
      this.show ? this.show('日期间隔不能大于31天'):wx.showToast({
        title: '日期间隔不能大于31天',
        icon:'none'
      })
      return;
    }
    this.setData({
      selStartDate:e.detail.startDate,
      selEndDate:e.detail.endDate,
      showStartDate:dateUtil.convertShortDateToOther(e.detail.startDate,'.'),
      showEndDate:dateUtil.convertShortDateToOther(e.detail.endDate,'.'),
      selDateShow: !1,
      showCanlendarText:!1,
      checkBtnClass:[
        {name:"last-week",class:"not-check-btn"},
        {name:"current-week",class:"not-check-btn"},
        {name:"last-month",class:"not-check-btn"},
        {name:"current-month",class:"not-check-btn"}
      ]
    })
  },
  showCondition:function(){
    var that = this;
    if(that.data.iconName == 'jia-zhankai'){
      that.setData({
        iconName:"jia-shouqi" ,
        showSelectCondition:true,
        displayOverlay:'block'
      })
    }else{
      that.setData({
        iconName:"jia-zhankai" ,
        showSelectCondition:false,
        displayOverlay:'none'
      })
    }
  },
  hideOverLay:function(){
    this.setData({
      showSelectCondition: !1,
      iconName:"jia-zhankai" ,
      displayOverlay:'none'
    })
  },
  hideCheckDateOverLay:function(){
    this.setData({
      selDateShow: !1
    })
  },
  onQueryVisitInoutInfos:function(){
    let selectVisitType = that.data.selectVisitType
    let selectPropOperInfo = that.data.selectPropOperInfo
    var selCondition = ''
    if(selectVisitType.type && selectVisitType.type != ''){
      selCondition = selectVisitType.typeDesc + ' | '
    }
    if(selectPropOperInfo.poSeqId != ''){
      selCondition = selCondition + selectPropOperInfo.poName + ' | '
    }
    selCondition = selCondition + that.data.showStartDate + '~' + that.data.showEndDate
    that.setData({
      pageNum:1,
      visitInoutLogs:new Array(),
      selCondition:selCondition
    })
    that.queryVisitInoutInfos()
  },
  queryVisitInoutInfos:function(){
    that.showLoading(!0)
    let selectVisitType = that.data.selectVisitType
    let selectPropOperInfo = that.data.selectPropOperInfo
    var param = {
      visitType:selectVisitType.type,
      poSeqId :selectPropOperInfo.poSeqId,
      pageNum:that.data.pageNum,
      pageSize:that.data.pageSize,
      beginActVisitDate:that.data.selStartDate,
      endActVisitDate:that.data.selEndDate
    }
    console.log('查询访客出入日志请求参数',param)
    network.RequestMQ.request({
      url:api.queryVisitInoutLogs,
      data:param,
      success:function(res){
        console.log(res)
        if(res.data.data != null){
          that.setData({
            visitInoutLogs:that.data.visitInoutLogs.concat(res.data.data),
            more:res.data.more == 'Y' ? true : false
          })
        }else{
          that.setData({
            more:false
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '查询访客出入记录失败',
          icon:'none',
          duration:3000
        })
        that.setData({
          more:false
        })
      },
      complete:function(){
        that.showLoading(!1)
        that.setData({
          showSelectCondition: !1,
          iconName:"jia-zhankai" ,
          loading:false,
          isRefreshing:false
        })
      }
    })
  },
  checkVisitInoutLogs:function(e){
    var visitInoutLog = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/subpages/visit/visitInoutLogDetail/visitInoutLogDetail?visitInfo=' + JSON.stringify(visitInoutLog)
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
    that.setData({
      pageNum:1,
      more:true,
      loading:false,
      isRefreshing:true,
      visitInoutLogs:new Array()
    })
    that.queryVisitInoutInfos()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (that.data.isRefreshing || that.data.loading || !that.data.more) {
      return;
    }
    that.setData({
      pageNum : that.data.pageNum +1,
      loading : true
    })
    that.queryVisitInoutInfos()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})