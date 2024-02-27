//logs.js
const util = require('../../utils/util.js'),
app = getApp();
Page({
  data: {
    logs: []
  },
  onLoad: function () {
    app.loading(),this.showLoading(!0);
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  }
})
