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
    'bgColor':'#FFF',

    'chooseTimeWidth':'150rpx',
    'isShowOverlay':false,
    'IS_SHOW_CHOOSE_AREA':false,
    'ordQueryDesc':'请选择',
    'iconName':'jia-shouqi',
    'isShowCondition':true,

    'btuBottom':'',

    'APPTORDLOGDTOS':[],
    'isLoading': false,
    'TOTALCOUNT': 0 ,
    'CURRENTCOUNT': 0,

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
    this.PAGENUM=1;
    this.PAGESIZE=5;
    let cInnerText=new Array();
    cInnerText[0]='';
    cInnerText[1]='';
    cInnerText[2]='';
    this.innerText=cInnerText;
    this.jsonParam=options.jsonParam||'';
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
     this.queryMore();
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
    this.objId = event.detail;
    this.getObjName(this.objId);
    this.showText();
    
  },
  getObjName:function(objId){
    for(let k=0;k<this.data.OBJINFOS.length;k++){
      if(this.data.OBJINFOS[k].value==objId){
        if(objId=='0'){
          this.innerText[0]='';
        }else{
          this.innerText[0]=this.data.OBJINFOS[k].text;
        }
        break;
      }
    }
  },
  chooseThisStat:function(event){
    let stat = event.currentTarget.dataset.stat;
    let statDesc = event.currentTarget.dataset.statdesc;
    this.innerText[1]=statDesc;
    this.showText();
    this.stat=stat;
    this.setData({'CHOOSED_STAT':stat});
  },
  getStatDesc:function(stat){
    if(stat=='I'){
      this.innerText[1]='未付款';
    }else if(stat=='ALL'){
      this.innerText[1]='全部';
    }else if(stat=='S'){
      this.innerText[1]='已支付';
    }else if(stat=='R'){
      this.innerText[1]='已退款';
    }else if(stat=='P'){
      this.innerText[1]='部分退款';
    }else if(stat=='O'){
      this.innerText[1]='退款中';
    }else if(stat=='DH'){
      this.innerText[1]='已取消';
    } 
  },
  chooseThisDate:function(event){
    let date = event.currentTarget.dataset.date;
    if(date=='D'){
      this.beginDate=dateUtil.convertShortDateToLang(dateUtil.getCurrentDate("yyyyMMdd"));
      this.endDate=dateUtil.convertShortDateToLang(dateUtil.getCurrentDate("yyyyMMdd"));
      this.innerText[2]=this.beginDate+"~"+this.endDate;
      this.showText();
    }else if(date=='W'){
      let curWeek=dateUtil.getCurrentWeek();
      this.beginDate=curWeek.begin;
      this.endDate=curWeek.end;
      this.innerText[2]=this.beginDate+"~"+this.endDate;
      this.showText();
    }else if(date=='L'){
      let preWeek=dateUtil.getPreWeek();
      this.beginDate=preWeek.begin;
      this.endDate=preWeek.end;
      this.innerText[2]=this.beginDate+"~"+this.endDate;
      this.showText();
    }else{
      let currentMonth=dateUtil.getCurrentMonth();
      this.beginDate=currentMonth.begin;
      this.endDate=currentMonth.end;
      this.innerText[2]=this.beginDate+"~"+this.endDate;
      this.showText();
    }
    this.setData({'CHOOSED_DATE':date,'CHOOSED_TIME_AREA':'按日历选择','chooseTimeWidth':'150rpx'});
  },
  chooseTimeArea:function(){
    this.setData({ 'IS_SHOW_CHOOSE_AREA': true, 'isShowOverlay': true});
  },
  hideDateOverLay:function(){
    this.setData({ 'IS_SHOW_CHOOSE_AREA': false, 'isShowOverlay': false});
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
    if(e.detail.endDate>dateUtil.getCurrentDate('yyyyMMdd')){
         //接口返回错误
      wx.showToast({
        title: '查询日期间隔不能超过今天',
        icon: 'none'
      })
      return false;
    }
    
    this.setData({'CHOOSED_TIME_AREA':choosedDate,'chooseTimeWidth':'400rpx','IS_SHOW_CHOOSE_AREA': false, 'isShowOverlay': false,'CHOOSED_DATE':''});

    this.beginDate = dateUtil.convertShortDateToLang(e.detail.startDate);
    this.endDate=dateUtil.convertShortDateToLang(e.detail.endDate);

    this.innerText[2]=this.beginDate+'~'+this.endDate;
    this.showText();

    // this.requestApptTimeInfo();
  },
  requestApptObjInfo: function () {
    this.showLoading(!0);
    var data = {
      // 'CUSTID': '3048000060',
      'CUSTID': app.globalData.userInfo.CUSTID,
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
      }, fail: function (res) {
        wx.showToast({
          title: res && res.data && res.data.ERRDESC ? res.data.ERRDESC : "网络繁忙,请稍后再试",
          icon: 'none'
        })
      },
      complete: function () {
        that.showLoading(!1);
        if(that.jsonParam&&that.jsonParam!=''){
          let param=JSON.parse(that.jsonParam);
          that.beginDate =param.beginDate;
          that.endDate = param.endDate;
          that.objId=param.objId;
          that.stat=param.stat;
          that.setData({
            'selStartDate':dateUtil.convertLongDateToShort(that.beginDate),
            'selEndDate':dateUtil.convertLongDateToShort(that.endDate),
            'CHOOSED_OBJID':that.objId,
            'CHOOSED_STAT':that.stat,
            'CHOOSED_DATE':'',
            'CHOOSED_TIME_AREA':that.beginDate+'~'+that.endDate,
            'chooseTimeWidth':'400rpx'
          });
          that.getObjName(that.objId);
          that.getStatDesc(that.stat);
          that.innerText[2]=that.beginDate+'~'+that.endDate;
          that.showText();
          that.requestApptOrdInfos();
        }else{
          that.beginDate =dateUtil.convertShortDateToLang(dateUtil.getCurrentDate("yyyyMMdd"));
          that.endDate = dateUtil.convertShortDateToLang(dateUtil.getCurrentDate("yyyyMMdd"));
          that.objId='0';
          that.stat='ALL';
          that.setData({
            'CHOOSED_DATE':'D',//当日
            'CHOOSED_TIME_AREA':'按日历选择',
            'CHOOSED_OBJID':that.objId,
            'CHOOSED_STAT':that.stat,
          });
          that.innerText[0]='';
          that.getStatDesc(that.stat);
          that.innerText[2]=that.beginDate+'~'+that.endDate;
          that.showText();
        }
      }
    });
  },
  showText:function(){
    if(this.innerText[0]==''&&this.innerText[1]==''&&this.innerText[2]==''){
      this.setData({'ordQueryDesc':'请选择'});
    }else{
       let ordQuery='';
       if(this.innerText[0]!=''){
        ordQuery=ordQuery+this.innerText[0]+"|";
       }
       if(this.innerText[1]!=''){
        ordQuery=ordQuery+this.innerText[1]+"|";
       }
       if(this.innerText[2]!=''){
        ordQuery=ordQuery+this.innerText[2];
       }
       if(ordQuery.substring(0,1)=='|'){
        ordQuery=ordQuery.substring(l);
       }
       if(ordQuery.substring(ordQuery.length-1,ordQuery.length)=='|'){
        ordQuery=ordQuery.substring(0,ordQuery.length-1);
       }
       this.setData({'ordQueryDesc':ordQuery});
    }
  },
  onQueryApptInfo:function(){
     if(this.objId=='0'||this.objId==''){
        wx.showToast({
          title: '请选择预约标的',
          icon: 'none'
        })
        return false;
     }
      if(this.stat==''){
        wx.showToast({
          title: '请选择订单状态',
          icon: 'none'
        })
        return false;
      }
      if(this.beginDate==''||this.endDate==''){
        wx.showToast({
          title: '请选择下单时间',
          icon: 'none'
        })
        return false;
      }
      this.PAGENUM=1;
      this.showCondition();
      this.showLoading(!0);
      this.requestApptOrdInfos();
      return false;
   },
   requestApptOrdInfos: function () {
    var data = {
      'CUSTID': app.globalData.userInfo.CUSTID,
      // 'CUSTID': '3048000060',
      'OBJID':this.objId,
      'ORDBEGINDATE': dateUtil.convertLongDateToShort(this.beginDate),
      'ORDENDDATE': dateUtil.convertLongDateToShort(this.endDate),
      'STAT':this.stat=='ALL'?'':this.stat,
      'PAGENUM': this.PAGENUM,
      'PAGESIZE': this.PAGESIZE
    };
    var that = this;
    netWork.RequestMQ.request({
      url: api.queryApptOrdLog,
      method: 'POST',
      data: data,
      success: (res) => {
        if (res.data.RESPCODE == '000') {
          for(let i=0;i<res.data.APPTORDLOGDTOS.length;i++){
            var APPTORDDTLS=res.data.APPTORDLOGDTOS[i].APPTORDDTLDTOS;
            for(let k=0;k<APPTORDDTLS.length;k++){
              let apptDateDesc=APPTORDDTLS[k].APPTDATEDESC;
              APPTORDDTLS[k].APPTDATEDAY=apptDateDesc.substring(5);
            }
          }
          let apptOrdLogDtos=that.PAGENUM==1?res.data.APPTORDLOGDTOS:that.data.APPTORDLOGDTOS.concat(res.data.APPTORDLOGDTOS);
          that.apptOrdLogDtos=apptOrdLogDtos;
          that.setData({ 'APPTORDLOGDTOS': apptOrdLogDtos, 'isLoading': false, 'CURRENTCOUNT': apptOrdLogDtos.length, 'TOTALCOUNT': res.data.TOTALRECORD});
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
        if (that.data.APPTORDLOGDTOS.length == 0) {
          that.setData({ 'bgColor': 'white' });
        } else {
          that.setData({ 'bgColor': '#F3F5F5' });
        }
      }
    }); 
  },
  queryMore() {
    if(this.data.CURRENTCOUNT==this.data.TOTALCOUNT){
      return;
    }else{
      this.PAGENUM = this.PAGENUM + 1;
      this.setData({ 'isLoading': true });
      this.showLoading(!0);
      this.requestApptOrdInfos();
    }
  },
})