import Toast from '../../../../miniprogram_npm/@vant/weapp/dialog/dialog';
const app = getApp(),
api = require("../../../../const/api"),
userInfo = require("../../../../model/userInfo"),
storage = require("../../../../const/storage"),
netWork = require("../../../../utils/network"),
respCode = require("../../../../const/respCode");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    obj:null,//详情数据对象
    hasRepairMan:false,//控制是否显示选中维修员的判断
    comObj:null,//公共对象数据
    aotosize:{ maxHeight: 60, minHeight: 30 },//留言
    payType:'N',//支付方式
    ordAmt:'',//金额
    capture:['camera'], //上传图片
    op:true,//默认是确认维修完成

    imgfinishList:[],
    imgfinishCnt:2
    ,curImgCnt:0 //当前上传的图片

    ,sizeType:['compressed']//缩略图
    ,cWidth: 0 //画布的宽度，图片压缩后大小
    ,cHeight : 0 //画布的高度，图片压缩后大小
  },

// 更改支付方式
  changePayType(event){
    this.setData({
      payType:event.detail,
    })
  },
  // 完成维修
  finishRepair(event){
    this.showLoading(1);
    var that = this;
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var ordAmt = this.data.ordAmt;
    if(ordAmt && ordAmt != '' && ordAmt !=undefined){
      let v = parseInt(ordAmt);
      if(v >10000){
        this.showLoading(0);
        Toast.alert({message:'金额不能大于10000元'});
        return;
      }
    }
    if(this.data.curImgCnt <= 0){
      this.showLoading(0);
      Toast.alert({message:'请上传最少一张完成图片'});
      return;
    }
    var payType = this.data.payType;
    var imgfinishList = this.data.imgfinishList;
    if(payType == 'N'){
      ordAmt =  '0';
    }else{
      if(!ordAmt || ordAmt == '' || ordAmt == 0){
        this.showLoading(0);
        Toast.alert({
          message: '请输入大于0的金额',
        });
        return;
      }
    }

    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var poSeqId = wx.getStorageSync(storage.STORAGE.USER_INFO).POSEQID;
    var imgCnt = imgfinishList.length;
    netWork.RequestMQ.request({
      url:api.finishRepair,
      method:'POST',
      data:{repairDate:repairDate,
        repairSeqId:repairSeqId,
        custId:custId,
        poSeqId:poSeqId,
        ordAmt:ordAmt,
        payType:payType,
        imgCnt:imgCnt,
      },
      success:res=>{
        that.showLoading(0);
        if(res.data.RESPCODE == '000'){
          var dtlId = res.data.finishRepairResult.dtlId;
          console.log('repair success',res.data);
          for(var i =0;i<imgfinishList.length;i++){
            that.upload(imgfinishList[i].url,api.imgUpload,
              {imgId:dtlId+'0'+i,fileType:'LOG',busiId:'01',busiDate:repairDate,busiSeqId:repairSeqId,custId:custId});
            // that.upload(imgfinishList[i].url,api.imgUpload,
            // {customize:'repair',packName:'repair/'+custId+'/'+repairDate+repairSeqId+dtlId,fileName:i+'.png'});
          }
          Toast.alert({message:'业务处理成功'}).then(()=>{
            wx.redirectTo({
              url: '../repairDetail/repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
            })
          })
        }
      }
      ,fail:res=>{
        this.showLoading(1);
        Toast.alert({message:res.data.ERRDESC});
      }
      ,complete:res=>{
        console.log('确认维修完成结果：',res);
        that.showLoading(0);
      }
    })
  },
// 修改确定
  sureUpd(){
    var that = this;
    Toast.confirm({message:'您确定修改支付方式吗？'}).then(()=>{
      that.sure();
    });
  },

  sure(event){
    this.showLoading(0);
    var that = this;
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var payType = this.data.payType;
    var ordAmt = this.data.ordAmt;
    if(ordAmt && ordAmt != '' && ordAmt !=undefined){
      let v = parseInt(ordAmt);
      if(v >10000){
        Toast.alert({message:'金额不能大于10000元'});
        return;
      }
    }
    
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var poSeqId = wx.getStorageSync(storage.STORAGE.USER_INFO).POSEQID;
    // debugger;
    if(payType == 'N'){
      ordAmt = '0';
    }else{
      if(ordAmt <= 0){
        Toast.alert({message:'请输入收费金额！'});
        this.showLoading(0);
        return;
      }
    }

    netWork.RequestMQ.request({
      url:api.updOrdAmt,
      method:'POST',
      data:{
          repairDate:repairDate,
          repairSeqId:repairSeqId,
          custId:custId,
          payType:payType,
          ordAmt:ordAmt,
          poSeqId:poSeqId,
        },
      success:res=>{
        that.showLoading(0);
        if(res.data.RESPCODE == '000'){
          // //如果存在上传文件，上传处理
          // that.upload(imgfinishList[i].url,api.imgUpload,
          //   {customize:'repair',packName:'repair/'+custId+'/'+repairDate+repairSeqId+dtlId,fileName:i+'.png'});

          Toast.alert({message:'修改成功'}).then(()=>{
            wx.redirectTo({
              url: '../repairDetail/repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
            })
          })

        }
      },
      fail:res=>{
        var desc ;
        try {
          desc = res.data.ERRDESC
          if(desc == '' || !desc || desc == null){
            desc = '网络异常，修改失败';
          }
        } catch (error) {
          desc = '网络异常，修改失败';
        }
        
        Toast.alert({message:desc});
      },
      complete:res=>{
        console.log('修改金额结果',res);
        that.showLoading(0);
      }
      
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(),this.showLoading(1);
    var repairDate = options['repairDate'];
    var repairSeqId = options['repairSeqId'];
    var op = options['op'];
    if(op == 'ordAmt'){
      this.setData({op:false})
      wx.setNavigationBarTitle({
        title: '修改报修金额',
      })
    }else{
        wx.setNavigationBarTitle({
          title: '确认维修完成',
        })
    }
    var payType = options['payType'];
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var that = this;
    netWork.RequestMQ.request({
      url:api.queryRepair,
      method:'POST',
      data:{repairDate:repairDate,repairSeqId:repairSeqId,custId:custId},
      success:res=>{
        var datas = res.data;
        var obj = datas.queryRepairLogResult.repairDtos[0];
        var ordAmt = obj.ordAmt;
        if(ordAmt == '0' || ordAmt == 0){
          ordAmt = '';
        }
        if(!payType){
          payType = obj.payType;
        }
        
        if(!payType){
          payType = 'N';
        }
        
        that.setData({
          obj:obj,
          comObj:datas.queryRepairLogResult,
          ordAmt:ordAmt,
          payType:payType,
        })
      }
      ,fail:res=>{
        Toast.alert({message:res.data.ERRDESC});
      }
      ,complete:res=>{
        console.log('修改支付金额方式页面结果:',res);
        that.showLoading(0);
      }
      
      
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.getSavedFileList({
      success (res) {
        if (res.fileList.length > 0){
          wx.removeSavedFile({
            filePath: res.fileList[0].filePath,
            complete (res) {
              console.log('清理临时文件',res);
            }
          })
        }
      }
     })
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

  // 输入金额
  ordAmtValue(event){
    console.log('当前金额',event.detail);
    let ordAmt = event.detail.value;
    if(ordAmt && ordAmt != ''){
      var value=Math.round(parseFloat(ordAmt)*100)/100;
      var xsd=value.toString().split(".");
      if(xsd.length==1){
        value=value.toString()+".00";
        this.setData({
          ordAmt:value
        })
        return;
      }
      if(xsd.length>1){
        if(xsd[1].length<2){
          value=value.toString()+"0";
        }
        this.setData({
          ordAmt:value
        })
        return;
      }
    }

    
  },
  //画布压缩图片
  choseImage(file){
    var that = this;
    var temp = this.data.imgfinishList;
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

          // wx.compressImage({
          //   src: '', // 图片路径
          //   quality: 60 ,// 压缩质量
          //   success: res => {
          //     console.log('压缩一次后的结果',res);
          //     path = res.tempFilePath
          //   }
          // })
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
        var zip = false;
        if(size != undefined && size != 0 && size > tempSize){
          console.log('图片太大，不管大小，必须进行一定的压缩');
          zip = true;
        }
        var ratio = 2;
        var canvasWidth = imgRes.width //图片原始长宽
        var canvasHeight = imgRes.height
        while (zip || canvasWidth > 2016 || canvasHeight > 2016){// 保证宽高在400以内
            canvasWidth = Math.trunc(imgRes.width / ratio)
            canvasHeight = Math.trunc(imgRes.height / ratio)
            ratio++;
            zip = false;
        }
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

          var curImgCnt = that.data.curImgCnt+1;
          that.setData({
            imgfinishList:temp,
            curImgCnt:curImgCnt,
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
                    var curImgCnt = that.data.curImgCnt+1;

                    that.setData({
                      imgfinishList:temp,
                      curImgCnt:curImgCnt
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
  // var temp = this.data.fileList;
  var that = this;

   

    //图片压缩算法
    that.choseImage(file);

 
},

    // 临时文件删除
    delete(event){
      console.log('delete image file:',event.detail.index);
      var path = this.data.imgfinishList[event.detail.index].url;
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
      this.data.imgfinishList.splice(event.detail.index,1);
      var imgCnt = this.data.curImgCnt -1;
      this.setData({
        imgfinishList:this.data.imgfinishList,
        curImgCnt:imgCnt
      })
    },
    // 文件过大的提示
    overSize(event){
      wx.showToast({
        title: '文件太大，请重新上传',
      })
    },
    // 文件上传的具体业务
    upload(filePath,uploadUrl,data){
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
          console.log('file upload success:',res);
        },
        fail:res=>{
          console.log('文件上传失败',res)
        }
        ,complete:res=>{
          console.log(filePath,uploadUrl,data);
        }
      });
    },

    // // 确认到场
    // turnUp(){
    // this.showLoading(1);
    // var that = this;
    // var repairDate = this.data.obj.repairDate;
    // var repairSeqId = this.data.obj.repairSeqId;
    // var reairType = this.data.obj.repairType;
    // var imgCnt = this.data.curImgCnt;
    // var fileList = this.data.imgList;
    // var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    // var poSeqId =  this.data.obj.poSeqId;
    // if(!this.checkSameMan()){
    //   this.showLoading(0);
    //   Toast.alert({message:'您非维修员本人，不能进行确认到场操作！'});
    //   return;
    // }

    // if(reairType == 'S' && imgCnt <= 0){
    //   this.showLoading(0);
    //   Toast.alert({message:'请至少上传一张到场图片'});
    //   return;
    // }
    // netWork.RequestMQ.request({
    //   url:api.repairManReach,
    //   method:'POST',
    //   data:{
    //     repairDate:repairDate,
    //     repairSeqId:repairSeqId,
    //     custId:custId,
    //     poSeqId:poSeqId,
    //     imgCnt:imgCnt,
    //   },
    //   success:res=>{
    //     var data = res.data;
    //     that.showLoading(0);
    //     if(data.RESPCODE == '000'){
    //       for(var i =0;i<fileList.length;i++){
    //         var dtlId = data.repairReachResult.dtlId;
    //         that.upload(fileList[i].url,api.imgUpload,
    //           {customize:'repair',packName:'repair/'+custId+'/'+repairDate+repairSeqId+dtlId,fileName:i+'.png'});
    //       }
    //       Toast.alert({message:'确认到场成功'}).then(()=>{
    //         wx.redirectTo({
    //           url: '../updAmt/updAmt?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
    //         });
    //       }); 
    //     }
    //   }
    //   ,fail:res=>{
    //     Toast.alert({message:res.data.ERRDESC});
    //   }
    //   ,complete:res=>{
    //     that.showLoading(0);
    //   }
    // });
    // },
    //文件上传结束
})