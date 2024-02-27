// subpages/acmanager/acDevList.js
let network = require("../../utils/network")
let api = require("../../const/api")
let storage = require("../../const/storage")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPopup:true,
    showArea:true,
    areaList: [{custId: "", areaId: "all", areaName: "全部", stat: "N", orderNo: 0}],
    buildingList: [{custId: "", buildingId: "all", areaId: "", buildingName: "全部", stat: ""}],
    upList: [
      {text: '全部', value: -1,checked:true},
      {text: '需要', value: 0,checked:false}, 
      {text: '不需要', value: 1,checked:false}, 
    ], 
    radio:0,
    selectArea: {areaName: "选择区域"},
    selectBuilding: {buildingName: '选择楼号'},
    selectUpStat:{text: '全部', value: -1,checked:true},
    devList:[],
    queryConid:'请选择',
    //分页数据处理
    pageNum: 1,
    loading: false,//是否正在加载
    more: false, //是否还有数据
    GLOBALDEVVER:''
  },
  ontapShowPopup(){
    this.setData({showPopup:!this.data.showPopup})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this. onRequestArea()
    //非敏感信息查询
    this.str2Hex("01XIMO     ");
    //to ascll   303158494d4f2020202020
   //发送的数据  包头 0506  长度 0011 30303131 数据 303158494d4f2020202020
    var sendData ="050630303131303158494d4f2020202020"
  },
str2Hex(str){
    let hexStr=""
  
    for(var i=0;i<str.length;i++){
      if(hexStr==""){
        hexStr = str.charCodeAt(i).toString(16)
      }else{
        hexStr += str.charCodeAt(i).toString(16)
      }
    }
    console.log("str2Hex",hexStr)
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

  onQueryAcDevList(){
    this.setData({
      devList: []
    })
    this.queryAcDevList()
  },

  queryAcDevList( ) {
    var that = this;
    // console.log(that.data.selectBuilding.BuildingInfo)
    var tempAreaId=that.data.selectArea.areaId 
    if (that.data.selectArea.areaId == undefined || that.data.selectArea.areaId == null||that.data.selectArea.areaId == 'all') {
      tempAreaId = ""
    }
    let buildingId = ""
    if (that.data.selectBuilding.buildingId == undefined || that.data.selectBuilding.buildingId == null|| that.data.selectBuilding.buildingId == 'all') {
      buildingId = ""
    }
    else {
      buildingId = that.data.selectBuilding.buildingId}

    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
  
    let NEEDSYNC = ""
   
    if (that.data.selectUpStat == ""|| that.data.selectUpStat.value==-1 ) {
      NEEDSYNC = ""
    }else{
       NEEDSYNC = that.data.selectUpStat.value==0?'Y':'N'
    }
    //CUSTID、STAT、PAGESIZE、PAGENUM
    network.RequestMQ.request({
      url:api.queryAcDevList,
      method: "POST",
      data: {
        "CUSTID": custId,
        "STAT": "",
        "PAGESIZE": 20,
        "PAGENUM": that.data.pageNum,
        "NEEDSYNC":NEEDSYNC,
        "BUILDINGID":buildingId,
        "AREAID":tempAreaId
      },
      
      success:function(a){
        console.log("queryAcDevList param ",this.data)

        console.log("queryAcDevList",a)
        var respList = a.data.ACDEVLISTDTO
     
        if(respList!=null&&respList.length>0){
          that.data.devList=that.data.devList.concat(respList)
          var tempMore = a.data.COUNT>that.data.devList.length
          that.setData({
            devList: that.data.devList,
            GLOBALDEVVER:a.data.GLOBALDEVVER,
            more:tempMore,
            loading:false
          })
        }
     
      },
      fail:function(a){
        console.log("queryAcDevList","fail")
      },
      complete:function(a){
        console.log("queryAcDevList","complete")
        that.setData({
          showPopup: false
          
        })
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
      queryConid:this.data.areaList[index].areaName,
      selectBuilding: {buildingName: '选择楼号'},
     
    })
    this.onRequestBuilding()
  },

  onBuildingChange: function(e) {
    let index = e.currentTarget.dataset.index;
    console.log("building: " + index)
    this.selectComponent('#building').toggle();
    var codition=this.data.queryConid
    if(codition!=""){
      codition = codition+","+this.data.buildingList[index].buildingName
    }else{
      codition =this.data.buildingList[index].buildingName
    }
    this.setData({
      selectBuilding: this.data.buildingList[index],
      queryConid:codition,
     
    })
    
  },

  onRadioChange(e){
    console.log("onRadioChange: " ,e)
    this.setData({
      radio:e.detail,
      selectUpStat:this.data.upList[e.detail],
    })
  },
  onTapClear(e){
    this.setData({ radio:0,
      selectArea: {areaName: "选择区域"},
      selectBuilding: {buildingName: '选择楼号'},
      selectUpStat:{text: '全部', value: -1,checked:true},
      queryConid:'请选择',})
  },
  ontapStatChange(e){
    console.log("ontapStatChange: " ,e)
    let index = e.currentTarget.dataset.bindex
    let checked = this.data.upList[index].checked
    if(checked){
      this.setData({
        [statItem]: false,
        selectUpStat:'',
      })
    }else{
      for(let i=0;i<this.data.upList.length;i++){
          if(i==index){
            this.data.upList[i].checked=true
          }else{
            this.data.upList[i].checked=false
          }
      }
      this.setData({
        upList: this.data.upList,
        selectUpStat:this.data.upList[index],
      })
    }
    var statItem = 'upList[' + index + '].checked';
  },
  onLoadMore() {
    this.data.pageNum = this.data.pageNum + 1
    this.setData({
      loading: true,
    })
    this.queryAcDevList()
  },

  onClickDev(e){
    let index = e.currentTarget.dataset.index
    console.log("onClickDev: " ,index)
    var clickDev = this.data.devList[index]
    wx.navigateTo({
      url: './acDevice?SELDEV='+JSON.stringify(clickDev)+"&GLOBALDEVVER="+this.data.GLOBALDEVVER,
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

  }
})