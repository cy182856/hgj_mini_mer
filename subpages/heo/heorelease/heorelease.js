// pages/help/help.js
var app = getApp(),
heo = require('../../../model/heoinfo'),
that = null;
import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowDialog:false,
    heoTypeList:[],
    heoTypeIndex:0,
    heoTitle:'',
    repairDesc:'',
    textArea:{ maxHeight: 110, minHeight: 110 },
    nOrGs:[{id:1, needOrGive:"N",name: "求助"},
      {id:2, needOrGive:"G",name: "帮助"},
      {id:3, needOrGive:"S",name: "分享"},
      {id:4, needOrGive:"P",name: "表扬"},
      {id:5, needOrGive:"E",name: "曝光"}],
    heoSeqId:'',
    uploadImgs:[],
    showUpload:!0,
    deleteImgs:[],
    imgUse:3,
    imgCnt:0,
    fileList: [],
    radio:"",
    showCheckHeoType:false,
    heoType:'',
    isTop:'N',
    nOrgIndex:0,
    needOrGive:'',
    focus:false,
    checkBtnClass:[
      {name:"need",class:"not-check-btn",text:'求助', type:'N'},
      {name:"give",class:"not-check-btn",text: '帮助', type:'G'}
    ],
    heoTypeDisable:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),this.showLoading(!1),heo.heoinfo.init(), that = this;
    heo.heoinfo.initHeoTypeList(options.theme);
    wx.getSavedFileList({
      success (res) {
          res.fileList.forEach(obj=>{
              wx.removeSavedFile({
                  filePath: obj.filePath,
                  complete (res) {
                      console.log(res)
                  }
              })
          })
      }
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
  showCheckHeoType:function(){
    if(that.data.heoTypeDisable){
      return false;
    }
    this.setData({
      showCheckHeoType:!this.data.showCheckHeoType,
      focus:false
    })
  },
  onClose:function(){
    this.setData({
      showCheckHeoType:!this.data.showCheckHeoType
    })
  },
  onCancel:function(){
    this.setData({
      showCheckHeoType:!this.data.showCheckHeoType
    })
  },
  onConfirm:function(e){
    this.setData({
      showCheckHeoType:!this.data.showCheckHeoType,
      heoTypeIndex : e.detail.index,
      heoType:e.detail.value.heoType
    })
  },
  inputHeoTitle:function(e){
    let reg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;  
    var heoTitle = e.detail;
    var that = this;
    if(heoTitle.match(reg)){
      wx.showToast({
        title: '标题不能输入表情符',
        icon:'none',
        duration:3000,
        success:function(){
          heoTitle = heoTitle.replace(reg,"");
          that.setData({
            heoTitle:heoTitle
          })
        }
      });
    }else{
      this.setData({
        heoTitle:heoTitle
      })
    }
  },
  showCheckNeedOrGive:function(){
    this.setData({
      showCheckNeedOrGive:!this.data.showCheckNeedOrGive,
      focus:false
    })
  },
  onCancelCheckNorG:function(){
    this.setData({
      showCheckNeedOrGive:!this.data.showCheckNeedOrGive
    })
  },
  onConfirmCheckNorG:function(e){
    this.setData({
      showCheckNeedOrGive:!this.data.showCheckNeedOrGive,
      nOrgIndex : e.detail.index,
      needOrGive:e.detail.value.needOrGive
    })
    if(e.detail.value.needOrGive != 'N' && e.detail.value.needOrGive != 'G'){
      for(var j in that.data.heoTypeList){
        if(that.data.heoTypeList[j].heoType == '99'){
          that.setData({
            heoTypeIndex:j,
            heoType:'99',
            heoTypeDisable:true
          })
          break;
        }
      }
    }else{
      that.setData({
        heoTypeDisable:false,
        heoTypeIndex:0,
        heoType:''
      })
    }
  },
  onCloseCheckNorG:function(){
    this.setData({
      showCheckNeedOrGive:!this.data.showCheckNeedOrGive
    })
  },
  onChangeRadio:function(e){
    this.setData({
      radio:e.detail,
      needOrGive:e.detail == '1' ? 'N':'G'
    })
  },
  checkNorG:function(e){
    var checkBtnClass = this.data.checkBtnClass;
    var checkBtn = e.target.dataset.id;
    var that = this;
    var needOrGive = '';
    for (var index in checkBtnClass) {
      if(checkBtnClass[index].name === checkBtn){
        if(checkBtnClass[index].class =="check-btn" ){
          checkBtnClass[index].class = "not-check-btn";
        }else{
          checkBtnClass[index].class = "check-btn";
          needOrGive = that.data.checkBtnClass[index].type
        }
      }else{
        checkBtnClass[index].class = "not-check-btn"
      }
    }
    this.setData({
      needOrGive:needOrGive,
      checkBtnClass:checkBtnClass
    })
  },
  bindHeoTypesChange:function(e){
    this.setData({
      heoTypeIndex:e.detail.value
    })
  },
  onChangeIsTop:function(e){
    this.setData({ 
      checked: e.detail ,
      isTop : e.detail ? 'Y' :'N'
    });
  },
  //文件上传
  afterRead(event) {
    // debugger;
    const { file } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    //图片压缩算法
    this.choseImage(file);
  },

  delete(event){
    var path = this.data.fileList[event.detail.index].url;
    console.log(path);
    wx.getSavedFileList({
      success (res) {
        if (res.fileList.length > 0){
          wx.removeSavedFile({
            filePath: path,
            complete (res) {
              console.log(res)
            }
          })
        }
      }
     })
    this.data.fileList.splice(event.detail.index,1);
    var imgCnt = this.data.imgCnt -1;
    this.setData({
      fileList:this.data.fileList,
      imgCnt:imgCnt
    })
  },
  inputHeoDesc:function(e){
    let reg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;  
    var heoDesc = e.detail;
    var that = this;
    if(heoDesc.match(reg)){
      wx.showToast({
        title: '描述不能输入表情符',
        icon:'none',
        duration:3000,
        success:function(){
          heoDesc = heoDesc.replace(reg,"");
          that.setData({
            heoDesc:heoDesc
          })
        }
      });
    }else{
      this.setData({
        heoDesc:heoDesc
      })
    }
  },   
  heoInfoRelease:function(){
    var that = this;
    if(!that.data.heoTitle){
      wx.showToast({
        title: '请输入标题',
        duration:3000,
        icon:'none'
      })
      return;
    }
    if(that.data.heoTitle.length >30){
      wx.showToast({
        title: '标题不能超过30个字',
        duration:3000,
        icon:'none'
      })
      return;
    }
    if(that.data.heoType == ""){
      wx.showToast({
        title: '请选择一个分类',
        duration:3000,
        icon:'none'
      })
      return;
    }
    if(that.data.needOrGive == ''){
      wx.showToast({
        title: '请选择互助类型',
        duration:3000,
        icon:'none'
      })
      return;
    }
    if(!that.data.heoDesc){
      wx.showToast({
        title: '请输入描述',
        duration:3000,
        icon:'none'
      })
      return;
    }
    if(that.data.heoTitle.length >150){
      wx.showToast({
        title: '描述不能超过30个字',
        duration:3000,
        icon:'none'
      })
      return;
    }
    Dialog.confirm({
      title: '提示',
      message: '确定发布吗？',
    }).then(() => {
      heo.heoinfo.releaseHeoInfo();
      })
      .catch(() => {
        console.log('点击取消')
      });
  },
  //画布压缩图片
  choseImage(file){
    var that = this;
    var temp = this.data.fileList;
    let timer = null;
    that.showLoading(!0)
    // file.forEach(element => {
    for(var numP = 0;numP < file.length;numP++){ 
      console.log('当前处理的是第'+numP+'张图片业务'); 
      var element = file[numP];      
      var path = element.path;
      var size = element.size;
      console.log('uploadFile',element);
        if(path == '' || path == undefined){
          path = element.url;
          console.log('取首先路径失败，未获取到图片信息，取次要路径',path);
            if(path == '' || path == undefined){
              path = element.thumb;
            }
        }
        try {
          //-----返回选定照片的本地文件路径列表，获取照片信息-----------
          console.log('开始获取图片信息',path);
          that.drawImage(path,numP,temp,size);          
        } catch (error) {
          console.log('图片压缩发生了异常',error);
          that.showLoading(!1)
          if(timer != null){
            clearTimeout(timer);
            timer = null;
          }
        }
      };
  },

  //图片压缩处理
  drawImage(path,curNum,temp,size){
    var cid = 'canvas'+curNum;
    var that = this;
    wx.getImageInfo({
      src: path,
      success:imgRes=>{
        console.log('成功获取到的图片信息',imgRes);
        //---------利用canvas压缩图片--------------
        var tempSize = 1048576;//1M的大小
        var ratio = 2;
        var zip = false;
        if(size != undefined && size != 0 && size > tempSize){
          console.log('图片太大，不管大小，必须进行一定的压缩');
          zip = true;
        }
        console.log('图片压缩率',ratio);
        var canvasWidth = imgRes.width //图片原始长宽
        var canvasHeight = imgRes.height
        while (zip || canvasWidth > 2016 || canvasHeight > 2016){// 保证宽高在400以内
            canvasWidth = Math.trunc(imgRes.width / ratio)
            canvasHeight = Math.trunc(imgRes.height / ratio)
            ratio++;
            zip = false;
        }
        console.log('压缩率最终值',(ratio-1));
        if(curNum == 0){
          that.setData({
            cWidth: canvasWidth,
            cHeight: canvasHeight
          })
        }else if(curNum == 1){
          that.setData({
            cWidth1: canvasWidth,
            cHeight1: canvasHeight
          })
        }else{
          that.setData({
            cWidth2: canvasWidth,
            cHeight2: canvasHeight
          })
        }
        //---------对于本身就比较小的图片，无需进行压缩处理---------------
        if(canvasWidth == imgRes.width && canvasHeight == imgRes.height){
          console.log('图片已经很小，无需进行压缩处理',path);
          var img = {};
          // debugger;
          img['url'] = path;
          temp.push(img);
          var imgCnt = that.data.imgCnt+1;
          that.setData({
            fileList:temp,
            imgCnt:imgCnt,
          })
        }else{
          path = imgRes.path;
          console.log('开始进行压缩处理',path);
          var ctx = wx.createCanvasContext(cid)
              ctx.drawImage(path, 0, 0, canvasWidth, canvasHeight)
              ctx.draw(false,setTimeout(function(){
                console.log('图片生成了，开始导出图片....');
                wx.canvasToTempFilePath({
                  canvasId: cid,
                  destWidth: canvasWidth,
                  destHeight: canvasHeight,
                  fileType:'jpg',
                  quality: 0.4,
                  success: function (res) {
                    console.log('最终的图片信息',res);
                    console.log(res.tempFilePath)//最终图片路径
                    var img = {};
                    // debugger;
                    img['url'] = res.tempFilePath;
                    temp.push(img);
                    var imgCnt = that.data.imgCnt+1;
                    that.setData({
                      fileList:temp,
                      imgCnt:imgCnt,
                    })
                    wx.hideToast({success: (res) => {},});
                    console.log('大功告成了');
                  },fail: function (res) {
                    timer = null;
                      wx.showToast({
                        title: '图片上传失败，请重试！',
                        icon:'none'
                      })
                      console.log(res.errMsg)
                  }
                })
              },1000));
        }
        //----------绘制图形并取出图片路径--------------
      
      },fail:imgRes=>{
        console.log('获取到的图片信息失败',imgRes);
        wx.showToast({
          title: '获取上传图片信息失败，请更换图片重试。',
          icon:'none',
          duration:3000
        })
      },
      complete:function(){
        that.showLoading(!1)
      }
    })
  },
  upload:(filePath,uploadUrl,data)=>{
    wx.uploadFile({
      url: uploadUrl, 
      filePath: filePath,
      name: 'file',
      header: {
        "Content-Type": "multipart/form-data",
        'accept': 'application/json'
      },
      formData: data,
      success(res) {
        // 上传完成需要更新 fileList
        console.log('图片上传成功',res);
      },
      complete:res=>{
        console.log('图片上传完成',res);
        return 1;
      }
    });
  },
  showHeoStandard:function(){
    this.setData({'isShowDialog':true});
  },
  closeInstru:function(){
    this.setData({'isShowDialog':false});
  }
})