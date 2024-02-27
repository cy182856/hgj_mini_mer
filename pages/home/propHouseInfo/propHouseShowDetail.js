const app = getApp(),
api = require("../../../const/api"),
netWork = require("../../../utils/network"),
constData = require("./houseConst");
import Toast from '../../../miniprogram_npm/@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    'isLoading':true,
    'pic_flex':'flex-start',
    'isShowDialog':false,
    'choosedIndex':-1,//默认没长按选择一个

    fileList:[],
    // 最大照片数量的限制
    imgnum: 6,
    disabled: true,
    elements: [],
    hidden: true,
    flag: false,
    x: 0,
    y: 500,
    uploadPicKind: ''
  },
  // 获取图片的信息（位置信息）
  getElements(){
    let that=this;
    var query = wx.createSelectorQuery();
    var nodesRef = query.selectAll(".uploadPic-li-pic");
    nodesRef.fields({
      dataset: true,
      rect: true
    }, (result) => {
      for (var i = 0; i < result.length; i++) {
        result[i].dataset['index'] = i
      }
      that.setData({
        elements: result
      });
    }).exec();
  },
   /*****
   * 上传图片
   ********/
  uploadpic: function(e) {
    let that=this;
    var tempFilePaths = new Array();
    let num = that.data.imgnum - that.data.fileList.length;
    wx.chooseImage({
      count: num, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var path = res.tempFiles;
        for (var i in res.tempFiles) {
          /**** 这里如果换为了服务器的，这里的 upload_percent 就得写为0，土武器上传完毕会改为对应的进度****/
          // path[i]['upload_percent'] = 100;
          let fileType=path[i].path.substring(path[i].path.lastIndexOf("."));
          console.log("fileType=="+fileType);
          if(fileType!='.jpeg'&&fileType!='.jpg'&&fileType!='.png'&&fileType!='.bmp'){
            that.setData({'isShowDialog':true,'showDialogDesc':'选择上传的图片格式不支持，请选择(.jpeg/.jpg/.png/.bmp)格式的图片。'});
            return ;
          }
          path[i]['src'] = path[i];
          path[i]['iserror'] = 0;
          path[i]['errormsg'] = '';
          tempFilePaths.push(path[i]);
        }
        that.choseImage(tempFilePaths);
        that.setData({'pic_flex':'center'});   
        that.isCanUpload=true;
      }
    })
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
          img['path'] = path;
          img['imageUrl'] = path;
          img['orgIndex'] = -1;
          temp.push(img);
          that.setData({
            fileList: temp
          },() => {
            that.getElements()
          });
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
                    img['path'] = res.tempFilePath;
                    img['imageUrl'] = res.tempFilePath;
                    img['orgIndex'] = -1;
                    temp.push(img);
                    that.setData({
                      fileList: temp
                    },() => {
                      that.getElements()
                    });
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
      },complete:function(){
      }
    })
  },
 
  /*****
   * 删除图片
   ********/
  delimg: function(e) {
    let that=this;
    var datalist = that.data.fileList;
    var thiskey = e.currentTarget.dataset.keyindex;
    wx.getSavedFileList({
      success (res) {
        if (res.fileList.length > 0){
          wx.removeSavedFile({
            filePath: datalist[thiskey].path,
            complete (res) {
              console.log(res)
            }
          })
        }
      }
     })
    datalist.splice(thiskey, 1);
    if(datalist.length==0){
      that.setData({'pic_flex':'flex-start', fileList: datalist});
    }else{
      that.setData({'pic_flex':'center', fileList: datalist});
    }
    this.isCanUpload=true;
    this.getElements();
  },
  // 完成按钮
  uploadPicFinshed() {
    let that=this;
    // 点击完成后的动作
    // var fileList = that.data.fileList;
    // if(fileList.length==0){
    //   that.setData({'isShowDialog':true,'showDialogDesc':'请选择需要上传的图片'});
    // }else{
    //   if(this.isCanUpload){//图片有改动时
    //     this.showLoading(!0);
    //     //计算总文件的大小
    //   }else{
    //     that.setData({'isShowDialog':true,'showDialogDesc':'图片上传成功'});
    //   }
    // }
    this.showLoading(!0);
    this.doUpLoadFile();
    this.isCanUpload=false;
  },
 
  // 拖拽逻辑
  //长按
  _longtap: function(e) {
    wx.vibrateShort({
      'type':'heavy'
    });
    var maskImg = e.currentTarget.dataset.img;
     
    this.setData({
      maskImg: maskImg
    });
 
    this.setData({
      x: e.currentTarget.offsetLeft,
      y: e.currentTarget.offsetTop
    })
    this.setData({
      hidden: false,
      flag: true,
      'choosedIndex':e.currentTarget.dataset.index
    })
  },
  //触摸开始
  touchs: function(e) {
    this.eIndex=e.currentTarget.dataset.index;
    this.setData({
      beginIndex: e.currentTarget.dataset.index
    })
  },
  //触摸结束
  touchend: function(e) {
    const x = e.changedTouches[0].pageX
    const y = e.changedTouches[0].pageY
   
    this.setData({
      hidden: true,
      flag: false,
      maskImg:'',
      x: 0,
      y: 500,
      'choosedIndex':-1
    })
  },
  //滑动
  touchm: function(e) {
    if (this.data.flag) {
      const x = e.touches[0].pageX;
      const y = e.touches[0].pageY;
      this.setData({
        x: x-85,
        y: y-215
      });

      const list = this.data.elements;
      let data = this.data.fileList;
      for (var j = 0; j < list.length; j++) {
        const item = list[j];
        if (x > item.left && x < item.right && y > item.top && y < item.bottom) {
          if(item.dataset.index==this.eIndex){
            return;
          }
          this.isCanUpload=true;
          const beginIndex = this.eIndex;
          const endIndex = item.dataset.index;
          this.eIndex=endIndex;//避免一直更新数值
          // const beginIndex = this.data.beginIndex;
          //向后移动
          if (beginIndex < endIndex) {
            let tem = data[beginIndex];
            for (let i = beginIndex; i < endIndex; i++) {
              data[i] = data[i + 1]
            }
            data[endIndex] = tem;
          }
          //向前移动
          if (beginIndex > endIndex) {
            let tem = data[beginIndex];
            for (let i = beginIndex; i > endIndex; i--) {
              data[i] = data[i - 1]
            }
            data[endIndex] = tem;
          }
          this.setData({
            fileList: data,
            'choosedIndex':this.eIndex
          });
        }
      }
    }
 
  },
  previewImg:function(event){
    var src = event.currentTarget.dataset.limg;//获取data-src
    let imgList=[];
    for(let index in this.data.fileList){
      imgList.push(this.data.fileList[index].path);
    }
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
    this.setData({
      'choosedIndex':-1
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.loading(), this.showLoading(!1);
    let showId=options.showId;
    this.isCanUpload=false;
    this.eIndex='';
    this.showId=showId;
    this.pageNum=1;
    this.pageSize=5;
    let iphone = app.globalData.iphone;
    if (iphone) {
      this.setData({
        btuBottom: '68rpx',
      })
    }
    this.requestPropHouseShow();
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
  requestPropHouseShow:function(){
    this.showLoading(!0);
    var data = {
      'CUSTID': app.globalData.userInfo.CUSTID,
      // 'CUSTID': '3048000060',
      'SHOWID':this.showId,
      'PAGENUM':this.pageNum,
      'PAGESIZE':this.pageSize 
    };
    var that = this;
    netWork.RequestMQ.request({
      url: api.queryPropHouseShowInfo,
      method: 'POST',
      data: data,
      success: (res) => {
        if (res.data.RESPCODE == '000') { 
          if(res.data.TOTALRECORD!='1'){
            that.setData({'PROPHOUSESHOWDTO':''});  
          }else{ 
            if(res.data.PROPHOUSESHOWDTOS[0].IMGCNT<1){
              that.setData({'PROPHOUSESHOWDTO':res.data.PROPHOUSESHOWDTOS[0],'imgnum':res.data.PROPHOUSESHOWDTOS[0].MAXUPLOADIMGCNT,'pic_flex':'flex-start','fileList':res.data.PROPHOUSESHOWDTOS[0].IMAGEURLS,'statChecked':false}); 
            }else{
              let imgs=[];
              let imageUrls=res.data.PROPHOUSESHOWDTOS[0].IMAGEURLS;
              var result=Promise.all(imageUrls.map((imageUrl, index) => {
                return new Promise(function (resolve, reject) {
                    wx.downloadFile({
                    'url':imageUrl,
                    success(res){
                      let fileInfo={};
                      fileInfo.path=res.tempFilePath;
                      fileInfo.imageUrl=imageUrl;
                      fileInfo.orgIndex=index;
                      resolve(fileInfo);
                    },
                    fail: function (err) {
                      console.log(err)
                      reject(new Error('failed to upload file'));
                    }
                    });
                  });
                }));
                result.then(function(results){
                   for(let k=0;k<results.length;k++){
                    let img={};
                    img.path=results[k].path;
                    img.imageUrl=results[k].imageUrl+"?t="+new Date().getTime();
                    img.orgIndex=results[k].orgIndex;
                    imgs[k]=img;
                   }
                   that.setData({'fileList':imgs}); 
                   that.getElements();
                }).catch(function (err) {
                  that.setData({'isShowDialog':true,'showDialogDesc':'文件加载失败,请稍后再试'});
                  that.showLoading(!1);
                });
                let statChecked=res.data.PROPHOUSESHOWDTOS[0].STAT=='N'?false:true;
                that.setData({'PROPHOUSESHOWDTO':res.data.PROPHOUSESHOWDTOS[0],'imgnum':res.data.PROPHOUSESHOWDTOS[0].MAXUPLOADIMGCNT?res.data.PROPHOUSESHOWDTOS[0].MAXUPLOADIMGCNT:6,
                'pic_flex':'center','statChecked':false}); 
            }
          }       
        } else {
          //接口返回错误
          wx.showToast({
            title: res.data.ERRDESC + '[' + res.data.RESPCODE + ']',
            icon: 'none'
          })
        }
      }, fail: function (res) {
        wx.showToast({
          title: res && res.data && res.data.ERRDESC ? res.data.ERRDESC : "网络繁忙,请稍后再试",
          icon: 'none'
        })
      },
      complete: function () {
        that.showLoading(!1);
        that.setData({'isLoading':false});
      }
    });
  },
  updateImgCnt:function(){
    let stat=this.data.PROPHOUSESHOWDTO.STAT;
    if(this.data.statChecked){
      if(stat=='N'){
        stat='C';
      }else{
        stat='N';
      }
    }
    var data = {
      'CUSTID': app.globalData.userInfo.CUSTID,
      //'CUSTID': '3048000060',
      'SHOWID':this.showId,
      'IMGCNT':this.data.fileList.length,
      'STAT':stat
    };
    var that = this;
    netWork.RequestMQ.request({
      url: api.updPropHouseShowInfo,
      method: 'POST',
      data: data,
      success: (res) => {
        if (res.data.RESPCODE == '000') { 
          that.setData({'isShowDialog':true,'showDialogDesc':'保存成功'});
        } else {
          //接口返回错误
          wx.showToast({
            title: res.data.ERRDESC + '[' + res.data.RESPCODE + ']',
            icon: 'none'
          })
        }
      }, fail: function (res) {
        wx.showToast({
          title: res && res.data && res.data.ERRDESC ? res.data.ERRDESC : "网络繁忙,请稍后再试",
          icon: 'none'
        })
      },
      complete: function () {
        that.showLoading(!1);
        that.requestPropHouseShow();
      }
    });
  },
  doUpLoadFile:function(){
    let that=this;
    let imageUrls = that.data.fileList.filter( function(url,index) {
       if(url.orgIndex==-1||url.orgIndex!= index ){
        url.curIndex=index;
        return  url;
       }
    });
   
    if(imageUrls.length==0){
      that.updateImgCnt();
      return;
    }
    var result=Promise.all(imageUrls.map((imageUrl, index) => {
         return new Promise(function (resolve, reject) {  
          let data={
            'custId':app.globalData.userInfo.CUSTID,
            // 'custId':'3048000060',
            'busiId':constData.houseBusiId.busiId_02,//房屋租赁的业务类型
            'imgId':that.showId+"00"+(imageUrl.curIndex+1),
            'fileType':constData.fileType,//日志类文件类型
          };  
          let filePath= imageUrl.path.substring(0,imageUrl.path.lastIndexOf("?")==-1?imageUrl.path.length:imageUrl.path.lastIndexOf("?"));
          wx.uploadFile({
            url: api.imgUpload, //仅为示例，非真实的接口地址
            filePath: filePath,
            name: 'file',
            header: {
              "Content-Type": "multipart/form-data",
              'accept': 'application/json'
            },
            formData:data,
            success (res){
              resolve(res.data);
            },
            fail: function (err) {
              console.log(err)
              reject(new Error('failed to upload file'));
            }
          })
         })
        })
      );
      result.then(function(results){
        that.updateImgCnt();
      }).catch(function (err) {
        console.log(err);
        that.setData({'isShowDialog':true,'showDialogDesc':'图片上传失败,请稍后再试'});
        that.showLoading(!1);
      });
  },
  changeHouseShowStat:function(event){
    this.isCanUpload=true;
    this.setData({ statChecked: event.detail });
  },
  closeInstru:function(){
    this.setData({'isShowDialog':false});
  }
})