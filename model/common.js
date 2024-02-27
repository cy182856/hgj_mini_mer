const network = require('../utils/network.js'),
app = getApp(),
p = require('../const/path.js'),
u = require('../utils/util'),
api = require('../const/api'),
st = require('../const/storage'),
util = require('../utils/util');
var n = null,
common ={
  init: function() {
    n = (0, u.getCurrentPage)();
  },
  //获取正常状态物管人员信息
  queryPropOperInfo:function(){
    n.showLoading(!0)
    network.RequestMQ.request({
      url:api.queryPropOperInfo,
      success:function(res){
        if(res.data.data && res.data.data != null){
          res.data.data.unshift({poName:'请选择',poSeqId:''})
          n.setData({
            propOperInfos:res.data.data
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '获取放行物管人员信息失败',
          icon:'none',
          duration:2000
        })
        n.setData({
          propOperInfos:new Array()
        })
      },
      complete:function(){
        n.showLoading(!1)
      }
    })
  }
}

module.exports = {
  common: common
};