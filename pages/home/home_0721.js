// pages/home/home.js
const app = getApp(),
api = require("../../const/api"),
userInfo = require("../../model/userInfo"),
storage = require("../../const/storage"),
netWork = require("../../utils/network"),
util = require("../../utils/util"),
respCode = require("../../const/respCode");
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tablist: [{
      "text": "工作台",     
      "iconPath": '/images/home.png',
      "selectedIconPath": '/images/home-select.png'
    },
    {
      "text": "我的",
      "iconPath": '/images/mine.png',
      "selectedIconPath": '/images/mine-select.png'
      }], 
    active:0,
    showPost:!1,
    functionShow:[],
    functions:[
      {topic:"报修管理",isShow:false,id:'1',authId:['104000'],funs:[{id:'1',authId:'104003',name:"接单",hasAuth:false,imgsrc:'/images/104003.png',url: '/subpages/repair/pages/orders/orders'},
          {id:'2',authId:'104005',name:"派单",hasAuth:false,imgsrc:'/images/104002.png',url: '/subpages/repair/pages/dispatch/dispatch'},
          {id:'3',authId:'104004',name:"我维修的",hasAuth:false,imgsrc:'/images/104004.png',url: '/subpages/repair/pages/myrepair/myrepair'},
          {id:'4',authId:'104007',name:"报修查询",hasAuth:false,imgsrc:'/images/104001.png',url: '/subpages/repair/pages/queryRepair/queryRepair'}
       ]},
      {topic:"问卷通知",isShow:false,authId:['105000','108000'],id:'2',funs:[
            { id: '1', authId:'108003', name: "通知到户", hasAuth: false, imgsrc: '/images/108003.png', url: '/subpages/humsgspecified/masssendhumsg/massSendHuMsg'},
            { id: '2', authId:'108004', name: "我的通知", hasAuth: false, imgsrc: '/images/108004.png', url: '/subpages/humsgspecified/humsgloglist/huMsgLogList'},
            { id: '3', authId:'108005', name: "通知查询", hasAuth: false, imgsrc: '/images/108002.png', url: '/subpages/humsg/humsgloglist/huMsgLogList'},
            { id: '4', authId:'108006', name: "通知发送", hasAuth: false, imgsrc: '/images/108001.png', url: '/subpages/humsg/masssendhumsg/massSendHuMsg'},
            { id: '5', authId:'105004', name: "问卷查询", hasAuth: false, imgsrc: '/images/105001.png', url: '/pages/commingsoon/commingsoon'},
            { id: '6', authId:'105005', name: "问卷发布", hasAuth: false, imgsrc: '/images/105002.png', url: '/pages/commingsoon/commingsoon'}
          ]},
          {topic:"房屋管理",isShow:false,id:'3',authId:['102000'],funs:[
            {id:'1',authId:'102007',name:"入住管理",hasAuth:false,imgsrc:'/images/102002.png',url: '/pages/home/ownerManage/ownerManage?type=1'},
            {id:'2',name:"房屋查询",authId:'102008',hasAuth:false,imgsrc:'/images/102003.png',url: '/pages/home/ownerManage/ownerManage?type=2'},
            //{id:'3',name:"缴费录入",authId:'102001',hasAuth:false,imgsrc:'/images/102003.png',url: '/subpages/pfeebillload/pbladd/pblAdd'},
            {id:'2',name:"出入认证",authId:'102004',hasAuth:false,imgsrc:'/images/102004.png',url: ''},
            { id:'3',name:"远程开门",authId:'102005',hasAuth:false,imgsrc: '/images/102005.png', url: '/subpages/remotedoor/doorList/doorList'},
            { id:'4',name:"扫码开门",authId:'102006',hasAuth:false,imgsrc: '/images/102006.png', url: '/subpages/remotedoor/qrCode/qrCode'}

        ]},

        {topic: "其他功能", id: '4', authId:['103000','107000','110000','112000','113000','117000','118000'], isShow: false, funs: [{ id: '1',authId:'103005', name: "预约查询", hasAuth: false, imgsrc: '/images/103004.png', url: '/subpages/appt/appt_timeDtl_query' },
          ,{ id: '2', authId:'110003', name: "访客管理", hasAuth: false, imgsrc: '/images/110001.png', url: '/subpages/visit/visitInfo/visitInfo'}  
          ,{ id: '3', authId:'107005', name: "邻里圈", hasAuth: false, imgsrc: '/images/107001.png', url: '/subpages/heo/heoaudit/heoinfo'}
          ,{ id: '4',authId:'', name: "便民信息", hasAuth: false, imgsrc: '', url: '../home/wuyeInfo/wuyeInfo'},
            { id: '5',authId:'112003', name: "房屋租售", hasAuth: false, imgsrc: '/images/112001.png', url: '../home/propHouseInfo/propHouseShow'},
            { id: '6',authId:'113003', name: "问题反馈", hasAuth: false, imgsrc: '/images/113001.png', url: ''}
          ,{ id: '7',authId:'117001', name: "充电桩", hasAuth: false, imgsrc: '/images/117000.png', url: '/subpages/charge/chargeManager/chargeManager'},
          {id:'8',name:"门禁管理",authId:'118001',hasAuth:false,imgsrc:'/images/home/icon_acmag.png',url: ''}
        ]}],
        showChooseType:false,
        showQucikCodeInput:false,
        propTop:'30%',
        panel_width:'80%',
        column_num:3
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    new app.userInfo(),app.toastComponent(),app.loading(),this.showLoading(!1);
    this.hgjWyModuleId= options && options.hgjWyModuleId ? options.hgjWyModuleId : '';//需要跳转页面时使用
    if(this.hgjWyModuleId&&this.hgjWyModuleId!=''){
      this.jumpPageParam='';
      this.packageJumpParam(options);
    }
    this.jsonParam= options &&  options.jsonParam ? options.jsonParam : '';
    if(!that.isUserLogined()){
      that.showLoading(!0);
      userInfo.Login().then(res =>{
        console.log(res)
        wx.setNavigationBarTitle({
          title: '智慧管家',
        })
        if(res.data && res.data.RESPCODE == respCode.RESP_CODE.SUCCESS){
          that.setData({
            userInfo: getApp().globalData.userInfo
          })
          that.initMain();
        }else{
          Dialog.alert({
            title: '提示',
            message: res.msg ? "登录失败":res.msg,
          }).then(() => {
            that.setData({
              active:1
            })
          });
        }
        that.showLoading(!1);
      }).catch(error =>{
        console.log(error)
        that.showLoading(!1);
        if(error.msg && error.msg != ''){
          Dialog.alert({
            title: '提示',
            message: error.msg,
          }).then(() => {
            util.redirectToErrorPage("sys_error",error.msg);
          });
        }else{
          wx.setNavigationBarTitle({
            title: '智慧管家(未连接)',
          })
        }
      })
      this.setData({
        functionShow:this.data.functions
      })
    }else{
      that.setData({
        userInfo: getApp().globalData.userInfo
      })
      that.initMain();
    }
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
    this.onLoad()
    wx.stopPullDownRefresh()
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

  onItemClick:function(e){
    console.log("onItemClick",JSON.stringify(e.currentTarget.dataset.func))
    var that = this; 
    var item = e.currentTarget.dataset.func;
    if(item){
      if(item.authId == '102004'){
        that.setData({
          popupTitle:'出入认证',
          showChooseType:true,
          panel_width:'60%',
          column_num:2,
          types:[
            {id:0,typeDesc:'出行码认证',image:'/images/home/house-usr.png',url:"/subpages/checkcode/checkcode/checkcode?codeType=U&title=出行码认证"}
            ,{id:1,typeDesc:'不显示',image:'/images/home/black.png',url:''}
            ,{id:2,typeDesc:'访客码入场',image:'/images/home/visit-code-in.png',url:"/subpages/checkcode/checkcode/checkcode?checkType=S&visitType=I&codeType=V&title=访客码入场"} 
            ,{id:3,typeDesc:'访客码离场',image:'/images/home/visit-code-out-.png',url:"/subpages/checkcode/checkcode/checkcode?checkType=S&visitType=O&codeType=V&title=访客码离场"}
            ,{id:4,typeDesc:'快速码入场',image:'/images/home/visit-quick-in.png',url:"/subpages/checkcode/checkcode/checkcode?checkType=Q&visitType=I&codeType=V&title=快速码入场"}
            ,{id:5,typeDesc:'快速码离场',image:'/images/home/visit-quick-out.png',url:"/subpages/checkcode/checkcode/checkcode?checkType=Q&visitType=O&codeType=V&title=快速码离场"}]
        })
      }else if(item.authId == '107005'){
        if(this.data.check107005
          && this.data.check107005){
            that.setData({
              popupTitle:'邻里圈',
              showChooseType:true,
              panel_width:'80%',
              column_num:3,
              types:[{id:1,typeDesc:'发布',image:'/images/heo/release2.png',url:'/subpages/heo/heopost/heopost'}
                ,{id:2,typeDesc:'审核',image:'/images/heo/audit.png',url:'/subpages/heo/heoaudit/heoinfo'}]
            })
          }else if(this.data.check107005){
            wx.navigateTo({
              url: '/subpages/heo/heopost/heopost',
            })
          }else{
            wx.navigateTo({
              url: '/subpages/heo/heoaudit/heoinfo',
            })
          }
      }else if(item.authId == '110003'){
        if(this.data.check110003
          && this.data.check110002){
            that.setData({
              popupTitle:'访客管理',
              showChooseType:true,
              panel_width:'80%',
              column_num:3,
              types:[{id:1,typeDesc:'访客单查询',image:'/images/home/visit.png',url:'/subpages/visit/visitInfo/visitInfo'}
                ,{id:2,typeDesc:'出入记录',image:'/images/home/visitinout.png',url:'/subpages/visit/visitInoutLogs/visitInoutLogs'}]
            })
          }else if(this.data.check110003){
            wx.navigateTo({
              url: '/subpages/visit/visitInfo/visitInfo',
            })
          }else{
            wx.navigateTo({
              url: '/subpages/visit/visitInoutLogs/visitInoutLogs',
            })
          }
      }else if(item.authId == '113003'){
        var questionFbAuth = that.data.questionFbAuth;
        if(questionFbAuth.length > 1){
          var types = new Array();
          for(var i in questionFbAuth){
            let source = questionFbAuth[i].authId;
            var type = {};
            type.id = i;
            type.typeDesc = questionFbAuth[i].authName;
            type.image = '/images/home/' + source + '.png';
            type.url = '/subpages/advice/queryAdviceList/queryAdviceList?source=' +  source;
            types.push(type);
          }
          that.setData({
            popupTitle:'问题反馈',
            showChooseType:true,
            panel_width:'80%',
            column_num:3,
            types:types
          })
        }
        
        else{
          let source = questionFbAuth[0].authId;
          wx.navigateTo({
            url: '/subpages/advice/queryAdviceList/queryAdviceList?source=' +  source
          })
        }
      }else if(item.authId =='118001'){
        console.log("item ",item)
        that.setData({
          popupTitle:'门禁管理',
          showChooseType:true,
          panel_width:'60%',
          column_num:2,
          types:[
            {id:0,typeDesc:'连接设备',image:'/images/home/icon_ac_conn.png',url:"/subpages/acmanager/acConnect"}
           
            ,{id:2,typeDesc:'设备查询',image:'/images/home/icon_devlist.png',url:"/subpages/acmanager/acDevList"} 
            ]
        })
      }
      
      else{
        wx.navigateTo({
          url:item.url
        })
      }
    }
  },
  closeCheckType:function(){
    this.setData({
      showChooseType:false
    })
  },
  initMain:function(){
    var that = this;
    that.showLoading(!0);
    netWork.RequestMQ.request({
      url:api.queryPoAuthInfos,
      method:'POST',
      data:{
        stat:'N'},
      success:(res) =>{
        if(!res.data || res.data.RESPCODE != respCode.RESP_CODE.SUCCESS){
          Dialog.alert({
            title: '提示',
            message: '获取权限信息失败',
          }).then(() => {
            that.setData({
              active:1
            })
          });
        }else{
          if(!res.data.authList || res.data.authList == null){
            Dialog.alert({
              title: '提示',
              message: '您还没有开通任何权限',
            }).then(() => {
              that.setData({
                active:1
              })
            });
          }else{
            var checkAuth = false;
            const authList = res.data.authList;
            var functions = that.data.functions;
            var check107005 = false,
            check107005 = false,
            check110003 = false,
            check110002 = false;
            //存放问题反馈子权限
            var questionFbAuth = new Array()
            wx.setStorage({
              data: res.data.authList,
              key: storage.STORAGE.AUTH_DATA
            })
            console.log(authList)
            for(var auth in authList){
              var authLevels2 = authList[auth].poAuthInfoVoList
              for(var fun1 in functions){
                let level1AuthId = authList[auth].authId
                let fun1AuthIds = functions[fun1].authId
                var funs = functions[fun1].funs
                for(var fun1AuthInd in fun1AuthIds){
                  if(level1AuthId == fun1AuthIds[fun1AuthInd]){
                    functions[fun1].isShow = true;
                    for(var auth2Ind in authLevels2){
                      if(authLevels2[auth2Ind].authId == '107005'){
                        check107005 = true;
                        for(var fun2 in funs){
                          if(funs[fun2] && funs[fun2].authId == '107005'){
                            funs[fun2].hasAuth = true
                            checkAuth = true;
                          }
                        }
                      }else if(authLevels2[auth2Ind].authId == '110002'){
                        check110002 = true;
                        for(var fun2 in funs){
                          if(funs[fun2] && funs[fun2].authId == '110003'){
                            funs[fun2].hasAuth = true
                            checkAuth = true;
                          }
                        }
                      }else if(authLevels2[auth2Ind].authId.substring(0,3) == '113'){
                        questionFbAuth.push({authId:authLevels2[auth2Ind].authId,authName: authLevels2[auth2Ind].authDesc});
                        for(var fun2 in funs){
                          if(funs[fun2] && funs[fun2].authId == '113003'){
                            funs[fun2].hasAuth = true
                            checkAuth = true;
                          }
                        }
                      }else{
                        if(authLevels2[auth2Ind].authId == '107005'){
                          check107005 = true;
                        }
                        if(authLevels2[auth2Ind].authId == '110003'){
                          check110003 = true;
                        }
                        for(var fun2 in funs){
                          if(funs[fun2] && authLevels2[auth2Ind].authId == funs[fun2].authId){
                            funs[fun2].hasAuth = true
                            checkAuth = true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            if(!checkAuth){
              Dialog.alert({
                title: '提示',
                message: '您还没有开通任何权限',
              }).then(() => {
                that.setData({
                  active:1
                })
              });
              return false;
            }
            that.setData({
              functionShow:functions,
              authList:authList,
              check107005:check107005,
              check107005:check107005,
              check110003:check110003,
              check110002:check110002,
              questionFbAuth:questionFbAuth
            })
            if(that.hgjWyModuleId&&that.hgjWyModuleId!=''){
              that.skipPage();
            }
          }
        }
      },
      complete:function(){
        that.showLoading(!1)
      }
    })
  },
  onClickHide:function(){
    this.setData({
      showPost:!1,
      errDesc:'',
      houseName:''
    })
  },
  hidePopup:function(){
    this.setData({
      showChooseType:!1
    })
  },
  initData:function(){
    this.setData({
      errDesc:'',
      houseName:''
    })
  },
  onTabBarChange(event) {
    this.setData({ 
      active: event.detail
     });
  },
  onAccountDetailInfo() {
    wx.navigateTo({
      url: '../mine/accountDetailInfo',
    })
  },

  onMyComment() {
    wx.navigateTo({
      url: '../mine/mineComment',
    })
  },
  packageJumpParam(options){
    let jumParams='';
    for(let item in options){
      jumParams=jumParams+item+"="+options[item]+"&";
    }
    this.jumpPageParam=jumParams.substring(0,jumParams.length-1);
  },
  skipPage(){
     let hgjWyModelInfos=app.globalData.userInfo.HGJWYMODULEINFOS;
     console.log(hgjWyModelInfos)
     let hgjWymodelArrays=JSON.parse(hgjWyModelInfos);
     for (let index = 0; index < hgjWymodelArrays.length; index++) {
      if(hgjWymodelArrays[index].modelId==this.hgjWyModuleId){
        let url=hgjWymodelArrays[index].pagePath;
        if(this.jumpPageParam!=''){
          url=url+'?'+this.jumpPageParam
        }
        wx.navigateTo({
          url: url,
        });
        break;
      } 
     }
  }
})