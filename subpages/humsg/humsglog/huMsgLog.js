// subpages/humsg/humsglog/huMsgLog.js
let network = require("../../../utils/network")
let api = require("../../../const/api")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    msgDate:'',
    msgSeqId:'',
    huMsgLogDto:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp();
    app.loading();
    this.showLoading(true);
    var curCUSTID = app.globalData.userInfo.CUSTID;
    this.msgDate = options.msgDate;
    this.msgSeqId = options.msgSeqId;
    console.log('options.msgDate='+options.msgDate+'，options.msgSeqId='+options.msgSeqId);
    this.setData({
      msgDate:this.msgDate,
      msgSeqId:this.msgSeqId,
		});
    this.doQueryHuMsgLog();
  },

  doQueryHuMsgLog(){
    let that = this;
    network.RequestMQ.request({
      url:api.queryHuMsgLog,
      method: "POST",
      // header: {"content-type":"application/json"},
      data: {"msgDate": that.data.msgDate, "msgSeqId": that.data.msgSeqId},
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
              huMsgLogDto: a.data.huMsgLogDto,
            });
          }
        } else {
          wx.showToast({
            title: "查询住户消息日志详情失败，请稍后重试",
            icon: 'none'
          });
        }
      },
      fail:function(a){
        wx.showToast({
          title: "查询住户消息日志详情失败",
          icon: 'none'
        });
      },
      complete:function(a){
        that.showLoading(false);
      }
    });
  },

})