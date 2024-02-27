const app = getApp(),
heo = require('../../../model/heoinfo'),
storage = require('../../../const/storage'),
api = require('../../../const/api'),
network = require('../../../utils/network');
import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    heoDtlInfos:new Array(),
    showRefuseDescInput:!1,
    refuseHeoDate:'',
    refuseHeoSeqId:'',
    showRefuseDescInput:false,
    inputLength :0,
    propTop:'45%',
    InputBottom : 0,
    heoPraiseListDtos:new Array(),
    pageNum:1,
    pageSize:10,
    lineHeight:0,
    textArea:{ maxHeight: 200, minHeight: 30 },
    showFloat:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),heo.heoinfo.init(),this.showLoading(!1);
    let authData = wx.getStorageSync(storage.STORAGE.AUTH_DATA)
    let userInfo = app.globalData.userInfo
    if(!authData || !userInfo){
      wx.showToast({
        title: '获取登录信息失败。',
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
    if(!userInfo.MODULEBITMAP || userInfo.MODULEBITMAP.substr(2,1) != '1'){
      wx.showToast({
        title: '邻里圈模块已经被关闭，请联系管理员。',
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
      return false;
    }
    if(options.queryType && options.queryType != ''){
      var checkHasAuditAuth = false;
      var checkHasReleaseAuth = false
      for(var index in authData){
        var authList = authData[index].poAuthInfoVoList
        for(var k in authList){
          if(authList[k].authId == '107001'){
            checkHasAuditAuth = true;
          }else if(authList[k].authId == '107005'){
            checkHasReleaseAuth = true
          }
        }
      }
      if(options.queryType == 'A' && !checkHasAuditAuth){
        wx.showToast({
          title: '您暂未开通邻里圈审核权限，请联系管理员。',
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
        return false;
      }else if(options.queryType != 'A' && !checkHasReleaseAuth){
        wx.showToast({
          title: '您暂未开通互帮发布权限，请联系管理员。',
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
        return false;
      }
    }
    if(!options.heoDate || !options.heoSeqId){
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
      return false;
    }
    var poSeqId = getApp().globalData.userInfo.POSEQID
    this.setData({
      poSeqId:poSeqId,
      heoDate:options.heoDate,
      heoSeqId:options.heoSeqId,
      queryType:options.queryType ? options.queryType : '',
      isFullSucreen:app.globalData.isFullSucreen,
      windH:app.globalData.windowH,
      InputViewHeight:140,
      marginBottom:app.globalData.isFullSucreen ? 42 : 10,
      windowW: app.globalData.windowW
    })
    heo.heoinfo.initHeoDtlInfos(options.heoDate,options.heoSeqId,options.queryType ? options.queryType : '');
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
    heo.heoinfo.init()
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
    let pages = getCurrentPages(); 
    let prePage = pages[pages.length - 2]; 
    var heoInfo = this.data.heoInfo;
    if(prePage.route != 'pages/home/home'){
      prePage.refreshHeoInfos(heoInfo)
    }
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
  updateHeoInfo:function(e){
    console.log(e.currentTarget.dataset)
    let heoInfo = e.currentTarget.dataset.item;
    let stat = e.currentTarget.dataset.stat;
    let oper = e.currentTarget.dataset.opername;
    if(stat == 'R'){
      this.setData({
        showRefuseDescInput:true,
        refuseHeoDate:heoInfo.heoDate,
        refuseHeoSeqId:heoInfo.heoSeqId
      })
    }else{
      Dialog.confirm({
        title: '提示',
        message: '确定'+ oper + '该帖子么？',
      }).then(() => {
          var updHeoInfo = {};
          updHeoInfo.heoDate = heoInfo.heoDate;
          updHeoInfo.heoSeqId = heoInfo.heoSeqId;
          updHeoInfo.stat = stat;
          heo.heoinfo.updHeoInfo(updHeoInfo,oper)
        })
        .catch(() => {
          console.log('点击取消')
        });
    }
  },
  heoTopManager:function(e){
    var heoInfo = e.currentTarget.dataset.item;
    if(heoInfo.isTop == 'Y'){
      Dialog.confirm({
        title: '提示',
        message: '确定取消置顶该帖子么？',
      }).then(() => {
          var updHeoInfo = {};
          updHeoInfo.heoDate = heoInfo.heoDate;
          updHeoInfo.heoSeqId = heoInfo.heoSeqId;
          updHeoInfo.isTop = 'N';
          heo.heoinfo.updHeoInfo(updHeoInfo,'取消置顶')
        })
        .catch(() => {
          console.log('点击取消')
        });
    }else{
      Dialog.confirm({
        title: '提示',
        message: '确定置顶该帖子么？',
      }).then(() => {
          var updHeoInfo = {};
          updHeoInfo.heoDate = heoInfo.heoDate;
          updHeoInfo.heoSeqId = heoInfo.heoSeqId;
          updHeoInfo.isTop = 'Y';
          heo.heoinfo.updHeoInfo(updHeoInfo,'置顶')
        }).catch(() => {
          console.log('点击取消')
        });
    }
  },
  previewImage: function(e){
    wx.previewImage({
        current: e.currentTarget.dataset.id,
        urls:e.currentTarget.dataset.item
    })
  },
  onClickHide:function(){
    this.setData({
      showRefuseDescInput:!1,
      refuseDesc:'',
      refuseHeoDate:'',
      refuseHeoSeqId:'',
      inputLength:0
    })
  },
  bindRefuseDescBlur:function(){
    this.setData({
      propTop:'45%'
    })
  },
  hideMsgInput:function(){
    this.setData({
      showMsgInput:false,
      InputBottom: 0,
      marginBottom:app.globalData.isFullSucreen ? 42 : 10
    })
  },
  setRefuseDescFocus:function(){
    this.setData({
      refuseDescFocus:true,
      propTop:'25%'
    })
  },
  inputRefuseDesc:function(e){
    this.setData({
      inputLength:e.detail.value ? e.detail.value.length : 0,
      refuseDesc:e.detail.value
    })
  },
  refuseHeoInfo:function(){
    var updHeoInfo = {};
    if(!this.data.refuseDesc 
      || this.data.refuseDesc == ''){
        wx.showToast({
          title: '请输入拒绝原因',
          icon:'none',
          duration:3000
        })
    }else{
      updHeoInfo.heoDate = this.data.refuseHeoDate;
      updHeoInfo.heoSeqId = this.data.refuseHeoSeqId;
      updHeoInfo.refuseDesc = this.data.refuseDesc;
      updHeoInfo.stat = 'R'
      heo.heoinfo.updHeoInfo(updHeoInfo,'审核拒绝')
    }
  },
  bindShowMsgInput:function(e){
    this.setData({
      showFloat:true
    })
    var poSeqId = this.data.poSeqId,
    replyseqid = e.currentTarget.dataset.replyseqid,
    replyUsrName = e.currentTarget.dataset.replyusername;
    if(this.data.queryType == 'A'
    || (this.data.heoInfo.usrType == 'P'
      && poSeqId != this.data.heoInfo.usrSeqId)){
        console.log('审核状态下或留言对象为自己或帖子类型为物业发布且发帖人非自己，不能留言。')
        return false;
    }
    if(replyUsrName == '已销户'){
      wx.showToast({
        title: '对方已销户，无法留言。',
        icon:'none',
        duration:3000
      })
      return false;
    }
    if(poSeqId != replyseqid){
      this.setData({
        showMsgInput:true,
        replySeqId:replyseqid,
        replyUsrName:replyUsrName ? replyUsrName : '楼主'
      })
      if(this.data.oldReplyUse != replyseqid){
        this.setData({
          inputMsg:'',
          oldReplyUse:replyseqid
        })
      }
    }else{
      this.setData({
        showDeleteOwnMsg:true,
        deleteHeoDtlItem:e.currentTarget.dataset.item
      })
    }
  },
  InputFocus(e) {
    var that = this;
    console.log(that.data)
    that.setData({
      showMsgInput:true,
      InputBottom: e.detail.height,
      marginBottom:0
    })
  },
  InputBlur(e) {
    this.setData({
      showMsgInput:false,
      InputBottom: 0,
      marginBottom:app.globalData.isFullSucreen ? 42 : 10
    })
  },
  hideMsgInput:function(){
    this.setData({
      showMsgInput:false,
      InputBottom: 0,
      marginBottom:app.globalData.isFullSucreen ? 42 : 10
    })
  },
  bindlinechange:function(e){
    if(e.detail.lineCount > 1){
      if(this.data.lineHeight != e.detail.height){
        var InputViewHeight = this.data.InputViewHeight ;
        if(parseInt(e.detail.lineCount) - parseInt(this.data.lineCount) == 1){
          InputViewHeight = this.data.InputViewHeight + (parseInt(e.detail.height - this.data.lineHeight)*1.8) ;
           if(InputViewHeight < 140){
            InputViewHeight = 140;
          }
        }else if(parseInt(this.data.lineCount) - parseInt(e.detail.lineCount) == 1){
          var heigh = e.detail.height > this.data.lineHeight ? parseInt(e.detail.height - this.data.lineHeight) 
          : parseInt(this.data.lineHeight - e.detail.height);
          InputViewHeight = this.data.InputViewHeight - (heigh * 1.8) ;
          if(InputViewHeight < 140){
           InputViewHeight = 140;
         }
        }
        this.setData({
          InputViewHeight:this.data.maxInputViewHeight  && InputViewHeight > this.data.maxInputViewHeight ? this.data.maxInputViewHeight : InputViewHeight,
          lineCount:e.detail.lineCount,
          lineHeight: e.detail.height
        })
      }
      if((e.detail.lineCount >= 5 && e.detail.lineCount < 9) || this.data.inputMsg.length > 70){
        this.setData({
          maxInputViewHeight:InputViewHeight 
        })
      }
    }else{
      this.setData({
        InputViewHeight:e.detail.lineCount == 1 ? 140 : this.data.InputViewHeight,
        lineCount:e.detail.lineCount,
        lineHeight: e.detail.height
      })
    }
  },
  bindInputMsg:function(e){
    let reg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;  
    var inputMsg = e.detail;
    var that = this;
    if(inputMsg.match(reg)){
      wx.showToast({
        title: '消息内容不能输入表情符',
        icon:'none',
        duration:3000,
        success:function(){
          inputMsg = inputMsg.replace(reg,"");
          that.setData({
            inputMsg:inputMsg
          })
        }
      });
    }else{
      if(inputMsg.length > 80){
        wx.showToast({
          title: '消息内容最多只能输入80个字',
          icon:'none',
          duration:2000,
          success:function(){
            inputMsg = inputMsg.substr(0,80);
            that.setData({
              inputMsg:inputMsg
            })
          }
        });
      }
      this.setData({
        inputMsg:inputMsg
      })
    }
  },
  sendMsg:function(e){
    if(!this.data.inputMsg || this.data.inputMsg == '' ){
      wx.showToast({
        title: '请输入您要回复的内容',
        icon:'none',
        duration:3000
      })
      return false;
    }
    this.showLoading(!0)
    heo.heoinfo.saveHeoDtlInfo()
  },
  delHeoDtl:function(e){
    var heoDtlInfo = e.currentTarget.dataset.item;
    var updHeoDtl = {};
    updHeoDtl.heoDate = heoDtlInfo.heoDate
    updHeoDtl.heoSeqId = heoDtlInfo.heoSeqId
    updHeoDtl.dtlId = heoDtlInfo.dtlId
    updHeoDtl.custId = heoDtlInfo.custId
    Dialog.confirm({
      title: '提示',
      message: '确定要删除该条评论么？',
    }).then(() => {
      updHeoDtl.stat = this.data.queryType == 'A' ? 'D' : 'C'
        heo.heoinfo.updHeoDtlInfo(updHeoDtl,true)
      })
      .catch(() => {
        console.log('点击取消')
      });
  },
  updateHeoDtlReadStat:function(heoDate,heoSeqId){
    var heoDtlInfo = {};
    heoDtlInfo.heoDate = heoDate;
    heoDtlInfo.heoSeqId = heoSeqId;
    heoDtlInfo.readStat = 'R';
    heoDtlInfo.replySeqId = this.data.poSeqId
    heo.heoinfo.updHeoDtlInfo(heoDtlInfo,false);
  },
  checkPraiseList:function(){
    let heoInfo = this.data.heoInfo
    wx.navigateTo({
      url: '/subpages/heo/heopraislist/heopraislist?heoDate=' + heoInfo.heoDate + "&heoSeqId=" + heoInfo.heoSeqId
      // url: '/subpages/heo/heopraislist/heopraislist?imageNames=' + JSON.stringify(heoInfo.imageNames )
    })
  },
  praiseHeo:function(e){
    let that = this;
    let heoInfo = that.data.heoInfo;
    that.showLoading(!0)
    network.RequestMQ.request({
      url:api.doHeoPraise,
      data:{
        heoDate:heoInfo.heoDate,
        heoSeqId:heoInfo.heoSeqId,
        houseSeqId:heoInfo.houseSeqId
      },
      method:'POST',
      success:function(res){
        heoInfo.takePartInPraise = heoInfo.takePartInPraise == 'Y' ? 'N' : 'Y';
        heoInfo.praiseCnt = heoInfo.takePartInPraise == 'Y' ? parseInt(heoInfo.praiseCnt) + 1 : parseInt(heoInfo.praiseCnt) - 1 
        that.setData({
          heoInfo:heoInfo
        })
      },
      fail:function(fal){
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon:'none',
          duration:3000
        })
      },
      complete:function(){
        that.showLoading(!1)
      }
    })

  },
  deleteOwnMsg:function(e){
    console.log(e)
    this.delHeoDtl(e)
  },
  hideDelete:function(){
    this.setData({
      showDeleteOwnMsg:false
    })
  },
  showMoreFlag:function(){
    this.setData({
      showFloat : !this.data.showFloat
    })
  }
})