// subpages/humsg/masssendhumsg/massSendHuMsg.js
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
    
    selectArea: {areaName: "全区域"},
    selectBuilding: {buildingName: '全楼号'},
    selectRoom: {houseNo: '全室号'},
    selectSign:{signName:''},

    loading: false,//是否正在加载

    msgTitle:'',
    msgBody:'',
    sendAreaIds:[],
    // sendAreaNames:[],
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
          var curAraeList = a.data.areaInfo;
          if (curAraeList != null && curAraeList.length != 0) {
            var areaInfo1st = curAraeList[0];
            var areaInfo_add = {areaId: "aaa", areaName: "全区域", custId: areaInfo1st.custId, orderNo: 0, stat: "N"};
            curAraeList.unshift(areaInfo_add);
          }

          that.setData({
            showArea: true,
            //areaList: a.data.areaInfo
            areaList: curAraeList
          })
          console.log(curAraeList);
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
        var curBuildingList = a.data.buildingInfo;
        if (curBuildingList != null && curBuildingList.length != 0) {
          var buildingInfo1st = curBuildingList[0];
          var buildingInfo_add = {areaId: buildingInfo1st.areaId, buildingId: "bbb", buildingName: "全楼号", 
                                  custId: buildingInfo1st.custId, orderNo: 0, stat: "N"};
          curBuildingList.unshift(buildingInfo_add);
        }

        that.setData({
          //buildingList: a.data.buildingInfo
          buildingList: curBuildingList
          ,showBuilding: true
        })
        console.log(curBuildingList);
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
        var curRoomList = a.data.houseInfo;
        if (curRoomList != null && curRoomList.length != 0) {
          var hi1st = curRoomList[0];
          var houseInfo_add = {areaId: hi1st.areaId, areaName: hi1st.areaName, buildingId: hi1st.buildingId, 
                                buildingName: hi1st.buildingName, checkCode: null, codeExpTime: null, custId: hi1st.custId, 
                                houseNo: "全室号", houseSeqId: "hhhhh", isParkSpace: "", orderNo: 0, 
                                ownerSeqId: "", poKeeperSeq: null, poName: null, propFee: "", scoreSum: 0, stat: "N"};
          curRoomList.unshift(houseInfo_add);
        }

        that.setData({
          //roomList: a.data.houseInfo
          roomList: curRoomList
          ,showRoom: true
        })
        console.log(curRoomList);
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
      selectBuilding: {buildingName: '全楼号'},
      selectRoom: {houseNo: '全室号'},
    })

    console.log(this.data.areaList[index])
    var curSendAreaIds = [];
    // var curSendAreaNames = [];
    if (this.data.areaList[index].areaId != 'aaa') {
      curSendAreaIds[0] = this.data.areaList[index].areaId;
      // curSendAreaNames[0]= this.data.areaList[index].areaName;
    }
    this.setData({
      sendAreaIds:curSendAreaIds
      // ,sendAreaNames:curSendAreaNames
    })
    console.log(this.data.sendAreaIds);
    // console.log(this.data.sendAreaNames);
    if (this.data.areaList[index].areaId == 'aaa') {
      //直接返回，不用进行下一步楼号信息的查询
      return;
    }

    this.onRequestBuilding();
  },

  onBuildingChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("building: " + index)
    this.selectComponent('#building').toggle();
    this.setData({
      selectBuilding: this.data.buildingList[index],
      roomList: [],
      selectRoom: {houseNo: '全室号'},
    })

    console.log(this.data.buildingList[index]);
    var curSendAreaIds = [];
    // var curSendAreaNames = [];
    curSendAreaIds[0] = this.data.sendAreaIds[0];
    // curSendAreaNames[0] = this.data.sendAreaNames[0];
    if (this.data.buildingList[index].buildingId != 'bbb') {
      curSendAreaIds[1] = this.data.buildingList[index].buildingId;
      // curSendAreaNames[1]= this.data.buildingList[index].buildingName;
    }
    this.setData({
      sendAreaIds:curSendAreaIds
      // ,sendAreaNames:curSendAreaNames
    })
    console.log(this.data.sendAreaIds);
    // console.log(this.data.sendAreaNames);
    if (this.data.buildingList[index].buildingId == 'bbb') {
      //直接返回，不用进行下一步室号信息的查询
      return;
    }

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
    // var curSendAreaNames = this.data.sendAreaNames;
    if (this.data.roomList[index].houseSeqId != 'hhhhh') {
      curSendAreaIds[2] = this.data.roomList[index].houseSeqId;
      // curSendAreaNames[2]= this.data.roomList[index].houseNo;
    }
    this.setData({
      sendAreaIds:curSendAreaIds
      // ,sendAreaNames:curSendAreaNames
    })
    console.log(this.data.sendAreaIds);
    // console.log(this.data.sendAreaNames);
    // if (this.data.roomList[index].houseSeqId == 'hhhhh') {
    //   //直接返回，不用进行下一步相关操作
    //   return;
    // }
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
    // console.log(this.data.sendAreaNames);
    console.log(this.data.huRoles);
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
    // if (this.data.sendAreaIds.length == 0 
    //   // || this.data.sendAreaNames.length == 0
    //   ) {
    //   wx.showToast({
    //     title: '请选择通知范围',
    //     icon: 'none'
    //   });
    //   return;
    // }
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
        // "sendAreaNames": that.data.sendAreaNames,
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
    console.log("onNavigateToListPage-url：/subpages/humsg/humsgloglist/huMsgLogList")
    wx.navigateTo({
      url: '/subpages/humsg/humsgloglist/huMsgLogList',
    })
  },

  redirectToListPage:function(){
    console.log("redirectToListPage-url：/subpages/humsg/humsgloglist/huMsgLogList")
    wx.redirectTo({
      url: '/subpages/humsg/humsgloglist/huMsgLogList',
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
    // console.log(new Date());
    // console.log(new Date().getTime());
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