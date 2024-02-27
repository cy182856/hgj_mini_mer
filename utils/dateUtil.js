const util = require('./util');
const stringUtil = require('./stringUtil');
//日期加指定单位
Date.prototype.DateAdd = function (strInterval, Number) {
  var dtTmp = this;
  switch (strInterval) {
      case 's': return new Date(Date.parse(dtTmp) + (1000 * Number));// 秒
      case 'n': return new Date(Date.parse(dtTmp) + (60000 * Number));// 分
      case 'h': return new Date(Date.parse(dtTmp) + (3600000 * Number));// 小时
      case 'd': return new Date(Date.parse(dtTmp) + (86400000 * Number));// 天
      case 'w': return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));// 星期
      case 'q': return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number * 3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());// 季度
      case 'm': return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());// 月
      case 'y': return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());// 年
  }
}
//+---------------------------------------------------  
//| 比较日期差 dtEnd 格式为日期型或者 有效日期格式字符串  
//+---------------------------------------------------  
Date.prototype.DateDiff = function (strInterval, dtEnd) {
  var dtStart = this;
  if (typeof dtEnd == 'string')//如果是字符串转换为日期型  
  {
      dtEnd = ht.parseDate(dtEnd);
  }
  switch (strInterval) {
      case 's': return parseInt((dtEnd - dtStart) / 1000);
      case 'n': return parseInt((dtEnd - dtStart) / 60000);
      case 'h': return parseInt((dtEnd - dtStart) / 3600000);
      case 'd': return parseInt((dtEnd - dtStart) / 86400000);
      case 'w': return parseInt((dtEnd - dtStart) / (86400000 * 7));
      case 'm': return (dtEnd.getMonth() + 1) + ((dtEnd.getFullYear() - dtStart.getFullYear()) * 12) - (dtStart.getMonth() + 1);
      case 'y': return dtEnd.getFullYear() - dtStart.getFullYear();
  }
}
//+---------------------------------------------------  
//| 取得当前日期所在月的最大天数  
//+---------------------------------------------------  
Date.prototype.MaxDayOfDate = function () {
  var myDate = this;
  var ary = myDate.toArray();
  var date1 = (new Date(ary[0], ary[1] + 1, 1));
  var date2 = date1.DateAdd('m', 1);
  var result = dateDiff(date1.Format('yyyy-MM-dd'), date2.Format('yyyy-MM-dd'));
  return result;
}
//---------------------------------------------------  
// 判断闰年  
//---------------------------------------------------  
Date.prototype.isLeapYear = function () {
  return (0 == this.getYear() % 4 && ((this.getYear() % 100 != 0) || (this.getYear() % 400 == 0)));
}

//日期加上指定单位 返回yyyyMMdd
const dateAddMonth = (date,strInterval, number)=>{
  var pad = parseDate(formatDate(date, "yyyy-MM-dd"));
  return formatDate(pad.DateAdd(strInterval,number),"yyyyMMdd");
}

// 字串转化成日期
const parseDate = strDate => {
  var myDate;
  if (strDate.indexOf("/Date(") > -1)
      myDate = new Date(parseInt(strDate.replace("/Date(", "").replace(")/", ""), 10));
  else
      myDate = new Date(Date.parse(strDate.replace(/-/g, "/").replace("T", " ").split(".")[0]));//.split(".")[0] 用来处理出现毫秒的情况，截取掉.xxx，否则会出错
  return myDate;
};

const toMailDateDtPartString = (dateString) =>{
  return formatDate(dateString,"yyyyMMdd");
}

// 日期格式化v日期,format:格式
const formatDate =(v, format) => {
  if (!v) return "";
    var d = v;
    if (typeof v === 'string') {
        if (v.indexOf("/Date(") > -1)
            d = new Date(parseInt(v.replace("/Date(", "").replace(")/", ""), 10));
        else
            d = new Date(Date.parse(v.replace(/-/g, "/").replace("T", " ").split(".")[0]));//.split(".")[0] 用来处理出现毫秒的情况，截取掉.xxx，否则会出错
    }
    var o = {
        "M+": d.getMonth() + 1,  //month
        "d+": d.getDate(),       //day
        "h+": d.getHours(),      //hour
        "m+": d.getMinutes(),    //minute
        "s+": d.getSeconds(),    //second
        "q+": Math.floor((d.getMonth() + 3) / 3),  //quarter
        "S": d.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

//获取当前日期返回指定格式 format --指定格式
const getCurrentDate = (format) =>{
  return formatDate(new Date(), format);
}

const convertDateTime = (dateTime) =>{
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth() + 1;
     return year + "年" + util.leftPad(month,2,0) +"月";
}

const convertDateTimeToCn = (dateTime) =>{
  var year = dateTime.getFullYear();
  var month = dateTime.getMonth() + 1;
  var day = dateTime.getDate();
  console.log(day)
  return year + "年" + util.leftPad(month,2,0) +"月" + util.leftPad(day,2,0) + "日";
}

//yyyy-MM-dd 转 yyyyMMdd
const convertLongDateToShort = (longDate) =>{
  if(!longDate || longDate == '' || longDate == null){
    return '';
  }
  return longDate.replace(/-/g, "");
}
//yyyyMMdd 转 yyyy-MM-dd
const convertShortDateToLang = (shortDate) =>{
  let year = shortDate.substr(0,4);
  let month = shortDate.substr(4,2);
  let day = shortDate.substr(6,2);
  return year + "-" + month + "-" + day
}
//日期改为指定格式 symbol为符号 如 "/"", "."
//yyyyMMdd 转 yyyy.MM.dd
const convertShortDateToLangDian = (shortDate) =>{
    let year = shortDate.substr(0,4);
    let month = shortDate.substr(4,2);
    let day = shortDate.substr(6,2);
    return year + "." + month + "." + day
}
//yyyy.MM.dd 转 yyyyMMdd
const convertLangDianDateToShort = (longDate) =>{
    if(!longDate || longDate == '' || longDate == null){
        return '';
    }
    return longDate.replace(/\./g, "");
}

const convertShortDateToOther = (date,symbol) =>{
  let year = date.substr(0,4);
  let month = date.substr(4,2);
  let day = date.substr(6,2);
  return year + symbol + month + symbol + day
}

const convertDateToDay = (dateTime) =>{
  dateTime = dateTime.replace(/-/g, "");
  var month = dateTime.substr(4,2)
  var day = dateTime.substr(6);
   return  month + "月" + day + "日";
}

const getDateDiff = (startDate,endDate) =>{
  var aDate, oDate1, oDate2, iDays;
  aDate = startDate.split("-");
  oDate1 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
  aDate = endDate.split("-");
  oDate2 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
  iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);
  if((oDate1 - oDate2) < 0) {
    return -iDays;
  }
  return iDays;
}

const checkDateIsSameMonth = (startDate,endDate) =>{
  var aDate, oDate1, oDate2;
  aDate = startDate.split("-");
  oDate1 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
  aDate = endDate.split("-");
  oDate2 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
  var startMonth = oDate1.getMonth();
  var endMonth = oDate2.getMonth();
  return startMonth == endMonth;
}

//比较两个日期大小 日期格式：yyyy-MM-dd
const compareDate =(date1,date2) =>{
  var arys1,arys2;
  if(date1 == date2){
    return true;
  }
  if(date1 == '' || date2 == '' || date1 == null || date2 == null){
    return false;
  }    
  if(date1 != null && date2 != null) {     
    arys1=date1.split('-');     
    var sdate=new Date(arys1[0],parseInt(arys1[1]-1),arys1[2]);     
    arys2=date2.split('-');     
    var edate=new Date(arys2[0],parseInt(arys2[1]-1),arys2[2]);     
    if(sdate > edate) {        
      return false;        
    }else {   
      return true;     
    }  
  } 
}

//获取昨天
const getYesterDay = () =>{
  var now = new Date();
  var nowYear = now.getFullYear();//当前年
  var nowDay = now.getDate(); //当前日
  var nowMonth = now.getMonth(); //当前月
  return formatDate(new Date(nowYear, nowMonth, nowDay -  1), 'yyyy-MM-dd');
}
//获取指定的前几天,并返回指定格式
//返回yyyyMMdd格式的前几天
const getDaysAgoShort = (i)=>{
    return getDaysAgo(i,2);
}
//返回yyyy.MM.dd格式的前几天格式的前几天
const getDaysAgoDian = (i)=>{
    return getDaysAgo(i,1);
}
//返回yyyy-MM-dd格式的前几天格式的前几天
const getDaysAgoDefault = (i)=>{
    return getDaysAgo(i,0);
}
const getDaysAgo = (day,format)=>{
    var formatStr = 'yyyy-MM-dd';
    if(format == 1){
        formatStr = 'yyyy.MM.dd'
    }else if(format == 2){
        formatStr = 'yyyyMMdd'
    }

    var now = new Date();
    var nowYear = now.getFullYear();//当前年
    var nowDay = now.getDate(); //当前日
    var nowMonth = now.getMonth(); //当前月
    return formatDate(new Date(nowYear, nowMonth, nowDay -  day), formatStr);
}
//获取本周
const getCurrentWeek = () =>{
  var res = {
      begin: '',
      end: ''
  };
  var now = new Date();
  var nowYear = now.getFullYear();//当前年
  var nowDayOfWeek = now.getDay()== 0 ? 7 : now.getDay(); //今天本周的第几天
  var nowDay = now.getDate(); //当前日
  var nowMonth = now.getMonth(); //当前月
  var weekStart = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1);
  var weekEnd = new Date(nowYear, nowMonth, nowDay + (7 - nowDayOfWeek));

  res.begin = formatDate(weekStart, 'yyyy-MM-dd');
  if(weekEnd > now){
    res.end = formatDate(now, 'yyyy-MM-dd')
  }else{
    res.end = formatDate(weekEnd, 'yyyy-MM-dd')
  }
  return res;
}

//获取上周
const getPreWeek = () =>{
  var res = {
      begin: '',
      end: ''
  };
  var now = new Date();
  var nowYear = now.getFullYear();//当前年
  var nowDayOfWeek = now.getDay()== 0?7:now.getDay(); //今天本周的第几天
  var nowDay = now.getDate(); //当前日
  var nowMonth = now.getMonth(); //当前月
  var weekStartDate = new Date(nowYear, nowMonth, (nowDay - nowDayOfWeek - 6));
  var weekEndDate = new Date(nowYear, nowMonth, (nowDay - nowDayOfWeek));

  res.begin = formatDate(weekStartDate, 'yyyy-MM-dd');
  res.end = formatDate(weekEndDate, 'yyyy-MM-dd');

  return res;
}

// 获取当前月
const getCurrentMonth = () =>{
    var res = {
        begin: '',
        end: ''
    };
    var now = new Date();
    var currentDate = parseDate(formatDate(new Date(), "yyyy-MM-01"));
    var endDate = currentDate.DateAdd('m', 1).DateAdd('d', -1);
    res.begin = formatDate(currentDate, 'yyyy-MM-dd');
    if(endDate > now){
      res.end = formatDate(now, 'yyyy-MM-dd')
    }else{
      res.end = formatDate(endDate, 'yyyy-MM-dd')
    }
    return res;
}

// 获取上月
const getPreMonth = () => {
    var res = {
        begin: '',
        end: ''
    };
    var currentDate = parseDate(formatDate(new Date(), "yyyy-MM-01"));
    var preMonth = currentDate.DateAdd('d', -1);

    res.begin = formatDate(preMonth, 'yyyy-MM-01');
    res.end = formatDate(preMonth, 'yyyy-MM-dd');

    return res;
}

//获取某年某个月的第一天
const getFirstDayInMonth = (yearAndMonth) =>{
  var year = yearAndMonth.substr(0,4);
  var month = yearAndMonth.substr(4,2);
  var currentMonth = parseDate(year+"-"+month+"-"+"01");
  var day = currentMonth.getDate();
  return new Date(year, month - 1, day);
}

//获取某年某个月的最后一天
const getLastDayInMonth = (yearAndMonth) =>{
  var year = yearAndMonth.substr(0,4);
  var month = yearAndMonth.substr(4,2);
  var currentMonth = parseDate(year+"-"+month+"-"+"01");
  var day = currentMonth.getDate();
  return new Date(year, month, day - 1);
}

const convertTohour = (time) =>{
  if(!time){
    return 0;
  }
  var hour = parseInt(time/60);
  var minute = parseInt(time%60);
  return parseFloat(hour+minute/60.0).toFixed(1);
}

//获取两个日期直接的月份差
const getMonthBetween = (startDate,endDate) =>{
  startDate = stringUtil.str2Date(startDate);
  endDate = stringUtil.str2Date(endDate);
  console.log(startDate)
  console.log(endDate)
  var num = 0;
  var year = endDate.getFullYear()- startDate.getFullYear();
  num += year*12;
  var month = endDate.getMonth()-startDate.getMonth();
  num += month;

  // var day = endDate.getDate()-startDate.getDate();
  // if(day>0){
  //   if(day>15){ num+=1; }
  //   　　num+=1;
  // }else if(day<0){
  //   if(day<-15){num-=1; }
  //   num-=1;
  // }
  return -num;
}

module.exports = {
  parseDate:parseDate,
  formatDate:formatDate,
  getCurrentWeek:getCurrentWeek,
  getPreWeek:getPreWeek,
  getCurrentMonth:getCurrentMonth,
  getPreMonth:getPreMonth,
  getDaysAgoShort:getDaysAgoShort,
  getDaysAgoDian:getDaysAgoDian,
  getDaysAgoDefault:getCurrentDate,
  getDaysAgo:getDaysAgo,
  dateAddMonth:dateAddMonth,
  getCurrentDate:getCurrentDate,
  getDateDiff:getDateDiff,
  toMailDateDtPartString:toMailDateDtPartString,
  checkDateIsSameMonth:checkDateIsSameMonth,
  convertDateTime:convertDateTime,
  convertDateToDay:convertDateToDay,
  getYesterDay:getYesterDay,
  convertLongDateToShort:convertLongDateToShort,
  convertShortDateToLang:convertShortDateToLang,
  getFirstDayInMonth:getFirstDayInMonth,
  getLastDayInMonth:getLastDayInMonth,
  compareDate:compareDate,
  convertDateTimeToCn:convertDateTimeToCn,
  convertShortDateToOther:convertShortDateToOther,
  convertShortDateToLangDian:convertShortDateToLangDian,
  convertLangDianDateToShort:convertLangDianDateToShort,
  convertTohour:convertTohour,
  getMonthBetween:getMonthBetween
}