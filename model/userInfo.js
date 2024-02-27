//const storage = require("../const/storage");

import storage from "../utils/storageUtils";


var api = require("../const/api"),
network = require("../utils/network"),
p = require("../const/path"),
s = require("../const/storage"),
respCode = require("../const/respCode"),
util = require("../utils/util"),
checkLogin = function() {
  var app = getApp();
  if (0 == app.globalData.userHasLogined || wx.getStorageSync(s.STORAGE.USER_AUTHORIZE) != 1) try {
    var o = wx.getStorageSync(s.STORAGE.SESSION_ID),
      n = wx.getStorageSync(s.STORAGE.USER_AUTHORIZE),
      d = app.globalData.userHasLogined;
      app.globalData.userHasLogined = (o && n && d) ? 1 : -1;
  } catch (a) {}
  return 1 == app.globalData.userHasLogined;
},
// initData = function() {
//   var a = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null;
//   if (a && a.data)
//     if (respCode.RESP_CODE.SUCCESS === a.data.RESPCODE) {
//       var t = getApp();
//       t.globalData.userHasLogined = 1, t.globalData.userInfo = a.data;
//       wx.setStorage({
//           key: s.STORAGE.USER_AUTHORIZE,
//           data: !0
//       });
//       wx.setStorage({
//           key: s.STORAGE.CUSTID,
//           data: a.data.CUSTID
//       });
//       (0, util.SafeSetStorageSync)(s.STORAGE.SESSION_ID, a.data.SESSIONID);
//       (0, util.SafeSetStorageSync)(s.STORAGE.USER_INFO, a.data);
//     }else if( a.data.ERRCODE && respCode.RESP_CODE.NEED_REGISTER == a.data.ERRCODE){
//       util.redirectToPage("",p.PATH.PATH_REGISTER_TOAST)
//     }
//     else  getApp().globalData.userHasLogined = -1,wx.setStorage({
//       key: s.STORAGE.USER_AUTHORIZE,
//       data: !1
//     })
// },
doLogin = function() {
  var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null,
  e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
  i = (0, util.getCurrentPage)();
  // var suite_id = 'wwaf0bc97996187867';
  var suite_id = 'wx68f12959e564a1df';
  // if(api.env == 'prod'){
  //   suite_id = 'wx68f12959e564a1df';
  // }
  let promise = new Promise((resolve, reject)=>{
    wx.qy.login({
      success:function(res){
        res.code ? network.RequestMQ.request({
          url:api.Login,
          method: "POST",
          data: {
            "code": res.code,
             "suite_id": suite_id
          },
          success:function(a){
             //放进缓存
            new storage().setToken(a.data.token);
            new storage().setUserName(a.data.userName);
            //wx.setStorageSync(storage.STORAGE.TOKEN_KEY, a.data.token)
            //initData(a), e && e(a), resolve(a);
            resolve(a);
          },
          fail:function(a){
           // initData(a), e && e(a), 
            e(a),
            a.data.ERRCODE && respCode.RESP_CODE.NEED_REGISTER == a.data.ERRCODE ? "" : reject({msg:a.data && a.data.ERRDESC ? a.data.ERRDESC :''}); 
          },
          complete:function(a){
            t && t();
          }
        }) : reject({msg:"获取用户授权态失败,请退出重新登录"})
      },
      fail: function(a) {
        reject({msg:'"获取用户授权态失败,请退出重新登录"'})
      }
    })
  })
  return promise;
}
module.exports = {
  userInfo: function() {
    var g = getCurrentPages(),
    r = g[g.length - 1],
    s = {
      getLoginState: function() {
        return getApp().globalData.userHasLogined;
      },
      isUserLogined: function() {
        return checkLogin();
      }
    }
    Object.assign(r, s);
  },
  isUserLogined: checkLogin,
  Login: doLogin
}