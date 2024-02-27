// pages/common/error/error.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    errList:[{
        type:'not_bind',
        typeDesc:'账号未绑定',
        src:'../../../images/not_bind.png'
    },{
      type:"toast",
      typeDesc:"非致命消息提示",
      src:"../../../images/toast.png"
    },{
      type:"error",
      typeDesc:"致命消息提示",
      src:"../../../images/error.png"
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var msg = options.msg,
    type = options.type;
    for(var index in this.data.errList){
      if(type == this.data.errList[index].type){
        this.setData({
          src:this.data.errList[index].src
        })
      }
    }
    this.setData({
      errMsg:msg
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