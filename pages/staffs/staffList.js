// pages/staffs/staffList.js
let network = require("../../utils/network")
let api = require("../../const/api")
let storage = require("../../const/storage")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postid: '01',
    iphoneX: false,
    staffs: [],
    selIndex: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let postID = options.POSTID
    if (postID) {
      this.data.postid = postID
    }
    this.setData({
      iphoneX: getApp().globalData.iphoneX
    })
    this.queryStaffList()
  },

  queryStaffList() {

    var that = this;
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    console.log("queryPoSpePost custId ", custId)
    console.log("queryPoSpePost iphoneX ", that.data.iphoneX)
    network.RequestMQ.request({
      url: api.queryPoSpePost,
      method: "POST",
      data: {
        "custId": custId,
        "stat": 'N',
        "postId": that.data.postid
      },
      success: function (a) {

        if (a.data.RESPCODE == "000") {
          a.data.poSpePostDtos.forEach(item => {
            item.Checked = false
          })

          that.setData({
            staffs: a.data.poSpePostDtos
          })
          console.log("queryPoSpePost S ", a.data.poSpePostDtos)
        }
      },
      fail: function (a) {
        console.log("queryPoSpePost F ", a)
      },
      complete: function (a) {
        console.log("queryPoSpePost C ")
      }
    })
  },
  onPersonClick(e) {
    console.log("onPersonClick C ", e)
    let index = e.currentTarget.dataset.index
   
    var staffItem = 'staffs[' + index + '].Checked';
    if (this.data.selIndex != -1) {
      var lastStaffItem = 'staffs[' + this.data.selIndex + '].Checked';
      this.setData({
        [lastStaffItem]: false,
        [staffItem]:true
      })
    }else{
      this.setData({    
        [staffItem]:true  
      })
    }   
    this.data.selIndex = index
  },
  onTapConfirm() {
    wx.navigateBack({
      complete: (res) => {
        delta: 1
      },
    })
    // console.log("selectedStaffs", this.data.selectedStaffs)
    let clickItem = this.data.staffs[this.data.selIndex]
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit("eventPOSelect", clickItem)

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

  }
})