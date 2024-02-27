var e = Object.assign || function(e) {
  for (var t = 1; t < arguments.length; t++) {
    var a = arguments[t];
    for (var r in a) Object.prototype.hasOwnProperty.call(a, r) && (e[r] = a[r]);
  }
  return e;
},
params = require("../const/params"),
st = require("../const/storage"),
util = require("./util"),
path = require("../const/path"),
respCode = require("../const/respCode"),
api = require("../const/api"),
s = {
  map: {},
  mq: [],
  running: [],
  MAX_REQUEST: 10,
  push: function(o) {
    var i = params.COMMON;
      i = e({}, i);
    o.data = Object.assign(i, o.data || {});
    var E = {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      l = wx.getStorageSync(st.STORAGE.SESSION_ID);
    for ("" != l && (E = {
        Cookie: api.sessionKey + "=" + l,
        "Content-Type": "application/x-www-form-urlencoded"
      }, o.data = e({}, o.data)),
       o.header = e({}, o.header || {}, E), o.t = +new Date(); this.mq.indexOf(o.t) > -1 || this.running.indexOf(o.t) > -1;) o.t += 10 * Math.random() >> 0;
    this.mq.push(o.t), this.map[o.t] = o;
  },
  next: function() {
    var e = (0, util.getCurrentPage)(),
      t = this;
    if (0 !== this.mq.length && this.running.length < this.MAX_REQUEST) {
      var s = this.mq.shift(),
        O = this.map[s],
        d = O.complete,   
        u = O.ignore_result,
        E = O.overHttpOutCallBack,
        OL = O.overHttpLoginCallBack;
      O.complete = function() {
        for (var s = arguments.length, l = Array(s), g = 0; g < s; g++) l[g] = arguments[g];
        if (l.length > 0) {
          var S = l[0];
          console.log(S)
          if (void 0 === S.data) u || (e && e.show ? e.show("网络不给力哦,请检查网络设置") : wx.showToast({
            image: "/images/network_error.png",
            title: "网络不给力"
          }));
          else {
            var c = S.data.RESPCODE ? S.data.RESPCODE : S.data.respCode;
            if (respCode.RESP_CODE.SUCCESS != c) {
              if (!u) {
                var R = !1;
                switch (c) {
                  case respCode.RESP_CODE.LOGIN_OUT_TIME:
                    util.removeStorageKeys([st.STORAGE.USER_AUTHORIZE, st.STORAGE.SESSION_ID,st.STORAGE.USER_INFO]);
                    if (R == !1) {
                      wx.showToast({
                        title:'会话过期，重新登录',
                        icon: 'none',
                        duration: 3000
                      })
                      setTimeout(function(){
                        wx.reLaunch({
                          url: path.PATH.PATH_MAIN_PAGE
                        })
                      },1000)
                      break;
                    }
                    break;
                  // case respCode.RESP_CODE.RESULT_FAIL:
                  //   R = !0;
                }
                if (R) {
                  if (S.data.ERRDESC) {
                    var A = S.data.ERRDESC;
                    A && e && e.show ? e.show(A, 2500) : wx.showToast({
                      title: A,
                      icon:'none',
                      duration:2500
                    });
                  }
                }
              }
            } else {
              if (S.data.toast) {
                var A = S.data.toast;
                A && e && e.show ? e.show(A, 2500): wx.showToast({
                  title: A,
                  icon:'none',
                  duration:2500
                });
              }
            }
          }
        }
        t.running.splice(t.running.indexOf(O.t), 1), delete t.map[O.t], d && d.apply(O, l),
        t.next();
      };
      var l = O.success,
        g = O.fail;
      return O.success = function() {
        for (var e = arguments.length, t = Array(e), o = 0; o < e; o++) t[o] = arguments[o];
        let rCode = t[0].data.RESPCODE ? t[0].data.RESPCODE : t[0].data.respCode;
        t[0].data && (respCode.RESP_CODE.SUCCESS === rCode && l && l.apply(O, t),
        respCode.RESP_CODE.SUCCESS !== rCode && g && g.apply(O, t));
      }, this.running.push(O.t), wx.request(O);
    }
  },
  request: function(e) {
    return this.push(e), this.next();
  }
};

module.exports = {
  RequestMQ: s
};