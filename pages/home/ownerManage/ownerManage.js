// pages/home/ownerManage/ownerManage.js
let network = require("../../../utils/network")
let api = require("../../../const/api")

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
      {text: '全部', value: -1,checked:true},
      {text: '未认领', value: 0,checked:false}, //‘I’ – 初始，
      {text: '已认领', value: 1,checked:false}, //‘P’ – 已认领(pack)，未认证
      {text: '已入住', value: 2,checked:false}, //‘N’ – 已入住
      {text: '已关闭', value: 3,checked:false},
    ],
    followUpList: [
      {text: '全部', value: -1,checked:true},
      {text: '需要', value: 0,checked:false}, 
      {text: '不需要', value: 1,checked:false}, 
    ],    
    isTestRoomList: [
      {text: '全部', value: -1,checked:true},
      {text: '测试', value: 0,checked:false}, 
      {text: '正常', value: 1,checked:false}, 
    ],
    selTestRommCon:{text: '全部', value: -1},
    selFollowUpCon:{text: '全部', value: -1},
    selectArea: {areaName: "             选择区域"},
    selectBuilding: {buildingName: '             选择楼号'},
    selectRoom: {houseNo: '             选择室号'},
    selectStat: {text: '选择状态', value: 0},

    houseList:[],

    //分页数据处理
    pageNum: 1,
    loading: false,//是否正在加载
    more: false, //是否还有数据

    type: 1, //1:入住管理，2：业主管理 

    dropMenuShow: false, //下拉菜单不显示
    isLoading:false,
    queryConid:"请选择",
    lastStateIndex:0,
    iphoneX:false,
    needRefresh:false,
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.type = options.type
    if (this.data.type == 1) {
      wx.setNavigationBarTitle({
        title: '入住管理',
      })
    }
    else if (this.data.type == 2) {
      wx.setNavigationBarTitle({
        title: '房屋查询',
      })
    }
    this.setData({
      iphoneX : getApp().globalData.iphoneX 
    })
    
    this.onRequestArea()
    
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
    if(this.data.needRefresh){
      this.data.houseList = []
      this.onQueryHouseInfoWithLoadMore(false)
      this.data.needRefresh = false
    }
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
			console.log("onReachBottom")
      if(this.data.more){
        this.onLoadMore()
      }
         
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  ontapShowPopup(){
    console.log(".........click house.......");
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
      selectRoom: {houseNo: '选择室号'},
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
      selectRoom: {houseNo: '选择室号'},
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
  onStatChange: function(e) {
    console.log("stat index: " + e.detail)
    this.setData({
      selectStat: this.data.statList[e.detail]
    })
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
    var statItem = 'statList[' + index + '].checked';
  },
  ontapTestRoomChange(e){
    console.log("ontapStatChange: " ,e)

    let index = e.currentTarget.dataset.bindex
    let checked = this.data.isTestRoomList[index].checked
    if(checked){
      this.setData({
        [testRoomItem]: false,
        selTestRommCon:'',
      })
    }else{
      for(let i=0;i<this.data.isTestRoomList.length;i++){
          if(i==index){
            this.data.isTestRoomList[i].checked=true
          }else{
            this.data.isTestRoomList[i].checked=false
          }
      }
      this.setData({
        isTestRoomList: this.data.isTestRoomList,
        selTestRommCon:this.data.isTestRoomList[index],
      })
    } 
    let testRoomItem = 'isTestRoomList[' + index + '].checked';

  },
  ontapFollowUpChange(e){
    let index = e.currentTarget.dataset.bindex
    let checked = this.data.followUpList[index].checked
    if(checked){
      this.setData({
        [followupItem]: false,
        selFollowUpCon:'',
      })
    }else{
      for(let i=0;i<this.data.followUpList.length;i++){
          if(i==index){
            this.data.followUpList[i].checked=true
          }else{
            this.data.followUpList[i].checked=false
          }
      }
      this.setData({
        followUpList: this.data.followUpList,
        selFollowUpCon:this.data.followUpList[index],
      })
    }
    let followupItem = 'followUpList[' + index + '].checked';

  },
  onQueryHouseInfo() {
    // if (this.data.showArea && this.data.selectArea.areaName == "选择区域") {
    //   wx.showToast({
    //     title: '请选择区域',
    //     icon: 'none'
    //   })
    //   return
    // }
    this.data.pageNum = 1
    this.setData({
      showPopup:false,
      houseList: []
    })
    this.onQueryHouseInfoWithLoadMore(false)
  },
  onQueryHouseInfoWithLoadMore(loadMore) {
    if (loadMore) {
      console.log("加载更多")
    }
    else {
      console.log("重新请求")
    }

    let that = this
    let areaId = ""
    let buildingId = ""
    let houseNo = ""
    let stat = ""
    let query=""
    let isForTest = ""
    let isNeedFollow=""
    if (that.data.selectArea.areaId == undefined || that.data.selectArea.areaId == null||that.data.selectArea.areaId == 'all') {
      areaId = ""
    }
    else {
      areaId = that.data.selectArea.areaId
      query = that.data.selectArea.areaName
    }
    if (that.data.selectBuilding.buildingId == undefined || that.data.selectBuilding.buildingId == null|| that.data.selectBuilding.buildingId == 'all') {
      buildingId = ""
    }
    else {
      buildingId = that.data.selectBuilding.buildingId
      query = query+" | "+that.data.selectBuilding.buildingName
    }
    if (that.data.selectRoom.houseNo.trim() == "选择室号"||that.data.selectRoom.houseNo == "全部") {
      houseNo = ''
    }else{
      houseNo = that.data.selectRoom.houseNo
    }
    query = query+(houseNo==''?'':" | "+ houseNo)
    if(that.data.selectStat==''){
      stat=''
    }else{
      if (that.data.selectStat.text == "未认领") {
        stat = "I"
      }
      else if (that.data.selectStat.text == "已认领") {
        stat = "P"
      }
      else if (that.data.selectStat.text == "已入住") {
        stat = "N"
      }
      else if (that.data.selectStat.text == "已关闭") {
        stat = "C"
      }
      query = query+ (that.data.selectStat.text=='选择状态'?'':" | "+that.data.selectStat.text)
      
    }
    if(that.data.selFollowUpCon==''){
      isNeedFollow=''
    }else{
      if (that.data.selFollowUpCon.value == 0) {
        isNeedFollow="Y"
      }
      else if (that.data.selFollowUpCon.value == 1) {
        isNeedFollow='N'
      }
      query = query+ (that.data.selFollowUpCon.text=='全部'?'':" | "+that.data.selFollowUpCon.text+"跟进")
    }

    if(that.data.selTestRommCon==''){
      isForTest=''
    }else{
      if (that.data.selTestRommCon.value == 0) {
        isForTest="Y"
      }
      else if (that.data.selTestRommCon.value == 1) {
        isForTest='N'
      }
      query = query+ (that.data.selTestRommCon.text=='全部'?'':" | "+that.data.selTestRommCon.text+"房屋")
    }
    if(query.charAt(0)==' '&&query.charAt(1)=='|'){
      query = query.substring(2)
    }
    that.setData({
      isLoading:true,
      queryConid:query ==''?"全部":query
    })
    network.RequestMQ.request({
      url:api.queryHouseInfo,
      method: "POST",
      data: {
        "pageNum": that.data.pageNum,
        "pageSize": 20,
        "areaId": areaId,
        "buildingId": buildingId,
        "houseNo": houseNo,
        "stat": stat,
        "isForTest":isForTest,
        "isNeedFollow":isNeedFollow
      },
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
  },

  onLoadMore() {
    this.data.pageNum = this.data.pageNum + 1
    this.setData({
      loading: true,
    })
    this.onQueryHouseInfoWithLoadMore(true)
  },

  onClickHouse: function(e){
    var that = this
    let index = e.currentTarget.dataset.index;
    // console.log(index)
    // console.log(this.data.houseList[index])
    let houseInfo = this.data.houseList[index]
    if (houseInfo.stat == "I") {
      //未认领
      if(this.data.type == 1) {
        wx.navigateTo({
          url: '../ownerManage/houseInfo',
          success: function(res) {
            // 通过eventChannel向被打开页面传送数据
            res.eventChannel.emit('acceptHouseInfo', { data: houseInfo })
          },
          events: {
            RefreshEvent: function(data) {
            console.log(data)
            if(data.data=='M'){
              that.data.needRefresh = true
            }
          }}
        })
      }
      else if(this.data.type == 2) {
        wx.showToast({
          title: '房屋还未认领',
          icon: 'none',
        })
      }
    }
    // else if (houseInfo.stat == "P") {
    //   //已认领 待审核   暂不处理
    // }
    else if (houseInfo.stat == "N"||houseInfo.stat == "P") {
      //已入住
      console.log(houseInfo)
      console.log("已入住")
      wx.navigateTo({
        url: '../family/memberList?type=' + this.data.type,
        success: function(res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('acceptHouseInfo', { data: houseInfo })
        },
        events: {
          RefreshEvent: function(data) {
          console.log(data)
          if(data.data=='M'){
            that.data.needRefresh = true
          }
        }}
      })
    }
  },

  onDropMenuOpen() {
    // console.log("onDropMenuOpen")
    this.setData({
      dropMenuShow: true
    })
  },
  onDropMenuClose() {
    // console.log("onDropMenuClose")
    this.setData({
      dropMenuShow: false
    })
  },

  onCancelAccountThanRefreshList() {
    this.onQueryHouseInfo()
  }

  
})