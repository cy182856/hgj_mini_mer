const date = require('../../../../utils/dateUtil.js');
const api = require('../../../../const/api.js');
const app = getApp();
const storages = require('../../../../const/storage.js');
import storage from '../../../../utils/storageUtils.js';


import Toast from '../../../../miniprogram_npm/@vant/weapp/dialog/dialog';Page({

  /**
   * 页面的初始数据
   */
  data: {
    orgName:''
    ,selectcontent:''
    ,value:''  //选中的值
    ,valueid:'' //选中的id
    ,buildingShow:false
    ,buildingList:''
    ,roomNumShow:false
    ,roomNumList:''
    ,grpCode:''
    ,stagesList:''
    ,grpName:''
    ,budName:''
    ,stagesDataIndex:'-1'
    ,buildDataIndex:'-1'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.queryStages();
  },

// 根据项目号获取分期
queryStages(){
  var data = {
  }
    app.req.postRequest(api.queryStages,data).then(res=>{
    let data = res.data;
    if(data.respCode == '000'){
      console.log('data===>',data);
      this.setData({
        stagesList:data.data.list,
        orgName:data.data.orgName
      })
    }
  })
},
  
// 点击分期选择-获取楼栋
stagesChange(e){
  console.log("--------------------------------"+e.currentTarget.dataset.index+"--------------------------------")
  console.log(e.currentTarget.dataset.datavalue.grpCode + "------" + e.currentTarget.dataset.datavalue.grpName)
  var data = {
    grpCode:e.currentTarget.dataset.datavalue.grpCode
  }
    app.req.postRequest(api.queryBuilding,data).then(res=>{
    let data = res.data;
    if(data.respCode == '000'){
      console.log('data===>',data);
      this.setData({
        buildingList:data.data.list,
        buildingShow:true,
        roomNumShow:false,
        grpName:e.currentTarget.dataset.datavalue.grpName,
        stagesDataIndex:e.currentTarget.dataset.index
      })
    }
  })
},

// 点击楼栋选择-获取房号
buildingChange(e){
  console.log(e.currentTarget.dataset.datavalue.budId + "------------"+e.currentTarget.dataset.datavalue.budName)
  var data = {
    buildingId:e.currentTarget.dataset.datavalue.budId
  }
    app.req.postRequest(api.queryRoomNum,data).then(res=>{
    let data = res.data;
    if(data.respCode == '000'){
      console.log('data===>',data);
      this.setData({
        roomNumList:data.data.list,
        roomNumShow:true,
        budName:e.currentTarget.dataset.datavalue.budName,
        buildDataIndex:e.currentTarget.dataset.index
      })
    }
  })
},

// 房号选择-回显已选择房号到报修页面
changecontent(e){
  console.log(e.currentTarget.dataset.datavalue.resName + "-----------------" + e.currentTarget.dataset.datavalue.id)
  this.setData({
    value:e.currentTarget.dataset.datavalue.resName,
    valueid:e.currentTarget.dataset.datavalue.id
  })
  var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  
    prevPage.setData({
        selectedHouseId:e.currentTarget.dataset.datavalue.id,
        selectedHouseName:e.currentTarget.dataset.datavalue.resName,
        grpName:this.data.grpName,
        budName:this.data.budName,
    })
  wx.navigateBack({
    delta: 1,
  })
},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})