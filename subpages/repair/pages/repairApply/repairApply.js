const date = require('../../../../utils/dateUtil.js');
const api = require('../../../../const/api.js');
const app = getApp();
const storages = require('../../../../const/storage.js');
import storage from '../../../../utils/storageUtils.js';


import Toast from '../../../../miniprogram_npm/@vant/weapp/dialog/dialog';


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

Page({

  /**
   * 页面的初始数据
   */
  data: {
    repairType: 'S',
    show: false,
    columns: [],
    date:'',
    time:'',
    imgUse:3,
    imgCnt:0,
    fileList: [],
    fileList2: [],
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

    ,sizeType:['compressed']//缩略图
    ,cWidth: 0 //画布的宽度，图片压缩后大小
    ,cHeight : 0 //画布的高度，图片压缩后大小

    ,bdObj:null//标地对象
    ,objId:'' //标地代号

    ,quickDesc: []
    ,showQuickDesc:false

    ,cstCode:''
    ,wxOpenId:''
    ,proNum:''

    ,isjiantou:true  //箭头切换
    // ,selectcontent:[
    //   {id:1,name:"房屋1"},
    //   {id:2,name:"房屋2"},
    //   {id:3,name:"房屋3"}
    
    // ]
    ,selectcontent:''
    ,value:''  //选中的值
    ,valueid:'' //选中的id
    ,selectedHouseId:''
    ,selectedHouseName: '请选择房屋'
    ,grpName:''
    ,budName:''
    ,repair_button_disabled:false

  },
//详情
topage(repairDate,repairSeqId){
    wx.redirectTo({
      url: '../repairDetailPage/repairDetailPage?repairDate='+repairDate+'&repairSeqId='+repairSeqId,
    })
  },
repairHouse(){
  console.log("跳转选择房屋页面")
  wx.navigateTo ({
    url: '../repairHouseSelected/repairHouseSelected',
  })
},
// 报修记录跳转
toListPage(){
  wx.redirectTo({
    url: '../repairQuery/repairQuery',
  })
},
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
  this.setData({
    repairDesc:event.detail,
  })
},

// ridio
  choseType(event){
    // console.log(event);
    this.setData({
      repairType:event.detail,
    })
  },
// 时间弹窗
  changeTime(event) {
    const { picker, value, index } = event.detail;
    var date = value[0].substring(0,10)
    var timeDesc = value[1];
    var re = /:|-|\./g;
    var expArvTime = (date+timeDesc).replace(re,'');
    this.setData({
      date: date,
      time:timeDesc,
      expArvTime:expArvTime,
    })
    this.onClose();
    
  },
// 显示弹窗
  showPopup() {
    this.setData({ show: true });
  },
// 隐藏弹窗
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
getUploaderList(e) {
  this.setData({
    fileList2: e.detail.compressList
  })
},

// 提交
submitInfo(){
  // debugger;
  //this.showLoading(1);
  var datas = this.data;
  var d = {};
  d['repairDesc'] = datas.repairDesc;
  d['repairType'] = datas.repairType;
  d['imgCnt']=datas.imgCnt;
  d['expArvTime']=datas.expArvTime;
  d['repairObjId'] = datas.objId;
  d['fileList'] = datas.fileList2;
  //d['houseId'] = datas.valueid;
  d['houseId'] = datas.selectedHouseId;
  //d['cstCode'] = app.storage.getCstCode();
  //d['wxOpenId'] = app.storage.getWxOpenId();
  //d['proNum'] = app.storage.getProNum();


  // if(!datas.objId || datas.objId == ''){
  //   console.log('没有值',datas);
  //   return;
  // }

  if( this.data.selectedHouseId == '' || this.data.selectedHouseId == null || this.data.selectedHouseId == undefined){
    //this.showLoading(0);
    app.alert.alert('请选择房屋');
    return;
  }
  if(!datas.repairDesc || datas.repairDesc == ''){
    //this.showLoading(0);
    app.alert.alert('请简要描述您的问题，以便我们为您提供更好的服务！');
    return;
  }
  // var imgCnt = datas.imgCnt;
  // if(datas.imgCnt < 1){
  //   this.showLoading(0);
  //   app.alert.alert('请至少上传一张报修图片');
  //   return;
  // }

    if(this.data.fileList2.length < 1){
      //this.showLoading(0);
      app.alert.alert('请至少上传一张报修图片');
      return;
    }

  var that = this;
  if(!that.data.repair_button_disabled){
    that.setData({ repair_button_disabled: true });
    app.req.postRequest(api.repairApply,d).then(value => {
        console.log('报修申请的响应结果',value.data);
        //that.showLoading(0);
        //var custId = app.storage.getCustId();
        if(value.data.respCode == '000'){
          that.setData({ repair_button_disabled: false });
          //消息推送
          // app.req.postRequest(api.sendMsg,{msgBusiType:'REPAIR_NEW_JOB'});
          var repairDate = value.data.repairDate;
          var repairSeqId = value.data.repairSeqId;
          var fileList = that.data.fileList;
          var result = 0;
          var le = fileList.length;
          // if(imgCnt > 0){
          //   console.log('申请成功，维护上传的临时图片,共计：',fileList.length);
          //   for(var i =0;i< le;i++){
          //     // that.upload(fileList[i].url,api.uploadImages,
          //     //   {customize:'repair',packName:'repair/'+custId+'/'+repairDate+repairSeqId,fileName:i+'.png'});
          //     //   console.log('当前处理完成的是：',i);

          //    // result = result + that.upload(fileList[i].url,api.uploadImages,
          //    // {imgId:i,fileType:'LOG',busiId:'01',busiDate:repairDate,busiSeqId:repairSeqId,custId:custId});
          //     //console.log('当前处理完成的是：',i);
          //   }
          // }
          Toast.alert({
            message:'报修申请成功',
          }).then(()=>{
            // let repairCommonId = that.data.repairCommonId;
            // if(repairCommonId == undefined || repairCommonId == ''){
            //   if(result == le){
            //     that.topage(repairDate,repairSeqId);
            //   }else{
            //     that.showLoading(1);
            //     setTimeout(function(){
            //       that.showLoading(0);
            //       that.topage(repairDate,repairSeqId);
            //     },100);
            //   }
            // }else{
            //   app.req.postRequest(api.updRepairCommon,{custId:custId,repairCommonId:repairCommonId}).then(res=>{
            //     console.log('常用频率数据维护结果',res);
            //     if(result == le){
            //       that.topage(repairDate,repairSeqId);
            //     }else{
            //       that.showLoading(1);
            //       setTimeout(function(){
            //         that.showLoading(0);
            //         that.topage(repairDate,repairSeqId);
            //       },100);
            //     }
            //   })
            // }
            this.toListPage();
          })
        }else{
          that.setData({ repair_button_disabled: false });
          Toast.alert({
            message:'报修申请失败,' + value.data.errDesc,
          })
        }
    });
  }
},


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // app.loading(),this.showLoading(1);
    // var selectedHouseId = options['selectedHouseId'];
    // var selectedHouseName = options['selectedHouseName'];
    // var grpName = options['grpName'];
    // var budName = options['budName'];
    // this.setData({
    //   selectedHouseId:selectedHouseId,
    //   selectedHouseName:selectedHouseName,
    //   grpName:grpName,
    //   budName:budName,
    // });

    // if(source && source == '1'){
    //   console.log('直接新建一个job');
    // }else{
    //   app.req.postRequest(api.queryDetail,{}).then(res=>{
    //     if(res.data.respCode == '000' && res.data.repairDate != null && res.data.repairDate != ''){
    //       wx.redirectTo({
    //         url: '../repairDetail/repairDetail?repairDate='+res.data.repairDate+'&repairSeqId='+res.data.repairSeqId,
    //       })
    //     }
    //   });
    // }

    //初始化选则的预期时间
    // this.initTime();
    // var datas = app.storage.getLoginInfo();
    // var myDate = new Date();
    // let hour = myDate.getHours();
    // let minit = myDate.getMinutes();

    // var time = datas.repairWorkTime;
    // let tel = datas.urgentTel;
    // if(time && time != ''){
    //   let h1 = time.substring(0,2);
    //   let m1 = time.substring(2,4);
    //   let h2 = time.substring(4,6);
    //   let m2 = time.substring(6,8);
    //   time = h1 +':'+ m1 +'~'+ h2 +':'+ m2;
    //   if((hour > h1 && hour < h2)||(hour == h1 && minit >= m1) || (hour == h2 && minit <= m2)){
    //     tel = datas.wkTimeTel;
    //   }
    // }
    // this.setData({
    //   repairWorkTime:time,
    //   tel:tel,
    //   obj:app.storage.getLoginInfo(),
    // });

    //获取报修常用描述
    //this.getDescList();

    //获取客户房屋列表
   // this.getHouseList();

    // console.log('obj is :',app.storage.getLoginInfo());
    //在进入该页面时，先清理图片缓存数据，微信缓存有上限，避免出现系统问题图片上传成功后,清除微信端的缓存图片数据
    //   wx.getSavedFileList({
    //     success (res) {
    //         res.fileList.forEach(obj=>{
    //             wx.removeSavedFile({
    //                 filePath: obj.filePath,
    //                 complete (res) {
    //                     console.log(res)
    //                 }
    //             })
    //         })
    //     }
    // })
    //this.showLoading(0);
  },



  //获取客户房屋列表
  getHouseList(){
    var data = {
      //cstCode:app.storage.getCstCode()
      //token:wx.getStorageSync(storage.STORAGE.TOKEN_KEY)
    }
   var token = new storage().getToken();
    app.req.postRequest(api.repairHouseList,data).then(res=>{
      let data = res.data;
      if(data.respCode == '000'){
        console.log('data===>',data);
        this.setData({
          selectcontent:data.data.list
        })
       console.log('selectcontent===>',this.data.selectcontent);
      }
    })
  },

  //获取常用报修描述语
  // getDescList(){
  //   app.req.postRequest(api.repairCommonList,{}).then(res=>{
  //     let data = res.data;
  //     if(data.respCode == '000'){
  //       console.log('data===>',data);
  //       let dataList = data.data;
  //       dataList.forEach(function(item) {
  //         // console.log(item);
  //         item['text'] = item.repairDesc;
  //     })
  //     console.log('dataList===>',dataList);
  //       this.setData({
  //         quickDesc:dataList
  //       })
  //     }
  //   })
  // },

  // //标地信息
  // getBiaoDiInfo(options){
  //   var objId = options['objId'];
  //   var custId = options['custId'];
  //   console.log('标地信息查询',custId,objId,options);
  //   if(objId && objId != ''){
  //     app.req.postRequest(api.queryPropObj,{custId:custId,objId:objId}).then(res=>{
  //       let data = res.data;
  //       if(data.respCode == '000'){
  //         let propObj = data.data;
  //         this.setData({
  //           bdObj:propObj,
  //           objId:objId,
  //         });
  //       }else{
  //         console.log('查询标地失败',res);
  //         console.log('查询标地失败',res);
  //           Toast.alert({message:data.errDesc}).then(()=>{
  //             wx.redirectTo({
  //               url: '../../../../pages/noauth/noauth?errDesc='+data.errDesc,
  //             })
  //           })
  //       }
  //     })
  //   }
  // },

  // //标地关闭
  // closeBiaoDi(){
  //   this.setData({
  //     bdObj:null,
  //     objId:'',
  //   })
  // },

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
    //   repairDesc = valueObj.text;
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


 // 下拉框收起和下拉
 changejiantou(){
  this.setData({
    isjiantou:!this.data.isjiantou
  })
},
// 选择数据后回显
changecontent(e){
  this.setData({
    value:e.currentTarget.dataset.datavalue.resName,
    valueid:e.currentTarget.dataset.datavalue.id,
    isjiantou:true
  })
}

  
})