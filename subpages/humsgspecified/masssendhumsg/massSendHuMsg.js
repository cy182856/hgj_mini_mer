// subpages/humsgspecified/masssendhumsg/massSendHuMsg.js
let network = require("../../../utils/network")
let api = require("../../../const/api")
import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    CUSTID: "",
    poSeqId:"",
    propType:"",
    showArea: false,
    showBuilding:false,
    showRoom:false,
    areaList: [],
    buildingList: [],
    roomList: [],
    poNoticeSigns:[],

    selectArea: {areaName: "选择区域"},
    selectBuilding: {buildingName: '选择楼号'},
    selectRoom: {houseNo: '选择室号'},
    selectSign:{signName:''},

    loading: false,//是否正在加载

    msgTitle:'',
    msgBody:'',
    sendAreaIds:[],
    huRoles:[],
    show: false,
    curDateTime:'',
    autosize:{minHeight: 49},
    show_textarea:true,
    signName:'',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp();
    var curCUSTID = app.globalData.userInfo.CUSTID;
    var curPoSeqId = app.globalData.userInfo.POSEQID;
    var curPropType = app.globalData.userInfo.PROPTYPE;
    console.log("userInfo.CUSTID="+curCUSTID+"，userInfo.POSEQID="+curPoSeqId+"，userInfo.PROPTYPE="+curPropType);
    this.setData({
      CUSTID:curCUSTID,
      poSeqId:curPoSeqId,
      propType:curPropType
    });
    this.onRequestArea(),
    this.onRequestNotice()
  },

  onRequestNotice(){
    var that=this; 
    network.RequestMQ.request({
      url:api.queryPoNoticeSign,
      method:"POST",
      data:{
        "custId":that.data.CUSTID,
        "poSeqId":that.data.poSeqId,
      },
      success:function(res) {
        that.setData({
          poNoticeSigns:res.data.data,
          selectSign:res.data.data[0],
          signName:res.data.data[0].signName
        })
        console.log(res.data.data);
      }
    })
  },

  onRequestArea() {
    var that = this;
    network.RequestMQ.request({
      url:api.queryHouseArea,
      method: "POST",
      data: {
        "custId": that.data.CUSTID,
      },
      success:function(a){
        if (a.data.areaInfo == null) {
          if(a.data.buildingInfo == null) {
            console.log("既没有区域 也没有楼号 数据")
            that.setData({
              showArea: false
              ,showBuilding: true
            })
          }
          else {//无区域 有楼号
            that.setData({
              buildingList:  a.data.buildingInfo,
              showArea: false
              ,showBuilding: true
            })
          }
        }
        else  {//有区域
          that.setData({
            showArea: true,
            areaList: a.data.areaInfo
          })
          console.log(a.data.areaInfo);
        }
      },
      fail:function(a){
        
      },
      complete:function(a){
        
      }
    })
  },

  onRequestBuilding() {
    var that = this;
    // console.log(that.data.selectArea.areaId)
    network.RequestMQ.request({
      url:api.queryHouseBuilding,
      method: "POST",
      data: {
        "custId": that.data.CUSTID,
        "areaId": that.data.selectArea.areaId,
      },
      success:function(a){
        that.setData({
          buildingList: a.data.buildingInfo
          ,showBuilding: true
        })
        console.log(a.data.buildingInfo);
      },
      fail:function(a){
        
      },
      complete:function(a){
        
      }
    })
  },

  onRequestRoom() {
    var that = this;
    // console.log(that.data.selectBuilding.BuildingInfo)
    network.RequestMQ.request({
      url:api.queryHouseRoom,
      method: "POST",
      data: {
        "custId": that.data.CUSTID,
        "areaId": that.data.selectArea.areaId,
        "buildingId": that.data.selectBuilding.buildingId
      },
      success:function(a){
        that.setData({
          roomList: a.data.houseInfo
          ,showRoom: true
        })
        console.log(a.data.houseInfo);
      },
      fail:function(a){
        
      },
      complete:function(a){
        
      }
    })
  },

  onAreaChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("area: " + index)
    this.selectComponent('#area').toggle();
    this.setData({
      selectArea: this.data.areaList[index],
      buildingList: [],
      roomList: [],
      selectBuilding: {buildingName: '选择楼号'},
      selectRoom: {houseNo: '选择室号'},
    })

    console.log(this.data.areaList[index])
    var curSendAreaIds = [];
    curSendAreaIds[0] = this.data.areaList[index].areaId;
    this.setData({
      sendAreaIds:curSendAreaIds
    })
    console.log(this.data.sendAreaIds);

    this.onRequestBuilding();
  },

  onBuildingChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("building: " + index)
    this.selectComponent('#building').toggle();
    this.setData({
      selectBuilding: this.data.buildingList[index],
      roomList: [],
      selectRoom: {houseNo: '选择室号'},
    })

    console.log(this.data.buildingList[index]);
    var curSendAreaIds = [];
    curSendAreaIds[0] = this.data.sendAreaIds[0];
    curSendAreaIds[1] = this.data.buildingList[index].buildingId;
    this.setData({
      sendAreaIds:curSendAreaIds
    })
    console.log(this.data.sendAreaIds);

    this.onRequestRoom();
  },

  onRoomChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("room: " + index)
    this.selectComponent('#room').toggle();
    this.setData({
      selectRoom: this.data.roomList[index]
    })

    console.log(this.data.roomList[index]);
    var curSendAreaIds = this.data.sendAreaIds;
    curSendAreaIds[2] = this.data.roomList[index].houseSeqId;
    this.setData({
      sendAreaIds:curSendAreaIds
    })
    console.log(this.data.sendAreaIds);
  },
  onSignChange:function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("sign: " + index)
    this.selectComponent('#sign').toggle();
    this.setData({
      selectSign:this.data.poNoticeSigns[index],
      signName:this.data.poNoticeSigns[index].signName
    })
  },
  onDropMenuOpen() {
    // console.log("onDropMenuOpen")
  },

  onDropMenuClose() {
    // console.log("onDropMenuClose")
  },

  onMsgTitleChange(event){
    this.setData({
      msgTitle: event.detail,
    });
    console.log(this.data.msgTitle);
  },

  onMsgBodyChange(event){
    this.setData({
      msgBody: event.detail,
    });
    console.log(this.data.msgBody);
  },

  onSendObjChange(event) {
    this.setData({
      huRoles: event.detail,
    });
    console.log(this.data.huRoles);
  },

  onMassSendHuMsg(){
    console.log(this.data.msgTitle);
    console.log(this.data.msgBody);
    console.log(this.data.sendAreaIds);
    console.log(this.data.huRoles);
    console.log(this.data.signName);
    if (this.data.msgTitle == null || this.data.msgTitle == "") {
      wx.showToast({
        title: '请输入通知标题',
        icon: 'none'
      });
      return;
    }
    if (this.data.msgBody == null || this.data.msgBody == "") {
      wx.showToast({
        title: '请输入通知内容',
        icon: 'none'
      });
      return;
    }
    
    var idsLen = this.data.sendAreaIds.length;
    if (idsLen < 3) {
      var titleDesc = "";
      switch (idsLen) {
        case 0:
          titleDesc = "通知范围";
          break;
        case 1:
          titleDesc = "楼号";
          break;
        case 2:
          titleDesc = "室号";
          break;
        default:
          titleDesc = "通知范围";
          break;
      }
      wx.showToast({
        title: '请选择'+titleDesc,
        icon: 'none'
      });
      return;
    }
    if (this.data.huRoles.length == 0) {
      wx.showToast({
        title: '请选择通知对象',
        icon: 'none'
      });
      return;
    }
    
    var that = this;
    wx.showModal({
      title: '提示',
      content: '通知发送后不可撤回，确定立即发送？',
      success: function (sm) {
        if (sm.confirm) {
          // 用户点击了确定
          that.doMassSendHuMsg();
        } else if (sm.cancel) {
          console.log('用户点击了取消')
        }
      }
    })
  },

  doMassSendHuMsg(){
    let that = this;
    network.RequestMQ.request({
      url:api.massSendHuMsg,
      method: "POST",
      // header: {"content-type":"application/json"},
      data: {
        "custId": that.data.CUSTID,
        "msgTitle": that.data.msgTitle,
        "msgBody": that.data.msgBody,
        "sendAreaIds": that.data.sendAreaIds,
        "huRoles": that.data.huRoles,
        "poSeqId": that.data.poSeqId,
        "signName":that.data.signName
      },
      success:function(a){
        that.setData({
          loading: false,
        })
        var rCode = a.data.respCode;
        console.log(a.data.respCode)
        if (rCode && rCode != null && rCode != "") {
          if (rCode != "000") {
            wx.showToast({
              title: a.data.errDesc,
              icon: 'none'
            });
          } else {
            // wx.showToast({
            //   title: "群发消息请求结束，请稍后查看发送结果",
            //   icon: 'none'
            // });
            // Dialog.alert({
            //   message: '群发消息结束，请稍后查看发送结果',
            // }).then(() => {
            //   // on close
            //   that.redirectToListPage();
            // });
            wx.showModal({
              content: '群发消息结束，请稍后查看发送结果',
              showCancel: false,
              success: function (sm) {
                  // 用户点击了确定
                  that.redirectToListPage();
              }
            });
          }
        } else {
          wx.showToast({
            title: "群发消息请求失败，请稍后重试",
            icon: 'none'
          });
        }
      },
      fail:function(a){
        that.setData({
          loading: false,
        })
        wx.showToast({
          title: "发送消息失败",
          icon: 'none'
        });
      },
      complete:function(a){
        that.setData({
          loading: false,
        })
      }
    })
  },

  onNavigateToListPage:function(e){
    console.log(e);
    console.log("onNavigateToListPage-url：/subpages/humsgspecified/humsgloglist/huMsgLogList")
    wx.navigateTo({
      url: '/subpages/humsgspecified/humsgloglist/huMsgLogList',
    })
  },

  redirectToListPage:function(){
    console.log("redirectToListPage-url：/subpages/humsgspecified/humsgloglist/huMsgLogList")
    wx.redirectTo({
      url: '/subpages/humsgspecified/humsgloglist/huMsgLogList',
    })
  },
  
  showPreviewPopup(){
    var that = this;
    if (that.data.msgTitle == "") {
      wx.showToast({
        title: '请先输入通知标题',
        icon: 'none'
      });
      return;
    }
    if (that.data.msgBody == "") {
      wx.showToast({
        title: '请先输入通知内容',
        icon: 'none'
      });
      return;
    }
  
    console.log(getCurDateTime());
    var curDateTime = getCurDateTime();
    this.setData({ show: true,  curDateTime: curDateTime, show_textarea: false });
  },

  onClose() {
    this.setData({ show: false, show_textarea: true });
  },

});

function getCurDateTime() {
  var date = new Date();
  var Y = date.getFullYear();
  var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
  var D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate());
  var h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()) + ':';
  var s = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds());
  return Y+"年"+M+"月"+D+"日"+" "+h+m+s;
}