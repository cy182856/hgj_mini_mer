const network = require('../../../utils/network');

var app = getApp(),
api = require('../../../const/api'),
heo = require('../../../model/heoinfo'),
that = null;
import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    type:'',
    queryType:'',
    isRefreshing:!1,
    hasMoreData:!1,
    isLoadingMoreData:!1,
    pageNum:1,
    pageSize:7,
    heoInfos:[],
    showStat:true,
    iphoneX:app.globalData.iphoneX,
    showHeoTypeClass:false,
    emptyMsg:'',
    showClose:true,
    heoTypeList:[],
    x:'680rpx',
    y:'780rpx',
    hasMoreData:true,
    ownerHeoThemes:[{theme:'S',themeDesc:'分享'},
    {theme:'P',themeDesc:'表扬'},
    {theme:'E',themeDesc:'曝光'},
    {theme:'N',themeDesc:'求助'},
    {theme:'G',themeDesc:'帮助'}],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),heo.heoinfo.init(), this.showLoading(!0),that= this;
    if(options.type == 'release'){
      this.setData({
        queryType:'R',
        emptyMsg:'您还没有发布任何信息',
        queryFinish:false
      })
      heo.heoinfo.queryHeoInfos();
      heo.heoinfo.initHeoTypeList();
    }else if(options.type == "partic"){
      this.setData({
        queryType:'P',
        emptyMsg:'您还没有参与任何信息',
        queryFinish:false
      })
    }
    var poSeqId = app.globalData.userInfo.POSEQID
    this.setData({
      type:options.type,
      poSeqId:poSeqId,
      windowH : app.globalData.windowH - 50
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
    let pages = getCurrentPages(); 
    let prePage = pages[pages.length - 2]; 
    prePage.onPullDownRefresh();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      isRefreshing:true,
      pageNum:1,
      isLoadingMoreData: false,
      hasMoreData:true
    })
    heo.heoinfo.queryHeoInfos();
    wx.stopPullDownRefresh();
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
  onChange(event) {
    if(event.detail.name == '0'){
      this.setData({
        pageNum:1,
        heoInfos:new Array(),
        queryType:'R',
        hasMoreData:true,
        emptyMsg:'您还没有发布任何信息',
        queryFinish:false
      })
      heo.heoinfo.queryHeoInfos()
    }else{
      this.setData({
        pageNum:1,
        heoInfos:new Array(),
        queryType:'P',
        hasMoreData:true,
        emptyMsg:'您还没有参与任何信息',
        queryFinish:false
      })
      heo.heoinfo.queryHeoInfos()
    }
  },
  onLoadMore:function(){
    this.setData({
      pageNum:this.data.pageNum + 1
    })
    heo.heoinfo.queryHeoInfos()
  },
  previewImage: function(e){
    wx.previewImage({
        current: e.currentTarget.dataset.id,
        urls:e.currentTarget.dataset.item
    })
  },
  chekHeoInfoDetail:function(e){
    var heoInfo = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '/subpages/heo/heodetail/heodetail?heoDate=' + heoInfo.heoDate + "&heoSeqId=" + heoInfo.heoSeqId 
      + "&queryType=" + this.data.queryType
    })
  },
  moveEnd:function(e){
    var xNumLeft = 20 / 750 * app.globalData.windowW;
  	var xNumRight = 680 / 750 * app.globalData.windowW;
  	var x = e.changedTouches[0].pageX;
    var average = 375 / 750 * app.globalData.windowW;
  	var yNum = e.changedTouches[0].clientY - 25;
  	if (x < average) {
  		this.setData({
  			x: xNumLeft,
			  y: yNum < 55 ? 55 : yNum
  		})
  	} else {
  		this.setData({
  			x: xNumRight,
		  	y: yNum < 55 ? 55 : yNum
  		})
    }
  },
  release:function(e){
    this.setData({
      showHeoTypeClass:!this.data.showHeoTypeClass
    })
  },
  closeCheckHeoType:function(){
    this.setData({
      showHeoTypeClass:!1
    })
  },
  updateHeoInfo:function(e){
    console.log(e.currentTarget.dataset)
    let heoInfo = e.currentTarget.dataset.item;
    let stat = e.currentTarget.dataset.stat;
    let oper = e.currentTarget.dataset.opername;
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
  },
  refreshHeoInfos:function(heoInfo){
    var heoInfos = this.data.heoInfos;
    for(var index in heoInfos){
      if(heoInfo.heoDate == heoInfos[index].heoDate
        && heoInfo.heoSeqId == heoInfos[index].heoSeqId){
          heoInfos[index].stat = heoInfo.stat
          heoInfos[index].notReadMsgCount = 0
          heoInfos[index].takePartInPraise = heoInfo.takePartInPraise
          heoInfos[index].praiseCnt = heoInfo.praiseCnt
        }
    }
    this.setData({
      heoInfos:heoInfos
    })
  },
  praiseHeo:function(e){
    let that = this;
    let heoInfo = e.currentTarget.dataset.item;
    let heoInfos = that.data.heoInfos;
    that.showLoading(!0)
    network.RequestMQ.request({
      url:api.doHeoPraise,
      data:{
        heoDate:heoInfo.heoDate,
        heoSeqId:heoInfo.heoSeqId,
        houseSeqId:heoInfo.houseSeqId
      },
      method:'POST',
      success:function(res){
        for(var index in heoInfos){
          if(heoInfos[index].heoDate == heoInfo.heoDate &&
            heoInfos[index].heoSeqId == heoInfo.heoSeqId){
              heoInfos[index].takePartInPraise = heoInfos[index].takePartInPraise == 'Y' ? 'N' : 'Y';
              heoInfos[index].praiseCnt = heoInfos[index].takePartInPraise == 'Y' ? parseInt(heoInfos[index].praiseCnt) + 1 : parseInt(heoInfos[index].praiseCnt) - 1 
              break;
            }
        }
        that.setData({
          heoInfos:heoInfos
        })
      },
      fail:function(fal){
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon:'none',
          duration:3000
        })
      },
      complete:function(){
        that.showLoading(!1)
      }
    })

  }
})