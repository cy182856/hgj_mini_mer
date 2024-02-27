// subpages/advice/add/addAdvice.js
import Toast from '../../../miniprogram_npm/@vant/weapp/dialog/dialog';
const app = getApp();
const api = require('../../../const/api.js');
const storage = require("../../../const/storage");
const netWork = require("../../../utils/network");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    adviceTypes: [
      { text: '全部', value: '' },
      { text: '建议', value: 'A' },
      { text: '投诉', value: 'C' },
      { text: '表扬', value: 'P' },
    ],
    assignees: [
      { text: '全部', value: 0 },
      { text: '由我受理', value: 1 },
      { text: '暂未受理', value: 2 },
      { text: '由他人受理', value: 3 },
    ],
    procStats:[
      { text: '全部', value: '' },
      { text: '待受理', value: '01' },
      { text: '受理中', value: '03' },
      { text: '受理完成', value: '07' },
      { text: '已确认', value: '09' },
      { text: '已评价', value: '11' },
      { text: '已取消', value: '19' },
    ],
    adviceType: '',
    assignee: 0,
    procStat:'',
    source:'113003',//1-我受理的，2-反馈受理,3-受理查询

    totalNum:0,
    pageNum:0,
    pageSize:10,
    objList:[],
    comObj:null,

    tempProc:'',



  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化加载开始
    app.loading(),this.showLoading(0);

    //来源设置title
    this.initPage(options);
  },

  //初始化页
  initPage(options){
    console.log('查询入口带入的参数',options);
    let source = options['source'];
    let titleName = '问题反馈受理';
    if(source != undefined && source != ''){
      this.setData({source:source});
      switch(source){
        case '113003':titleName='我受理的';break;
        case '113002':titleName='问题反馈受理';this.setData({tempProc:"('01','03','07','09','11')"});break;
        case '113001':titleName='问题反馈查询';this.setData({tempProc:"('01','03','07','09','11',19)"});
      }
    }

    wx.setNavigationBarTitle({
      title: titleName,
    })
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
    // if(this.data.onLoad){
      console.log('refush============>');
      this.setData({pageNum:0,objList:[]});
      this.queryForPage();
    // }
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
    console.log('开始加载更多了');
    this.loadMore();
  },

  //加载更多
  loadMore(){
    // let pageNum = this.data.pageNum + 1;
    let pageSize = this.data.pageSize;
    let totalNum = this.data.totalNum;
    // console.log('加载更多','totalNu='+totalNum,'pageNum*pageSize='+pageNum*pageSize);
    if(!(totalNum > this.data.pageNum * pageSize)){
      
      wx.showToast({
        title: '没有更多数据了',
        icon:'none'
      })
      return;
    }
    this.queryForPage();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // other function
  //分页查询
  queryForPage(){
    let that = this;
    this.showLoading(1);
    let paramData = this.getQueryParam();
    console.log('查询请求参数',paramData);
    netWork.RequestMQ.request({
      url:api.queryAdviceForPage,
      method:'POST',
      data:paramData,
      success:res=>{
        that.showLoading(0);
        let data = res.data;
        if(data.RESPCODE == '000'){
          data = data.data;
          let newDataList = data.adviceDtoList;
          if(newDataList == null){
            wx.showToast({
              title: '已经没有更多了',
              icon:'none',
            })
            return;
          }
          let objList = that.data.objList;
          objList.push.apply(objList,newDataList);
          console.log("totalNum====>",data.totalNum);
          that.setData({
            objList:objList,
            pageNum:(that.data.pageNum+1),
            totalNum:data.totalNum,
            comObj:data
          })
        }else{
          Toast.alert({message:data.ERRDESC});
        }
      },
      fail:res=>{
        console.log('查询反馈列表失败了')
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
        console.log('查询反馈列表的结果',res);
        
      }
    });
  },
  //分页查询的参数
  getQueryParam(){
    let assignee = this.data.assignee;
    let adviceType = this.data.adviceType;
    let poSeqId = '';
    let exPoSeqId = '';
    let tempProc = this.data.tempProc;//b端不展示用户取消的反馈
    let obj = this.getUsrInfoFromCache();
    let source = this.data.source;
    let procStat = this.data.procStat;
    if(source=='113002'){//问题反馈菜单进去的
      procStat = tempProc;
      switch(assignee){
        case 1:poSeqId = obj.POSEQID;break;//由我受理
        case 2:procStat = '01';break;//暂未受理
        case 3:exPoSeqId = obj.POSEQID;procStat = "('03','07')";break;
        default:'';
      }
    }else if(source == '113001'){//反馈查询功能菜单进来的
      procStat = procStat==''?tempProc:procStat;
    }else{ //我受理功能菜单进入的
      poSeqId = obj.POSEQID;
    }
    

    let data = {};
    data['pageNum'] = this.data.pageNum + 1;
    data['pageSize'] = this.data.pageSize;
    data['poSeqId'] = poSeqId;
    data['exPoSeqId'] = exPoSeqId;
    data['procStat'] = procStat;
    data['adviceType'] = adviceType;
    
    return data;
  },


  //进入详情页
  toDetailPage(event){
    // console.log('detail page data',event);
    let obj = event.currentTarget.dataset;
    let adviceDate = obj.date;
    let adviceSeqId = obj.seq;
    let adviceType = obj.type;
    let procStat = obj.stat;
    let source = this.data.source;
    let assignee = this.data.assignee;
    let poSeqId = obj.po;
    let url = '../adviceDetail/otherDetail';
    let usrInfo = this.getUsrInfoFromCache();
    if(this.checkAuth(source,assignee,poSeqId,usrInfo.POSEQID,procStat)){ //只有由我受理功能菜单进入或者问题反馈受理菜单进来且选择了我
      url = '../adviceDetail/myDetail';
    }

    wx.navigateTo({
      url: url+'?adviceDate='+adviceDate+'&adviceSeqId='+adviceSeqId+'&adviceType='+adviceType,
    })
  },

  checkAuth(source,assignee,poSeqId,localPoSeqId,procStat){
    if(source == '113003'|| assignee == '1'){
      return true;
    }
    if(source == '113002'){
      if(procStat == '01'){
        return true;
      }
      if(poSeqId && poSeqId != '' && localPoSeqId == poSeqId){
        return true;
      }
    }
    return false;
  },
  /** 修改反馈类型*/
  changeAdviceType(event){
    this.setData({adviceType:event.detail});
    this.reloadParam();
    this.queryForPage();
  },
  /** 修改*/
  changeAssignee(event){
    this.setData({assignee:event.detail});
    this.reloadParam();
    this.queryForPage();
  },
  //修改procStat
  changeProcStat(event){
    this.setData({procStat:event.detail});
    this.reloadParam();
    this.queryForPage();
  },
  //修改参数，重新查询
  reloadParam(){
    this.setData({
      pageNum:0,
      objList:[],
    })
  },
  //缓存获取数据
  getUsrInfoFromCache(){
    return wx.getStorageSync(storage.STORAGE.USER_INFO)
  },
  

})