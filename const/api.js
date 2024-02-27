//const ProdApiRootUrl = 'https://jia.huiguan.com/jiamsv/';
//const ProdApiRootUrl = 'https://hgj.shofw.com/jiamsv/';
//const TechApiRootUrl = 'https://jia-tech.huiguan.com/jiamsv/';

//const TechApiRootUrl = 'https://zhgj.shofw.com/qw/';
//const TechApiRootUrl = 'http://192.168.79.5:84/qw/';
  const TechApiRootUrl = 'http://192.168.23.108:84/qw/';
//const TechApiRootUrl = 'http://zhgjtest.shofw.com:84/qw/';
//const TechApiRootUrl = 'https://zhgjtest.xhguanjia.com/qw/';

// const TechApiRootUrl = 'https://jia-test.huiguan.com/jiamsv/';
const env = "tech";
//const env = "prod";
const ApiRootUrl = env == 'tech' ? TechApiRootUrl : ProdApiRootUrl;

module.exports = {
  env:env,
  sessionKey : env == 'tech' ? 'HUIGUANJIAJSESSIONID' : 'HGJJSESSIONID',
  uploadImagesUrl: ApiRootUrl + "/image/upload",
  checkImageUrl: ApiRootUrl + '/image/check',
  Login: ApiRootUrl + 'login/wxlogin',
  queryPoAuthInfos: ApiRootUrl + "usr/poauth",
  queryHouseArea: ApiRootUrl + "prop/getAreaInfo", //查询房屋区域
  queryHouseBuilding: ApiRootUrl + "prop/getBuildingInfo", //查询房屋楼号
  queryHouseRoom: ApiRootUrl + "prop/getHouseInfo", //查询房屋室号
  queryHouseInfo: ApiRootUrl + "prop/getHouseInfoPageList", //查询房屋信息
  queryQrcodeImage: ApiRootUrl + "hu/getHouseUsrInfoQrcode", //生成认证二维码
  getMemberInfo: ApiRootUrl + "hu/getHouseUsrInfo",//获得家庭成员
  cancelAccount: ApiRootUrl + "hu/cancelHouseUsrInfo",//注销账户
  updateManagerInfo: ApiRootUrl + "po/updatePropOperInfo",//更新物管人员信息
  checkHuCheckCode :ApiRootUrl + "hu/checkHuCheckCode", //校验业主二维码
  checkHuCheckRanNum :ApiRootUrl + "hu/checkHuCheckRanNum", //校验业主快速通行码
  auditHouseUsrInfo :ApiRootUrl +"/hu/auditHouseUsrInfo",//审核入住申请
  updHouseInfo :ApiRootUrl +"prop/updHouseInfo",//修改房屋跟进信息

  //报事报修
  //repairHouseList:ApiRootUrl + 'repairHouseList', //查询所有房屋
  repairApply:ApiRootUrl + 'repair.do',//报修申请
  repairQuery:ApiRootUrl + 'queryRepairLogSy.do',//报修查询列表
  repairQueryById:ApiRootUrl + 'queryRepairLogSyById.do',//根据ID查询
  repairAddMsgBody:ApiRootUrl + 'repair/addRepairMsg.do', //报修留言
  repairCostDetailQuery:ApiRootUrl + 'queryRepairCostDetail.do',//报修费用明细查询

  queryStages:ApiRootUrl + 'queryStages', //查询分期

  queryBuilding:ApiRootUrl + 'queryBuilding', //查询楼栋

  queryRoomNum:ApiRootUrl + 'queryRoomNum', //查询房号

  serviceBuild:ApiRootUrl + 'serviceBuild.do',//管家服务楼栋


  /**************预约模块********************/
  queryApptObjInfo: ApiRootUrl + 'appt/queryApptObjInfo', //预约标的查询
  queryApptTimeDtl: ApiRootUrl + 'appt/queryApptTimeDtl',
  addApptOrdLog: ApiRootUrl + 'appt/addApptOrdLog',
  queryApptOrdLog: ApiRootUrl + 'appt/queryApptOrdLog',
  updApptOrdLog: ApiRootUrl + 'appt/updApptOrdLog',
  queryApptTimeOrdLog: ApiRootUrl +'appt/queryApptTimeOrdLog',

  queryHouseInfo: ApiRootUrl + "prop/getHouseInfoPageList", //查询房屋信息
  queryPropHouseShowInfo: ApiRootUrl + "prop/queryPropHouseShowInfo", //查询房屋展示位信息
  queryPropHouseInfo: ApiRootUrl + "prop/queryPropHouseInfo", //查询物业房屋展示信息
  queryPropBriefDesc: ApiRootUrl + "prop/queryPropBriefDesc", //查询物业简介信息
  updPropHouseShowInfo: ApiRootUrl + "prop/updPropHouseShowInfo", //修改物业房屋展示位信息

  /**************查询维修人员********************/
  queryPoSpePost: ApiRootUrl + "prop/queryPoSpePost",
  queryHouseInfo: ApiRootUrl + "prop/getHouseInfoPageList", //查询房屋信息

  /**************报修模块********************/
  queryJieDan:ApiRootUrl + 'receivingOrder', //接单查询
  queryPaiDan:ApiRootUrl + 'queryDistributeOrder',//派单查询
  dispatch: ApiRootUrl + 'distributeOrder', //接单,派单,改派
  queryRepair: ApiRootUrl + 'queryRepair', //报修查询
  myRepair:ApiRootUrl+ 'myRepair', //我的报修
  queryMsg:ApiRootUrl + 'queryRepairMsg', //留言明细
  award:ApiRootUrl + 'awardRepairMedal', //奖励
  repairManReach: ApiRootUrl + 'repairManReach',//维修员到场确认
  finishRepair: ApiRootUrl + 'finishRepair', //维修完成
  updExpArvTime:ApiRootUrl + 'updExpArvTime',//更改预期到达时间和确认预期到达时间
  updOrdAmt : ApiRootUrl + 'repair/updOrdAmt' ,//修改金额
  cancelOrd: ApiRootUrl + 'cancelOrd',//订单取消
  getRepairItem:ApiRootUrl + 'repair/getItem.do',//查询报修项
  updRepairItem:ApiRootUrl + 'repair/updItem',//修改报修类别
  addRepairMsg: ApiRootUrl+ 'repair/addRepairMsg.do', //报修留言备注
  changeRepairType: ApiRootUrl+ 'changeRepairType', //修改报修类型

  /**************查询访客日志信息********************/
  queryVisitLogs: ApiRootUrl + "visitinfo/queryVisitLogInfos" //查询访客日志信息
  ,updVisitLog: ApiRootUrl + "/visitinfo/updVisitLog"
  ,queryVisitInoutLogs : ApiRootUrl + "/visitinfo/queryVisitInoutLogInfos"//查询访客出入日志信息

  /**************群发住户消息********************/
  ,massSendHuMsg: ApiRootUrl + "huMsg/massSendHuMsg" //群发住户消息
  ,queryHuMsgLogList: ApiRootUrl + "huMsg/queryHuMsgLogList" //查询住户消息日志列表
  ,queryHuMsgLog: ApiRootUrl + "huMsg/queryHuMsgLog" //查询住户消息日志详情
  ,queryPoNoticeSign:ApiRootUrl+"ponotice/queryPoNoticeSign"

  /**************通用文件上传和预览********************/
  // ,imgUpload:ApiRootUrl+'upload/image' //通用图片文件上传
  ,imgUpload:ApiRootUrl+'uploadFile' //通用图片文件上传
  ,imgCheck:ApiRootUrl + 'image/query?packName=PACK&fileName=FILE' //通用图片预览
  ,deleteFile:ApiRootUrl + 'file/delete' //通用文件删除

  /**************邻里圈**************/
  ,queryHeoTypeList:ApiRootUrl + 'heo/queryHeoTypeList'
  ,queryHeoInfos:ApiRootUrl + 'heo/queryHeoInfos'
  ,addHeoInfo:ApiRootUrl + "heo/addHeoInfo"
  ,updateHeoInfo : ApiRootUrl + "heo/updHeoInfo",
  queryHeoDtlInfos: ApiRootUrl + "heo/queryHeoDtls"
  ,addHeoDtl : ApiRootUrl + '/heo/addHeoDtl'
  ,updHeoDtlInfo : ApiRootUrl + 'heo/updHeoDtl',
  doHeoPraise: ApiRootUrl + "heo/heoPraise"
  ,queryHeoPraiseList: ApiRootUrl + "heo/queryHeoPraiseList"

  /**************物业费**************/
  ,queryPfeeMonBill:ApiRootUrl + 'pbl/queryPfeeMonBill'
  ,pfeeBillLoadSingle:ApiRootUrl + 'pbl/pfeeBillLoadSingle'


  /****查询物管人员信息******/
  ,queryPropOperInfo: ApiRootUrl + '/prop/queryPropOperInfo'

  /****反馈,投诉建议表扬******/
  ,queryAdviceDetail:ApiRootUrl + 'advice/queryAdviceDetail' //反馈详情
  ,queryAdviceForPage:ApiRootUrl + 'advice/queryAdviceLog' //反馈列表
  ,doAdvice:ApiRootUrl + 'advice/recvAdvice' //接受反馈
  ,finishAdvice:ApiRootUrl + 'advice/finish' //处理完反馈
  ,cancelAdvice:ApiRootUrl + 'advice/cancel' //取消接受反馈
  ,updAdviceItem:ApiRootUrl+ 'advice/updItem' //修改反馈归属项
  ,getAdviceItem:ApiRootUrl + 'advice/getItem' //获取反馈项
  ,addMsgBody:ApiRootUrl + 'advice/addMsgBody' //新增留言反馈

  /**** 充电桩 *****/
  ,queryChargeList : ApiRootUrl + '/charge/queryChargeList'
  ,queryChargeDetail : ApiRootUrl + '/charge/queryChargeDetail'
  
  /**** 远程开门 *****/
  ,queryRemoteDoors : ApiRootUrl + '/door/queryRemoteDoors' //门禁列表
  ,remoteDoorOpen : ApiRootUrl + '/door/remoteDoorOpen' //远程开门

  /******************门禁 蓝牙 */
 ,queryAcDevList:ApiRootUrl +'door/queryAcDevList' //查询门禁设备列表
 ,queryAcDevInfo:ApiRootUrl +'door/queryAcDevInfo' //查询门禁设备详情
 ,acInit:ApiRootUrl +'door/acInit' //门禁设备初始化
 ,queryAcDevSn:ApiRootUrl +'door/queryAcDevSn' //根据蓝牙搜索的SN，查询设备的信息
,insertAdEnterLog:ApiRootUrl +'door/insertAdEnterLog'
 ,querySmartCodeInfo : ApiRootUrl + '/hu/querySmartCodeInfo'
}