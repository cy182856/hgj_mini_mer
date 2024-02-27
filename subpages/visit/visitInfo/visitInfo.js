const network = require("../../../utils/network");
const api = require("../../../const/api");
const app = getApp();
const dateUtil = require('../../../utils/dateUtil');
import storage from "../../../utils/storageUtils";

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
    CUSTID: "",
    showArea: false,
    showBuilding:false,
    showRoom:false,
    areaList: [],
    buildingList: [{buildingId:'',buildingName: '全部'}],
    select_height:580,
    roomList: [{houseSeqId:'',houseNo: '全部'}],
    checkBtnClass:[
      {name:"last-week",class:"not-check-btn"},
      {name:"current-week",class:"not-check-btn"},
      {name:"last-month",class:"not-check-btn"},
      {name:"current-month",class:"not-check-btn"}
    ],
    selectArea: {areaId:'0', areaName: "请选择区域"},
    selectBuilding: {buildingId:'',buildingName: '全部'},
    selectRoom: {houseSeqId:'',houseNo: '全部'},
    isIphoneX:!1,
    visitLogs:[],
    selDateShow:!1,
    showCanlendarText:!0,
    //分页数据处理
    pageNum: 1,
    pageSize:10,
    loading: false,//是否正在加载
    more: false, //是否还有数据
    showSelectCondition:!0,
    selCondition:'请选择生成日期',
    iconName:'jia-shouqi',
    displayOverlay:'none',
    selStartDate:'',
    selEndDate:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userInfo(),app.loading(),this.showLoading(!0);
    this.setData({
      selStartDate:dateUtil.getDaysAgo(6,2),
      selEndDate:dateUtil.getCurrentDate("yyyyMMdd"),
      showStartDate:dateUtil.convertShortDateToOther(dateUtil.getDaysAgo(6,2),'.'),
      showEndDate:dateUtil.getCurrentDate("yyyy.MM.dd"),
      isIphoneX:app.globalData.iphoneX,
      windowH : app.globalData.windowH
    });
    this.onRequestArea()
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
      more:true,
      loading:false,
      isRefreshing:true,
      visitLogs:new Array()
    })
    this.queryVisitLogs()
    wx.stopPullDownRefresh({
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom: function () {
  //   if (this.data.isRefreshing || this.data.loading || !this.data.more) {
  //     return;
  //   }
  //   this.onLoadMore()
  // },

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

  },

  onRequestArea() {
    var that = this;
    network.RequestMQ.request({
      url:api.queryHouseArea,
      method: "POST",
      data: {
        "custId": that.data.CUSTID,
      },
      success:function(a){
        if (a.data.areaInfo == null) {
          if(a.data.buildingInfo == null) {
            console.log("既没有区域 也没有楼号 数据")
            that.setData({
              showArea: false,
              selectArea: {areaId:'000', areaName:''},
              showBuilding:true
            })
          }
          else {//无区域 有楼号
            that.setData({
              buildingList:  that.data.buildingList.concat(a.data.buildingInfo),
              selectArea: {areaId:'000', areaName:''},
              showArea: false,
              showBuilding:true
            })
          }
        }
        else  {//有区域
          that.setData({
            showArea: true,
            areaList: a.data.areaInfo
          })
        }
      },
      fail:function(a){
        
      },
      complete:function(a){
        that.showLoading(!1)
      }
    })
  },

  onRequestBuilding() {
    var that = this;
    that.showLoading(!0);
    network.RequestMQ.request({
      url:api.queryHouseBuilding,
      method: "POST",
      data: {
        "custId": that.data.CUSTID,
        "areaId": that.data.selectArea.areaId,
      },
      success:function(a){
        that.setData({
          buildingList: that.data.buildingList.concat(a.data.buildingInfo),
          showBuilding:true
        })
      },
      fail:function(a){
        
      },
      complete:function(a){
        that.showLoading(!1)
      }
    })
  },
  onRequestRoom() {
    var that = this;
    // console.log(that.data.selectBuilding.BuildingInfo)
    that.showLoading(!0)
    network.RequestMQ.request({
      url:api.queryHouseRoom,
      method: "POST",
      data: {
        "custId": that.data.CUSTID,
        "areaId": that.data.selectArea.areaId,
        "buildingId": that.data.selectBuilding.buildingId
      },
      success:function(a){
        that.setData({
          roomList: that.data.roomList.concat(a.data.houseInfo),
          showRoom:true
        })
      },
      fail:function(a){
        
      },
      complete:function(a){
        that.showLoading(!1)
      }
    })
  },

  onAreaChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("area: " + index)
    this.selectComponent('#area').toggle();
    this.setData({
      selectArea: this.data.areaList[index],
      buildingList: [{buildingId:'',buildingName: '全部'}],
      roomList: [{houseSeqId:'',houseNo: '全部'}],
      selectBuilding: {buildingId:'', buildingName: '全部'},
      selectRoom: {houseSeqId:'', houseNo: '全部'},
    })
    this.onRequestBuilding()
  },

  onBuildingChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("building: " + index)
    this.selectComponent('#building').toggle();
    this.setData({
      selectBuilding: this.data.buildingList[index],
      roomList: [{houseSeqId:'',houseNo: '全部'}],
      selectRoom: {houseSeqId:'', houseNo: '全部'}
    })
    this.onRequestRoom();
  },

  onRoomChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("room: " + index)
    this.selectComponent('#room').toggle();
    this.setData({
      selectRoom: this.data.roomList[index]
    })
  },
  onQueryVisitInfo() {
    // if (this.data.selectArea.areaId == "0") {
    //   wx.showToast({
    //     title: '请选择区域',
    //     icon: 'none'
    //   })
    //   return false;
    // }
    if(!this.data.selStartDate || this.data.selStartDate == ''
    || !this.data.selEndDate || this.data.selEndDate == ''){
      wx.showToast({
        title: '请选择生成日期',
        icon: 'none'
      })
      return false;
    }
    this.data.pageNum = 1
    this.setData({
      visitLogs: new Array()
    })
    this.queryVisitLogs(false)
  },
  queryVisitLogs(type) {
    let that = this
    that.showLoading(!0)
    
    wx.request({
      url: api.queryVisitLogs,
      header: {
        'content-type': 'application/json',
        'token':new storage().getToken().toString()
      },
      data:{
        "pageNum": that.data.pageNum,
        "pageSize": that.data.pageSize,
        "beginVisitDate":that.data.selStartDate ,
        "endVisitDate":that.data.selEndDate
      },
      success: function (value) {
        console.log('访客记录返回:', value);
        if (value.data.respCode == "000") {
          var visitLogs = value.data.list;
          let totalNum = value.data.totalNum;
          var pages = parseInt(value.data.pages);
          that.data.visitLogs.push.apply(that.data.visitLogs,visitLogs);
          that.setData({
            pages:pages,
            visitLogs:type == 'loadMore'?that.data.visitLogs:visitLogs,
            totalNum:totalNum
          })
        } else {
          wx.showToast({
              title: '查询访客信息失败',
              icon:'none'
          })
        }
      },    
      
      complete:function(a){
          that.showLoading(!1)
          var selCondition = (that.data.selectBuilding.buildingId == '' ? "" :that.data.selectBuilding.buildingName)
          + (that.data.selectRoom.houseSeqId == '' ? "" : that.data.selectRoom.houseNo)
          + that.data.showStartDate + '~' + that.data.showEndDate
          that.setData({
            showSelectCondition: !1,
            iconName:"jia-zhankai" ,
            loading:false,
            selCondition:selCondition,
            isRefreshing:false
          })
      }

    });


    // network.RequestMQ.request({
    //   url:api.queryVisitLogs,
    //   method: "POST",
    //   data: {
    //     "custId": that.data.CUSTID,
    //     "pageNum": that.data.pageNum,
    //     "pageSize": that.data.pageSize,
    //     "areaId": that.data.selectArea.areaId,
    //     "buildingId": that.data.selectBuilding.buildingId == '0' ? '' : that.data.selectBuilding.buildingId,
    //     "houseSeqId": that.data.selectRoom.houseSeqId == '0' ? '' : that.data.selectRoom.houseSeqId,
    //     "beginVisitDate":that.data.selStartDate ,
    //     "endVisitDate":that.data.selEndDate
    //   },
    //   success:function(a){
    //     if(null != a.data.data){
    //       var datas = a.data.data;
    //       for(var i in datas){
    //         if(datas[i].avlCnt >= 0){
    //           datas[i].perCent = datas[i].expCnt - datas[i].avlCnt + '/' + datas[i].avlCnt
    //         }else if(datas[i].avlCnt == -2){
    //           datas[i].perCent = datas[i].expCnt - 0 + '/' + 0
    //         }
    //       }
    //       that.setData({
    //         more:a.data.haveMoreData == 'Y' ? true:false,
    //         visitLogs:that.data.visitLogs.concat(datas)
    //       })
    //     }
    //   },
    //   fail:function(a){
    //     that.setData({
    //       loading: false,
    //     })
    //     wx.showToast({
    //       title: '查询访客信息失败',
    //       icon:'none'
    //     })
    //   },
    //   complete:function(a){
    //     that.showLoading(!1)
    //     // var selCondition = (that.data.selectArea.areaId == '0' ? '未选择' : that.data.selectArea.areaName) 
    //     // + (that.data.selectBuilding.buildingId == '' ? "" :that.data.selectBuilding.buildingName)
    //     // + (that.data.selectRoom.houseSeqId == '' ? "" : that.data.selectRoom.houseNo)
    //     // + ' | ' + that.data.showStartDate + '~' + that.data.showEndDate
    //     var selCondition = (that.data.selectBuilding.buildingId == '' ? "" :that.data.selectBuilding.buildingName)
    //     + (that.data.selectRoom.houseSeqId == '' ? "" : that.data.selectRoom.houseNo)
    //     + that.data.showStartDate + '~' + that.data.showEndDate
    //     that.setData({
    //       showSelectCondition: !1,
    //       iconName:"jia-zhankai" ,
    //       loading:false,
    //       selCondition:selCondition,
    //       isRefreshing:false
    //     })
    //   }
    // })
  },

  // onLoadMore() {
  //   this.setData({
  //     pageNum : this.data.pageNum +1,
  //     loading : true
  //   })
  //   this.queryVisitLogs(true)
  // },

  loadMore(event){
    var pageNum = this.data.pageNum + 1;
    this.setData({
      pageNum:pageNum,
    });
    this.queryVisitLogs('loadMore');
  },

  onDropMenuOpen() {
    // console.log("onDropMenuOpen")
  },
  onDropMenuClose() {
    // console.log("onDropMenuClose")
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
  checkStat:function(e){
    var checkBtnClass = this.data.checkBtnClass;
    var checkBtn = e.target.dataset.id;
    var that = this;
    var stat = '';
    for (var index in checkBtnClass) {
      if(checkBtnClass[index].name === checkBtn){
        if(checkBtnClass[index].class =="check-btn" ){
          checkBtnClass[index].class = "not-check-btn";
        }else{
          checkBtnClass[index].class = "check-btn";
          stat = that.data.checkBtnClass[index].stat
        }
      }else{
        checkBtnClass[index].class = "not-check-btn"
      }
    }
    this.setData({
      stat:stat,
      checkBtnClass:checkBtnClass
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
  checkVisitInoutLog:function(e){
    var visitLog = e.currentTarget.dataset.visitlog;
    if(!visitLog || visitLog == null){
      wx.showToast({
        title: '系统异常，请刷新后重试。',
        icon:'none'
      })
    }
    if(visitLog.stat == 'I'){
      return false;
    }
    wx.navigateTo({
      url: '/subpages/visit/visitInoutInfo/visitInoutInfo?visitDate=' + visitLog.visitDate + "&visitSeqId=" + visitLog.visitSeqId,
    })
  }
})