// subpages/humsgspecified/humsgloglist/huMsgLogList.js
let network = require("../../../utils/network")
let api = require("../../../const/api")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    custId:'',
    poSeqId:"",
    huMsgLogs:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp();
    app.loading();
    this.showLoading(true);
    var curCUSTID = app.globalData.userInfo.CUSTID;
    var curPoSeqId = app.globalData.userInfo.POSEQID;
    console.log(curCUSTID);
    console.log(curPoSeqId);
    this.setData({
      custId:curCUSTID,
      poSeqId:curPoSeqId
    });
    this.doQueryHuMsgLogList();
  },

  doQueryHuMsgLogList(){
    let that = this;
    network.RequestMQ.request({
      url:api.queryHuMsgLogList,
      method: "POST",
      // header: {"content-type":"application/json"},
      data: {"custId": that.data.custId, "poSeqId": that.data.poSeqId},
      success:function(a){
        var rCode = a.data.respCode;
        console.log(a.data.respCode)
        if (rCode && rCode != null && rCode != "") {
          if (rCode != "000") {
            wx.showToast({
              title: a.data.errDesc,
              icon: 'none'
            });
          } else {
            that.setData({
              huMsgLogs: a.data.huMsgLogs,
            });
          }
        } else {
          wx.showToast({
            title: "查询住户消息日志列表失败，请稍后重试",
            icon: 'none'
          });
        }
      },
      fail:function(a){
        wx.showToast({
          title: "查询住户消息日志列表失败",
          icon: 'none'
        });
      },
      complete:function(a){
        that.showLoading(false);
      }
    });
  },
  
  onTapWatchDetail:function(e){
	  console.log(e);
    var msgDate = e.currentTarget.dataset.msgdate;
    var msgSeqId = e.currentTarget.dataset.msgseqid;
    console.log("onTapWatchDetail-msgDate:" + msgDate + "msgSeqId=" + msgSeqId)
    wx.navigateTo({
      url: '/subpages/humsgspecified/humsglog/huMsgLog?msgDate='+msgDate+'&msgSeqId='+msgSeqId,
    })
  },


})