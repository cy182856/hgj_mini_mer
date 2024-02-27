// pages/family/memberDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    authBitmap: '',
    notifyBitmap: '',
    authName: ["预约", "缴费", "邻里圈", "问卷调查", "水电煤抄表", "店铺收款", "访客管理", "天气订阅","打招呼","建议和投诉","生活服务" ,"车辆缴费", "文件公示","业主码","报事报修","支持自定义菜单","便民信息"],
    authList: [],
    notifyAuth: [{
      name: "日常通知",
      hasAuth: 1,
      loading:false
    }, {
      name: "问卷通知",
      hasAuth: 0,
      loading:false
    }],
    memberInfo: '',
    showBuildingRoom:'',
    PROPTYPE:"R",
    type: 1, //1:入住管理，2：业主管理
    shortName:''
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
    var that = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('MemberDetailEvent', function (data) {
      console.log(data.data)
      that.setData({
        shortName:getApp().globalData.userInfo.SHORTNAME,
        memberInfo: data.data,
        authBitmap: data.data.authBitmap,
        notifyBitmap: data.data.notifyBitmap,
        mNickName: data.data.nickName,
        showBuildingRoom:options.houseInfoDesc,
        PROPTYPE:getApp().globalData.userInfo.PROPTYPE
      })
    })
  },

  setUsrAuth() {
    let len = this.data.authName.length
   let moduleBitmap  = getApp().globalData.userInfo.MODULEBITMAP;
    let tempAuth = Array()
  
    for (let x = 0; x < len; x++) {
      if (x >= moduleBitmap.length || x >= this.data.authBitmap.length) {
        break
      }
      let m_A = moduleBitmap.charAt(x)
      let u_A = this.data.authBitmap.charAt(x)
      let a_name = this.data.authName[x]
      // if(x==8||x==7){
      //   m_A ='0'
      // }

     if (m_A == '1'||m_A == '2') {
        tempAuth.push({
          name: a_name,
          hasAuth: parseInt(u_A)
        })
      }
      // if (m_A == '2') {
      //   tempAuth.push({
      //     name: a_name,
      //     hasAuth: 1
      //   })
      // }
    }
    let len2 = this.data.notifyAuth.length
    for (let x = 0; x < len2; x++) {
      if (x > this.data.notifyBitmap.length) {
        break
      }
      let n_A = this.data.notifyBitmap.charAt(x)
      this.data.notifyAuth[x].hasAuth = parseInt(n_A)
    }
    this.setData({
      authList: tempAuth,
      notifyAuth: this.data.notifyAuth
    })
  },
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setUsrAuth()
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
    console.log("onHide")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onUnload")
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