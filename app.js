//app.js
import dialogUtils from './utils/dialogUtils';
import req from './utils/networkUtils';
import storage from "./utils/storageUtils";

const l = require("./component/loading/loading"),
t = require("./component/toast/toast"),
us = require("./model/userInfo"),
u = require('./utils/util');
const util = require("./utils/util");
App({
  toastComponent: t.toastComponent,
  userInfo: us.userInfo,
  loading: l.loading,
  show : function(that,param,opacity){
    var animation = wx.createAnimation({
      //持续时间800ms
      duration: 100000,
      timingFunction: 'ease',
    });
    //var animation = this.animation
    animation.opacity(opacity).step()
    //将param转换为key
    var json = '{"' + param + '":""}'
    json = JSON.parse(json);
    json[param] = animation.export()
    //设置动画
    that.setData(json)
  },
  onLaunch: function () {
    // 展示本地存储能力
    var that =this;

    // 登录
 
    // 获取用户信息
    this.getSys(), 
    wx.onMemoryWarning && wx.onMemoryWarning(function() {
      (0, console.log("memory_warning"))
    });
  },
  onShow:function(){
    var n = wx.getSystemInfoSync();
    this.globalData.sdkVersion = n.SDKVersion, "devtools" !== n.platform && (-1 == (0,
      u.versionCompare)(n.version, "6.5.8") && this.incompatibleVersion(), (0, u.versionCompare)(n.SDKVersion, "1.9.90") > -1 && this.updateApp());
  },
  getSys: function() {
    var that = this;
    wx.getSystemInfo({
      success: function(a) {
        console.log(a)
        var t = a.windowWidth,
          o = a.windowHeight,
        environment = a.environment;
        console.log(environment)
        // if(environment != 'wxwork'){
        //   wx.showModal({
        //     title: "提示",
        //     content: "该小程序为企业微信小程序，请使用企业微信打开~",
        //     showCancel: !1,
        //     complete: function () {
        //       that.closeWindow("该小程序为企业微信小程序，请使用企业微信打开~")
        //     }
        //   })
        //   return;
        // }
        that.globalData.windowW = t, that.globalData.windowH = o;
        that.globalData.platform = a.platform;
        if (a.model.indexOf('X') >= 0) {
          that.globalData.iphoneX = true;
        }
        if(a.model.indexOf('iPhone') >= 0
          && a.model.indexOf('5') >= 0){
            that.globalData.iphone5 = true;
        }
        if (a.model.indexOf('iPhone') >= 0) {
          that.globalData.iphone = true;
        }
        if(a.screenHeight - a.safeArea.height > 40){
          console.log('是全面屏')
          that.globalData.isFullSucreen = true
        }
      }
    });
  },
  updateApp: function () {
    var e = wx.getUpdateManager();
    e.onUpdateReady(function () {
      wx.showModal({
        title: "更新提示",
        content: "新版本已经准备好，请重启应用",
        showCancel: !1,
        success: function (a) {
          a.confirm && e.applyUpdate();
        }
      });
    });
  },
  incompatibleVersion: function () {
    var that = this;
    wx.showModal({
      title: "提示",
      content: "您的企业微信版本过低，请升级版本~",
      showCancel: !1,
      complete: function () {
        that.closeWindow("您的企业微信版本过低，请升级版本~");
      }
    });
  },
  closeWindow: function(msg) {
    util.redirectToErrorPage("toast",msg);
  },
  globalData: {
    userInfo: null,
    userHasLogined:0,
    windowW:0,
    windowH:0,
    iphoneX: false,
    iphone:false,
    isFullSucreen:false
  },
  req:new req(),//初始化请求对象,
  storage:new storage(),//初始化缓存对象
  alert:new dialogUtils() //初始化弹窗对象
})