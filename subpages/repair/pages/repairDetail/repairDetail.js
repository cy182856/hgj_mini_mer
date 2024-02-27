import Toast from '../../../../miniprogram_npm/@vant/weapp/dialog/dialog';
const network = require("../../../../utils/network");
const app = getApp(),
api = require("../../../../const/api"),
userInfo = require("../../../../model/userInfo"),
storage = require("../../../../const/storage"),
netWork = require("../../../../utils/network"),
date = require("../../../../utils/dateUtil"),
respCode = require("../../../../const/respCode");
let disabled=false;
const time = [
  '00:00-00:30','00:30-01:00',
  '01:00-01:30','01:30-02:00',
  '02:00-02:30','02:30-03:00',
  '03:00-03:30','03:30-04:00',
  '04:00-04:30','04:30-05:00',
  '05:00-05:30','05:30-06:00',
  '06:00-06:30','06:30-07:00',
  '07:00-07:30','07:30-08:00',
  '08:00-08:30','08:30-08:00',
  '08:00-08:30','08:30-09:00',
  '09:00-09:30','09:30-10:00',
  '10:00-10:30','10:30-11:00',
  '11:00-11:30','11:30-12:00',
  '12:00-12:30','12:30-13:00',
  '13:00-13:30','13:30-14:00',
  '14:00-14:30','14:30-15:00',
  '15:00-15:30','15:30-16:00',
  '16:00-16:30','16:30-17:00',
  '17:00-17:30','17:30-18:00',
  '18:00-18:30','18:30-19:00',
  '19:00-19:30','19:30-20:00',
  '20:00-20:30','20:30-21:00',
  '21:00-21:30','21:30-22:00',
  '22:00-22:30','22:30-23:00',
  '23:00-23:30','23:30-00:00'
];
let citys = null;
let that = null;
let firstOneDefault = '';//公共的默认值
let firstTwoDefault = '';//业主的默认值
let errorImg="errorImg";
let errorUrl= "/assets/icons/empty/loadingError.png";
let loadingUrl="/assets/icons/empty/loading.gif";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList:[],//详情中的文件图片回显数组
    maxCount:2,//最大展示回显的图片数
    rateScore:0,//评分
    msgList:[],//留言集合
    obj:null,//详情数据对象
    hasRepairMan:false,//控制是否显示选中维修员的判断
    choseObj:null,//新选中的维修员对象
    oldPoSeqId:'',//未改之前老的维修员序列号
    comObj:null,//公共对象数据
    autosize:{ maxHeight: 60, minHeight: 30 },//留言
    huScore:'1',//勋章奖励分
    payType:'',//支付方式
    msgBody:'感谢您的反馈！',//奖励留言
    imgList:[],//到场图片
    upImgCnt:3,//到场图片上传最大张数
    curImgCnt:0,//当前上传的图片张数
    msgImgList:[],//留言中到场的图片
    msgDtlId:'',//到场的留言ID
    msgfinishImgList:[],//留言中维修完成的图片
    msgFinishDtlId:'',//维修完成的留言ID
    msgfinishImgCnt:0,//维修完成的图片张数
    msgImgCnt:2,


    show: false,  //留言中的时间修改
    columns: [],
    date:'',
    time:'',
    expArvTime:'',
    activeNames:'1',
    dtlId:'',//留言待回复的ID

    capture:['camera'], //上传图片

    isJieDan:false,//从接单进来
    isPaiDan:false,//从派单进来
    isChaXun:false,//报修查询
    isMyRepair:true//默认是从我的查询进来的

    ,sizeType:['compressed']//缩略图
    ,cWidth: 0 //画布的宽度，图片压缩后大小
    ,cHeight : 0 //画布的高度，图片压缩后大小

    ,showItemType:false
    ,queryItemType:true
    ,itemTypeList:[]
    ,updItem:true


    ,areaList:null    //
    ,defaultValue:'100101'

    ,repairTypeCols : ['报事报修', '共建家园']
    ,repairTypeShow:false
    ,disabled:false
  },

  
  onChange(event) {
    console.log('切换打开留言板操作：',event.detail);
    this.setData({
      activeNames: event.detail,
    });
  },
  //留言展开
  onOpen(event){
    // this.showLoading(1);
    var obj = this.data.obj;
    var repairDate = obj.repairDate;
    var repairSeqId = obj.repairSeqId;
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var that = this;
    if(this.data.msgList.length > 0){
      this.showLoading(0);
      return;
    }
    netWork.RequestMQ.request({
      url:api.queryMsg,
      method:'POST',
      data:{repairDate:repairDate,repairSeqId:repairSeqId,custId:custId},
      success:res=>{
        // this.showLoading(0);
        if(res.data.RESPCODE == '000'){
          var msgLit = res.data.queryRepairMsgResult.repairMsgDtlDtos;
          that.setData({
            msgList:msgLit,
          });
        }
        
      }
    });
  },


  // 选中维修员
  choseRepairMan(event){
    var that = this;
    wx.navigateTo({
      url: '/pages/staffs/staffList?POSTID=01',
      events:{
        eventPOSelect: function(data) {
          console.log("eventPOSelect",data)
            that.setData({
              choseObj:data,
              hasRepairMan:true,
            });
        },      
      }
    })
  },

  //确认改派
  sureChangeRepairMan(){
    var that = this;
    var oldPoSeqId = that.data.obj.poSeqId;
    var changePoSeqId = that.data.choseObj.poSeqId;
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var repairDate = that.data.obj.repairDate;
    var repairSeqId = that.data.obj.repairSeqId;
      netWork.RequestMQ.request({
        url:api.dispatch,
        method:'POST',
        data:{
          repairDate:repairDate,
          repairSeqId:repairSeqId,
          custId:custId,
          poSeqId:oldPoSeqId,
          changePoSeqId:changePoSeqId
        },
        success:res=>{
          console.log("改派的返回结果：",res);
          if(res.data.RESPCODE == '000'){
            console.log('改派成功了，改提醒了',res.data);
            Toast.alert({message:'改派维修员成功'}).then(()=>{
              wx.redirectTo({
                url: '../repairDetail/repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId+'&source=paidan',
              })
              // that.setData({
              //   choseObj:data,
              // })
            });
          }else{
            Toast.alert({message:res.data.ERRDESC});
          }
        },fail:res=>{
          Toast.alert({message:res.data.ERRDESC});
        },complete:res=>{
          console.log('改派响应结果',res);
        }
      })
  },
  // 改派
  changeRepairMan(event){
    this.choseRepairMan('other');
  },
  //派单
  dispatchOrder(event){
    this.showLoading(1);
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var poSeqId = this.data.choseObj.poSeqId
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var that = this;
    netWork.RequestMQ.request({
      url:api.dispatch,
      method:'POST',
      data:{repairDate:repairDate,repairSeqId:repairSeqId,custId:custId,poSeqId:poSeqId},
      success:res=>{
        console.log(res);
        that.showLoading(0);
        if(res.data.RESPCODE == '000'){
          Toast.alert({message:'成功指定了维修员'}).then(()=>{
            wx.redirectTo({
              url: '../repairDetail/repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId+'&source=paidan',
            })
          })
        }
      },
      complete:res=>{
        that.showLoading(0);
      }
    })
  },
  //更改支付方式
  changePayType(event){
    this.setData({
      payType:event.detail,
    })
  },
  //支付修改
  changePay(event){
    console.log('支付方式修改',event);
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var payType = this.data.payType;
    wx.redirectTo({
      url: '../updAmt/updAmt?repairDate='+repairDate+'&repairSeqId='+repairSeqId+'&payType='+payType+'&op=updAmt',
    })
    

  } ,
  // 奖励勋章
  changeReward(event){
    this.setData({
      huScore:event.detail,
    })
  },
  // 奖励确认
  sureReward(event){
    this.showLoading(1);
    var that = this;
    var msgBody = this.data.msgBody;
    var huScore = this.data.huScore;
    var obj = this.data.obj;
    var repairDate = obj.repairDate;
    var repairSeqId = obj.repairSeqId;
    var poSeqId = obj.poSeqId;
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    netWork.RequestMQ.request({
      url:api.award,
      method:'POST',
      data:{
        repairDate:repairDate,
        repairSeqId:repairSeqId,
        custId:custId,
        msgBody:msgBody,
        huScore:huScore,
        poSeqId:poSeqId
      },
      success:res=>{
        that.showLoading(0);
        if(res.data.RESPCODE == '000'){
          that.setData({msgBody:''});//确定弹窗和textarea的文字重叠问题
          Toast.alert({message:(huScore == '1'?'成功发放了奖励':'本次未给予报修奖励')}).then(()=>{
            wx.redirectTo({
              url: '../repairDetail/repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
            });
          });
        }else{
          var desc = res.data.ERRDESC;
          if(!desc){
            desc = '网络异常，奖励发放失败';
          }
          Toast.alert({message:desc});
        }
      }
      ,fail:res=>{
        Toast.alert({message:res.data.ERRDESC});
      }
      ,complete:res=>{
        that.showLoading(0);
        console.log("奖励的结果",res);
      }
    })
  },

    //图片预览
    imgQuery(imgCnt,repairDate,repairSeqId,dtlId,imgStep){
      var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
      var url;
      var liuyan = false;
      if(dtlId&&dtlId != ''){
        url = api.imgCheck.replace('PACK','repair/'+custId+'/'+repairDate+repairSeqId+dtlId);
        liuyan = true;
      }else{
        url = api.imgCheck.replace('PACK','repair/'+custId+'/'+repairDate+repairSeqId);
      }

      var fList = [];
      for(var i=0;i<imgCnt;i++){
        var imgurl = url.replace('FILE',i+'.png');
        var u = {};
        u['url'] = imgurl;
        // u['url'] = 'https://jiainfo-1251737686.cos.ap-shanghai.myqcloud.com/jia-logo.png';
        fList.push(u);
      }
      console.log('fileList',fList);
      if(liuyan){
        //留言的图片
        if(imgStep == 0){
          this.setData({
            msgImgList:fList,
            msgImgCnt:imgCnt,
            msgDtlId:dtlId,
          });
        }else{
          this.setData({
            msgfinishImgList:fList,
            msgFinishDtlId:dtlId,
            msgfinishImgCnt:imgCnt
          });
        }
        
      }else{
        //详情页的图片
        this.setData({
          fileList:fList,
          maxCount:imgCnt,
        });
      }
      
    },

// //画布压缩图片
// choseImage(file){
//   //-----返回选定照片的本地文件路径列表，获取照片信息-----------
//   var that = this;
//   var temp = this.data.imgList;
//   var timer = null;

//     file.forEach(element => {
//       var path = element.path;
//       console.log('uploadFile',element);
//       if(path == '' || path == undefined){
//         path = element.url;
//         console.log('取首先路径失败，未获取到图片信息，取次要路径',path);
//           if(path == '' || path == undefined){
//             path = element.thumb;
//           }
//       } 
//       wx.getImageInfo({
//         src: path,
//         success:imgRes=>{
//           console.log('成功获取到的图片信息',imgRes);
//           //---------利用canvas压缩图片--------------
//           var ratio = 2;
//           var canvasWidth = imgRes.width //图片原始长宽
//           var canvasHeight = imgRes.height
//           while (canvasWidth > 2016 || canvasHeight > 2016){// 保证宽高在400以内
//               canvasWidth = Math.trunc(imgRes.width / ratio)
//               canvasHeight = Math.trunc(imgRes.height / ratio)
//               ratio++;
//           }
//           that.setData({
//               cWidth: canvasWidth,
//               cHeight: canvasHeight
//           })
//           if(canvasWidth == imgRes.width && canvasHeight == imgRes.height){
//             console.log('图片已经很小，无需进行压缩处理',path);
//             var img = {};
//             // debugger;
//             img['url'] = path;
//             temp.push(img);
//             var imgCnt = that.data.curImgCnt+1;
//             that.setData({
//               imgList:temp,
//               curImgCnt:imgCnt,
//             })
//             wx.hideLoading();
//           }else{
//             let i = 0
//             while(timer != null){
//               if(i == 0){
//                 console.log('有画图对象还在工作....');
//               }
//               i++;
//               if(i == 3000){
//                 console.log('上传第一张图片超时，结束上一个进程,继续下一个...');
//                 break;
//               }
//             }
//             wx.showToast({
//               title: '压缩中...',
//               icon:'loading',
//               duration:2000,
//             })
//             timer = '1';
//               //----------绘制图形并取出图片路径--------------
//               var ctx = wx.createCanvasContext('canvas')
//               ctx.drawImage(imgRes.path, 0, 0, canvasWidth, canvasHeight)
//               ctx.draw(false,setTimeout(function(){
//                   console.log('图片画完，开始导出');
//                   wx.canvasToTempFilePath({
//                     canvasId: 'canvas',
//                     destWidth: canvasWidth,
//                     destHeight: canvasHeight,
//                     fileType:'jpg',
//                     quality: 0.4,
//                     success: function (res) {
//                         console.log('图片压缩成功了',res);
//                         // console.log(res.tempFilePath)//最终图片路径
//                         var img = {};
//                         // debugger;
//                         img['url'] = res.tempFilePath;
//                         temp.push(img);
//                         var imgCnt = that.data.curImgCnt+1;
//                         that.setData({
//                           imgList:temp,
//                           curImgCnt:imgCnt,
//                         })
//                         wx.hideToast({
//                           success: (res) => {},
//                         })
//                         // clearTimeout(timer);//关闭定时器
//                         timer = null;//把定时器制null
//                         console.log('大功告成了');
//                     },
//                     fail: function (res) {
//                       wx.showToast({
//                         title: '图片上传失败，请重试！',
//                         icon:'none'
//                       })
//                       timer = null;
//                       console.log('图片压缩失败',res)
//                     }
//                 })
//               },1000));

//           }
//         },fail:imgRes=>{
//           console.log('获取到的图片信息失败',imgRes);
//         }
//       })
//   });
// },

 //画布压缩图片
 choseImage(file){
  var that = this;
  var temp = this.data.imgList;
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

//图片压缩处理,最新
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
      var ratio = 2;
      var tempSize = 1048576;//1M的大小
      var zip = false;
      if(size != undefined && size != 0 && size > tempSize){
        console.log('图片太大，不管大小，必须进行一定的压缩');
        zip = true;
      }
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
        img['url'] = path;
        temp.push(img);
        var imgCnt = that.data.curImgCnt+1;
            that.setData({
              imgList:temp,
              curImgCnt:imgCnt,
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
                  img['url'] = res.tempFilePath;
                  temp.push(img);
                  var imgCnt = that.data.curImgCnt+1;
                      that.setData({
                        imgList:temp,
                        curImgCnt:imgCnt,
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
  var that = this;
  //图片压缩算法
  that.choseImage(file);

 
},

  // 临时文件删除
  delete(event){
    console.log('delete image file:',event.detail.index);
    var path = this.data.imgList[event.detail.index].url;
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
    this.data.imgList.splice(event.detail.index,1);
    var imgCnt = this.data.curImgCnt -1;
    this.setData({
      imgList:this.data.imgList,
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

// 确认到场
turnUp(){
  this.showLoading(1);
  var that = this;
  var repairDate = this.data.obj.repairDate;
  var repairSeqId = this.data.obj.repairSeqId;
  var reairType = this.data.obj.repairType;
  var imgCnt = this.data.curImgCnt;
  var fileList = this.data.imgList;
  var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
  var poSeqId =  this.data.obj.poSeqId;
  if(!this.checkSameMan()){
    this.showLoading(0);
    Toast.alert({message:'您非维修员本人，不能进行确认到场操作！'});
    return;
  }

  if(reairType == 'S' && imgCnt <= 0){
    this.showLoading(0);
    Toast.alert({message:'请至少上传一张到场图片'});
    return;
  }
  // for(var i =0;i<fileList.length;i++){
  //   // var dtlId = data.repairReachResult.dtlId;
  //   var dtlId = '0003'
  //   that.upload(fileList[i].url,api.imgUpload,
  //     {imgId:dtlId+'0'+i,fileType:'LOG',busiId:'01',busiDate:repairDate,busiSeqId:repairSeqId,custId:custId});
  //   // that.upload(fileList[i].url,api.imgUpload,
  //   //   {customize:'repair',packName:'repair/'+custId+'/'+repairDate+repairSeqId+dtlId,fileName:i+'.png'});
  //   return;
  // }
  netWork.RequestMQ.request({
    url:api.repairManReach,
    method:'POST',
    data:{
      repairDate:repairDate,
      repairSeqId:repairSeqId,
      custId:custId,
      poSeqId:poSeqId,
      imgCnt:imgCnt,
    },
    success:res=>{
      var data = res.data;
      that.showLoading(0);
      if(data.RESPCODE == '000'){
        for(var i =0;i<fileList.length;i++){
          var dtlId = data.repairReachResult.dtlId;
          that.upload(fileList[i].url,api.imgUpload,
            {imgId:dtlId+'0'+i,fileType:'LOG',busiId:'01',busiDate:repairDate,busiSeqId:repairSeqId,custId:custId});
          // that.upload(fileList[i].url,api.imgUpload,
          //   {customize:'repair',packName:'repair/'+custId+'/'+repairDate+repairSeqId+dtlId,fileName:i+'.png'});
        }
        Toast.alert({message:'确认到场成功'}).then(()=>{
          wx.redirectTo({
            // url: '../updAmt/updAmt?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
            url:'./repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
          });
        }); 
      }
    }
    ,fail:res=>{
      Toast.alert({message:res.data.ERRDESC});
    }
    ,complete:res=>{
      that.showLoading(0);
    }
  });


  
},
  //文件上传结束

  // 维修完成
  repairFinish(event){
    console.log('维修完成',event);
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    if(!this.checkSameMan()){
      Toast.alert({message:'您非维修员本人，无法对该订单进行维修完成确认！'});
      return;
    }
    var repairType = this.data.obj.repairType;
    if(repairType == 'S'){
      wx.redirectTo({
        url: '../updAmt/updAmt?repairDate='+repairDate+'&repairSeqId='+repairSeqId+'&op=finish',
      })
    }else{
      Toast.confirm({message:'确认维修完成?'}).then(()=>{
        this.finishRepair();
      });
    }
  },
  checkSameMan(){
    var poSeqId =  this.data.obj.poSeqId;
    var loginPoSeqId = wx.getStorageSync(storage.STORAGE.USER_INFO).POSEQID;
    return poSeqId == loginPoSeqId;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:  function (options) {
    that = this;
    disabled=false;
    console.log('报修详情加载',options);
    var source = options['source'];
    var repairDate = options['repairDate'];
    var repairSeqId = options['repairSeqId'];

    //loading初始化
    app.loading(),this.showLoading(1);
    //初始化加载的数据
    that.initDetatilPage(repairDate,repairSeqId,source,this);
    //初始化时间
    that.initTime();
    //清除缓存中的图片,避免缓存中的图片过多导致异常
    that.cleanImgStorage();
    //关闭加载提示
    that.showLoading(0);
  },

  //初始化详情页
  initDetatilPage(repairDate,repairSeqId,source,that){
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    netWork.RequestMQ.request({
      url:api.queryRepair,
      method:'POST',
      data:{
        repairDate:repairDate,
        repairSeqId:repairSeqId,
        custId:custId,
      },
      success:res=>{
        that.showLoading(0);
        console.log('初始化加载详情数据成功',res);
        var datas = res.data;
        var obj = datas.queryRepairLogResult.repairDtos[0];
        console.log('obj...',obj);
        var payType = obj.payType;
        if(payType == '' || payType == undefined){
          payType = 'N';
        }
        var huScore = obj.huScore;
        if(huScore == '' || huScore == undefined || huScore <=0 || huScore == '-1'){
          huScore ='1';
        }
        //明细
        var fileList = obj.detailUrlList;
        var count = fileList.length;

        //留言到场
        var msgImgList = obj.msgOneUrlList;
        var msgImgCnt = msgImgList.length;
        var msgDtlId = '0';
        if(msgImgCnt > 0){
          msgDtlId = msgImgList[0].name;
        }
        //留言完成
        var msgfinishImgList = obj.msgTwoUrlList;
        var msgfinishImgCnt = msgfinishImgList.length;
        var msgFinishDtlId = '0';
        if(msgfinishImgCnt > 0){
            msgFinishDtlId = msgfinishImgList[0].name;
        }
        
        //检查图片链接是否有效，无效替换为默认图片
        let map=new Map();
        map.set("fileList",fileList);
        map.set("msgImgList",msgImgList);
        map.set("msgfinishImgList",msgfinishImgList);
        for(let item of map){
          for(let i=0;i<item[1].length;i++){
            wx.getImageInfo({
              src: item[1][i].url,
              fail:function(){
                item[1][i].url=errorUrl;
                item[1][i].name=errorImg;
                that.setData({
                  fileList:map.get("fileList"),
                  msgImgList:map.get("msgImgList"),
                  msgfinishImgList:map.get("msgfinishImgList")
                });
              }
            })
          }
        }
        //计算日期
        //let tObj = new Date();
        //let curDate = tObj.getFullYear()+'-'+leftPad(tObj.getMonth()+1)+'-'+leftPad(tObj.getDate());
        //let doneDate = obj.doneDate;
        //if (doneDate) {
        //  let startDate = doneDate.substring(0,4)+'-'+doneDate.substring(4,6)+'-'+doneDate.substring(6,8);
        //  let endDate = curDate;
        //  let subDay = daysBetween(startDate,endDate);
        //  console.log('subDay=====', subDay,startDate,endDate);
        //  that.setData({subDay:subDay<7})
        //}


        that.setData({
          obj:obj,
          comObj:datas.queryRepairLogResult,
          payType:payType,
          huScore:huScore,
          fileList:fileList,
          maxCount:count,
          msgImgList:msgImgList,
          msgImgCnt:msgImgCnt,
          msgDtlId:msgDtlId,
          msgfinishImgList:msgfinishImgList,
          msgfinishImgCnt:msgfinishImgCnt,
          msgFinishDtlId:msgFinishDtlId,
          userInfo:wx.getStorageSync(storage.STORAGE.USER_INFO),
          updItem:(obj.itemBtype == undefined || obj.itemBtype == ''),
          repairDate:repairDate,
          repairSeqId:repairSeqId,
          custId:custId,
        })
        //初始化留言
        that.onOpen();
        //加载详情中的图片信息
        // that.imgQuery(obj.imgCnt,repairDate,repairSeqId);
        that.initData(datas,source,that);
      },
      fail:res=>{
        console.log('初始化加载详情数据失败',res);
      },
      complete:res=>{
        that.showLoading(0);
      }
    });
  },

  //初始化加载的数据
  initData(datas,source,that){
    var comObj = datas.queryRepairLogResult;//查询的公共数据和详情数据
    var obj = comObj.repairDtos[0];//查询的详情数据

    //进入详情的来源
    if(source == 'chaxun'){
      that.setData({isChaXun:true,isMyRepair:false});
    }else if(source == 'jiedan'){
      that.setData({isJieDan:true,isMyRepair:false});
    }else if(source == 'paidan'){
      that.setData({isPaiDan:true,isMyRepair:false});
    }

    this.initRepairType();
  },


  //清除图片缓存数据
  cleanImgStorage(){
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
    });
  },

 
  // 修改预期到场时间
  changeTime(event){
    let that = this;
    this.setData({
      show:false
    })
    this.showLoading(1);
    console.log('更改预期到场时间',event);
    //时间修改
    var dataTime = event.detail.index;
    var date = this.data.columns[0].values[dataTime[0]];
    var t = time[dataTime[1]];
    console.log(date,time);
    var re = /:|-|\./g;
    var d = date.substring(0,10);
    var expArvTime = (d+t).replace(re,'');
    console.log(expArvTime);
    this.setData({
      expArvTime:expArvTime,
      date:d,
      time:t,
    })

    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var poSeqId = this.data.obj.poSeqId;
    var dtlId = this.data.dtlId;
    var unkArvTime = this.data.expArvTime;
    if(!this.checkSameMan()){
      this.showLoading(0);
      Toast.alert({message:'您非维修员本人，无法修改预期到场时间！'});
      return;
    }
    network.RequestMQ.request({
      url:api.updExpArvTime,
      method:'POST',
      data:{repairDate:repairDate,
        repairSeqId:repairSeqId,
        custId:custId,
        poSeqId:poSeqId,
        dtlId:dtlId,
        replyType:'01',
        unkArvTime:unkArvTime,
      },
      success:res=>{
        that.showLoading(0);
        if(res.data.RESPCODE == '000'){
          console.log('upd time success');
          Toast.alert({message:'已经提出修改时间成功，等待沟通确认！'}).then(()=>{
            wx.redirectTo({
              url: '../repairDetail/repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
            })
          })
        }
      }
      ,fail:res=>{
        Toast.alert({message:res.data.ERRDESC});
      }
      ,complete:res=>{
        console.log('修改时间的后台反馈：',res);
        that.setData({
          show:false
        })
      }
    })
  },

  //对呀预期到场时间进行确认
  sureTime(event){
    console.log('确认预期到场时间',event);
    this.showLoading(1);
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var poSeqId = this.data.obj.poSeqId;
    var dtlId = event.target.dataset.dtlid;
    var unkArvTime = this.data.obj.unkArvTime;
    var that = this;
    if(!this.checkSameMan()){
      this.showLoading(0);
      Toast.alert({message:'您非维修员本人，无法对预期到场时间进行确认！'});
      return;
    }
    network.RequestMQ.request({
      url:api.updExpArvTime,
      method:'POST',
      data:{repairDate:repairDate,
        repairSeqId:repairSeqId,
        custId:custId,
        poSeqId:poSeqId,
        dtlId:dtlId,
        replyType:'02',
        unkArvTime:unkArvTime,
      },
      success:res=>{
        that.showLoading(0);
        console.log('确认预期修改时间成功',res);
        if(res.data.RESPCODE == '000'){
          Toast.alert({message:'对预期到场时间已经确认了'}).then(()=>{
            wx.redirectTo({
              url: '../repairDetail/repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
            })
          })
        }else{
          Toast.alert(res.data.ERRDESC);
        }
      }
      ,fail:res=>{
        that.showLoading(0);
        Toast.alert({message:res.data.ERRDESC});
      }
      ,complete:res=>{
        that.showLoading(0);
        that.setData({
          show:false
        })
      }
    })
  },

  // 显示时间弹窗
  showPopup(event) {
    console.log('日期时间弹窗',event);
    if(this.data.comObj.repairTimeCnt == this.data.obj.arvTimeCnt){
      wx.showToast({
        title: '修改已达上限！',
        icon:'none'
      })
      return;
    }
    this.setData({ 
      show: true ,
      dtlId:event.target.dataset.dtlid,
    });
  },
// 隐藏时间弹窗
  onClose() {
    this.setData({ show: false });
  },

  //初始化加载，初始化选择的时间
  initTime(event){
      var coloum = new Array();//时间数组
      var jsonObj = {};//piker格式{'':[]}候选数据
      var jsonSonObj = {};//piker两列中第一列的json对象，参考上面的注释
      var jsonSonObj1 = {};//piker两列中第二列的json对象，参考上面的注释
      var d ;//往前推算的具体日期临时值
      var first;//获取当天的值
      var index;//当前默认选中的值
      var temp;//当是晚间的时候，则预选第二天
      
      for(var i = 0;i < 9;i++){
        d = date.getDaysAgoDian(-i);
        let dayTmp = this.getNextDate(i);
        var week = new Date(dayTmp).getDay();
        var weekDesc ;
        if(week == 0){
          weekDesc = ' ( 周日 )';
        }else if(week == 1){
          weekDesc = ' ( 周一 )';
        }else if(week == 2){
          weekDesc = ' ( 周二 )';
        }else if(week == 3){
          weekDesc = ' ( 周三 )';
        }else if(week == 4){
          weekDesc = ' ( 周四 )';
        }else if(week == 5){
          weekDesc = ' ( 周五 )';
        }else if(week == 6){
          weekDesc = ' ( 周六 )';
        }
        
        d = d + weekDesc;
        if(i == 0){
          first = d;
        }else if(i==1){
          temp = d;
        }
        jsonObj[d] = time;
      }
      jsonSonObj['values'] = Object.keys(jsonObj);
      jsonSonObj['className'] = 'column1';

      index = new Date().getHours() * 2 + 4;
      if(index > 47){
        first = temp;
        index = 20;
      }

      jsonSonObj1['values'] = jsonObj[first];
      jsonSonObj1['className'] = 'column1';
      jsonSonObj1['defaultIndex'] = index;

      coloum.push(jsonSonObj);
      coloum.push(jsonSonObj1);
      // var t = new Date();
      // console.log(t.getHours());
      // console.log(t.getMinutes())
      var re = /:|-|\./g;
      var d = first.substring(0,10);
      var t = time[index];
      var expArvTime = (d+t).replace(re,'');
      this.setData({
        columns:coloum,
        date:d,
        time:t,
        expArvTime:expArvTime,
      })
      
  },
  getNextDate(day) {  
    var dd = new Date();
    dd.setDate(dd.getDate() + day);
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
    var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
    return y + "-" + m + "-" + d;
  },

  //接单
  jieDan(event){
    this.showLoading(1);
    console.log('接单业务开始处理');
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var poSeqId = wx.getStorageSync(storage.STORAGE.USER_INFO).POSEQID;
    var that = this;
    network.RequestMQ.request({
      url:api.dispatch,
      method:'POST',
      data:{
        repairDate:repairDate,
        repairSeqId:repairSeqId,
        custId:custId,
        poSeqId:poSeqId
      },
      success:res=>{
        console.log('接单成功',res);
        var data = res.data;
        that.showLoading(0);
        if(res.data.RESPCODE == '000'){
          console.log('upd time success');
          Toast.alert({message:"成功接单！"}).then(()=>{
            wx.redirectTo({
              url: '../repairDetail/repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId+'&source=myRepair&op=finish',
            });
          })
        }else{
          Toast.alert({message:data.ERRDESC});
        }
      },
      fail:res=>{
        that.showLoading(0);
        Toast.alert({message:res.data.ERRDESC});
      },
      complete:res=>{
        that.showLoading(0);
      }
    });
  },

  //取消接单
  cancel(event){
    Toast.confirm({message:'取消接单？'}).then(()=>{
      let that = this;
      let poSeqId = this.data.obj.poSeqId;
      let repairDate = this.data.obj.repairDate;
      let repairSeqId = this.data.obj.repairSeqId;
      if(poSeqId==''||poSeqId == undefined ||repairDate == '' || repairDate== undefined||repairSeqId==''||repairSeqId==undefined){
        Toast.alert({message:'取消失败，关键信息缺失'});
        return;
      }
      netWork.RequestMQ.request({
        url:api.cancelOrd,
        method:'POST',
        data:{repairDate:repairDate,
          repairSeqId:repairSeqId,
          poSeqId:poSeqId,
        },
        success:res=>{
          that.showLoading(0);
          if(res.data.RESPCODE == '000'){
            Toast.alert({message:'取消成功'}).then(()=>{
              wx.redirectTo({
                url: '../orders/orders',
              })
            })
          }
        }
        ,fail:res=>{
          Toast.alert({message:res.data.ERRDESC});
        }
        ,complete:res=>{
          console.log('取消接单结果：',res);
          that.showLoading(0);
        }
      })
    })
  },

  // 完成维修
  finishRepair(event){
    this.showLoading(1);
    var that = this;
    var repairDate = this.data.obj.repairDate;
    var repairSeqId = this.data.obj.repairSeqId;
    var ordAmt = this.data.obj.ordAmt;
    var payType = this.data.obj.payType;
    // if(payType == 'N'){
    //   ordAmt = 0;
    // }else{
    //   if(!ordAmt || ordAmt == '' || ordAmt == 0){
    //     wx.showToast({
    //       title: '请输入大于0的金额',
    //     });
    //     return;
    //   }
    // }
    var custId = wx.getStorageSync(storage.STORAGE.CUSTID);
    var poSeqId = this.data.obj.poSeqId;
    netWork.RequestMQ.request({
      url:api.finishRepair,
      method:'POST',
      data:{repairDate:repairDate,
        repairSeqId:repairSeqId,
        custId:custId,
        poSeqId:poSeqId,
        ordAmt:ordAmt,
        payType:payType,
      },
      success:res=>{
        that.showLoading(0);
        if(res.data.RESPCODE == '000'){
          Toast.alert({message:'业务处理成功'}).then(()=>{
            wx.redirectTo({
              url: '../repairDetail/repairDetail?repairDate='+repairDate+'&repairSeqId='+repairSeqId+'&op=finish',
            })
          })
        }
      }
      ,fail:res=>{
        Toast.alert({message:res.data.ERRDESC});
      }
      ,complete:res=>{
        console.log('确认维修完成结果：',res);
        that.showLoading(0);
      }
    })
  },
  //留言
  liuyan(event){
    // console.log('留言',event);
    this.setData({msgBody:event.detail})
  },
   /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //清理小程序的临时文件，防止图片上传失败
    wx.getSavedFileList({
      success (res) {
        if (res.fileList.length > 0){
          wx.removeSavedFile({
            filePath: res.fileList[0].filePath,
            complete (res) {
              console.log('清理临时文件',res)
            }
          })
        }
      }
     });

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

  //选择反馈类型
  choseItemType(){
    this.queryItemType();
    this.changeShow();
  },

  //控制反馈显隐
  changeShow(){
    this.setData({
      showItemType: !this.data.showItemType
    })
  },

  //修改选中的类别
  //changeType(event) {
  //  const { picker, value, index } = event.detail;
  //  picker.setColumnValues(1, citys[value[0]]);
  //},
  //确认选中了数据
  sureChose(event){
    let piker = this.selectComponent('#itemTypePicker');
    //关闭弹窗
    this.changeShow();

    let codeValue = event.detail.values[2].code;
    console.log('e==>',codeValue);
    var pre = parseInt(codeValue.substring(0,2));
    var mid = parseInt(codeValue.substring(2,4));
    var last = parseInt(codeValue.substring(4,6));
    let code = this.data.code;
    let codeName = this.data.codeName;
    let stype = code[mid-1][last];
    let stypeName = codeName[mid-1][last];
    let btype = code[mid-1][0];
    let btypeName = codeName[mid-1][0];
    let repairType = 'S';
    //console.log('code==>',code);
    //console.log('pre==>',code[mid-1][last],codeName[mid-1][last]);
    //console.log('pre==>',code[mid-1][0],codeName[mid-1][0]);
    if (pre === 10) {
      repairType = 'P';
    }

    //btypeName = (repairType == 'P'?'公共-':'业主-')+btypeName;


    //获取选中的值
    //let obj = piker.getValues();
    //let key = obj[1]['key'];
    //let btypeDesc = obj[0];
    //let stypeDesc = obj[1]['text'];
    //if(stypeName==this.data.obj.itemBtypeDesc && btypeName == this.data.obj.itemStypeDesc){
    //  wx.showToast({
    //    title: '修改类别不能相同',
    //    icon:'none'
    //  })
    //  return;
    //}
    let itemRepType = 'obj.itemRepType';
    let itemBtypeDesc = 'obj.itemBtypeDesc';
    let itemStypeDesc = 'obj.itemStypeDesc';
    ////调用修改接口
    let repairDate = this.data.obj.repairDate;
    let repairSeqId = this.data.obj.repairSeqId;
    //let that = this;
    network.RequestMQ.request({
      url:api.updRepairItem,
      method:'POST',
      data:{
        repairDate:repairDate,
        repairSeqId:repairSeqId,
        itemStype:stype,
        itemBtype:btype,
        repairType:repairType
      },
      success:res=>{
        console.log('修改反馈结果',res);
        this.setData({queryItemType:false});
        let data = res.data;
        if(data.RESPCODE == '000'){
          let desc = '修改成功';
          if(that.data.updItem){
            desc = '类型分配成功';
          }
          wx.showToast({
            title: desc,
            icon:'none'
          })
          that.setData({
            [itemBtypeDesc]:btypeName,
            [itemStypeDesc]:stypeName,
            [itemRepType]:repairType,
            updItem:false
          })
        }else{
          Toast.alert({message:data.ERRDESC});
        }
      }
    })
  },
  //查询反馈类别
  queryItemType(){
    getItems();
    //let obj = this.data.obj;
    //let itemBtypeDesc = obj.itemBtypeDesc;
    //let itemStype = obj.itemStype;
    //if(itemBtypeDesc == null || itemStype == null){
    //  itemStype = '';
    //  itemBtypeDesc = '';
    //}
    //network.RequestMQ.request({
    //  url:api.getRepairItem,
    //  method:'POST',
    //  data:{itemBtypeDesc:itemBtypeDesc,itemStype:itemStype},
    //  success:res=>{
    //    console.log('查询反馈的返回结果',res);
    //    this.setData({queryItemType:false});
    //    let data = res.data;
    //    if(data.RESPCODE == '000'){
    //      data = data.data;
    //      this.setData({itemTypeList:data.value});
    //      citys = data.city;
    //    }else{
    //      Toast.alert({message:data.ERRDESC});
    //    }
    //  }
    //})
  },

  repairMsgBody(event){
    console.log(event.detail);
    this.setData({repairMsgBody:event.detail})
  },

  submitRepairMsg(e){
    let that = this;
    let msgBody = this.data.repairMsgBody;
    let msgSource=e.currentTarget.dataset.msgsource;
    if (msgBody === undefined || msgBody === '') {
      Toast.alert({message: '请输入留言备注'});
      return;
    }
    let repairDate = this.data.obj.repairDate;
    let repairSeqId = this.data.obj.repairSeqId;
    if(disabled){
      console.log("点的太快了");
      return;
    }
    disabled=true;
    this.setData({
      disabled:true
    });
    netWork.RequestMQ.request({
      url:api.addRepairMsg,
      method:'POST',
      data:{
        repairDate:repairDate,
        repairSeqId:repairSeqId,
        msgBody:msgBody,
        msgSource:msgSource
      },
      success:res=>{
        console.log('res====>', res);
        if (res.data.RESPCODE === '000') {
          Toast.alert({message: '留言成功'}).then(res=>{
            that.setData({msgList:[],repairMsgBody:''});
            that.onOpen();
          })

        }else{
          Toast.alert({message: res.data.errDesc});
        }
      },
      complete:res=>{
        setTimeout(function(){
          disabled=false;
          that.setData({
            disabled:false
          })
        },500)
      }
    })

  },

  initRepairType:function(){
    let obj = this.data.obj;
    let comObj = this.data.comObj;

    let repairTypeCols = this.data.repairTypeCols;
    if(comObj.propType == 'R'){
      repairTypeCols = ['个人住宅', '共建家园']
    }else{
      repairTypeCols = ['套内报修', '共建家园']
    }
    this.setData({repairTypeCols:repairTypeCols})
  },
  openRepairTypeShow:function(){
    this.setData({repairTypeShow: true})
  },
  closeRepairTypeShow : function(){
    this.setData({repairTypeShow: false})
  },
  changeRepairType: function(event){
    const { picker, value, index } = event.detail;
    // let index = ${index};
    console.log(index);
    let repairType;
    if(index === 0){
      repairType = 'S';
    }else{
      repairType = 'P';
    }
    let repairDate = this.data.obj.repairDate;
    let repairSeqId = this.data.obj.repairSeqId;
    let obj = this.data.obj;
    let that = this
    netWork.RequestMQ.request({
      url:api.changeRepairType,
      method:'POST',
      data:{
        repairDate:repairDate,
        repairSeqId:repairSeqId,
        repairType:repairType,
      },
      success:res=>{
        console.log('res====>', res);
        if (res.data.RESPCODE === '000') {
          Toast.alert({message: '修改成功'})
          obj.repairType = repairType
        }else{
          Toast.alert({message: res.data.errDesc});
        }
        that.setData({
          repairTypeShow: false,
          obj : obj
        })
      }
    })
  },
  //图片点击事件
  clickPreview:function(event){
    let name=event.detail.name;
    let index=event.detail.index;
    let map=new Map();
    map.set("fileList",this.data.fileList);
    map.set("msgList",this.data.msgImgList);
    map.set("finshList",this.data.msgfinishImgList);
    //获取到图片所在的list
    let list=map.get(name);
    let item=list[index];
    //如果图片名不为标记的图片名，正常放大
    if(item.name!=errorImg){
      let templist=[];
      for(let i=0;i<list.length;i++){
        if(list[i].name!=errorImg){
          templist.push(list[i].url);
        }
      }
      wx.previewImage({
        urls: templist,
        current : item.url
      })
      //图片名为标记的图片名，先改为loading，再重新发送请求加载
    }else{
      list[index].url=loadingUrl;
      map.set(name,list);
      this.setData({
        fileList:map.get("fileList"),
        msgImgList:map.get("msgList"),
        msgfinishImgList:map.get("finshList")
      });

      netWork.RequestMQ.request({
        url:api.queryRepair,
        method:'POST',
        data:{
          repairDate:this.data.repairDate,
          repairSeqId:this.data.repairSeqId,
          custId:this.data.custId,
        },
        success:res=>{
          let resMap=new Map();
          resMap.set("fileList",res.data.queryRepairLogResult.repairDtos[0].detailUrlList);
          resMap.set("msgList",res.data.queryRepairLogResult.repairDtos[0].msgOneUrlList);
          resMap.set("finshList",res.data.queryRepairLogResult.repairDtos[0].msgTwoUrlList);
          wx.getImageInfo({
            src: resMap.get(name)[index].url,
            success:function(){
              list[index]=resMap.get(name)[index]
              map.set(name,list);
            },
            fail:function(){
              list[index].url = errorUrl;
              list[index].name = errorImg;
              map.set(name,list);
            },
            complete:function(){
              that.setData({
                fileList:map.get("fileList"),
                msgImgList:map.get("msgList"),
                msgfinishImgList:map.get("finshList")
              })
            }
          })
        },
        fail:res=>{
          console.log('初始化加载详情数据失败',res);
        }
      });
    }
  },
})


/**
 * code对应的数据就是数组下标值，通过下标值获取对应的分类编号
 */

function getItems() {
  let itemBtype = that.data.obj.itemBtype;
  let itemStype = that.data.obj.itemStype;
  let itemRepType = that.data.obj.itemRepType;
  let repairType = that.data.obj.repairType;
  let defaultValue = ''; //默认选中值
  let preDefault = ''; //前置默认一级菜单
  let midDeFault = ''; //中间，二级菜单
  let lastDefault = ''; //最后，三级菜单



  network.RequestMQ.request({
    url:api.getRepairItem,
    method:'POST',
    data:{},
    success:res=>{
      console.log('res.data====>', res);
      let data = res.data.data;
      let pro = {
        100000:'公共',
        200000:'业主',
      };
      console.log('pro====>',pro);
      let mapCity = new Map();//大类
      let mapCountry = new Map();//小类

      let dataValue = new Array(); //三级菜单中的值
      let dataName = new Array(); //三级菜单中的名字
      let code = new Array(); //三级菜单中的名字
      let codeName = new Array(); //三级菜单中的名字



      //let otherFlag = 1;
      for (let i = 0; i < data.length; i++) {
        dataValue[i] = new Array();
        dataName[i] = new Array();
        code[i] = new Array();
        codeName[i] = new Array();
        let datum = data[i]; //每一个大类
        let btype = datum.itemBtype;

        let keyPre = datum.repairType === 'P'?'10':'20';//二级菜单前缀
        let keyLast = '00'; //二级菜单结尾
        let key = parseInt(keyPre + leftPad(i+1) + keyLast);


        let stypeList = datum.itemStypeList.split(",");
        let nameList = datum.itemNameList.split(",");
        let p = 1;
        for (let j = 0; j < stypeList.length; j++) {
          let temp = stypeList[j];
          if(temp === '0000'){
            dataValue[i][0] = stypeList[j];
            dataName[i][0] = nameList[j];
            code[i][0] = btype;
            codeName[i][0] = nameList[j].trim();
            mapCity.set(key,nameList[j].trim());
            continue;
          }
          let sType = stypeList[j];
          if (datum.repairType===itemRepType && sType === itemStype && btype === itemBtype) {
            midDeFault = leftPad(i+1);
            lastDefault = leftPad(p);
          }
          dataValue[i][p] = sType;
          dataName[i][p] = nameList[j];
          code[i][p] = temp;
          codeName[i][p] = nameList[j].trim();
          let threeKey = parseInt(keyPre+leftPad(i+1)+leftPad(p));
          p = p +1 ;
          mapCountry.set(threeKey,nameList[j].trim());
          //otherFlag++;
        }
      }
      console.log('dataValue====>',dataValue);
      console.log('dataName====>', dataName);
      console.log('code====>', code);
      let areaList = {};
      areaList.province_list = pro;
      areaList.city_list = _strMapToObj(mapCity);
      areaList.county_list = _strMapToObj(mapCountry);
      console.log('result ====> ', areaList);
      if (itemBtype != undefined && itemBtype != '') {
        preDefault = itemRepType=== 'S'?'20':'10';
        defaultValue = preDefault+midDeFault+lastDefault;
        console.log('pre==mid==last===>', preDefault + '|' + midDeFault + '|' + lastDefault);
      }else{
        defaultValue = repairType==='P'?firstOneDefault:firstTwoDefault;
      }
      console.log('default=====>', defaultValue);
      console.log('areaList=====>', areaList);
      that.setData({
        areaList:areaList,
        code:code,
        codeName:codeName,
        defaultValue:defaultValue
      });
    }

  });
}

function leftPad(v) {
  if (v < 10) {
    return '0'+v;
  }else if(v>99){
    console.log('不能超过99');
  }else{
    return v;
  }
}

function _strMapToObj(strMap){
  let obj= Object.create(null);
  for (let[k,v] of strMap) {
    if (k < 200000 && (firstOneDefault === '' || k < firstOneDefault)) {
      console.log('k1===>',k);
      firstOneDefault = '' + k;
    } else if(k > 200000 && firstTwoDefault === '' || k < firstOneDefault){
      firstTwoDefault = '' + k;
      console.log('k2===>',k);
    }
    obj[k] = v;
  }
  return obj;
}


function daysBetween(DateOne, DateTwo) {
  var OneMonth = DateOne.substring(5, DateOne.lastIndexOf('-'));
  var OneDay = DateOne.substring(DateOne.length, DateOne.lastIndexOf('-') + 1);
  var OneYear = DateOne.substring(0, DateOne.indexOf('-'));

  var TwoMonth = DateTwo.substring(5, DateTwo.lastIndexOf('-'));
  var TwoDay = DateTwo.substring(DateTwo.length, DateTwo.lastIndexOf('-') + 1);
  var TwoYear = DateTwo.substring(0, DateTwo.indexOf('-'));

  var cha = ((Date.parse(OneMonth + '/' + OneDay + '/' + OneYear) - Date.parse(TwoMonth + '/' + TwoDay + '/' + TwoYear)) / 86400000);
  return Math.abs(cha);
}

