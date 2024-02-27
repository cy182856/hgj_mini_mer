// subpages/heo/heoinfo.js
const app = getApp(),
heo = require('../../../model/heoinfo'),
dateUtil = require('../../../utils/dateUtil');
import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    queryType:'A', // A -- 审核  R -- 我的发布  P -- 我的参与
    curYear: new Date().getFullYear(), 
    curMonth: new Date().getMonth() + 1,
    today: new Date().getDate(),
    prev: !0,
    next: !0,
    header: true,           
    week_title: true,    
    title_type: 'cn',  
    cellSize:100,
    more:!1, 
    style: [],
    currentDate: new Date().getTime(),
    maxDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      }else if(type==='day'){
        return `${value}日`;
      }
      return value;
    },
    iconName:'jia-zhankai',
    showSelectCondition:false,
    condition:'分类:HEOTYPEDESC | 状态:STATDESC | RELEASEDATE',
    conditionDesc:'',
    iphoneX:app.globalData.iphoneX,
    heoTypeList:[],
    heoInfos:[],
    select_type_height:410,
    select_stat_height:320,
    selectTypeList:{heoType:'',heoTypeDesc:'全部'},
    selectHeoStat:{stat:'',statDesc:'全部'},
    heoStatList:[{stat:'',statDesc:'全部'},
      {stat:'I',statDesc:'待审核'},
      {stat:'R',statDesc:'审核拒绝'},
      {stat:'N',statDesc:'正常'},
      {stat:'C',statDesc:'关闭'},
      {stat:'D',statDesc:'删除'}
    ],
    checkBtnClass:[
      {name:"last-week",class:"not-check-btn"},
      {name:"current-week",class:"not-check-btn"},
      {name:"last-month",class:"not-check-btn"},
      {name:"current-month",class:"not-check-btn"}
    ],
    isTopClass:[{name:"isTop",class:"not-check-btn",type:'Y'},
      {name:"isNotTop",class:"not-check-btn",type:'N'}
    ],
    selDateShow:!1,
    showCanlendarText:!0,
    pageNum:1,
    pageSize:7,
    isRefreshing:!1,
    hasMoreData:!1,
    isLoadingMoreData:!1,
    isRefreshing:!1,
    showRefuseDescInput:false,
    inputLength :0,
    popupTop:'45%'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),heo.heoinfo.init(), this.showLoading(!0);
    this.setData({
      selStartDate:dateUtil.getDaysAgo(6,2),
      selEndDate:dateUtil.getCurrentDate("yyyyMMdd"),
      showStartDate:dateUtil.convertShortDateToOther(dateUtil.getDaysAgo(6,2),'.'),
      showEndDate:dateUtil.getCurrentDate("yyyy.MM.dd"),
      queryFinish:false
    })
    this.revertConditionDesc()
    heo.heoinfo.initHeoTypeList();
    heo.heoinfo.queryHeoInfos();
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
    heo.heoinfo.init()
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
      isRefreshing:true,
      pageNum:1,
      isLoadingMoreData: false,
      hasMoreData:true,
      queryFinish:false
    })
    heo.heoinfo.queryHeoInfos();
    wx.stopPullDownRefresh({
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.isRefreshing || this.data.isLoadingMoreData || !this.data.hasMoreData) {
      return;
    }
    this.setData({
      isLoadingMoreData: true
      ,pageNum:this.data.pageNum +1
    })
    heo.heoinfo.queryHeoInfos();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  refreshHeoInfos:function(heoInfo){
    var heoInfos = this.data.heoInfos;
    for(var index in heoInfos){
      if(heoInfo.heoDate == heoInfos[index].heoDate
        && heoInfo.heoSeqId == heoInfos[index].heoSeqId){
          heoInfos[index].stat = heoInfo.stat
          heoInfos[index].refuseDesc = heoInfo.refuseDesc
        }
    }
    this.setData({
      heoInfos:heoInfos
    })
  },
  showCondition:function(){
    var that = this;
    if(that.data.iconName == 'jia-zhankai'){
      that.setData({
        iconName:"jia-shouqi" ,
        showSelectCondition:true
      })
    }else{
      that.setData({
        iconName:"jia-zhankai" ,
        showSelectCondition:false
      })
    }
  },
  onHeoTypeListChange:function(e){
    let index = e.currentTarget.dataset.index;
    this.setData({
      selectTypeList:this.data.heoTypeList[index],
      heoType:this.data.heoTypeList[index].heoType
    })
    this.selectComponent('#heoType').toggle();
  },
  hideConditionOverLay:function(){
    this.setData({
      iconName:"jia-zhankai",
      showSelectCondition: !1,
    })
  },
  hideOverLay:function(){
    this.setData({
      selDateShow: !1
    })
  },
  onHeoStatChange:function(e){
    let index = e.currentTarget.dataset.index;
    this.setData({
      selectHeoStat:this.data.heoStatList[index],
      stat:this.data.heoStatList[index].stat
    })
    this.selectComponent('#heoStat').toggle();
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
  revertConditionDesc:function(){
    let heoTypeDesc = this.data.selectTypeList.heoTypeDesc;
    let statDesc = this.data.selectHeoStat.statDesc;
    var dateDesc = '';
    if(this.data.showStartDate && this.data.showEndDate){
      if(this.data.showStartDate == this.data.showEndDate){
        dateDesc = this.data.showStartDate
      }else{
        dateDesc = this.data.showStartDate + '~' + this.data.showEndDate
      }
    }else{
      dateDesc = '未选择发布日期'
    }
    this.setData({
      conditionDesc:this.data.condition.replace('HEOTYPEDESC',heoTypeDesc)
      .replace('STATDESC',statDesc).replace('RELEASEDATE',dateDesc)
    })
  },
  chekHeoInfoDetail:function(e){
    console.log(e.currentTarget.dataset.item)
    var heoInfo = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: "/subpages/heo/heodetail/heodetail?heoDate=" + heoInfo.heoDate + "&heoSeqId=" + heoInfo.heoSeqId
      + "&queryType=" + "A"
    })
  },
  previewImage: function(e){
    wx.previewImage({
        current: e.currentTarget.dataset.id,
        urls:e.currentTarget.dataset.item
    })
  },
  onQueryHeoInfos:function(){
    this.setData({
      heoInfos:new Array(),
      pageNum:1,
      queryFinish:false
    })
    this.revertConditionDesc()
    heo.heoinfo.queryHeoInfos()
  },
  onLoadMore:function(){
    this.setData({
      pageNum:this.data.pageNum + 1
    })
    heo.heoinfo.queryHeoInfos()
  },
  updateHeoInfo:function(e){
    let heoInfo = e.currentTarget.dataset.item;
    let stat = e.currentTarget.dataset.stat;
    let oper = e.currentTarget.dataset.opername;
    if(stat == 'R'){
      this.setData({
        showRefuseDescInput:true,
        refuseHeoDate:heoInfo.heoDate,
        refuseHeoSeqId:heoInfo.heoSeqId
      })
    }else{
      Dialog.confirm({
        title: '提示',
        message: '确定'+ oper + '该帖子么？',
      }).then(() => {
          var updHeoInfo = {};
          updHeoInfo.heoDate = heoInfo.heoDate;
          updHeoInfo.heoSeqId = heoInfo.heoSeqId;
          updHeoInfo.stat = stat;
          heo.heoinfo.updHeoInfo(updHeoInfo,oper)
        })
        .catch(() => {
          console.log('点击取消')
        });
    }
  },
  onClickHide:function(){
    this.setData({
      showRefuseDescInput:!1,
      refuseDesc:'',
      refuseHeoDate:'',
      refuseHeoSeqId:'',
      inputLength:0
    })
  },
  bindRefuseDescBlur:function(){
    this.setData({
      popupTop:'45%'
    })
  },
  setRefuseDescFocus:function(){
    this.setData({
      refuseDescFocus:true,
      popupTop:'25%'
    })
  },
  inputRefuseDesc:function(e){
    let reg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u253D|[\A9|\AE]\u2525|\uA9|\uAE|\u2525/ig;  
    var refuseDesc = e.detail.value;
    var that = this;
    if(refuseDesc.match(reg)){
      wx.showToast({
        title: '拒绝理由不能输入表情符',
        icon:'none',
        duration:2500,
        success:function(){
          refuseDesc = refuseDesc.replace(reg,"");
          that.setData({
            inputLength:refuseDesc ? refuseDesc.length : 0,
            refuseDesc:refuseDesc
          })
        }
      });
    }else{
      this.setData({
        inputLength:refuseDesc ? refuseDesc.length : 0,
        refuseDesc:refuseDesc
      })
    }
  },
  refuseHeoInfo:function(){
    var updHeoInfo = {};
    var that = this;
    if(!this.data.refuseDesc 
      || this.data.refuseDesc == ''){
        wx.showToast({
          title: '请输入拒绝原因',
          icon:'none',
          duration:2500
        })
    }else{
      updHeoInfo.heoDate = this.data.refuseHeoDate;
      updHeoInfo.heoSeqId = this.data.refuseHeoSeqId;
      updHeoInfo.refuseDesc = this.data.refuseDesc;
      updHeoInfo.stat = 'R'
      heo.heoinfo.updHeoInfo(updHeoInfo,'审核拒绝')
    }
  },
  heoTopManager:function(e){
    var heoInfo = e.currentTarget.dataset.item;
    if(heoInfo.isTop == 'Y'){
      Dialog.confirm({
        title: '提示',
        message: '确定取消置顶该帖子么？',
      }).then(() => {
          var updHeoInfo = {};
          updHeoInfo.heoDate = heoInfo.heoDate;
          updHeoInfo.heoSeqId = heoInfo.heoSeqId;
          updHeoInfo.isTop = 'N';
          heo.heoinfo.updHeoInfo(updHeoInfo,'取消置顶')
        })
        .catch(() => {
          console.log('点击取消')
        });
    }else{
      Dialog.confirm({
        title: '提示',
        message: '确定置顶该帖子么？',
      }).then(() => {
          var updHeoInfo = {};
          updHeoInfo.heoDate = heoInfo.heoDate;
          updHeoInfo.heoSeqId = heoInfo.heoSeqId;
          updHeoInfo.isTop = 'Y';
          heo.heoinfo.updHeoInfo(updHeoInfo,'置顶')
        }).catch(() => {
          console.log('点击取消')
        });
    }
  },
  checkIsTop:function(e){
    var isTopClass = this.data.isTopClass;
    var isTopId = e.target.dataset.id;
    var that = this;
    var isTop = '';
    for (var index in isTopClass) {
      if(isTopClass[index].name === isTopId){
        if(isTopClass[index].class =="check-btn" ){
          isTopClass[index].class = "not-check-btn";
        }else{
          isTopClass[index].class = "check-btn";
          isTop = isTopClass[index].type
        }
      }else{
        isTopClass[index].class = "not-check-btn"
      }
    }
    that.setData({
      isTopClass:isTopClass,
      isTop:isTop
    })
  }
})