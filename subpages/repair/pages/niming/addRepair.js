const date = require('../../../../utils/dateUtil.js');
const api = require('../../../../const/api.js');
const app = getApp();
const custId = app.storage.getCustId(),
      huSeqId = app.storage.getHuSeqId(),
      applyFile = 'repair/apply/'+custId+'/'+huSeqId;
import Toast from '../../../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    date:'',
    time:'',
    imgUse:3,
    imgCnt:0,
    fileList: [],
    repairDesc:'',
    textArea:{ maxHeight: 110, minHeight: 110 },
    expArvTime:'',
    repairWorkTime:'',//工作时间
    tel:''//紧急电话

    ,showTip:'' //申请成功的dialog
    ,tipDesc:'报修申请成功' //申请成功提示语言
    ,repairDate:''
    ,repairSeqId:''
    ,obj:null

    ,custId:''
    ,wxOpenId:''
    ,objId:''

    ,sizeType:['compressed']//缩略图
    ,cWidth: 0 //画布的宽度，图片压缩后大小
    ,cHeight : 0 //画布的高度，图片压缩后大小

    ,bdObj:null //标地信息

    ,quickDesc: []
    ,showQuickDesc:false
  },
//详情
topage(repairDate,repairSeqId){
  let param = '&custId='+this.data.custId+'&wxOpenId='+this.data.wxOpenId;
    wx.redirectTo({
      url: './repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId+param,
    })
  },
// 报修记录跳转
// toListPage(){
//   wx.redirectTo({
//     url: '../repairQuery/repairQuery',
//   })
// },
//文本域
repairDesc(event){
  // console.log('描述',event.detail);
  let desc = event.detail;
  let reg = /[^\u0020-\u007E\u00A0-\u00BE\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u0080-\u009F\u2000-\u201f\u2026\u2022\u20ac\r\n]/g;
    if(desc.match(reg)) {
      this.setData({repairDesc:this.data.repairDesc});
      return;
    }else{
      this.setData({
        repairDesc:event.detail,
      })
    }
  
},



  //画布压缩图片
  choseImage(file){
    var that = this;
    var temp = this.data.fileList;
    let timer = null;

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
          if(timer != null){
            clearTimeout(timer);
            timer = null;
          }
        }
      };
  },

  //图片压缩处理
  drawImage(path,curNum,temp,size){
    wx.showToast({
      title: '处理中...',
      icon:'loading'
    })
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
          wx.hideLoading();
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
      }
    })
  },

  //文件上传开始
  afterRead(event) {
    const { file } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    console.log('开始处理文件保存到缓存的业务',file);
    //图片压缩算法
    this.choseImage(file);
    
  },

  delete(event){
    console.log('删除图片操作',event.detail);
    var path = this.data.fileList[event.detail.index].url;
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
  overSize(event){
    app.alert.alert('文件太大，请重新上传');
  },

  upload(filePath,uploadUrl,data){
    console.log('文件开始上传',filePath,uploadUrl,data);
    wx.uploadFile({
      url: uploadUrl, // 仅为示例，非真实的接口地址
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
  
//文件上传结束

// 提交
submitInfo(){
  this.showLoading(1);
  var datas = this.data;
  var d = {};
  d['repairDesc'] = datas.repairDesc;
  d['imgCnt']=datas.imgCnt;
  d['custId'] = datas.custId;
  d['wxOpenId'] = datas.wxOpenId;

  if(datas.objId != undefined && datas.objId != "undefined"){
    d['repairObjId'] = datas.objId;
  }
  
  if(datas.custId == '' || datas.wxOpenId == ''){
    this.showLoading(0);
    Toast.alert({message:'关键信息缺失，无法提交'});
    return;
  }
  if(!datas.repairDesc || datas.repairDesc == ''){
    this.showLoading(0);
    app.alert.alert('请简要描述您的问题，以便我们为您提供更好的服务！');
    return;
  }
  var imgCnt = datas.imgCnt;
  // if(datas.imgCnt < 1){
  //   this.showLoading(0);
  //   app.alert.alert('请至少上传一张报修图片');
  //   return;
  // }
  var that = this;
  app.req.postRequest(api.anonymousRepair,d).then(value => {
      console.log('匿名报修申请的响应结果',value.data);
      that.showLoading(0);
      var custId = this.data.custId;
      if(value.data.respCode == '000'){
        //消息推送
        // app.req.postRequest(api.sendMsg,{msgBusiType:'REPAIR_NEW_JOB'});
        var repairDate = value.data.repairDate;
        var repairSeqId = value.data.repairSeqId;
        var fileList = that.data.fileList;
        var result = 0;
        var le = fileList.length;
        if(imgCnt > 0){
          console.log('申请成功，维护上传的临时图片,共计：',fileList.length);
          for(var i =0;i< le;i++){
            // that.upload(fileList[i].url,api.uploadImages,
            //   {customize:'repair',packName:'repair/'+custId+'/'+repairDate+repairSeqId,fileName:i+'.png'});
            //   console.log('当前处理完成的是：',i);

            result = result + that.upload(fileList[i].url,api.uploadImages,
            {imgId:i,fileType:'LOG',busiId:'01',busiDate:repairDate,busiSeqId:repairSeqId,custId:custId});
            console.log('当前处理完成的是：',i);
          }
        }
        Toast.alert({
          message:'报修申请成功',
        }).then(()=>{
          if(result == le){
            that.topage(repairDate,repairSeqId);
          }else{
            that.showLoading(1);
            setTimeout(function(){
              that.showLoading(0);
              that.topage(repairDate,repairSeqId);
            },100);
          }
          
        })
      }else{

      }
  });
},


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),this.showLoading(1);

    let custId = options['custId'];
    let wxOpenId = options['wxOpenId'];
    let objId = options['objId'];
    if(custId == undefined || wxOpenId == undefined){
      this.showLoading(0);
      Toast.alert({message:'关键信息缺失，请退出重试'});
      return;
    }
    if(objId == undefined){
      objId = '';
    }

    //动态显示电话和工作时间
    var datas = app.storage.getLoginInfo();
    var myDate = new Date();
    let hour = myDate.getHours();
    let minit = myDate.getMinutes();

    var time = datas.repairWorkTime;
    let tel = datas.urgentTel;
    if(time && time != ''){
      let h1 = time.substring(0,2);
      let m1 = time.substring(2,4);
      let h2 = time.substring(4,6);
      let m2 = time.substring(6,8);
      time = h1 +':'+ m1 +'~'+ h2 +':'+ m2;
      if((hour > h1 && hour < h2)||(hour == h1 && minit >= m1) || (hour == h2 && minit <= m2)){
        tel = datas.wkTimeTel;
      }
    }
    this.setData({
      repairWorkTime:time,
      tel:tel,
      custId:custId,
      wxOpenId:wxOpenId,
      objId:objId
    });

    //获取标地信息
    this.getBiaoDiInfo(options);
    //获取快捷描述语
    this.getDescList();

    this.showLoading(0);
  },


    //标地信息
    getBiaoDiInfo(options){
      console.log('获取标地信息');
      var custId = options['custId'];
      var objId = options['objId'];
      console.log('获取标地信息',this.data);
      if(objId && objId != ''){
        app.req.postRequest(api.queryPropObj,{custId:custId,objId:objId}).then(res=>{
          console.log('获取标地信息返回结果',res);
          let data = res.data;
          if(data.respCode == '000'){
            let propObj = data.data;
            this.setData({
              bdObj:propObj
            });
          }else{
            console.log('查询标地失败',res);
            Toast.alert({message:data.errDesc}).then(()=>{
              wx.redirectTo({
                //url: '../../../../pages/noauth/noauth?errDesc='+data.errDesc,
              })
            })
          }
        })
      }
    },

  //标地关闭
  closeBiaoDi(){
    this.setData({
      bdObj:null,
      objId:'',
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

    //选择快捷回复
    choseDesc:function (){
      console.log('选择快捷回复');
      this.closeQuick();
    },
  
    closeQuick: function () {
      this.setData({
        showQuickDesc:!this.data.showQuickDesc,
      })
    },
  
    sureQuick: function (event) {
      console.log('确认选中新值', event.detail);
      var repairDesc = this.data.repairDesc;
      let valueObj = event.detail.value;
      repairDesc = valueObj.text;
      // if(!repairDesc || repairDesc == ''){
        
      // }else{
      //   repairDesc += valueObj.text;
      // }
      this.closeQuick();
      if(repairDesc.length > 140){
        Toast.alert({
          message:'内容超长，请输入合适内容',
        });
      }else{
        this.setData({
          repairDesc: repairDesc,
          repairCommonId:valueObj.repairCommonId
        });
      }
    },
      //获取常用报修描述语
  getDescList(){
    app.req.postRequest(api.repairCommonList,{}).then(res=>{
      let data = res.data;
      if(data.respCode == '000'){
        console.log('data===>',data);
        let dataList = data.data;
        dataList.forEach(function(item) {
          // console.log(item);
          item['text'] = item.repairDesc;
      })
      console.log('dataList===>',dataList);
        this.setData({
          quickDesc:dataList
        })
      }
    })
  },
  
  
  
})