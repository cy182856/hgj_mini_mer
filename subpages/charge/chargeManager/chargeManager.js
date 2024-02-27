var that = null;
const app = getApp(),
api = require("../../../const/api"),
network = require("../../../utils/network");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    map_popup_show:false, //地图弹窗是否显示
    sub_popup_show:false, //订阅弹窗是否显示
    rule_popup_show:false, //计费规则弹窗是否显示
    time_popup_show:false, //订阅时间弹窗是否显示
    sub_date_show:false, //
    showChargeAreaId: [''],
    today: new Date().getDate(),
    padding_bottom:0,
    isFinish:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new app.userInfo(),app.loading(),that = this, that.showLoading(!0);
    that.setData({
      isIphoneX:app.globalData.iphoneX,
      userInfo: getApp().globalData.userInfo
    })
    that.queryChargeList();
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
  queryChargeList(){
    that.showLoading(!0);
    network.RequestMQ.request({
      url:api.queryChargeList,
      success:function(res){
        that.setData({
          chargeList:res.data.chargeAreaVos,
          chargeRule:res.data.chargeRuleVo,
          padding_bottom:that.data.isIphoneX ? '176' : '140'
        })
        if(that.data.showChargeAreaId[0] == ''){
          that.setData({
            showChargeAreaId:res.data.chargeAreaVos ? res.data.chargeAreaVos[0].chargeAreaId : ''
          })
        }
      },
      fail:function(re){
        wx.showToast({
          title: '获取充电桩信息失败,请稍后重试',
          icon:'none',
          duration:2000
        })
      },
      complete:function(){
        that.showLoading(!1);
        that.setData({
          isFinish:true
        })
      }
    })
  },
  onClickArea(event) {
    this.setData({
      showChargeAreaId: event.detail,
    });
  },
  onShowMapPopup:function(e){
    let chargeArea = e.currentTarget.dataset.item;
    console.log(chargeArea);
    if(!chargeArea.areaLongitude 
      || !chargeArea.areaDimension 
      || !chargeArea.chargeAreaName){
			wx.showToast({
				title: '位置信息缺失',
				icon:'none',
				duration:3000
			})
			setTimeout(function(){
				wx.navigateBack({
					delta:1
				});
			},3000)
			return false;
		}
		const INIT_MARKER = {
			callout: {
				content: chargeArea.chargeAreaName,
				padding: 10,
				borderRadius: 2,
				display: 'ALWAYS'
			},
			latitude: chargeArea.areaDimension,//纬度
			longitude: chargeArea.areaLongitude,//经度
			iconPath: '../images/marker.png',
			width: '34px',
			height: '34px',
			rotate: 0,
			alpha: 1
		};
		that.setData({
      map_popup_show:true,
      scale:18,
			location: {
				latitude: chargeArea.areaDimension,
				longitude: chargeArea.areaLongitude
			},
			isShowScale: false,
			isShowCompass: false,
			isShowPosition: false,
			showActionSheet: false,
			markers: [{
				...INIT_MARKER
			}]
		})
		that.showLoading(!1)
  },
  onCloseMapPopup:function(e){
    that.setData({
      map_popup_show:false 
    })
  },
  onShowRulePopup:function(e){
    let chargeRule = e.currentTarget.dataset.item;
    console.log(chargeRule);
    if(!chargeRule){
      wx.showToast({
				title: '计费规则暂未配置，请联系物业',
				icon:'none',
				duration:3000
			})
			return false;
    }
    that.setData({
      rule_popup_show:true 
    })
  },
  onCloseRulePopup:function(e){
    that.setData({
      rule_popup_show:false 
    })
  },
  chargeDetail:function(e){
    let chargeDev = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../chargedetail/chargedetail?coopId=' + chargeDev.coopId + "&deviceSn=" + chargeDev.deviceSn
    })
  }
})