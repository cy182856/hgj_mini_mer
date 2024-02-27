
const p= require("../const/path");
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  getQueryObject: function (t) {
    for (var e = t.split("?")[1].split("&"), n = new Object(), r = 0; r < e.length; r++) {
      var i = e[r].split("=")[0], o = e[r].split("=")[1];
      n[i] = o;
    }
    return n;
  }, 
  getCurrentPage: function () {
    var t = getCurrentPages();
    return t[t.length - 1];
  },
  getPrevPage: function(){
    var t = getCurrentPages();
    return t[t.length - 2];
  },
  isObjectEmpty: function(t) {
    if (void 0 === t || null == t) return !0;
    for (var e in t) return !1;
    return !0;
  },
  SafeSetStorageSync: function(t, e) {
      try {
          wx.setStorageSync(t, e);
      } catch (n) {
          try {
              wx.setStorageSync(t, e);
          } catch (n) {
              wx.setStorage({
                  key: t,
                  data: e
              });
          }
      }
  },
  removeStorageKeys: function(t) {
    t.forEach(function(t) {
        wx.removeStorage({
            key: t
        });
    });
  },
  redirectToErrorPage: function(type,msg) {
    wx.canIUse && wx.canIUse("reLaunch") ? wx.reLaunch({
      url: p.PATH.PATH_ERROR + "?type=" + type + "&msg=" + msg
    }) : wx.redirectTo({
      url: p.PATH.PATH_ERROR + "?type=" + type + "&msg=" + msg
    });
  }
  ,
  redirectToPage: function(params,page) {
    wx.canIUse && wx.canIUse("reLaunch") ? wx.reLaunch({
      url: page + "?params=" + JSON.stringify(params)
    }) : wx.redirectTo({
      url: page + "?params=" + JSON.stringify(params)
    });
  },
  versionCompare: function(t, e) {
    var n = parseFloat(t), r = parseFloat(e), i = t.replace(n + ".", "") || "", o = e.replace(r + ".", "") || "", u = parseFloat(i), a = parseFloat(o);
    return n > r ? 1 : n < r ? -1 : u > a ? 1 : u === a ? 0 : -1;
  }
  ,
    versionCompare: function(t, e) {
        var n = parseFloat(t), r = parseFloat(e), i = t.replace(n + ".", "") || "", o = e.replace(r + ".", "") || "", u = parseFloat(i), a = parseFloat(o);
        return n > r ? 1 : n < r ? -1 : u > a ? 1 : u === a ? 0 : -1;
    }
}
