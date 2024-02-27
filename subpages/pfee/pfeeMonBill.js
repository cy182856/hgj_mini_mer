// subpages/pfee/pfeeMonBill.js
let network = require("../../utils/network")
let dateUtil = require("../../utils/dateUtil")
let api = require("../../const/api")
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPopup:true,
    showArea: false,
    areaList: [{custId: "", areaId: "all", areaName: "全部", stat: "N", orderNo: 0}],
    buildingList: [{custId: "", buildingId: "all", areaId: "", buildingName: "全部", stat: ""}],
    roomList: [{custId: "", houseSeqId: "all", houseNo: "全部", buildingId: "", areaId: ""}],
    statList: [
      {text: '全部', value: '',checked:true},
      {text: '已缴费', value: 'I',checked:false},
      {text: '未缴费', value: 'S',checked:false}, 
    ],
    selectArea: {areaName: "选择区域"},
    selectBuilding: {buildingName: '选择楼号'},
    selectRoom: {houseNo: '选择门牌号'},
    selectStat: {text: '选择状态', value: 0},

    dropMenuShow: false, //下拉菜单不显示
    isLoading:false,
    queryConid:"请选择",
    lastStateIndex:0,
    iphoneX:false,

    billMonShow: false,
    yearCols:'',
    selectYearMon:'',
    selectYearMonDesc: '请选择月份',
    currentDate: new Date().getTime(),
    minDate: new Date().getTime(),
    pfeeMonBills:[],
    areaId:'',
    buildingId:'',
    houseNo:'',

    //分页数据处理
    pageNum: 1,
    loading: false,//是否正在加载
    more: false, //是否还有数据

    type: 1, //1:入住管理，2：业主管理 

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      iphoneX : getApp().globalData.iphoneX 
    })
    
    this.onRequestArea()
    this.initYears()
  },

  initYears: function(e){
    let currYear = new Date().getFullYear();
    let dafaultYearIndex;
    let yearCols = new Array();
    for(let i=2015; i<2099; i++){
      yearCols.push(i.toString());
      if(currYear == i){
        dafaultYearIndex = yearCols.length-1;
      }
    }
    console.log(yearCols);
    console.log(dafaultYearIndex);
    this.setData({
      yearCols: yearCols,
      dafaultYearIndex: dafaultYearIndex
    });
  },
  onClose: function(e){
    this.setData({billMonShow:false});
  },
  onConfirm: function(e){
    

    this.setData({
      billMonShow:false
    });
  },

  showYearMon(e) {
    // let num = e.currentTarget.dataset['index'];
    // console.log(num);
    // this.setData({ billMonShow: true, num: num });
    this.setData({ billMonShow: true });
  },
  confirmYearMon(event) {
    let dateTmp = new Date(event.detail);
    let selectYearMon = this.convert2YearMon(dateTmp);
    let selectYearMonDesc = this.convert2YearMonDesc(dateTmp);
    this.setData({ 
      billMonShow: false, 
      selectYearMon: selectYearMon,
      selectYearMonDesc: selectYearMonDesc
    });
  },
  hiddenYearMon() {
    this.setData({ billMonShow: false });
  },


  ontapStatChange(e){
    console.log("ontapStatChange: " ,e)
    let index = e.currentTarget.dataset.bindex
    let checked = this.data.statList[index].checked
    if(checked){
      this.setData({
        [statItem]: false,
        selectStat:'',
      })
    }else{
      for(let i=0;i<this.data.statList.length;i++){
          if(i==index){
            this.data.statList[i].checked=true
          }else{
            this.data.statList[i].checked=false
          }
      }
      this.setData({
        statList: this.data.statList,
        selectStat:this.data.statList[index],
      })
    }
    //var statItem = 'statList[' + index + '].checked';
  },
  ontapShowPopup(){
    this.setData({
      showPopup: !this.data.showPopup,

    })
  },
  closedPopup(){
    this.setData({
      showPopup: false,
    
    })
  },
  onRequestArea() {
    var that = this;
    network.RequestMQ.request({
      url:api.queryHouseArea,
      method: "POST",
      data: {
      },
      success:function(a){
        console.log("onRequestAreaa",a)

        if (a.data.areaInfo == null) {
          if(a.data.buildingInfo == null) {
            console.log("既没有区域 也没有楼号 数据")
            that.setData({
              showArea: false
            })
          }
          else {//无区域 有楼号
            that.data.buildingList = that.data.buildingList.concat(a.data.buildingInfo)
            that.setData({
              buildingList:  that.data.buildingList,
              showArea: false
            })
          }
        }
        else  {//有区域
          that.data.areaList = that.data.areaList.concat(a.data.areaInfo)
          console.log("areaList",that.data.areaList)

          that.setData({
            showArea: true,
            areaList: that.data.areaList
          })
        }
      },
      fail:function(a){
        wx.showToast({
          title: a.data.ERRDESC,
          icon: 'none',
        })
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
        "areaId": that.data.selectArea.areaId,
      },
      success:function(a){
        that.data.buildingList = that.data.buildingList.concat(a.data.buildingInfo)

        that.setData({
          buildingList:   that.data.buildingList
        })
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
    var tempAreaId=that.data.selectArea.areaId 
    if (that.data.selectArea.areaId == undefined || that.data.selectArea.areaId == null||that.data.selectArea.areaId == 'all') {
      tempAreaId = "000"
    }
    network.RequestMQ.request({
      url:api.queryHouseRoom,
      method: "POST",
      data: {
        "areaId": tempAreaId,
        "buildingId": that.data.selectBuilding.buildingId
      },
      
      success:function(a){
        console.log("onRequestRoom",this.data)

        console.log("onRequestRoom",a)
        that.data.roomList=that.data.roomList.concat(a.data.houseInfo)
        that.setData({
          roomList: that.data.roomList
        })
      },
      fail:function(a){
        console.log("onRequestRoom","fail")
      },
      complete:function(a){
        console.log("onRequestRoom","complete")
      }
    })
  },

  onAreaChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("area: " + index)
    this.selectComponent('#area').toggle();
    this.setData({
      selectArea: this.data.areaList[index],
      buildingList: [{custId: "", buildingId: "all", areaId: "", buildingName: "全部", stat: ""}],
      roomList: [{custId: "", houseSeqId: "all", houseNo: "全部", buildingId: "", areaId: ""}],
      selectBuilding: {buildingName: '选择楼号'},
      selectRoom: {houseNo: '选择门牌号'},
    })
    this.onRequestBuilding()
  },

  onBuildingChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("building: " + index)
    this.selectComponent('#building').toggle();
    this.setData({
      selectBuilding: this.data.buildingList[index],
      roomList: [{custId: "", houseSeqId: "all", houseNo: "全部", buildingId: "", areaId: ""}],
      selectRoom: {houseNo: '选择门牌号'},
    })
    this.onRequestRoom();
  },

  onRoomChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("room: " + index)
    this.selectComponent('#room').toggle();
    this.setData({
      selectRoom: this.data.roomList[index]
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

  queryPfeeBillMon: function(){
    let areaId = this.data.areaId;
    let buildingId = this.data.buildingId;
    let houseSeqId = this.data.houseSeqId;
    let billMon = this.data.billMon;
    let stat = this.data.stat;
    let payChal = '';
    let condition = {areaId:areaId, buildingId: buildingId, houseSeqId: houseSeqId, 
                    billMon: billMon, stat: stat, payChal: payChal};
    network.RequestMQ.request({
      url:api.queryHouseInfo,
      method: "POST",
      data: condition,
      success:function(a){
        



        if (a.data.houseInfo != null && a.data.houseInfo != undefined) {
          that.data.houseList = that.data.houseList.concat(a.data.houseInfo)
        }
        console.log("success data",this.data)
        console.log("success",a)
        let tmore = false
        if (that.data.houseList.length < a.data.totalCount) {
          tmore = true
          console.log("< 32")
        }
        
        that.setData({
          houseList: that.data.houseList,
          more: tmore,
          loading: false,
        })
      },
      fail:function(a){
        that.setData({
          loading: false,
        })
      },
      complete:function(a){
        that.setData({
          isLoading:false
        })
      }
    })




    this.setData({
      showPopup:false
    })

  },

  convert2YearMon: function(date){
    console.log("sssssssss"+dateFormat("YYYYmm", date));
    return dateFormat("YYYYmm", date);
  },
  convert2YearMonDesc: function(date){
    return date.getFullYear()+"年"+(date.getMonth()+1)+"月";
  }
})


function dateFormat(fmt, date) {
  let ret;
  const opt = {
      "Y+": date.getFullYear().toString(),        // 年
      "m+": (date.getMonth() + 1).toString(),     // 月
      "d+": date.getDate().toString(),            // 日
      "H+": date.getHours().toString(),           // 时
      "M+": date.getMinutes().toString(),         // 分
      "S+": date.getSeconds().toString()          // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
          fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
      };
  };
  return fmt;
}