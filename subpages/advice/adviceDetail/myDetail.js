import Toast from '../../../miniprogram_npm/@vant/weapp/dialog/dialog';
import network from '../../../utils/network';
const app = getApp();
const api = require('../../../const/api.js');
const netWork = require("../../../utils/network");
const storage = require("../../../const/storage");

let citys = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeNames: ['1'],

    obj:null,
    msgObj:null,

    showItemType:false,
    queryItemType:true,


    itemTypeList:[],

    adviceType:'',
    adviceDate:'',
    adviceSeqId:'',

    updItem:true,

    curPoSeqId:'',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化loading
    app.loading(),this.showLoading(0);
    //获取基本参数
    let adviceType = options['adviceType'];
    let adviceDate = options['adviceDate'];
    let adviceSeqId = options['adviceSeqId'];
    //初始化参数
    this.initParam(adviceType,adviceDate,adviceSeqId);
    //加载初始详情数据
    this.getDetailInfo();
  },
  //初始化参数
  initParam(adviceType,adviceDate,adviceSeqId){
    let usrInfo = wx.getStorageSync(storage.STORAGE.USER_INFO);
    let curPoSeqId = usrInfo.POSEQID;
    let obj = this.data.obj;
    if(obj){
      let poSeqId = obj.poSeqId;
      console.log('当前的物业人员是',curPoSeqId,poSeqId);
    }

    this.setData({
      adviceType:adviceType,
      adviceDate:adviceDate,
      adviceSeqId:adviceSeqId,
      curPoSeqId:curPoSeqId,
    })
    wx.setNavigationBarTitle({
      title: (adviceType=='C'?'投诉详情':(adviceType=='A'?'建议详情':'表扬详情')),
    })
  },
  //详情数据
  getDetailInfo(){
    this.showLoading(1);
    let that = this;
    let paramData = this.getQueryParam();
    netWork.RequestMQ.request({
      url:api.queryAdviceDetail,
      method:'POST',
      data:paramData,
      success:res=>{
        that.showLoading(0);
        let data = res.data;
        if(data.RESPCODE == '000'){
          data = data.data;
          
          that.setData({
            obj:data,
            updItem:(data.itemBtype == undefined || data.itemBtype == ''),
          })
        }else{
          Toast.alert({message:data.ERRDESC});
        }
      },
      fail:res=>{
        console.log('查询反馈详情信息失败了')
        if(res.data.RESPCODE != '000'){
          let errDesc = '网络异常，请稍后再试！';
          try {
            errDesc = res.data.ERRDESC;
          } catch (error) {
            errDesc = '网络异常，请稍后再试！';
          }
          Toast.alert({message:errDesc});
        }
      },
      complete:res=>{
        that.showLoading(0);
        console.log('反馈详情信息',res);
      }
    });
  },

  //获取查询详情参数
  getQueryParam(){
    let data = {};
    let obj = this.data;
    data['adviceDate'] = obj.adviceDate;
    data['adviceSeqId'] = obj.adviceSeqId;
    return data;
  },

  //切换反馈过程展开
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },

  // //取消反馈
  // cancelAdvice(){
  //   let adviceDate = this.data.adviceDate;
  //   let adviceSeqId = this.data.adviceSeqId;
  //   let wxOpenId = this.data.wxOpenId;
  //   let huSeqId = this.data.obj.huSeqId;
  //   let that = this;
  //   this.showLoading(1);
  //   app.req.postRequest(api.cancelAdvice,{
  //     adviceDate:adviceDate,
  //     adviceSeqId:adviceSeqId,
  //     wxOpenId:wxOpenId,
  //     huSeqId:huSeqId,
  //   }).then(res=>{
  //     that.showLoading(0);
  //     let data = res.data;
  //     if(data.respCode == '000'){
  //       Toast.alert({message:'您的反馈已经取消!'}).then(()=>{
  //         that.reloadPage();
  //       })
  //     }else{
  //       Toast.alert({message:data.errDesc});
  //     }
  //   })
  // },

  //页面重载
  reloadPage(){
    let adviceDate = this.data.adviceDate;
    let adviceSeqId = this.data.adviceSeqId;
    let adviceType = this.data.adviceType;
    wx.redirectTo({
      url: './myDetail?adviceDate='+adviceDate+'&adviceSeqId='+adviceSeqId+'&adviceType='+adviceType,
    })
  },

  //选择反馈类型
  choseItemType(){
    console.log('choseItemType===>',citys);
    if(citys == null){
      this.showLoading(1);
      this.queryItemType();
      this.showLoading(0);
    }
    this.changeShow();
  },

  //控制反馈显隐
  changeShow(){
    this.setData({
      showItemType: !this.data.showItemType
    })
  },

  //修改选中的类别
  changeType(event) {
    const { picker, value, index } = event.detail;
    picker.setColumnValues(1, citys[value[0]]);
  },
  //确认选中了数据
  sureChose(event){
    let piker = this.selectComponent('#itemTypePicker');

    //关闭弹窗
    this.changeShow();
    //获取选中的值
    let obj = piker.getValues();
    let key = obj[1]['key'];
    let btypeDesc = obj[0];
    let stypeDesc = obj[1]['text'];
    if(btypeDesc==this.data.obj.itemBtypeDesc && stypeDesc == this.data.obj.itemStypeDesc){
      wx.showToast({
        title: '修改类别不能相同',
        icon:'none'
      })
      return;
    }
    let itemBtypeDesc = 'obj.itemBtypeDesc';
    let itemStypeDesc = 'obj.itemStypeDesc';
    //调用修改接口
    let adviceDate = this.data.adviceDate;
    let adviceSeqId = this.data.adviceSeqId;
    let that = this;
    network.RequestMQ.request({
      url:api.updAdviceItem,
      method:'POST',
      data:{
        adviceDate:adviceDate,
        adviceSeqId:adviceSeqId,
        itemBtype:key
      },
      success:res=>{
        console.log('修改反馈结果',res);
        this.setData({queryItemType:false});
        let data = res.data;
        if(data.RESPCODE == '000'){
          let desc = '修改成功';
          if(that.data.updItem){
            desc = '类型分配成功';
          }
          wx.showToast({
            title: desc,
            icon:'none'
          })
          that.setData({
            [itemBtypeDesc]:btypeDesc,
            [itemStypeDesc]:stypeDesc,
            updItem:false
          })
          // this.reloadPage();
        }else{
          Toast.alert({message:data.ERRDESC});
        }
      }
    })
    

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.queryItemType();
  },
  //查询反馈类别
  queryItemType(){
    let obj = this.data.obj;
    let itemBtypeDesc = null;
    let itemStype = null;
    if(obj){
       itemBtypeDesc = obj.itemBtypeDesc;
       itemStype = obj.itemStype;
      // debugger;
      if(itemBtypeDesc== null || itemStype == null){
        itemBtypeDesc = '';
        itemStype = '';
      }
    }else{
      itemBtypeDesc = '';
      itemStype = '';
    }
    
    network.RequestMQ.request({
      url:api.getAdviceItem,
      method:'POST',
      data:{itemBtypeDesc:itemBtypeDesc,itemStype:itemStype},
      success:res=>{
        console.log('查询反馈的返回结果',res);
        this.setData({queryItemType:false});
        let data = res.data;
        if(data.RESPCODE == '000'){
          data = data.data;
          this.setData({itemTypeList:data.value});
          citys = data.city;
        }else{
          Toast.alert({message:data.ERRDESC});
        }
      },
      fail:res=>{
        Toast.alert({message:'获取类别项失败'});
      }
    })
  },

  //立即受理
  acceptAdvice(){
    this.doPost(api.doAdvice,'该反馈受理成功');
  },
  //取消受理
  cancelAdvice(){
    let that = this;
    Toast.confirm({message:'您确定要取消吗？'}).then(()=>{
      that.doPost(api.cancelAdvice,'该反馈受理取消成功');
    });
  },
  //完成受理
  finishAdvice(){
    this.doPost(api.finishAdvice,'该反馈已经处理完成');
  },
  //请求
  doPost(url,sDesc){
    this.showLoading(1);
    let param = this.getQueryParam();
    let that = this;
    network.RequestMQ.request({
      url:url,
      method:'POST',
      data:param,
      success:res=>{
        that.showLoading(0);
        console.log('业务返回结果',res);
        let data = res.data;
        if(data.RESPCODE == '000'){
          // wx.showToast({
          //   title: sDesc,
          // })
          Toast.alert({message:sDesc}).then(()=>{
            that.reloadPage();
          })
        }else{
          Toast.alert({message:data.ERRDESC});
        }
      },
      fail:res=>{
        console.log('业务处理失败',res);
      },
      complete:res=>{
        that.showLoading(0);
      }
    });
  },

  //修改留言
  addMsgBody(event) {
    console.log(event.detail);
    this.setData({addMsgBody:event.detail})
  },
  //提交留言
  submitAddMsgBody() {
    let that = this;
    let msgBody = this.data.addMsgBody;
    if (msgBody === undefined || msgBody === '') {
      Toast.alert({message: '请输入反馈备注'});
      return;
    }
    let adviceDate = this.data.obj.adviceDate;
    let adviceSeqId = this.data.obj.adviceSeqId;
    netWork.RequestMQ.request({
      url:api.addMsgBody,
      method:'POST',
      data:{
        adviceDate:adviceDate,
        adviceSeqId:adviceSeqId,
        msgBody:msgBody,
      },
      success:res=>{
        console.log('res====>', res);
        if (res.data.RESPCODE === '000') {
          Toast.alert({message: '反馈成功'}).then(res=>{
            that.setData({msgList:[],addMsgBody:''});
            that.onOpen();
          })

        }else{
          Toast.alert({message: res.data.errDesc});
        }
      }
    })
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

  }
})