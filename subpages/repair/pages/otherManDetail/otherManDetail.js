import Toast from '../../../../miniprogram_npm/@vant/weapp/dialog/dialog';
const api = require('../../../../const/api'),
      date = require('../../../../utils/dateUtil'),
      fileName = 'FILENAME',
      packName = 'PACKNAME',
      app = getApp();

      const time = [
        '00:00-00:30','00:30-01:00',
        '01:00-01:30','01:30-02:00',
        '02:00-02:30','02:30-03:00',
        '03:00-03:30','03:30-04:00',
        '04:00-04:30','04:30-05:00',
        '05:00-05:30','05:30-06:00',
        '06:00-06:30','06:30-07:00',
        '07:00-07:30','07:30-08:00',
        '08:00-08:30','08:30-08:00',
        '08:00-08:30','08:30-09:00',
        '09:00-09:30','09:30-10:00',
        '10:00-10:30','10:30-11:00',
        '11:00-11:30','11:30-12:00',
        '12:00-12:30','12:30-13:00',
        '13:00-13:30','13:30-14:00',
        '14:00-14:30','14:30-15:00',
        '15:00-15:30','15:30-16:00',
        '16:00-16:30','16:30-17:00',
        '17:00-17:30','17:30-18:00',
        '18:00-18:30','18:30-19:00',
        '19:00-19:30','19:30-20:00',
        '20:00-20:30','20:30-21:00',
        '21:00-21:30','21:30-22:00',
        '22:00-22:30','22:30-23:00',
        '23:00-23:30','23:30-00:00'
      ];
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
    tel:'',


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
    var poSeqId = this.data.obj.poSeqId;
    var huSeqId = app.storage.getHuSeqId();
    app.req.postRequest(api.cancelRepair,{repairDate:repairDate,repairSeqId:repairSeqId,huSeqId:huSeqId}).then(res=>{
      this.showLoading(0);
      console.log('取消报修单',res);
      if(res.data.respCode == '000'){
        //消息推送
        // app.req.postRequest(api.sendMsg,{poSeqId:poSeqId,msgBusiType:'REPAIR_CANCEL'});
        Toast.alert({
          message:'报修取消成功'
        }).then(()=>{
          wx.reLaunch({
            url: '../repairQuery/repairQuery',
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
  initTel(){
    var datas = app.storage.getLoginInfo();
    var time = datas.repairWorkTime;
    let h1 = time.substring(0,2);
    let m1 = time.substring(2,4);
    let h2 = time.substring(4,6);
    let m2 = time.substring(6,8);
    var myDate = new Date();
    let hour = myDate.getHours();
    let minit = myDate.getMinutes();
    let tel = datas.urgentTel;
    if((hour > h1 && hour < h2)||(hour == h1 && minit >= m1) || (hour == h2 && minit <= m2)){
      tel = datas.wkTimeTel;
    }
    console.log('tel====>',tel);
    this.setData({
      tel:tel,
    });
  },
  // 立即评价
  pingjia(event){
    this.showLoading(1);
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var rateScore = this.data.rateScore;
    app.req.postRequest(api.evaluateRepairOrder,
      {repairDate:repairDate,repairSeqId:repairSeqId,rateScore:rateScore} ).then(res => {
        var data = res.data;
        this.showLoading(0);
        if(data.respCode == '000'){
          console.log('评价成功',res);
          Toast.alert({
            message:'感谢您的评价，我们将为您提供更好的服务!',
          }).then(()=>{
            wx.redirectTo({
              url: '../repairDetailPage/repairDetailPage?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
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
            url: '../repairDetailPage/repairDetailPage?repairDate='+repairDate+"&repairSeqId="+repairSeqId,
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
            url: '../repairDetailPage/repairDetailPage?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
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
              url: '../repairDetailPage/repairDetailPage?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
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
    var that = this;
    //紧急电话
    this.initTel();
    
    app.req.postRequest(api.repairQuery,
      {repairDate:repairDate,repairSeqId:repairSeqId}).then(res=>{
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

  // 修改预期到场时间
  changeTime(event){
    let that = this;
    this.setData({
      show:false
    })
    this.showLoading(1);
    console.log('更改预期到场时间',event);
    //时间修改
    var dataTime = event.detail.index;
    var date = this.data.columns[0].values[dataTime[0]];
    var t = time[dataTime[1]];
    console.log(date,time);
    var re = /:|-|\./g;
    var d = date.substring(0,10);
    var expArvTime = (d+t).replace(re,'');
    console.log(expArvTime);
    this.setData({
      expArvTime:expArvTime,
      date:d,
      time:t,
    })

    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var poSeqId = this.data.obj.poSeqId;
    var dtlId = this.data.dtlId;
    var unkArvTime = this.data.expArvTime;

    app.req.postRequest(api.updTime,{
      repairDate:repairDate,
      repairSeqId:repairSeqId,
      dtlId:dtlId,
      unkArvTime:unkArvTime,
      replyType:'01',
      poSeqId:poSeqId, 
    }).then(res=>{
      console.log('修改预期到场时间的响应结果：',res);
      that.showLoading(0);
      var data = res.data;
      if(data.respCode == '000'){
        //消息推送
        // app.req.postRequest(api.sendMsg,{poSeqId:poSeqId,msgBusiType:'REPAIR_UPD_TIME',repairDate:repairDate,repairSeqId:repairSeqId});
        Toast.alert({message:'修改成功！'}).then(()=>{
          that.setData({
            activeNames:0,
            show:false,
          })
          wx.redirectTo({
            url: '../repairDetailPage/repairDetailPage?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
          })
        })
        
        
      }else{
        var desc = res.data.errDesc;
          if(desc == '' ||desc == undefined){
            desc = '网络异常,请稍后再试'
          }
          app.alert.alert(desc);
      }
    })
  },

  //对呀预期到场时间进行确认
  sureTime(event){
    this.showLoading(1);
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var dtlId = event.target.dataset.dtlid;
    var unkArvTime = this.data.obj.unkArvTime;
    var that = this;
    app.req.postRequest(api.updTime,{
      repairDate:repairDate,
      repairSeqId:repairSeqId,
      dtlId:dtlId,
      replyType:'02',
      unkArvTime:unkArvTime,
    }).then(res=>{
      console.log('预期到场时间确认的响应结果',res);
      that.showLoading(0);
      var data = res.data;
      if(data.respCode == '000'){
        Toast.alert({message:'确认成功！'}).then(()=>{
          wx.redirectTo({
            url: './repairDetailPage?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
          })
        });
        // that.setData({
        //   activeNames:0,
        //   show:false
        // })
      }else{
        var desc = data.errDesc;
        if(desc == '' || desc == undefined){
          desc = '修改预期到场时间失败';
        }
        Toast.alert({message:desc});
      }
    })
  },

  // 显示时间弹窗
  showPopup(event) {
    // comObj.repairTimeCnt > obj.arvTimeCnt
    if(this.data.comObj.repairTimeCnt == this.data.obj.arvTimeCnt){
      wx.showToast({
        title: '修改已达上限！',
        icon:'none'
      })
      return;
    }
    this.setData({ 
      show: true ,
      dtlId:event.target.dataset.dtlid,
    });
  },
// 隐藏时间弹窗
  onClose() {
    this.setData({ show: false });
  },

  //初始化加载，初始化选择的时间
  initTime(event){
    var coloum = new Array();//时间数组
    var jsonObj = {};//piker格式{'':[]}候选数据
    var jsonSonObj = {};//piker两列中第一列的json对象，参考上面的注释
    var jsonSonObj1 = {};//piker两列中第二列的json对象，参考上面的注释
    var d ;//往前推算的具体日期临时值
    var first;//获取当天的值
    var index;//当前默认选中的值
    var temp;//当是晚间的时候，则预选第二天
    
    for(var i = 0;i < 9;i++){
      d = date.getDaysAgoDian(-i);
      let dayTmp = this.getNextDate(i);
      var week = new Date(dayTmp).getDay();
      var weekDesc ;
      if(week == 0){
        weekDesc = ' ( 周日 )';
      }else if(week == 1){
        weekDesc = ' ( 周一 )';
      }else if(week == 2){
        weekDesc = ' ( 周二 )';
      }else if(week == 3){
        weekDesc = ' ( 周三 )';
      }else if(week == 4){
        weekDesc = ' ( 周四 )';
      }else if(week == 5){
        weekDesc = ' ( 周五 )';
      }else if(week == 6){
        weekDesc = ' ( 周六 )';
      }
      
      d = d + weekDesc;
      if(i == 0){
        first = d;
      }else if(i==1){
        temp = d;
      }
      jsonObj[d] = time;
    }
    jsonSonObj['values'] = Object.keys(jsonObj);
    jsonSonObj['className'] = 'column1';

    index = new Date().getHours() * 2 + 4;
    if(index > 47){
      first = temp;
      index = 20;
    }

    jsonSonObj1['values'] = jsonObj[first];
    jsonSonObj1['className'] = 'column1';
    jsonSonObj1['defaultIndex'] = index;

    coloum.push(jsonSonObj);
    coloum.push(jsonSonObj1);
    // var t = new Date();
    // console.log(t.getHours());
    // console.log(t.getMinutes())
    var re = /:|-|\./g;
    var d = first.substring(0,10);
    var t = time[index];
    var expArvTime = (d+t).replace(re,'');
    this.setData({
      columns:coloum,
      date:d,
      time:t,
      expArvTime:expArvTime,
    })
      
  },
  getNextDate(day) {  
    var dd = new Date();
    dd.setDate(dd.getDate() + day);
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
    var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
    return y + "-" + m + "-" + d;
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
    var that = this;
    if(this.data.msgList.length > 0){
      this.showLoading(0);
      console.log('留言已经存在，无需再次调用后台接口查询');
      return;
    }
    app.req.postRequest(api.repairDetailPage,
        {repairDate:repairDate,repairSeqId:repairSeqId}).then(value=>{
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
            // that.imgQuery(e.imgCnt,e.repairDate,e.repairSeqId,e.dtlId,imgStep);
            imgStep = imgStep + 1;
          }
        })
        that.initTime();
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