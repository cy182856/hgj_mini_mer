const app = getApp(),
api = require("../../const/api"),
storage = require("../../const/storage"),
dateUtil = require("../../utils/dateUtil"),
netWork = require("../../utils/network");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    'CHOOSED_OBJID':'0',
    'CHOOSED_TIME_AREA':'请选择预约日期区间',//时间区域
    'APPTTIMEDTLDTOS':[],

    'IS_SHOW_CHOOSE_AREA':false,
    'showCanlendarText':false,
    'isShowOverlay':true,
    'apptQueryDesc':'请选择预约标的以及日期区间',
    'iconName':'jia-shouqi',
    'isShowCondition':true,
    // 'isLoading':false,
    'btuBottom':'',

    'curYear': new Date().getFullYear(),
    'curMonth': new Date().getMonth() + 1,
    'today': new Date().getDate(),
    'prev': !0,
    'next': !0,
    'header': true,
    'week_title': true,  
    'title_type': 'cn',  
    'cellSize': 100,
    'more': !1,
    'style': [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(), this.showLoading(!1);
    this.beginDate = '';
    this.endDate = '';
    this.objId='';
    let cInnerText=new Array();
    cInnerText[0]='';
    cInnerText[1]='';
    this.innerText=cInnerText;
    let iphone = app.globalData.iphone;
    if (iphone) {
      this.setData({
        btuBottom: '68rpx',
      })
    }
    this.requestApptObjInfo();
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
  showCondition:function(){
    if(this.data.isShowCondition){
      this.setData({'isShowCondition':!this.data.isShowCondition,'iconName':"jia-zhankai"});
    }else{
      this.setData({'isShowCondition':!this.data.isShowCondition,'iconName':"jia-shouqi"});
    }
  },
  chooseObj:function(event){
    this.objId=event.detail;

    for(let k=0;k<this.data.OBJINFOS.length;k++){
      if(this.data.OBJINFOS[k].value==this.objId){
        if(this.objId=='0'){
          this.innerText[0]='';
        }else{
          this.innerText[0]=this.data.OBJINFOS[k].text;
        }
        break;
      }
    }
    if(this.innerText[0]==''&&this.innerText[1]==''){
      this.setData({'apptQueryDesc':'请选择预约标的以及日期区间'});
    }else{
       if(this.innerText[0]!=''&&this.innerText[1]!=''){
         this.setData({'apptQueryDesc':this.innerText[0]+'|'+this.innerText[1]});
       }else{
         this.setData({'apptQueryDesc':this.innerText[0]+this.innerText[1]});
       }
    }
 
    // this.requestApptTimeInfo();
  },
  chooseTimeArea:function(){
    this.setData({ 'IS_SHOW_CHOOSE_AREA': true, 'isShowOverlay': true});
  },
  // hideOverLay:function(){
  //   this.setData({ 'isShowCondition': false});
  // },
  hideDateOverLay:function(){
    this.setData({ 'IS_SHOW_CHOOSE_AREA': false, 'isShowOverlay': false});
    this.selectComponent('#item').toggle();
  },
  confirmDate: function (e) {
    let choosedDate = dateUtil.convertShortDateToLang(e.detail.startDate) + '~' + dateUtil.convertShortDateToLang(e.detail.endDate);
    if (dateUtil.getDateDiff(dateUtil.convertShortDateToLang(e.detail.endDate), dateUtil.convertShortDateToLang(e.detail.startDate))>30){
      //接口返回错误
      wx.showToast({
        title: '查询日期间隔不超过31天',
        icon: 'none'
      })
      return false;
    }
    this.setData({'CHOOSED_TIME_AREA':choosedDate});
    this.setData({ 'IS_SHOW_CHOOSE_AREA': false, 'isShowOverlay': false });
    this.selectComponent('#item').toggle();
    
    this.beginDate = e.detail.startDate;
    this.endDate=e.detail.endDate;

    this.innerText[1]=dateUtil.convertShortDateToLang(this.beginDate)+'~'+dateUtil.convertShortDateToLang(this.endDate);
    if(this.innerText[0]==''&&this.innerText[1]==''){
      this.setData({'apptQueryDesc':'请选择预约标的以及日期区间'});
    }else{
       if(this.innerText[0]!=''&&this.innerText[1]!=''){
         this.setData({'apptQueryDesc':this.innerText[0]+'|'+this.innerText[1]});
       }else{
         this.setData({'apptQueryDesc':this.innerText[0]+this.innerText[1]});
       }
    }

    // this.requestApptTimeInfo();
  },
  requestApptObjInfo: function(){
    this.showLoading(!0);
    var data = {
      'CUSTID': app.globalData.userInfo.CUSTID,
      // 'CUSTID': '3048000060',
    };
    var that = this;
    netWork.RequestMQ.request({
      url: api.queryApptObjInfo,
      method: 'POST',
      data: data,
      success: (res) => {
        if (res.data.RESPCODE == '000') {
          let apptObjs = [];
          let apptObj = {};
          apptObj.value = '0';
          apptObj.text = '选择标的';
          apptObjs.push(apptObj);

          for (var i = 0; i < res.data.APPTOBJINFODTOS.length; i++) {
            let apptObj = {};
            apptObj.value = res.data.APPTOBJINFODTOS[i].OBJID;
            apptObj.text = res.data.APPTOBJINFODTOS[i].OBJNAME;
            apptObjs.push(apptObj);
          }

          that.setData({ 'OBJINFOS': apptObjs });
        } else {
          //接口返回错误
          wx.showToast({
            title: res.data.ERRDESC + '[' + res.data.RESPCODE + ']',
            icon: 'none'
          })
        }
      },fail: function (res) {
        wx.showToast({
          title: res && res.data && res.data.ERRDESC ? res.data.ERRDESC : "网络繁忙,请稍后再试",
          icon: 'none'
        })
      },
      complete: function () {
        that.showLoading(!1);
      }
    });
  },
  onQueryApptInfo:function(){
    this.showCondition();
    this.requestApptTimeInfo();
  },
  requestApptTimeInfo:function(){
    if(this.objId==''||this.objId=='0'||this.beginDate==''||this.endDate==''){
      this.setData({ 'APPTTIMEDTLDTOS': [], 'APPTOBJDTLDTOS': [], 'APPTDATES': [], 'isLoading': false });
      return;
    }

    this.showLoading(!0);
    var data = {
      'CUSTID': app.globalData.userInfo.CUSTID,
      // 'CUSTID': '3048000060',
      'OBJID': this.objId,
      'APPTBEGINDATE': this.beginDate,
      'APPTENDDATE': this.endDate
    };
    var that = this;
    netWork.RequestMQ.request({
      url: api.queryApptTimeDtl,
      method: 'POST',
      data: data,
      success: (res) => {
        if (res.data.RESPCODE == '000') {
          that.setData({ 'APPTTIMEDTLDTOS': res.data.APPTTIMEDTLDTOS, 'APPTOBJDTLDTOS': res.data.APPTOBJDTLDTOS, 'APPTDATES': res.data.APPTDATES, 'isLoading': false });
        } else {
          //接口返回错误
          wx.showToast({
            title: res.data.ERRDESC + '[' + res.data.RESPCODE + ']',
            icon: 'none'
          })
        }
      }, fail: function (res) {
        wx.showToast({
          title: res && res.data && res.data.ERRDESC ? res.data.ERRDESC : "网络繁忙,请稍后再试",
          icon: 'none'
        })
      },
      complete: function () {
        that.showLoading(!1);
      }
    });
  },
  ordQuery:function(){
    wx.navigateTo({
      url: '/subpages/appt/appt_ordDtl_query'
    })
  },
  queryApptTimeOrdInfo:function(event){
    let apptDate = event.currentTarget.dataset.apptdate;
    let apptTimeId = event.currentTarget.dataset.appttimeid;
    let apptTimeDesc = event.currentTarget.dataset.appttimedesc;
    wx.navigateTo({
      url: '/subpages/appt/appt_timeDtl_detail?apptDate='+apptDate+"&apptTimeId="+apptTimeId+"&objId="+this.objId+"&apptTimeDesc="+apptTimeDesc
    })
  }
})