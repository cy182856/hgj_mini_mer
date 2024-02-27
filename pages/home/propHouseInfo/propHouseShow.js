const app = getApp(),
api = require("../../../const/api"),
storage = require("../../../const/storage"),
netWork = require("../../../utils/network");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    'isLoading':true,
    'rentOrSaleTitle':'租售方式',
    'floorAreaTitle':'楼层',
    'roomCntTitle':'房型',
    'time':new Date().getTime(),
    'bgColor':'#fff',

    'CHOOSED_FLOORAREA':'0',
    'CHOOSED_ROOMCNT':'0',
    'CHOOSED_RENTORSALE':'0',
    
    'RENTORSALES':[],
    'PROPHOUSESHOWDTOS':[],
    'TOTALRECORD':0,
    'CURRENTRECORD':0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(), this.showLoading(!1);
    this.isFirstLoad=true;
    this.pageNum=1;
    this.pageSize=5;
    this.rentOrSale='';
    this.floorArea='';
    this.roomCnt='';
    let iphone = app.globalData.iphone;
    if (iphone) {
      this.setData({
        btuBottom: '68rpx',
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示,返回时候刷新
   */
  onShow: function () {
    this.time=new Date().getTime();
    this.setData({'time':this.time});
    this.pageNum=1;
    this.pageSize=5;
   
    if(!this.isFirstLoad){
      this.requestPropHouseShows();
    }else{
      this.requestPropHouseInfo();
    }
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
  /**
   * 选中租赁方式时
   */
  chooseRentOrSale: function(event){
     let rentOrSale=event.detail;
     if(rentOrSale=='R'){
       this.rentOrSale='R';
       this.setData({'rentOrSaleTitle':'租赁'});
     }else if(rentOrSale=='S'){
       this.rentOrSale='S';
       this.setData({'rentOrSaleTitle':'售卖'});
     }else if(rentOrSale=='0'){
       this.rentOrSale='';
       this.setData({'rentOrSaleTitle':'租售方式'});
     }
     this.pageNum=1;
     this.requestPropHouseShows();
  },
  /**
   * 选择楼层时
   */
  chooseFloorArea:function(event){
     let floorArea=event.currentTarget.dataset.floorarea;
     let floorAreaDesc=event.currentTarget.dataset.floorareadesc;
     this.setData({'floorAreaTitle':floorAreaDesc,'CHOOSED_FLOORAREA':floorArea});
     this.pageNum=1;
     if(floorArea=='0'){
       this.floorArea='';
     }else{
       this.floorArea=floorArea;
     }
     this.selectComponent('#floorArea').toggle();
     this.requestPropHouseShows();
  },
  /**
   * 选择房型
   */
  chooseRoomCnt:function(event){
    let roomCnt=event.currentTarget.dataset.roomcnt;
    let roomCntDesc=event.currentTarget.dataset.roomcntdesc;
    this.setData({'roomCntTitle':roomCntDesc,'CHOOSED_ROOMCNT':roomCnt});
    this.pageNum=1;
    if(roomCnt=='0'){
      this.roomCnt='';
    }else{
      this.roomCnt=roomCnt;
    }
    this.selectComponent('#roomCnt').toggle();
    this.requestPropHouseShows();
  },
  /**
   * 物业简介页面前往
   */
  getHouseBriefDesc:function(){
    wx.navigateTo({
      url: '/pages/home/propHouseInfo/propBriefDesc',
    })
  },
  /**
   * 房屋展示信息
   */
  imageEdit:function(event){
    let showId=event.currentTarget.dataset.showid;
    let houseInfo=event.currentTarget.dataset.houseinfo;
    let houseTitle=event.currentTarget.dataset.housetitle;
    wx.navigateTo({
      url: '/pages/home/propHouseInfo/propHouseShowDetail?showId='+showId+'&houseInfo='+houseInfo+'&houseTitle='+houseTitle,
    })
  },
  requestPropHouseInfo:function(){
    this.showLoading(!0);
    var data = {
     'CUSTID': app.globalData.userInfo.CUSTID,
      // 'CUSTID': '3048000060',
      'PAGENUM':this.pageNum,
      'PAGESIZE':this.pageSize 
    };
    var that = this;
    netWork.RequestMQ.request({
      url: api.queryPropHouseInfo,
      method: 'POST',
      data: data,
      success: (res) => {
        if (res.data.RESPCODE == '000') {
          //租赁方式的获取
           let rentOrSales=[];
           let rentOrSale={};
           rentOrSale.text='不限';
           rentOrSale.value='0';
           rentOrSales.push(rentOrSale);
           for(let i=0;i<res.data.RENTORSALES.length;i++){
              let curRentOrSale={};
              if(res.data.RENTORSALES[i]=='S'){
                curRentOrSale.text='售卖';
                curRentOrSale.value='S';
              }else{
                curRentOrSale.text='租赁';
                curRentOrSale.value='R';
              }
              rentOrSales.push(curRentOrSale);
            }
            that.setData({'PROPHOUSESHOWDTOS':res.data.PROPHOUSESHOWDTOS,'TOTALRECORD':res.data.TOTALRECORD,'CURRENTRECORD':res.data.PROPHOUSESHOWDTOS.length,'RENTORSALES':rentOrSales});  
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
        that.isFirstLoad=false;
        if(that.data.PROPHOUSESHOWDTOS.length>0){
          that.setData({'isLoading':false,'bgColor':'#F2F2F2'});
        }else{
          that.setData({'isLoading':false,'bgColor':'#fff'});
        }
      }
    });
  },
  requestPropHouseShows:function(){
    this.showLoading(!0);
    var data = {
      'CUSTID': app.globalData.userInfo.CUSTID,
      // 'CUSTID': '3048000060',
      'RENTORSALE':this.rentOrSale,
      'ROOMCNT':this.roomCnt,
      'FLOORAREA':this.floorArea,
      'PAGENUM':this.pageNum,
      'PAGESIZE':this.pageSize 
    };
    var that = this;
    netWork.RequestMQ.request({
      url: api.queryPropHouseShowInfo,
      method: 'POST',
      data: data,
      success: (res) => {
        if (res.data.RESPCODE == '000') {
          let propHouseShows=that.pageNum==1?res.data.PROPHOUSESHOWDTOS:that.data.PROPHOUSESHOWDTOS.concat(res.data.PROPHOUSESHOWDTOS);
           that.setData({'PROPHOUSESHOWDTOS':propHouseShows,'TOTALRECORD':res.data.TOTALRECORD,'CURRENTRECORD':propHouseShows.length});
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
        if(that.data.PROPHOUSESHOWDTOS.length>0){
          that.setData({'isLoading':false,'bgColor':'#F2F2F2'});
        }else{
          that.setData({'isLoading':false,'bgColor':'#fff'});
        }
      }
    });
  },
  queryMore:function(){
    if(this.data.CURRENTRECORD==this.data.TOTALRECORD){
      return;
    }else{
      this.pageNum = this.pageNum + 1;
      this.setData({ 'isLoading': true });
      this.requestPropHouseShows();
    }
  }

})