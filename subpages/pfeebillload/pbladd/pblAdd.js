// subpages/humsgspecified/masssendhumsg/massSendHuMsg.js
let network = require("../../../utils/network")
let dateUtil = require("../../../utils/dateUtil")
let api = require("../../../const/api")
import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //请求字段
    custId: "",
    houseSeqId:"",
    buildingId:"",
    areaId:"",
    billAmt:"",
    stat:"S",
    loadFlag:"O",
    payChnl:"U",
    loadPoSeq:"",
    billRemark:"",
    ordDate:dateUtil.formatDate(new Date(), 'yyyyMMdd'),
    ordSeqId:"",
    beginBillMon:"",
    endBillMon:"",
    billAmtTotal:"0.00",
    //pblAdd.wxml字段
    active:0,
    //addByRcvdAmt.wxml ==>
    //房屋选择辅助字段
    showArea: false,
    areaList: [],
    buildingList: [],
    roomList: [],
    selectArea: {areaName: "选择区域"},
    selectBuilding: {buildingName: '选择楼号'},
    selectRoom: {houseNo: '选择室号'},
    //其他辅助字段
    currentDate: new Date().getTime(),
    minDate: new Date().getTime(),
    showEndBillMonPicker:false,
    payChnls:[
      {value:"U", text:"未知"},
      {value:"P", text:"对公_POS收款"},
      {value:"A", text:"对公_支付宝收款"},
      {value:"W", text:"对公_微信收款"},
      {value:"T", text:"对公_银行收款"},
      {value:"J", text:"对公_平台小程序"},
      {value:"C", text:"个人_现金收款"},
      {value:"O", text:"个人_其他"},
    ],
    ordDateDesc:dateUtil.formatDate(new Date(), 'yyyy年MM月dd日'),
    showOrdDatePicker:false,
    currentOrdDate:new Date().getTime(),
    pfeePayMonDesc:"",
    beginBillMonDesc:"",
    endBillMonDesc:"请选择...",
    pfeeMonBillDtos:"",
    loadWay:'SB',
    //addByBillAmt.wxml ==>
    //请求字段
    payChnl2:"U",
    billRemark2:"",
    ordSeqId2:"",
    billAmtTotal2:"",
    //
    showArea2: false,
    areaList2: [],
    buildingList2: [],
    roomList2: [],
    selectArea2: {areaName: "选择区域"},
    selectBuilding2: {buildingName: '选择楼号'},
    selectRoom2: {houseNo: '选择室号'},
    currentDate2: new Date().getTime(),
    minDate2: new Date().getTime(),
    showEndBillMonPicker2:false,
    ordDateDesc2:dateUtil.formatDate(new Date(), 'yyyy年MM月dd日'),
    showOrdDatePicker2:false,
    currentOrdDate2:new Date().getTime(),
    pfeePayMonDesc2:"",
    beginBillMonDesc2:"",
    endBillMonDesc2:"请选择...",
    pfeeMonBillDtos2:"",
    loadWay2:'SA',
    amtRecordMode:'A'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp();
    var curCustId = app.globalData.userInfo.CUSTID;
    var curPoSeqId = app.globalData.userInfo.POSEQID;
    console.log("userInfo.CUSTID="+curCustId+"，userInfo.POSEQID="+curPoSeqId);
    this.setData({
      custId:curCustId,
      loadPoSeq:curPoSeqId,
    });
    this.onRequestArea()
  },

  onRequestArea() {
    var that = this;
    network.RequestMQ.request({
      url:api.queryHouseArea,
      method: "POST",
      data: {
        "custId": that.data.custId,
      },
      success:function(a){
        if (a.data.areaInfo == null) {
          if(a.data.buildingInfo == null) {
            console.log("既没有区域 也没有楼号 数据")
            that.setData({
              showArea: false
            })
          }
          else {//无区域 有楼号
            that.setData({
              buildingList:  a.data.buildingInfo,
              showArea: false
            })
          }
        }
        else {//有区域
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
        "custId": that.data.custId,
        "areaId": that.data.selectArea.areaId,
      },
      success:function(a){
        that.setData({
          buildingList: a.data.buildingInfo
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
        "custId": that.data.custId,
        "areaId": that.data.selectArea.areaId,
        "buildingId": that.data.selectBuilding.buildingId
      },
      success:function(a){
        that.setData({
          roomList: a.data.houseInfo
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

    this.onRequestRoom();
  },

  onRoomChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("room: " + index)
    this.selectComponent('#room').toggle();
    let selectRoom_temp = this.data.roomList[index];
    console.log(selectRoom_temp);
    let pfeePayMon_temp = selectRoom_temp.pfeePayMon;//yyyyMM
    let pfeePayMonDesc_temp = "";
    let beginBillMon_temp = "";
    let beginBillMonDesc_temp = "";
    if (pfeePayMon_temp != null && pfeePayMon_temp != '') {
      pfeePayMonDesc_temp = pfeePayMon_temp.substr(0, 4)+"年"+pfeePayMon_temp.substr(4)+"月";
      beginBillMon_temp = dateUtil.dateAddMonth(new Date(pfeePayMon_temp.substr(0, 4)+"-"+pfeePayMon_temp.substr(4)+"-01"), "m", 1).substr(0, 6);//20201101 
      beginBillMonDesc_temp = beginBillMon_temp.substr(0,4)+"年"+beginBillMon_temp.substr(4)+"月"
    }
    let minDate_temp = new Date(beginBillMon_temp.substr(0, 4)+"-"+beginBillMon_temp.substr(4)+"-01").getTime();
    let currentDate_temp = minDate_temp;
    console.log(pfeePayMon_temp, pfeePayMonDesc_temp, beginBillMon_temp, beginBillMonDesc_temp, minDate_temp)
    this.setData({
      selectRoom: selectRoom_temp
      // ,pfeePayMon:pfeePayMon_temp
      ,pfeePayMonDesc:pfeePayMonDesc_temp
      ,beginBillMon:beginBillMon_temp
      ,beginBillMonDesc:beginBillMonDesc_temp
      ,houseSeqId:selectRoom_temp.houseSeqId
      ,buildingId:selectRoom_temp.buildingId
      ,areaId:selectRoom_temp.areaId
      ,billAmt:selectRoom_temp.propFee
      ,minDate:minDate_temp
      ,currentDate:currentDate_temp
    })

  },

  onChange(event) {
    // wx.showToast({
    //   title: '切换到标签'+ event.detail.name,
    //   icon: 'none',
    // });
    let tab_index = event.detail.name;
    console.log(tab_index);
    if(tab_index == 1){
      this.onRequestArea2()
    }
  },

  onShowEndBillMonPicker(event){
    if (this.data.beginBillMon == "") {
      wx.showToast({
        title: '请先选择室号',
        icon: 'none',
      });
      return;
    }
    this.setData({
      showEndBillMonPicker: true,
    });
  },

  onCloseEndBillMonPicker(){
    this.setData({
      showEndBillMonPicker: false,
    });
  },

  onConfirmEndBillMon(event) {
    let endBillMon_temp = dateUtil.formatDate(new Date(event.detail), 'yyyyMM');
    console.log(endBillMon_temp)
    this.setData({
      showEndBillMonPicker: false,
      currentDate: event.detail,
      endBillMon: endBillMon_temp,
      endBillMonDesc: dateUtil.formatDate(new Date(event.detail), 'yyyy年MM月'),
    });
    // console.log(event.detail);
    // console.log(new Date(event.detail));
    let that = this;
    network.RequestMQ.request({
      url:api.queryPfeeMonBill,
      method: "POST",
      // header: {"content-type":"application/json"},
      data: {
        "custId": that.data.custId,
        "houseSeqId": that.data.houseSeqId,
        "startBillMon": that.data.beginBillMon,
        "endBillMon": endBillMon_temp
      },
      success:function(a){
        //do something
        console.log(a)
        let rCode = a.data.respCode;
        if (rCode && rCode != null && rCode != "") {
          if (rCode != '000') {
            wx.showToast({
              title: a.data.errDesc,
              icon: 'none'
            });
          } else {
            that.setData({
              pfeeMonBillDtos:a.data.pfeeMonBillDtos,
              billAmtTotal:a.data.sumAmt,
            });
          }
        } else {
          wx.showToast({
            title: "获取账单明细失败，请稍后重试",
            icon: 'none'
          });
        }
      },
      fail:function(a){
        console.log(a)
      },
      complete:function(a){
        
      }
    });
    
  },

  onCancelEndBillMon(event) {
    this.setData({
      showEndBillMonPicker: false,
    });
  },

  onChangePayChnl(event){
    this.setData({
      payChnl: event.detail,
    });
    // console.log(event.detail)
    // console.log(this.data.payChnl)
  },

  onShowOrdDatePicker(event){
    this.setData({
      showOrdDatePicker: true,
    });
  },

  onCloseOrdDatePicker(){
    this.setData({
      showOrdDatePicker: false,
    });
  },

  onConfirmOrdDate(event) {
    this.setData({
      showOrdDatePicker: false,
      currentOrdDate: event.detail,//时间戳
      ordDate: dateUtil.formatDate(new Date(event.detail), 'yyyyMMdd'),
      ordDateDesc: dateUtil.formatDate(new Date(event.detail), 'yyyy年MM月dd日'),
    });
    // console.log(event.detail);
    // console.log(new Date(event.detail));
    // console.log(this.data.ordDate);
  },

  onCancelOrdDate(event) {
    this.setData({
      showOrdDatePicker: false,
    });
  },

  onChangeOrdSeqId(event) {
    // event.detail 为当前输入的值
    console.log(event.detail);
    this.setData({
      ordSeqId:event.detail,
    });
  },

  onChangeBillRemark(event) {
    // event.detail 为当前输入的值
    console.log(event.detail);
    this.setData({
      billRemark:event.detail,
    });
  },

  onSubmitAudit(event){
    let custId = this.data.custId;
    let houseSeqId = this.data.houseSeqId;
    let buildingId = this.data.buildingId;
    let areaId = this.data.areaId;
    let billAmt = this.data.billAmt;
    let stat = this.data.stat;
    let loadFlag = this.data.loadFlag;
    let payChnl = this.data.payChnl;
    let loadPoSeq = this.data.loadPoSeq;
    let billRemark = this.data.billRemark;//可空
    let ordDate = this.data.ordDate;
    let ordSeqId = this.data.ordSeqId;//可空
    let beginBillMon = this.data.beginBillMon;
    let endBillMon = this.data.endBillMon;
    let billAmtTotal = this.data.billAmtTotal;
    let loadWay = this.data.loadWay;
    if (custId=="" || loadPoSeq=="") {
      wx.showToast({
        title: "网络异常，请稍后重试",
        icon: 'none'
      });
      return;
    }
    if (areaId=="" || buildingId=="" || houseSeqId=="" || billAmt=="") {
      wx.showToast({
        title: "请先选择住址",
        icon: 'none'
      });
      return;
    }
    if (endBillMon=="") {
      wx.showToast({
        title: "请先选择账单结束日期",
        icon: 'none'
      });
      return;
    }
    if (ordSeqId != "" && ordSeqId.length != 8) {
      wx.showToast({
        title: "请输入8位订单序列号",
        icon: 'none'
      });
      return;
    }
    let data_temp = {"custId":custId,"houseSeqId":houseSeqId,"buildingId":buildingId,"areaId":areaId,"billAmt":billAmt,"stat":stat,
                      "loadFlag":loadFlag,"payChnl":payChnl,"loadPoSeq":loadPoSeq,"billRemark":billRemark,"ordDate":ordDate,
                      "ordSeqId":ordSeqId,"beginBillMon":beginBillMon,"endBillMon":endBillMon,"billAmtTotal":billAmtTotal,"loadWay":loadWay};
    console.log(data_temp);
    let that = this;
    wx.showModal({
      content: '确定提交审核？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          network.RequestMQ.request({
            url:api.pfeeBillLoadSingle,
            method: "POST",
            // header: {"content-type":"application/json"},
            data: data_temp,
            success:function(a){
              console.log(a)
              let rCode = a.data.respCode;
              if (rCode && rCode != null && rCode != "") {
                if (rCode != '000') {
                  wx.showToast({
                    title: a.data.errDesc,
                    icon: 'none'
                  });
                } else {
                  wx.showModal({
                    content: '提交审核成功',
                    showCancel: false,
                    success: function (sm) {
                        // 用户点击了确定
                        wx.redirectTo({
                          url: '/subpages/pfeebillload/pbladd/pblAdd',
                        });
                    }
                  });
                }
              } else {
                wx.showToast({
                  title: "提交审核失败，请稍后重试",
                  icon: 'none'
                });
              }
            },
            fail:function(a){
              console.log(a)
              let errDesc_temp = '提交审核出现失败，请稍后重试';
              if(a && a.data){
                errDesc_temp = a.data.errDesc;
              }
              wx.showToast({
                title: errDesc_temp,
                icon: 'none'
              });
            },
            complete:function(a){
              
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  },

  //按实收录入 ==》
  onRequestArea2() {
    var that = this;
    network.RequestMQ.request({
      url:api.queryHouseArea,
      method: "POST",
      data: {
        "custId": that.data.custId,
      },
      success:function(a){
        if (a.data.areaInfo == null) {
          if(a.data.buildingInfo == null) {
            console.log("既没有区域 也没有楼号 数据")
            that.setData({
              showArea2: false
            })
          }
          else {//无区域 有楼号
            that.setData({
              buildingList2:  a.data.buildingInfo,
              showArea2: false
            })
          }
        }
        else {//有区域
          that.setData({
            showArea2: true,
            areaList2: a.data.areaInfo
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

  onRequestBuilding2() {
    var that = this;
    // console.log(that.data.selectArea2.areaId)
    console.log("==> enter onRequestBuilding2()")
    network.RequestMQ.request({
      url:api.queryHouseBuilding,
      method: "POST",
      data: {
        "custId": that.data.custId,
        "areaId": that.data.selectArea2.areaId,
      },
      success:function(a){
        that.setData({
          buildingList2: a.data.buildingInfo
        })
        console.log(a.data.buildingInfo);
      },
      fail:function(a){
        
      },
      complete:function(a){
        
      }
    })
  },

  onRequestRoom2() {
    var that = this;
    // console.log(that.data.selectBuilding.BuildingInfo)
    network.RequestMQ.request({
      url:api.queryHouseRoom,
      method: "POST",
      data: {
        "custId": that.data.custId,
        "areaId": that.data.selectArea2.areaId,
        "buildingId": that.data.selectBuilding2.buildingId
      },
      success:function(a){
        that.setData({
          roomList2: a.data.houseInfo
        })
        console.log(a.data.houseInfo);
      },
      fail:function(a){
        
      },
      complete:function(a){
        
      }
    })
  },

  onAreaChange2: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("==> enter onAreaChange2(), area2: " + index)
    this.selectComponent('#area2').toggle();
    this.setData({
      selectArea2: this.data.areaList[index],
      buildingList2: [],
      roomList2: [],
      selectBuilding2: {buildingName: '选择楼号'},
      selectRoom2: {houseNo: '选择室号'},
    })

    console.log(this.data.areaList[index])

    this.onRequestBuilding2();
  },

  onBuildingChange2: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("building2: " + index)
    this.selectComponent('#building2').toggle();
    this.setData({
      selectBuilding2: this.data.buildingList2[index],
      roomList2: [],
      selectRoom2: {houseNo: '选择室号'},
    })

    console.log(this.data.buildingList2[index]);

    this.onRequestRoom2();
  },

  onRoomChange2: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("room2: " + index)
    this.selectComponent('#room2').toggle();
    let selectRoom_temp = this.data.roomList2[index];
    console.log(selectRoom_temp);
    let pfeePayMon_temp = selectRoom_temp.pfeePayMon;//yyyyMM
    let pfeePayMonDesc_temp = "";
    let beginBillMon_temp = "";
    let beginBillMonDesc_temp = "";
    if (pfeePayMon_temp != null && pfeePayMon_temp != '') {
      pfeePayMonDesc_temp = pfeePayMon_temp.substr(0, 4)+"年"+pfeePayMon_temp.substr(4)+"月";
      beginBillMon_temp = dateUtil.dateAddMonth(new Date(pfeePayMon_temp.substr(0, 4)+"-"+pfeePayMon_temp.substr(4)+"-01"), "m", 1).substr(0, 6);//20201101 
      beginBillMonDesc_temp = beginBillMon_temp.substr(0,4)+"年"+beginBillMon_temp.substr(4)+"月"
    }
    let minDate_temp = new Date(beginBillMon_temp.substr(0, 4)+"-"+beginBillMon_temp.substr(4)+"-01").getTime();
    let currentDate_temp = minDate_temp;
    console.log(pfeePayMon_temp, pfeePayMonDesc_temp, beginBillMon_temp, beginBillMonDesc_temp, minDate_temp)
    this.setData({
      selectRoom2: selectRoom_temp
      // ,pfeePayMon:pfeePayMon_temp
      ,pfeePayMonDesc2:pfeePayMonDesc_temp
      ,beginBillMon:beginBillMon_temp
      ,beginBillMonDesc2:beginBillMonDesc_temp
      ,houseSeqId:selectRoom_temp.houseSeqId
      ,buildingId:selectRoom_temp.buildingId
      ,areaId:selectRoom_temp.areaId
      ,billAmt:selectRoom_temp.propFee
      ,minDate2:minDate_temp
      ,currentDate2:currentDate_temp
    })

  },

  onShowEndBillMonPicker2(event){
    if (this.data.beginBillMon == "") {
      wx.showToast({
        title: '请先选择室号',
        icon: 'none',
      });
      return;
    }
    this.setData({
      showEndBillMonPicker2: true,
    });
  },

  onCloseEndBillMonPicker2(){
    this.setData({
      showEndBillMonPicker2: false,
    });
  },

  onConfirmEndBillMon2(event) {
    let endBillMon_temp = dateUtil.formatDate(new Date(event.detail), 'yyyyMM');
    console.log(endBillMon_temp)
    this.setData({
      showEndBillMonPicker2: false,
      currentDate2: event.detail,
      endBillMon: endBillMon_temp,
      endBillMonDesc2: dateUtil.formatDate(new Date(event.detail), 'yyyy年MM月'),
      billAmtTotal2: '',
      pfeeMonBillDtos2: [],
    });
    // console.log(event.detail);
    // console.log(new Date(event.detail));
  },

  onCancelEndBillMon2(event) {
    this.setData({
      showEndBillMonPicker2: false,
    });
  },

  onChangeAmtRecordMode(event) {
    this.setData({
      amtRecordMode: event.detail,
      billAmtTotal2: '',
      pfeeMonBillDtos2: [],
    });
  },

  // onChangeBillAmtTotal2(event){
  //   console.log(event);
  //   console.log(event.detail);
  // },

  onBlurBillAmtTotal2(event){
    // console.log(event);
    // console.log(event.detail);
    console.log(event.detail.value);
    let value_temp = event.detail.value;
    let endBillMon_temp = this.data.endBillMon;
    let billAmt_temp = this.data.billAmt;
    if (endBillMon_temp == "" || billAmt_temp == "") {
      this.setData({
        billAmtTotal2: '',
      });
      wx.showToast({
        title: "请先选择账单结束日期",
        icon: 'none'
      });
      return;
    } else {
      let billAmtTotal2_temp = this.data.billAmtTotal2;
      console.log(billAmtTotal2_temp);
      if(value_temp != billAmtTotal2_temp){
        this.setData({
          billAmtTotal2: parseFloat(value_temp).toFixed(2),
        });
        let that = this;
        network.RequestMQ.request({
          url:api.queryPfeeMonBill,
          method: "POST",
          // header: {"content-type":"application/json"},
          data: {
            "custId": that.data.custId
            ,"houseSeqId": that.data.houseSeqId
            ,"startBillMon": that.data.beginBillMon
            ,"endBillMon": endBillMon_temp
            ,"billAmt": billAmt_temp
            ,"billAmtTotal": value_temp
            ,"amtRecordMode": that.data.amtRecordMode
          },
          success:function(a){
            //do something
            console.log(a)
            let rCode = a.data.respCode;
            if (rCode && rCode != null && rCode != "") {
              if (rCode != '000') {
                that.setData({
                  billAmtTotal2: '',
                  pfeeMonBillDtos2:[],
                });
                wx.showToast({
                  title: a.data.errDesc,
                  icon: 'none'
                });
              } else {
                that.setData({
                  pfeeMonBillDtos2:a.data.pfeeMonBillDtos,
                  // billAmtTotal2:a.data.sumAmt,
                });
              }
            } else {
              wx.showToast({
                title: "获取账单明细失败，请稍后重试",
                icon: 'none'
              });
            }
          },
          fail:function(a){
            console.log(a);
            that.setData({
              billAmtTotal2: '',
              pfeeMonBillDtos2:[],
            });
            wx.showToast({
              title: a.data.errDesc,
              icon: 'none'
            });
          },
          complete:function(a){
            
          }
        });
      }
    }
  },

  onChangePayChnl2(event){
    this.setData({
      payChnl2: event.detail,
    });
    // console.log(event.detail)
    // console.log(this.data.payChnl)
  },

  onShowOrdDatePicker2(event){
    this.setData({
      showOrdDatePicker2: true,
    });
  },

  onCloseOrdDatePicker2(){
    this.setData({
      showOrdDatePicker2: false,
    });
  },

  onConfirmOrdDate2(event) {
    this.setData({
      showOrdDatePicker2: false,
      currentOrdDate2: event.detail,//时间戳
      ordDate: dateUtil.formatDate(new Date(event.detail), 'yyyyMMdd'),
      ordDateDesc2: dateUtil.formatDate(new Date(event.detail), 'yyyy年MM月dd日'),
    });
    // console.log(event.detail);
    // console.log(new Date(event.detail));
    // console.log(this.data.ordDate);
  },

  onCancelOrdDate2(event) {
    this.setData({
      showOrdDatePicker2: false,
    });
  },

  onChangeOrdSeqId2(event) {
    // event.detail 为当前输入的值
    console.log(event.detail);
    this.setData({
      ordSeqId2:event.detail,
    });
  },

  onChangeBillRemark2(event) {
    // event.detail 为当前输入的值
    console.log(event.detail);
    this.setData({
      billRemark2:event.detail,
    });
  },

  onSubmitAudit2(event){
    let custId = this.data.custId;
    let houseSeqId = this.data.houseSeqId;
    let buildingId = this.data.buildingId;
    let areaId = this.data.areaId;
    let billAmt = this.data.billAmt;
    let stat = this.data.stat;
    let loadFlag = this.data.loadFlag;
    let payChnl = this.data.payChnl2;
    let loadPoSeq = this.data.loadPoSeq;
    let billRemark = this.data.billRemark2;//可空
    let ordDate = this.data.ordDate;
    let ordSeqId = this.data.ordSeqId2;//可空
    let beginBillMon = this.data.beginBillMon;
    let endBillMon = this.data.endBillMon;
    let billAmtTotal2 = this.data.billAmtTotal2;
    let loadWay2 = this.data.loadWay2;
    let amtRecordMode = this.data.amtRecordMode;
    if (custId=="" || loadPoSeq=="") {
      wx.showToast({
        title: "网络异常，请稍后重试",
        icon: 'none'
      });
      return;
    }
    if (areaId=="" || buildingId=="" || houseSeqId=="" || billAmt=="") {
      wx.showToast({
        title: "请先选择住址",
        icon: 'none'
      });
      return;
    }
    if (endBillMon=="") {
      wx.showToast({
        title: "请先选择账单结束日期",
        icon: 'none'
      });
      return;
    }
    if (endBillMon=="") {
      wx.showToast({
        title: "请先选择账单结束日期",
        icon: 'none'
      });
      return;
    }
    if (billAmtTotal2=="") {
      wx.showToast({
        title: "请先输入实收金额",
        icon: 'none'
      });
      return;
    }
    if (ordSeqId != "" && ordSeqId.length != 8) {
      wx.showToast({
        title: "请输入8位订单序列号",
        icon: 'none'
      });
      return;
    }
    let data_temp = {"custId":custId,"houseSeqId":houseSeqId,"buildingId":buildingId,"areaId":areaId,"billAmt":billAmt,"stat":stat,
                      "loadFlag":loadFlag,"payChnl":payChnl,"loadPoSeq":loadPoSeq,"billRemark":billRemark,"ordDate":ordDate,
                      "ordSeqId":ordSeqId,"beginBillMon":beginBillMon,"endBillMon":endBillMon,"billAmtTotal":billAmtTotal2,
                      "loadWay":loadWay2,"amtRecordMode":amtRecordMode};
    console.log(data_temp);
    let that = this;
    wx.showModal({
      content: '确定提交审核？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          network.RequestMQ.request({
            url:api.pfeeBillLoadSingle,
            method: "POST",
            // header: {"content-type":"application/json"},
            data: data_temp,
            success:function(a){
              console.log(a)
              let rCode = a.data.respCode;
              if (rCode && rCode != null && rCode != "") {
                if (rCode != '000') {
                  wx.showToast({
                    title: a.data.errDesc,
                    icon: 'none'
                  });
                } else {
                  wx.showModal({
                    content: '提交审核成功',
                    showCancel: false,
                    success: function (sm) {
                        // 用户点击了确定
                        wx.redirectTo({
                          url: '/subpages/pfeebillload/pbladd/pblAdd',
                        });
                    }
                  });
                }
              } else {
                wx.showToast({
                  title: "提交审核失败，请稍后重试",
                  icon: 'none'
                });
              }
            },
            fail:function(a){
              console.log(a)
              let errDesc_temp = '提交审核出现失败，请稍后重试';
              if(a && a.data){
                errDesc_temp = a.data.errDesc;
              }
              wx.showToast({
                title: errDesc_temp,
                icon: 'none'
              });
            },
            complete:function(a){
              
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  },

});
