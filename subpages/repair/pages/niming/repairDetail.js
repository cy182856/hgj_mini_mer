import Toast from '../../../../miniprogram_npm/@vant/weapp/dialog/dialog';
const api = require('../../../../const/api'),
      date = require('../../../../utils/dateUtil'),
      fileName = 'FILENAME',
      packName = 'PACKNAME',
      app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList:[],
    maxCount:2,
    msgList:[],
    obj:null,
    comObj:null,

    msgImgList:[],//留言到场图片
    msgImgCnt:2,
    msgDtlId:'',//到场的留言ID
    msgfinishImgList:[],//留言中维修完成的图片
    msgFinishDtlId:'',//维修完成的留言ID
    msgfinishImgCnt:0,//维修完成的图片张数

    show: false,  //留言中的时间修改
    columns: [],
    date:'',
    time:'',
    expArvTime:'',
    activeNames:'1',
    dtlId:'',//留言待回复的ID

    rateScore:0,//评分


  },

  // 取消报修
  cancel(){
    Toast.confirm({
      message:'您确定取消该报修单吗？'
    }).then(()=>{
      this.cancelRepair();
    })
  },

// 取消报修
  cancelRepair(event){
    this.showLoading(1);
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    // var poSeqId = this.data.obj.poSeqId;
    // var huSeqId = app.storage.getHuSeqId();
    let wxOpenId = this.data.obj.wxOpenId;
    let custId = this.data.obj.custId;
    app.req.postRequest(api.annonyCancelRepair,{repairDate:repairDate,repairSeqId:repairSeqId,wxOpenId:wxOpenId,custId:custId}).then(res=>{
      this.showLoading(0);
      console.log('取消报修单',res);
      if(res.data.respCode == '000'){
        //消息推送
        Toast.alert({
          message:'报修取消成功'
        }).then(()=>{
          wx.reLaunch({
            url: './queryRepair?custId='+custId+'&wxOpenId='+wxOpenId,
          })
        })
       
      }else{
        var desc = res.data.errDesc;
          if(!desc){
            desc = '网络异常,请稍后再试'
          }
          app.alert.alert(desc);
      }
    })
  },
  // 立即评价
  pingjia(event){
    this.showLoading(1);
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var rateScore = this.data.rateScore;
    let wxOpenId = this.data.obj.wxOpenId;
    let custId = this.data.obj.custId;
    if(!custId||custId == '' || !wxOpenId || wxOpenId == ''){
      Toast.alert({message:'关键信息缺失'});
      return;
    }
    app.req.postRequest(api.annonyEvaluateRepairOrder,
      {repairDate:repairDate,repairSeqId:repairSeqId,rateScore:rateScore,wxOpenId:wxOpenId,custId:custId} ).then(res => {
        var data = res.data;
        this.showLoading(0);
        if(data.respCode == '000'){
          console.log('评价成功',res);
          Toast.alert({
            message:'感谢您的评价，我们将为您提供更好的服务!',
          }).then(()=>{
            wx.redirectTo({
              url: './repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId+'&custId='+custId+'&wxOpenId='+wxOpenId,
            });
          })
         
        }else{
          var desc = res.data.errDesc;
          if(desc == '' || !desc || desc == null){
            desc = '网络异常,评价失败'
          }
          app.alert.alert(desc);
        }
    });
  },

  // 对于无需费用的，直接确认维修完成
  nopaysure(event){
    this.showLoading(1);
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var payType = this.data.obj.payType;
    console.log('无费用的确认维修完成：',api.surePay);
    app.req.postRequest(api.surePay,{repairDate:repairDate,repairSeqId:repairSeqId,payType:payType}).then(res=>{
      this.showLoading(0);
      if(res.data.respCode == '000'){
        Toast.alert({message:'维修完成,请对维修员提供您的评价吧！'}).then(()=>{
          wx.redirectTo({
            url: './repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId+'&custId='+custId+'&wxOpenId='+wxOpenId,
          })
        })
      }else{
        Toast.alert({message:res.data.errDesc});
      }
    })
  },

  //立即支付
  pay(event){
    this.showLoading(1);
    console.log('开始支付',event);
    var that = this;
    app.req.postRequest(api.minProgramPayUrl, {
      custId:app.storage.getCustId(),
      huSeqId:app.storage.getHuSeqId(),
      houseSeqId:app.storage.getHouseSeqId(),
      openid:app.storage.getHgjOpenId(),
      busiId:'03',
      ordDate:that.data.obj.repairDate,
      ordSeqId:that.data.obj.repairSeqId,
      ordAmt:that.data.obj.ordAmt
    }).then(value => {
      that.showLoading(0);
      console.log('支付后台响应的结果',value.data);
      if(value.data.RESPCODE != '000'){
        Toast.alert({message:value.data.ERRDESC}).then(()=>{
          wx.redirectTo({
            url: './repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId+'&custId='+custId+'&wxOpenId='+wxOpenId,
          })
        })
        return;
      }
      var payinfo = null;
      try{
        payinfo = JSON.parse(value.data.PAYINFO);
        console.log('支付返回结果：',payinfo);
      }catch(e){
        console.log('转化发生异常',e);
        Toast.alert({message:'格式异常'});
        return;
      }      
      wx.requestPayment({
        'timeStamp': payinfo.timeStamp,
        'nonceStr': payinfo.nonceStr,
        'package': payinfo.package,
        'signType': payinfo.signType,
        'paySign': payinfo.paySign,
        'success':function(res){
          console.log('支付成功',res);
          that.showLoading(0);
          //消息推送
          var poSeqId = that.data.obj.poSeqId;
          let repairDate = that.data.obj.repairDate;
          let repairSeqId = that.data.obj.repairSeqId;
          if(poSeqId != '' && poSeqId != undefined){
            app.req.postRequest(api.sendMsg,{poSeqId:poSeqId,msgBusiType:'REPAIR_PAY',ordAmt:that.data.obj.ordAmt,repairDate:repairDate,repairSeqId:repairSeqId});
          }
          
          Toast.alert({
            message:'报修单支付成功',
          }).then(()=>{
            wx.redirectTo({
              url: './repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId+'&custId='+custId+'&wxOpenId='+wxOpenId,
            })
          })
          
        },
        'fail':function(res){
          console.log("pay fail",res);
        },
        'complete':function(res){
          console.log('pay finish',res);
          that.showLoading(0);
        }
      })
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),this.showLoading(1);
    console.log('报修详情详细页:',options);
    var repairDate = options['repairDate'];
    var repairSeqId = options['repairSeqId'];
    let custId = options['custId'];
    let wxOpenId = options['wxOpenId'];
    if(!custId || !wxOpenId || !repairDate || !repairSeqId){
      this.showLoading(0);
      Toast.alert({message:'关键信息缺失'});
      return;
    }
    var that = this;
    app.req.postRequest(api.annonyQuery,
      {repairDate:repairDate,repairSeqId:repairSeqId,custId:custId,wxOpenId:wxOpenId}).then(res=>{
      console.log('报修详情详细数据:',res);
      var respData = res.data;
      that.showLoading(0);
      if(respData.respCode == '000'){
        var obj = respData.repairDtos[0];
        //明细
        var fileList = obj.detailUrlList;
        var count = fileList!= null?fileList.length:0;
        //留言到场
        var msgImgList = obj.msgOneUrlList;
        var msgImgCnt = msgImgList!=null?msgImgList.length:0;
        var msgDtlId = '0';
        if(msgImgCnt > 0){
          msgDtlId = msgImgList[0].name;
        }
        //留言完成
        var msgfinishImgList = obj.msgTwoUrlList;
        var msgfinishImgCnt = msgfinishImgList!=null?msgfinishImgList.length:0;
        var msgFinishDtlId = '0';
        if(msgfinishImgCnt > 0){
            msgFinishDtlId = msgfinishImgList[0].name;
        }
        that.setData({
          obj:obj,
          comObj:respData,
          fileList:fileList,
          maxCount:count,
          msgImgList:msgImgList,
          msgImgCnt:msgImgCnt,
          msgDtlId:msgDtlId,
          msgfinishImgList:msgfinishImgList,
          msgfinishImgCnt:msgfinishImgCnt,
          msgFinishDtlId:msgFinishDtlId,
        });
        that.onOpen();
      }else{
        var desc = res.data.errDesc;
        if(!desc){
          desc = '网络异常,请稍后再试'
        }
          app.alert.alert(desc);
      }
    });
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









  //留言闭合
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  //留言展开
  onOpen(event){
    // this.showLoading(1);
    var obj = this.data.obj;
    var repairDate = obj.repairDate;
    var repairSeqId = obj.repairSeqId;
    var custId = obj.custId;
    var that = this;
    if(this.data.msgList.length > 0){
      this.showLoading(0);
      console.log('留言已经存在，无需再次调用后台接口查询');
      return;
    }
    app.req.postRequest(api.annonyQueryRepairMsg,
        {repairDate:repairDate,repairSeqId:repairSeqId,custId:custId}).then(value=>{
      that.showLoading(0);
      console.log('留言查询返回的结果：',value);
      var datas = value.data;
      if(datas.respCode == '000'){
        var msgList = datas.repairMsgDtlDtos;
        that.setData({
          msgList:msgList,
        });
        var imgStep = 0;
        msgList.forEach(e=>{
          if(e.imgCnt > 0){
            imgStep = imgStep + 1;
          }
        })
      }else{
        app.alert.alert(value.data.errDesc);
      }
    });
  },

    //图片预览
    imgQuery(imgCnt,repairDate,repairSeqId,dtlId,imgStep){
      if(imgCnt == 0){
        console.log('还未有任何的图片');
        return;
      }
      var custId = app.storage.getCustId();
      var url;
      var liuyan = false;
      if(dtlId&&dtlId != ''){
        url = api.queryImageUrl.replace(packName,'repair/'+custId+'/'+repairDate+repairSeqId+dtlId);
        liuyan = true;
      }else{
        url = api.queryImageUrl.replace(packName,'repair/'+custId+'/'+repairDate+repairSeqId);
      }

      var fList = [];
      for(var i=0;i<imgCnt;i++){
        var imgurl = url.replace(fileName,i+'.png');
        var u = {};
        u['url'] = imgurl;
        // TODO 测试http
        // if(liuyan){
        //   u['url'] = 'http://jiaimginfo.huiguan.com/jia-logo.png';
        // }
        
        fList.push(u);
      }
      console.log('fileList',fList);
      if(liuyan){
        //留言的图片
        if(imgStep == 0){
          this.setData({
            msgImgList:fList,
            msgImgCnt:imgCnt,
            msgDtlId:dtlId,
          });
        }else{
          this.setData({
            msgfinishImgList:fList,
            msgFinishDtlId:dtlId,
            msgfinishImgCnt:imgCnt
          });
        }
      }else{
        //详情页的图片
        var da = {};
        da['fileType'] = 'LOG';
        da['busiId'] = '01';
        da['busiDate'] = repairDate;
        da['busiSeqId'] = repairSeqId;
        da['custId'] = custId;
        // da['imgId'] = dtlId;
        app.req.postRequest(api.queryImageUrl,da).then(res=>{
            console.log('图片结果',res);
          })
        this.setData({
          fileList:fList,
          maxCount:imgCnt,
        });
      }
      
    },
    //立即评价的分数变动
    changeScore(event){
      this.setData({rateScore:event.detail});
    },
    // 联系我
    completemessage(errcode,name,headurl){
      console.log('联系我',errcode);
    }
})