var that = null;
const app = getApp(),
api = require("../../../const/api"),
network = require("../../../utils/network");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mainActiveIndex: 0,
    activeId: '',
    showDesc:false,
    items:[
      {text: '大门门禁'},{text: '单元门禁'},
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),that = this, that.showLoading(!0);
    that.setData({
      isFullSucreen:app.globalData.isFullSucreen,
      acDevId:'',
      poName: app.globalData.userInfo.PONAME,
      marginBottom:app.globalData.isFullSucreen ? '146' : '110',
      devListHeight:app.globalData.isFullSucreen ?(parseInt(app.globalData.windowH)*2  - 520 ) : (parseInt(app.globalData.windowH) * 2 - 480 )
    })
    that.queryDoorList();
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

  queryDoorList(){
    that.showLoading(!0);
    network.RequestMQ.request({
      url:api.queryRemoteDoors,
      success:function(res){
        that.setData({
          cellDoorDevList:res.data.cellDoorDevListDtos,
          gateDoorDevList:res.data.gateDoorDevListDtos
        })
      },
      fail:function(re){
        wx.showToast({
          title: '获取门禁列表失败,请稍后重试',
          icon:'none',
          duration:2000
        })
      },
      complete:function(){
        that.showLoading(!1);
        that.setData({
          isFinish:true
        })
      }
    })
  },
  checkDetail:function(){
    that.setData({
      showDesc:true
    })
  },
  selectViewDoor:function(e){
    let acDevId = e.currentTarget.dataset.item;
    let currAcDevId = that.data.acDevId;
    if(currAcDevId==''){
      that.setData({
        acDevId: acDevId
      });
    }else if(currAcDevId == acDevId){
      that.setData({
        acDevId: ''
      });
    }else if(currAcDevId != acDevId){
      that.setData({
        acDevId: acDevId
      });
    }
  },
  choiceDoor(event) {
    that.setData({
      acDevId: event.detail
    });
  },
  closeInstru:function(){
    that.setData({
      showDesc:false
    })
  },
  onClickNav({ detail = {} }) {
    let tab = detail.index;
    if(tab != that.data.mainActiveIndex){
      that.setData({
        acDevId: '',
        acDevId1: ''
      })
    }
    that.setData({
      mainActiveIndex:detail.index ? detail.index : 0
    })
  },
  openDoor:function(e){
    let acDevId = e.currentTarget.dataset.item;
    that.showLoading(!0);
    network.RequestMQ.request({
      url:api.remoteDoorOpen,
      method: "POST",
      data: {
        "poName": that.data.poName,
        "acDevId": that.data.acDevId
      },
      success:function(res){
        setTimeout(function () {
          that.showLoading(!1);
          wx.showToast({
            title: '远程开门成功',
            icon:'none',
            duration:4000
          })
         }, 4000) //延迟时间 这里是4秒
      },
      fail:function(re){
        setTimeout(function () {
          that.showLoading(!1);
          wx.showToast({
            title: '远程开门失败,请稍后重试',
            icon:'none',
            duration:4000
          })
        }, 4000) //延迟时间 这里是4秒
      },
      complete:function(){
        that.setData({
          isFinish:true
        })
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})