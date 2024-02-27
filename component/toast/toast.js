module.exports = {
  toastComponent: function() {
      var t = getCurrentPages(), e = t[t.length - 1], s = {
          _toast_: {
              is_hide: !1,
              content: "",
              name: "",
              className: "",
              style: ""
          }
      }, a = {
          show: function(t, s, a, n) {
              var o = e && e.data && e.data.toastShowStyle || "", i = this;
              this.setData({
                  _toast_: {
                      is_hide: !0,
                      content: t,
                      name: a,
                      className: n,
                      style: o
                  }
              }), setTimeout(function() {
                  return i.setData({
                      _toast_: {
                          is_hide: !1
                      }
                  });
              }, s || 3000);
          }
      };
      Object.assign(e, a), e.setData(s);
  }
};