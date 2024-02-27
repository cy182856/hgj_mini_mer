// pages/home/family/memberList.js
let network = require("../../../utils/network")
let api = require("../../../const/api")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    houseInfo: {},
    showBuildingRoom:"",
    houseUsrList:[],
    PROPTYPE: "R",
    type: 1, //1:入住管理，2：业主管理 
    shortName:'',
    needReload:'N',
    isEdit:false,
    isNeedFollow:'N',
    remark:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type
    })
    if (this.data.type == 1) {
      wx.setNavigationBarTitle({
        title: '入住管理',
      })
    }
    else if (this.data.type == 2) {
      wx.setNavigationBarTitle({
        title: '房屋查询',
      })
    }
    this.data.userInfo = getApp().globalData.userInfo
    var that = this
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptHouseInfo', function(data) {
      console.log("acceptHouseInfo")
      console.log(data.data)
      let roomDetail = ''
      if (data.data.areaId != "000") {
        roomDetail = roomDetail + data.data.areaName 
      }
      roomDetail = roomDetail + data.data.buildingName + data.data.houseNo
      
      that.setData({
        shortName:getApp().globalData.userInfo.SHORTNAME,
        houseInfo : data.data,
        showBuildingRoom: roomDetail,
        PROPTYPE: that.data.userInfo.PROPTYPE,
        isNeedFollow: data.data.isNeedFollow,
        remark:data.data.houseRemark
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getMembers()
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
    if(this.data.needReload=="Y"){
      var pages = getCurrentPages();
      if(pages.length > 1){
          //上一个页面实例对象
        var prePage = pages[pages.length - 2];
          //关键在这里
        prePage.onCancelAccountThanRefreshList()
        }
    }
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

  getMembers() {
    var that = this;
    console.log(api.getMemberInfo)
    console.log(that.data.houseInfo.houseSeqId)
    console.log(that.data.houseInfo)
    network.RequestMQ.request({
      url:api.getMemberInfo,
      method: "POST",
      data: {
        "houseSeqId": that.data.houseInfo.houseSeqId,
      },
      success:function(a){
        that.setData({
          houseUsrList:  a.data.houseUsrInfo
        })
      },
      fail:function(a){
        
      },
      complete:function(a){
        
      }
    })
  },
  onClickUsr(e) {
    let index = e.currentTarget.dataset.index;
    console.log(this.data.houseUsrList[index])
    var that = this
    wx.navigateTo({
      url: './memberDetail?houseInfoDesc=' + that.data.showBuildingRoom + "&type=" + this.data.type,
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('MemberDetailEvent', { data: that.data.houseUsrList[index]})
      }
    })
  },
  onCheckAccount(){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否审核通过？',
      showCancel: true,
      success: function(res) {
        if (res.confirm) {
          network.RequestMQ.request({
            url:api.auditHouseUsrInfo,
            method: "POST",
            data: {
              "houseSeqId": that.data.houseInfo.houseSeqId
            },
            success:function(a){
              that.data.houseInfo.stat = 'N'
              that.setData({
                houseInfo:  that.data.houseInfo,
                needReload:'Y'
              })
            },
            fail:function(a){
              
            },
            complete:function(a){
              
            }
          })
        }}
      })
  },
  onCancelAccount() {
    var that = this;
    // return
    wx.showModal({
      title: '注销账户',
      content: '确定要注销账户吗？',
      showCancel: true,
      success: function(res) {
        if (res.confirm) {
          //注销账户
          console.log("注销账户")
          network.RequestMQ.request({
            url:api.cancelAccount,
            method: "POST",
            data: {
              "houseSeqId": that.data.houseInfo.houseSeqId
            },
            success:function(a){
              var pages = getCurrentPages();
              if(pages.length > 1){
                //上一个页面实例对象
                var prePage = pages[pages.length - 2];
                //关键在这里
                prePage.onCancelAccountThanRefreshList()
              }

              wx.navigateBack()
            },
            fail:function(a){
              wx.showToast({
                title: a.data.ERRDESC ? a.data.ERRDESC : '注销失败,请稍后重试',
                icon:'none',
                duration:2000
              })
            },
            complete:function(a){
              
            }
          })
        }
      }
    })
  },
  modifyFollowInfo(){
    var that = this
    wx.showLoading({
      title: '正在修改',
    })
    network.RequestMQ.request({
      url:api.updHouseInfo,
      method: "POST",
      data: {
        "custId": that.data.houseInfo.custId,
        "houseSeqId": that.data.houseInfo.houseSeqId,
        "isNeedFollow":that.data.isNeedFollow,
        "houseRemark":that.data.remark
      },
      
      success:function(a){
       
        that.setData({
          isEdit:false
        })
        const eventChannel = that.getOpenerEventChannel()
        eventChannel.emit('RefreshEvent', { data: 'M' })
        console.log("updHouseInfo",a)
   
      },
      fail:function(a){
        console.log("updHouseInfo","fail")
      },
      complete:function(a){
        console.log("updHouseInfo","complete")
        wx.hideLoading({
          success: (res) => {},
        })
      }
    })
  },
  ontapModify(){
    if(this.data.isEdit){
      this.modifyFollowInfo()

    
    }else{
      this.setData({
        isEdit:true
      })
    }
  },
  onFollowChange({ detail }){
    console.log("onFollowChange",detail)
   this.setData({
     isNeedFollow:detail?'Y':'N'
   })
  },
  inputRemark({detail}){
    console.log("onFollowChange",detail)
    this.setData({
      remark:detail
    })
  },
  ontapCancle(){
    this.setData({
      isEdit:false,
      isNeedFollow: this.data.houseInfo.isNeedFollow,
      remark:this.data.houseInfo.houseRemark
    })
  }
})