// subpages/checkcode/checkcode/checkcode.js
var that = null,
app = getApp(),
netWork = require('../../../utils/network'),
api = require('../../../const/api');
import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog';
import storage from "../../../utils/storageUtils";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    propTop:'25%',
    showFoot:false,
    showResult:false,
    showQucikCodeInput:false,
    activeNames: ['1'],
    visitPass:"",
    inputData: {
      input_value: "",//输入框的初始内容
      value_length: 0,//输入框密码位数
      isNext: true,//是否有下一步的按钮
      get_focus: true,//输入框的聚焦状态
      focus_class: true,//输入框聚焦样式
      value_num: [1, 2, 3, 4, 5, 6],//输入框格子数
      height: "80rpx",//输入框高度
      width: "90%",//输入框宽度
      see: true,//是否明文展示
      interval: true,//是否显示间隔格子,
      showTip:false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this,app.loading(),that.showLoading(!1);
    let userInfo = app.globalData.userInfo;
    if(!options.codeType || options.codeType == ''
      || (options.codeType == 'Q'
        && (!options.visitType || options.visitType == ''
        || !options.checkType || options.checkType == ''))){
      wx.showToast({
        title: '系统异常，请重试。',
        icon:'none',
        duration:3000,
        success:function(){
          setTimeout(function(){
            wx.navigateBack({
              delta: 0,
            })
          },3000)
        }
      })
    }
    wx.setNavigationBarTitle({
      title: options.title
    })
    that.setData({
      codeType:options.codeType,
      visitType:options.visitType ? options.visitType : '',
      checkType:options.checkType ? options.checkType : '',
      estateName:userInfo && userInfo.SHORTNAME != null ? userInfo.SHORTNAME : '' 
    })
    if(options.codeType == 'U'
     || options.checkType == 'S'){
       that.scanCode()
     }else{
      that.verifQuickCode()
     }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  scanCode:function(){
    wx.scanCode({
      onlyFromCamera: true,
      success:function(res){
        that.showLoading(!0)
         wx.request({
            url: api.checkHuCheckCode,
            header: {
              'content-type': 'application/json',
              'token':new storage().getToken().toString()
            },
            data:{
                //codeType:that.data.codeType,
                //visitType:that.data.visitType,
                //checkType:that.data.checkType,
                checkCodeParam:res.result
            },
            success: function (ree) {
              console.log('访客验证返回:', ree);
              var visitPass = ree.data.visitPass;
              if (ree.data.ERRCODE == "01010000") {
                that.setData({
                    errDesc:'验证通过，可通行。',
                    checkSuccess:true,
                    //houseName:ree.data.houseInfoDto.houseName,
                    //visitInfo : visitInfo,
                    visitPass:visitPass,
                    showPassBtn:false,
                    showResult:true
                })
              } else {
                that.setData({
                    errDesc:ree.data.ERRDESC,
                    checkSuccess:false,
                    //houseName:ree.data.houseInfoDto.houseName,
                    //visitInfo : visitInfo,
                    //visitInoutLogDtos:ree.data.visitInoutLogDtos,
                    showPassBtn:true,
                    showResult:true
                })
              }
            },          
          });

        // netWork.RequestMQ.request({
        //   url:api.checkHuCheckCode,
        //   method:'GET',
        //   header:{
        //     'content-type': 'application/json',
        //     'token':new storage().getToken().toString()
        //   },
        //   data:{
        //     codeType:that.data.codeType,
        //     visitType:that.data.visitType,
        //     checkType:that.data.checkType,
        //     checkCodeParam:res.result
        //   },
        //   success:function(ree){
        //     console.log(ree)
        //     // var visitInfo = ree.data.visitLogDto
        //     // if(null != visitInfo){
        //     //   if(visitInfo.avlCnt >= 0){
        //     //     visitInfo.perCent = visitInfo.expCnt - visitInfo.avlCnt + '/' + visitInfo.avlCnt
        //     //   }else if(visitInfo.avlCnt == -2){
        //     //     visitInfo.perCent = visitInfo.expCnt - 0 + '/' + 0
        //     //   }
        //     // }
        //     if(ree.data.ERRCODE == "01010000"){
        //       that.setData({
        //         errDesc:'验证通过，可通行。',
        //         checkSuccess:true,
        //         //houseName:ree.data.houseInfoDto.houseName,
        //         //visitInfo : visitInfo,
        //         showPassBtn:false,
        //         showResult:true
        //       })
        //     }else{
        //       that.setData({
        //         errDesc:ree.data.ERRDESC,
        //         checkSuccess:false,
        //         houseName:ree.data.houseInfoDto.houseName,
        //         visitInfo : visitInfo,
        //         visitInoutLogDtos:ree.data.visitInoutLogDtos,
        //         showPassBtn:true,
        //         showResult:true
        //       })
        //     }
        //   },
        //   fail:function(ree){
        //     that.setData({
        //       errDesc:ree.data && ree.data.ERRDESC ? ree.data.ERRDESC : "验证异常，请稍后重试。",
        //       showPost:true,
        //       showPassBtn:false,
        //       showResult:false
        //     })
        //   },
        //   complete:function(){
        //     //that.showLoading(!1),
        //     that.setData({
        //       showChooseType:!1
        //     })
        //   }
        // })

      },
      complete:function(){
        console.log('扫码完成')
      },
      fail:function(){
        wx.navigateBack({
          delta: 0
        })
      }
    })
  },
  verifQuickCode:function(){
    this.setData({
      showQucikCodeInput:true
    })
  },
  onQuickCodeInputFocus:function(){
    this.setData({
      propTop:'25%'
    })
  },
  onQuickCodeInputBlur:function(){
    this.setData({
      propTop:'30%'
    })
  },
  onQuickCodeInputChange:function(e){
    var quickCode = e.detail;
    if(/[^\d]/.test(quickCode)){
      wx.showToast({
        title: '快速通行码只能是数字',
        icon:'none',
        duration:3000
      })
      quickCode = quickCode.replace(/[^\d]/g,'');
    }
    this.setData({
      quickCode:quickCode
    })
  },
  inputFocus:function(){
    that.setData({
      propTop:'25%'
    })
  },
  inputBlur:function(){
    that.setData({
      propTop:'30%'
    })
  },
  finishInput:function(e){
    that.setData({
      checkCode:e.detail
    })
    if(e.detail.length == 6){
      that.setData({
        showCheckBtn:true
      })
    }else{
      that.setData({
        showCheckBtn:false
      })
    }
  },
  checkQuickCode:function(){
    if(!that.data.checkCode 
      || that.data.checkCode.length <6){
        wx.showToast({
          title: '请输入六位通行码',
          icon:'none'
        })
      }
    that.showLoading(!0)

    wx.request({
      url: api.checkHuCheckRanNum,
      header: {
        'content-type': 'application/json',
        'token':new storage().getToken().toString()
      },
      data:{
          //codeType:that.data.codeType,
          //visitType:that.data.visitType,
          //checkType:that.data.checkType,
          checkCodeParam: that.data.checkCode
      },
      success: function (ree) {
        console.log('访客验证返回:', ree);
        if (ree.data.ERRCODE == "01010000") {
          var visitPass = ree.data.visitPass;
          that.setData({
              errDesc:'验证通过，可通行。',
              checkSuccess:true,
              //houseName:ree.data.houseInfoDto.houseName,
              //visitInfo : visitInfo,
              visitPass:visitPass,
              showPassBtn:false,
              showResult:true,
              showQucikCodeInput:false
          })
        } else {
          that.setData({
              errDesc:ree.data.ERRDESC,
              checkSuccess:false,
              //houseName:ree.data.houseInfoDto.houseName,
              //visitInfo : visitInfo,
              //visitInoutLogDtos:ree.data.visitInoutLogDtos,
              showPassBtn:true,
              showResult:true,
              showQucikCodeInput:false
          })
        }
      },          
    });

    // netWork.RequestMQ.request({
    //   url:api.checkHuCheckCode,
    //   data:{
    //     checkType:'Q',
    //     codeType:'V',
    //     visitType:that.data.visitType,
    //     checkCodeParam:that.data.checkCode
    //   },
    //   success:function(ree){
    //     var visitInfo = ree.data.visitLogDto
    //     if(null != visitInfo){
    //       if(visitInfo.avlCnt >= 0){
    //         visitInfo.perCent = visitInfo.expCnt - visitInfo.avlCnt + '/' + visitInfo.avlCnt
    //       }else if(visitInfo.avlCnt == -2){
    //         visitInfo.perCent = visitInfo.expCnt - 0 + '/' + 0
    //       }
    //     }
    //     if(ree.data.ERRCODE == "01010000"){
    //       that.setData({
    //         errDesc:'验证通过，可通行。',
    //         checkSuccess:true,
    //         houseName:ree.data.houseInfoDto.houseName,
    //         visitInfo : visitInfo,
    //         showPassBtn:false,
    //         showResult:true
    //       })
    //     }else{
    //       that.setData({
    //         errDesc:ree.data.ERRDESC,
    //         checkSuccess:false,
    //         houseName:ree.data.houseInfoDto.houseName,
    //         visitInfo : visitInfo,
    //         visitInoutLogDtos:ree.data.visitInoutLogDtos,
    //         showPassBtn:true,
    //         showResult:true
    //       })
    //     }
    //   },
    //   fail:function(ree){
    //     that.setData({
    //       errDesc:ree.data && ree.data.ERRDESC ? ree.data.ERRDESC : "验证异常，请稍后重试。",
    //       showPost:true,
    //       showResult:false
    //     })
  },
  complete:function(){
    that.setData({
      showQucikCodeInput:!1
    })
      that.showLoading(!1)
  },
   
  onClickHide:function(){
    wx.navigateBack({
      delta: 0,
    })
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  backToPrePage:function(){
    wx.navigateBack({
      delta: 0,
    })
  },
  initData:function(){
    wx.navigateBack({
      delta: 0,
    })
  },

  passVisit:function(){

    that.setData({
      showTip:true
    })

  },

  confirmTip:function(){
    var visitInfo = that.data.visitInfo;
    var visitInoutInfo = {};
    visitInoutInfo.visitDate = visitInfo.visitDate
    visitInoutInfo.visitSeqId = visitInfo.visitSeqId
    visitInoutInfo.visitType = that.data.visitType
    if(visitInfo.avlCnt == 0){
      visitInoutInfo.avlCnt = -2
    }
    console.log(visitInoutInfo)
    that.showLoading(!0)
    netWork.RequestMQ.request({
      url:api.updVisitLog,
      data:visitInoutInfo,
      success:function(res){
        wx.showToast({
          title: '已放行',
          icon:'none',
          duration:1000
        })
        that.setData({
          showPassBtn:false
        })
      },
      fail:function(res){
        wx.showToast({
          title: '放行失败，请重试。',
          icon:'none',
          duration:3000
        })
      },
      complete:function(){
        that.showLoading(!1)
      }
    })
  },
  closeTip:function(){
    that.setData({
      showTip:false
    })
  }
})