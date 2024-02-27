Component({
  /**
   * 组件的属性列表
   */
  properties: {
    uploaderList: {
      type: Array,
      value: []
    },
    compressList: {
      type: Array,
      value: []
    },
    uploaderNum: {
      type: Number,
      value: 0
    },
    desc: {
      type: String,
      value: '最多上传3张照片。'
    },
    title: {
      type: String,
      value: '上传照片'
    },
    type: {
      // false 开启图文咨询  补充咨询
      type: Boolean,
      value: false
    }
  },

  data: {
    // uploaderList: [],
    // compressList:[],
    // uploaderNum: 0,
    showUpload: true,
    uploaderNowNum: 0,
    piccount: 3,
    delindex: -1,
    cwidth: '',
    cheight: '',
    currentImg: -1,
  },
  methods: {
    // 删除图片
    clearImg: function (e) {
      let that= this;
      var nowList = []; //新数据
      var nowBase64List=[];
      var base64list= that.data.compressList; 
      var uploaderList = that.data.uploaderList; //原数据
      for (let i = 0; i < uploaderList.length; i++) {
        if (i == e.currentTarget.dataset.index) {
          continue;
        } else {
          nowList.push(uploaderList[i]);
          nowBase64List.push(base64list[i]);
          continue;
        }
      }
      this.setData({
        uploaderNum: this.data.uploaderNum - 1,
        uploaderList: nowList,
        compressList: nowBase64List,
        showUpload: true,
      });
      this.triggerEvent('getUploaderList', {
        uploaderList: nowList,
        compressList: nowBase64List,
      });
    },
    //展示图片
    showImg: function (e) {
      var that = this;
      wx.previewImage({
        urls: that.data.uploaderList,
        current: that.data.uploaderList[e.currentTarget.dataset.index]
      })

    },
    //上传图片
    upload: function (e) {
      var that = this;
      //that.compressList = new Array(that.piccount);
      wx.chooseMedia({
        count: 1, // 默认4
        mediaType: ['image'],
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          that.setData({
            currentImg: that.data.currentImg + 1
          })
          let uploaderList = that.data.uploaderList.concat(res.tempFiles[0].tempFilePath);
          if (!that.properties.type) {
            //开启图文咨询
            if (uploaderList.length == that.data.piccount) {
              that.setData({
                showUpload: false
              })
            }
            that.setData({
              uploaderList: uploaderList,
              uploaderNum: uploaderList.length,
            })
            that.compress_img(res.tempFiles[0].tempFilePath, that.data.currentImg)
          } else {
            // 补充咨询
            if (uploaderList.length + that.properties.uploaderNum === that.data.piccount) {
              that.setData({
                showUpload: false
              })
            }
            that.setData({
              uploaderList: uploaderList,
              uploaderNowNum: uploaderList.length + that.properties.uploaderNum
            })
            that.triggerEvent('getUploaderList', {
              uploaderList: uploaderList,
              uploaderNowNum: that.data.uploaderNowNum
            })
          }
        }
      })
    },
    compress_img(url) {
      let that = this
      console.log("选择图片返回的路径", url)
      wx.getImageInfo({
        src: url,
        success(res) {
          console.log("路径", res.path)
          console.log('获得原始图片大小', res.width, res.height)
          var originWidth, originHeight;
          originHeight = res.height;
          originWidth = res.width;
          // 最大尺寸限制   //压缩比例
          var maxWidth = originWidth >= originHeight ? 768 : 1280,
            maxHeight = originWidth >= originHeight ? 1280 : 768;
          // 目标尺寸
          var targetWidth = originWidth,
            targetHeight = originHeight;
          //等比例压缩，如果宽度大于高度，则宽度优先，否则高度优先
          if (originWidth > maxWidth || originHeight > maxHeight) {
            if (originWidth / originHeight > maxWidth / maxHeight) {
              // 要求宽度*(原生图片比例)=新图片尺寸
              targetWidth = maxWidth;
              targetHeight = Math.round(maxWidth * (originHeight / originWidth));
            } else {
              targetHeight = maxHeight;
              targetWidth = Math.round(maxHeight * (originWidth / originHeight));
            }
          }
          console.log("压缩后的图片大小", targetWidth, targetHeight)
          console.log("上传图片", res.path)
          //更新canvas大小
          that.setData({
            cwidth: targetWidth,
            cheight: targetHeight
          });
          that.drawPic(that.data.cheight, that.data.cwidth, res.path);
        }
      })

    },
    drawPic(h, w, path) {
      let that = this;
      const query = that.createSelectorQuery();
      query
        .select('#photo_canvas')
        .fields({ id: true,  node: true,  size: true  })
        .exec((res) => {
          const canvas = res[0].node;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          const canImg = canvas.createImage();
          ctx.clearRect(0, 0, w, h)
          canImg.src = path;
          
            canImg.onload = () => {
              console.log("进入onload");
              ctx.save();
              ctx.drawImage(canImg, 0, 0, w,h);
              setTimeout(function () {
                wx.canvasToTempFilePath({
                  canvas: canvas,  x: 0, y: 0,
                  destWidth:w,  destHeight:h,  fileType: "jpg",
                  quality: 1, //最高质量，只通过尺寸放缩去压缩，画的时候都按最高质量来画
                  success: (res) => {
                    console.info("压缩后路径", String(res.tempFilePath));
                    var base64 = wx.getFileSystemManager().readFileSync(res.tempFilePath, 'base64');
                    let comlist= that.data.compressList.concat(base64);
                    that.setData({
                      compressList: comlist,
                    })
                    that.triggerEvent('getUploaderList', {
                      uploaderList: that.data.uploaderList,
                      compressList: that.data.compressList
                    })
                  },
                  fail: (err) => {
                    console.error(err)
                  }
                }, that)
              }, 1000);
            };

    

        })
    }
  }
})