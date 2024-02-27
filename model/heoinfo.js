const network = require('../utils/network.js');
const { tenThousandths2Percent } = require('../utils/stringUtil.js');

var app = getApp(),
p = require('../const/path.js'),
u = require('../utils/util'),
api = require('../const/api'),
st = require('../const/storage'),
util = require('../utils/util'),
n = null,
h ={
  init: function() {
    n = (0, u.getCurrentPage)();
  },
  initHeoTypeList:function(theme){
    n.showLoading(!0);
    network.RequestMQ.request({
      url:api.queryHeoTypeList,
      data:{
        stat:'N'
      },
      method:'POST',
      success:function(res){
        if(res.data.data != null && res.data.data.length >0){
          var heoTypeList = new Array();
          for(var dd in res.data.data){
            heoTypeList.push(res.data.data[dd])
          }
          if(theme && theme!= ''){
            for(var i in n.data.nOrGs){
              if(theme == n.data.nOrGs[i].needOrGive){
                n.setData({
                  nOrgIndex:i,
                  needOrGive:n.data.nOrGs[i].needOrGive
                })
                break;
              }
            }
            heoTypeList.unshift({heoType:'',heoTypeDesc:'请选择'});
            var checkOther = false;
            for(var j in heoTypeList){
              if(heoTypeList[j].heoType == '99'){
                checkOther = true;
                break;
              }
            }
            if(!checkOther){
              heoTypeList.push({heoType:'99',heoTypeDesc:'其他'});
            }
            if(theme != 'N' && theme != 'G'){
              for(var j in heoTypeList){
                if(heoTypeList[j].heoType == '99'){
                  n.setData({
                    heoTypeIndex:j,
                    heoType:'99',
                    heoTypeDisable:true
                  })
                  break;
                }
              }
            }else{
              n.setData({
                heoTypeDisable:false,
                heoTypeIndex:0,
                heoType:''
              })
            }
            n.setData({
              heoTypeList:heoTypeList
            })
          }else{
            var allCondition = n.data.selectTypeList
            if(allCondition && allCondition != null){
              heoTypeList.unshift(allCondition)
            }
            var heoTypeConditions = new Array();
            res.data.data.unshift({heoType:"",heoTypeDesc:'全部',select:true})
            for(var index in res.data.data){
              if(index % 2 == 0){
                res.data.data[index].flex = 'left'
              }else{
                res.data.data[index].flex = 'right'
              }
            }
            for(var i= 0 ; i < (res.data.data.length + 1)/2; i++){
              var heoTypeObj = {}
              heoTypeObj.id = i;
              var heoTypes = new Array()
              var k = 0;
              for(var d in res.data.data){
                var heoType = res.data.data[d]
                if(k==2){
                  continue;
                }
                if(!heoType.hasCheck){
                  k = k+1;
                  heoType.hasCheck = true;
                  heoTypes.push(heoType)
                }
                heoTypeObj.heoTypes = heoTypes;
              }
              heoTypeConditions.push(heoTypeObj)
            }
            n.setData({
              heoTypeList: heoTypeList,
              heoTypeConditions:heoTypeConditions
            })
          }
        }else{
          n.setData({
            heoTypeList: new Array(),
            heoTypeConditions:new Array()
          })
        }
      },
      fail:function(){

      },
      complete:function(){
        n.showLoading(!1)
      }
    })
  },
  initIsTopHeoInfos:function(){
    var heoType = n.data.heoType;
    var needOrGive = n.data.needOrGive;
    let that = this;
    var queryTopHeoInfosParams = {
      heoType:heoType ? heoType : '',
      stat:'N',
      needOrGive:needOrGive ? needOrGive : '',
      isTop:'Y'
    }
    n.showLoading(!0)
    network.RequestMQ.request({
      url:api.queryHeoInfos,
      data:queryTopHeoInfosParams,
      method:'POST',
      success:function(res){
        console.log(res)
        if(res.data.data != null && res.data.data.length >0){
          n.setData({
            isTopHeoInfos:res.data.data
          })
        }else{
          n.setData({
            isTopHeoInfos:new Array()
          })
        }
      },
      fail:function(fal){
        wx.showToast({
          title: fail.ERRDESC ? fail.ERRDESC : '获取置顶帖子信息失败',
          icon:'none',
          duration:3000
        })
      },
      complete:function(){
        that.queryHeoInfos()
      }
    })
  },
  queryHeoInfos:function(){
    var heoType = n.data.heoType ? n.data.heoType : '';
    var needOrGive = n.data.needOrGive ?  n.data.needOrGive : '';
    var queryHeoInfosParams = {
      heoType:heoType,
      needOrGive:needOrGive,
      stat:n.data.stat ? n.data.stat : '',
      isTop:n.data.isTop ? n.data.isTop : '',
      pageNum:n.data.pageNum,
      pageSize:n.data.pageSize,
      beginHeoDate:n.data.selStartDate ? n.data.selStartDate :'',
      endHeoDate:n.data.selEndDate ? n.data.selEndDate :'',
      queryType:n.data.queryType ? n.data.queryType : ''
    }
    n.showLoading(!0)
    network.RequestMQ.request({
      url:api.queryHeoInfos,
      data:queryHeoInfosParams,
      method:'POST',
      success:function(res){
        if(res.data.data != null && res.data.data.length >0){
          n.setData({
            heoInfos:n.data.isLoadingMoreData ? n.data.heoInfos.concat(res.data.data) : res.data.data
          })
        }
        console.log(res.data.hasMoreData)
        n.setData({
          hasMoreData:res.data.hasMoreData == 'Y' ? true : false,
          padding_bottom: n.data.iphoneX ? 34 : 0
        })
      },
      fail:function(fal){
        wx.showToast({
          title: '查询失败，请稍后再试',
          icon:'none',
          duration:3000
        })
      },
      complete:function(){
        n.setData({
          isLoadingMoreData:false,
          isRefreshing:false,
          iconName:"jia-zhankai" ,
          showSelectCondition:!1,
          queryFinish:true
        })
        n.showLoading(!1)
      }
    })
  },
  releaseHeoInfo:function(){
    console.log(n.data)
    var data = {};
    data.heoTitle = n.data.heoTitle;
    data.heoDesc = n.data.heoDesc;
    data.imgCnt = n.data.imgCnt;
    data.heoType = n.data.heoType;
    data.houseIsPub = 'N';
    data.isTop = n.data.isTop;
    data.needOrGive = n.data.needOrGive;
    n.showLoading(!0)
    network.RequestMQ.request({
      method:'POST',
      data:data,
      url:api.addHeoInfo,
      success:function(res){
        console.log("addHeoInfo 返回",res)
        if(res.data.RESPCODE == "000"
        && res.data.heoSeqId && res.data.heoSeqId != ''){
          var custId = app.globalData.userInfo.CUSTID;
          var heoDate = res.data.heoDate;
          var heoSeqId = res.data.heoSeqId;
          let stat = res.data.stat;
          var fileList = n.data.fileList;
          console.log(fileList)
          for(var i =0; i<fileList.length; i++){
            n.upload(fileList[i].url,api.imgUpload,
              {fileType:'LOG',busiDate:heoDate ,custId:custId, busiId :'02',busiSeqId:heoSeqId,imgId:i+1});
          }
          var prePage = util.getPrevPage()
          prePage.setData({
            showHeoTypeClass:false
          })
          wx.showToast({
            title:stat && stat == 'N' ?'发布成功...' : '发布成功，请等待审核...',
            icon: 'none',
            duration: 3000,
            success:function(){
              setTimeout(function(){
                if(prePage.route == 'subpages/heo/heopost/heopost'){
                  wx.redirectTo({
                    url: '/subpages/heo/mineRelease/mineRelease?type=release',
                  })
                }else{
                  wx.navigateBack({
                    delta: 1
                  })
                  prePage.onLoad({type:'release'})
                }
              },3000)
            }
          })
        }else{
          wx.showToast({
            title: '发布失败，'+res.data && res.data.ERRDESC ? res.data.ERRDESC :'',
            icon:'none',
            duration:3000
          })
        }
      },
      fail:function (res) {
        wx.showToast({
          title: '发布失败，'+res.data && res.data.ERRDESC ? res.data.ERRDESC :'',
          icon:'none',
          duration:3000
        })
      },
      complete:function (params) {
        n.showLoading(!1);
      }
    })
  },
  updHeoInfo:function(heoInfo,oper){
    n.showLoading(!0)
    network.RequestMQ.request({
      url:api.updateHeoInfo,
      data:heoInfo,
      method:'POST',
      success:function(res){
        console.log(res)
        wx.showToast({
          title: oper + '帖子成功',
          icon:'none',
          duration:3000,
          success:function(){
            var heoInfos = n.data.heoInfos
            if(!heoInfos || heoInfos.length <1){
              var heoInfo2 = n.data.heoInfo
              if(heoInfo.stat){
                heoInfo2.stat = heoInfo.stat
              }
              if(heoInfo.isTop){
                heoInfo2.isTop = heoInfo.isTop
              }
              if(heoInfo.stat == 'R'){
                heoInfo2.refuseDesc = heoInfo.refuseDesc
              }
              n.setData({
                heoInfo:heoInfo2,
                refuseDesc:''
              })
            }else{
              for(var i in heoInfos){
                var heoInfo2 = heoInfos[i]
                if(heoInfo.heoDate == heoInfo2.heoDate
                  && heoInfo.heoSeqId == heoInfo2.heoSeqId){
                    if(heoInfo.stat){
                      heoInfo2.stat = heoInfo.stat
                    }
                    if(heoInfo.isTop){
                      heoInfo2.isTop = heoInfo.isTop
                    }              
                    if(heoInfo.stat == 'R'){
                      heoInfo2.refuseDesc = heoInfo.refuseDesc
                    }
                  }
              }
              n.setData({
                heoInfos:heoInfos
              })
            }
          }
        })
      },
      fail:function(res){
        if(oper == '置顶'
        && res.data.ERRDESC && res.data.ERRDESC != ''){
          wx.showToast({
            title: res.data.ERRDESC,
            icon:'none',
            duration:3000
          })
        }else{
          wx.showToast({
            title: oper + '帖子失败',
            icon:'none',
            duration:3000
          })
        }
      },
      complete:function(){
        n.showLoading(!1)
        n.setData({
          refuseDesc:'',
          showRefuseDescInput:!1,
          refuseHeoDate:'',
          refuseHeoSeqId:''
        })
      }
    })
    
  },
  initHeoDtlInfos:function(heoDate,heoSeqId,queryType){
    var that = this;
    n.showLoading(!0)
    network.RequestMQ.request({
      url:api.queryHeoInfos,
      data:{      
        heoDate:heoDate,
        heoSeqId:heoSeqId,
        queryType:queryType
      },
      success:function(res){
        if(res.data.data && res.data.data.length >0){
          var heoInfo = res.data.data[0];
          n.setData({
            heoInfo:heoInfo,
            heoDtlInfos:res.data.data[0].heoDtlDtos ? res.data.data[0].heoDtlDtos : new Array()
          })
          if(heoInfo.usrType == 'P'){
            that.queryHeoPraiseList();
          }
        }
        var query = wx.createSelectorQuery();
        query.select('#heoInfoItem').boundingClientRect(rect=>{
          let height = rect.height;
          n.setData({
            itemHeight : height
          })
        }).exec();
      },
      fail:function(){

      },
      complete:function(){
        n.showLoading(!1)
      }
    })
  },
  saveHeoDtlInfo:function(){
    var that = this;
    var data = {},
    heoInfo = n.data.heoInfo;
    data.heoDate = heoInfo.heoDate
    data.heoSeqId = heoInfo.heoSeqId
    data.rlsSeqId = heoInfo.usrSeqId
    data.msgBody = n.data.inputMsg
    data.msgType = 'T'
    data.replySeqId = n.data.replySeqId
    network.RequestMQ.request({
      url:api.addHeoDtl,
      method:'POST',
      data:data,
      success:function(){
        n.setData({
          inputMsg:'',
          showMsgInput:!1,
          focus:false
        })
        that.initHeoDtlInfos(data.heoDate,data.heoSeqId,'');
      },
      fail:function(){
        wx.showToast({
          title: '留言失败，请稍后重试',
          icon:'none',
          duration:3000
        })
      },
      complete:function(){
        n.showLoading(!1)
      }
    })
  },
  updHeoDtlInfo:function(heoDtlInfo,refresh){
    var that = this;
    n.showLoading(!0)
    network.RequestMQ.request({
      url:api.updHeoDtlInfo,
      method:'POST',
      data:heoDtlInfo,
      success:function(){
        if(refresh){
          that.initHeoDtlInfos(heoDtlInfo.heoDate,heoDtlInfo.heoSeqId,'');
        }
      },
      fail:function(){
        wx.showToast({
          title: '删除留言失败，请稍后再试。',
          icon:'none',
          duration:3000
        })
      },
      complete:function(){
        n.showLoading(!1)
      }
    })
  },
  queryHeoPraiseList:function(){
    n.showLoading(!0)
    var params = {
      heoDate:n.data.heoDate,
      heoSeqId:n.data.heoSeqId,
      pageNum:n.data.pageNum,
      pageSize:n.data.pageSize
    }
    console.log(params)
    network.RequestMQ.request({
      url:api.queryHeoPraiseList,
      data:params,
      success:function(res){
        if(res.data && res.data.heoPraiseListDtos){
          n.setData({
            heoPraiseListDtos: n.data.heoPraiseListDtos.concat(res.data.heoPraiseListDtos),
            hasMoreData:res.data.totalNum > n.data.pageNum * n.data.pageSize ? true : false,
            totalNum:res.data.totalNum
          })
        }
      },
      fail:function(){

      },
      complete:function(){
        n.showLoading(!1)
        n.setData({
          isLoadingMoreData:false,
          isRefreshing:false,
          isHideLoadMore:true
        })
      }
    })
  }
}

module.exports = {
  heoinfo: h
};