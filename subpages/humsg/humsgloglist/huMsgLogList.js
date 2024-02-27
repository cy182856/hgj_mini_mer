// subpages/humsg/humsgloglist/huMsgLogList.js
let network = require("../../../utils/network")
let api = require("../../../const/api")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    custId:'',
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
    console.log(curCUSTID);
    this.setData({
      custId:curCUSTID
    });
    this.doQueryHuMsgLogList();
  },

  doQueryHuMsgLogList(){
    let that = this;
    network.RequestMQ.request({
      url:api.queryHuMsgLogList,
      method: "POST",
      // header: {"content-type":"application/json"},
      data: {"custId": that.data.custId},
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
            // 去除换行符，好让列表中消息内容不至于第一行很短的情况下就省略了。
            let huMsgLogs_temp = a.data.huMsgLogs;
            huMsgLogs_temp.forEach(element => {
              element.msgBody = element.msgBody.replace(/\n|\r/g,"");
            });
            that.setData({
              // huMsgLogs: a.data.huMsgLogs,
              huMsgLogs: huMsgLogs_temp,
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
      url: '/subpages/humsg/humsglog/huMsgLog?msgDate='+msgDate+'&msgSeqId='+msgSeqId,
    })
  },


})