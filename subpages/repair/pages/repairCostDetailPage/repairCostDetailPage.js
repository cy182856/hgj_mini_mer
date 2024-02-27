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
    materialList:[],
    repairNum:'',//报修单号
    labourCost:'',//人工费
    materialCost:''//材料费
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),this.showLoading(1);
    console.log('报修费用详细页:',options);
    var that = this;
   
    //获取费用详情数据
    var d = {};
    d['repairNum'] = options['repairNum'];
    this.setData({
      repairNum:options['repairNum']
    });
    app.req.postRequest(api.repairCostDetailQuery,d).then(res=>{
      console.log('报修详情详细数据:',res);
      var respData = res.data;
      that.showLoading(0);
      if(respData.respCode == '000'){
        var materialList = respData.materialList;
        var labourCost = respData.labourCost;
        var materialCost = respData.materialCost;
        that.setData({
          materialList:materialList,
          labourCost:labourCost,
          materialCost:materialCost,
        });
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

})