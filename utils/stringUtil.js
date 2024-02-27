

/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
*/
function formatTime(date,format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

//返回几月几号
// function getMonthAndDay(date) {
//   var newDate = date.substring(4,4)

// }

//字符串转时间20200401
function str2Date(date) {
  let dateStr = date.substr(0,4) + '-' + date.substr(4,2) +'-'+date.substr(6,2) + ' 08:08:08';
    let fullYear = parseInt(dateStr.substring(0,4));

      let month = parseInt(dateStr.substring(5, 7).substring(0, 1) == '0' ? dateStr.substring(6, 7) : dateStr.substring(5, 7));
  
      let day = parseInt(dateStr.substring(8, 10).substring(0, 1) == '0' ? dateStr.substring(9, 10) : dateStr.substring(8, 10));
  
      let hour = parseInt(dateStr.substring(11, 13).substring(0, 1) == '0' ? dateStr.substring(12, 13) : dateStr.substring(11, 13));
  
      let minute = parseInt(dateStr.substring(14, 16).substring(0, 1) == '0' ? dateStr.substring(15, 16) : dateStr.substring(14, 16));
  
      let second = parseInt(dateStr.substring(17, 19).substring(0, 1) == '0' ? dateStr.substring(18, 19) : dateStr.substring(17, 19));
  
      return new Date(fullYear,month-1,day,hour,minute,second);
}
//字符串转时间20200401
function str2DateByFormat(date,format) {
  // let rd = date.substr(0,4) + '-' + date.substr(4,2) +'-'+date.substr(6,2) + ' 00:00:00:000';
  return new Date(date).format(format);
}

//计算天数差 20200401 - 20200405
function calcuteDaysDiff(date1, date2) {
  let d1 = str2Date(date1);
  let d2 = str2Date(date2);
  var timestamp = d2.getTime() - d1.getTime();
  return timestamp/(1000*60*60*24);
}

//计算时间差 hh:mm - hh:mm （返回分钟差）
function calcuteTimeDiff(time1,time2) {
  let strArr = time1.split(':');
  let strArr2 = time2.split(':');
  let h1 = parseInt(strArr[0]);
  let m1 = parseInt(strArr[1]);
  let h2 = parseInt(strArr2[0]);
  let m2 = parseInt(strArr2[1]);
  let totalM = h2 * 60 + m2 - h1 *60 - m1;
  return totalM;
}

//数据转化  
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//字符串转json
function stringToJson(data) {
  return JSON.parse(data);
}

//json转字符串
function jsonToString(data) {
  return JSON.stringify(data);
}

// map转换为json
function mapToJson(map) {
  return JSON.stringify(strMapToObj(map));
}

// json转换为map
function jsonToMap(jsonStr) {
  return objToStrMap(JSON.parse(jsonStr));
}


// map转化为对象（map所有键都是字符串，可以将其转换为对象） 
function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

// 对象转换为Map
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}  

// map转换为json
function arrStr2Array(arrStr) {
  var _str = arrStr.substring("[{".length, arrStr.lenght - "}]".length);
  var arr = _str.split("},{");
  for (var i = 0; i < arr.length;i++){
    arr[i] = "{"+arr[i]+"}";
  }
  return arr;
}

function getPicUrlsFromArrStr(arrStr) {
  var arr = arrStr2Array(arrStr);
  if (arr == undefined || arr==null)return null;
  var strArr = new Array();
  for (var i = 0; i < arr.length; i++) {
    var mapNew = jsonToMap(arr[i]);
    strArr[i] = mapNew.get("PICURL");
  }
  return strArr;
}

function tenThousandths2Percent(str){
  try{
    return (parseInt(str) / 100).toFixed(2) + "%";
  }catch(err){
    return "";
  }
}

function changeMoney(moneyStr) {
  if (moneyStr == null || moneyStr == undefined || moneyStr=="") return "";
  let index = moneyStr.indexOf(".");
  if (index == -1) {
    return moneyStr + ".00";
  } else {
    return (moneyStr + "00").substring(0, index + 3);
  }
}

function getDay(day) {
      var today = new Date();
      today.setTime(today.getTime());
      var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
      today.setTime(targetday_milliseconds); //注意，这行是关键代码
      var tYear = today.getFullYear();
      var tMonth = today.getMonth();
      var tDate = today.getDate();
      tMonth = doHandleMonth(tMonth + 1);
      tDate = doHandleMonth(tDate);
      return tYear + tMonth + tDate;
}

/**
 * 返回日期
 */
function getDate(day) {
  var today = new Date();
  today.setTime(today.getTime());
  var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
  today.setTime(targetday_milliseconds); //注意，这行是关键代码
  
  return today;
}
function getDateWithrMonth(date,month) {
  var newDate = date
  var newYear = date.getFullYear();
  var newMonth = date.getMonth()+month;
  if(month>0){
    if(newMonth>=11){
        newYear += 1;    
        newMonth -= 11;    
        newDate.setFullYear(newYear);    
        newDate.setMonth(newMonth-1);    
      }else{    
        newDate.setFullYear(newYear);    
        newDate.setMonth(newMonth);    
      }
  }else{
    if(newMonth>=0){
       newDate.setFullYear(newYear);    
       newDate.setMonth(newMonth);  
    }else{
        newYear -= 1;    
        newMonth += 11;    
        newDate.setFullYear(newYear);    
        newDate.setMonth(newMonth-1);    
    }
  }
  
  return newDate;
}


/** 加上当前的时间是几年几月几日 */
 function calcDateTime(dateTime) {
  var year = dateTime.getFullYear();
  var month = dateTime.getMonth() + 1;
   var day = dateTime.getDate();
   return year + "年" +doHandleMonth(month)+"月";
}
function calcDateDay(dateTime) {
  var year = dateTime.getFullYear();
  var month = dateTime.getMonth() + 1;
  var day = dateTime.getDate();
  return year + "年" + doHandleMonth(month) + "月" + doHandleMonth(day) + "日";
}

/** 加上当前的时间是202005 */
function calcDateYearMonth(dateTime) {
  var year = dateTime.getFullYear();
  var month = dateTime.getMonth() + 1;
   return year + "" + doHandleMonth(month) + "";
}
/**获取当前时间上个月份 */
function getPreMonthTime(dateTime){
  var year = dateTime.getFullYear();
  var month = dateTime.getMonth();
  return year + "年" + doHandleMonth(month) + "月";
}

function getPreMonthDateTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth();
  var day = now.getDate();
  if (month == 0) { // 如果是1月份则时间为上年12月份
    year = year - 1;
    month = 11;
  } else {
    month = month - 1;
  }
  return new Date(year, month , day).getTime();
}

function convertToMonth(yearMonth){
  var dateTime = yearMonth+"";
  var year = dateTime.substring(0,4);
  var month = dateTime.substring(5,7);
  return year + "" + month+"";
}
function convertToDay(yearMonthDay) {//2020年05月01日
  var dateTime = yearMonthDay + "";
  var year = dateTime.substring(0, 4);
  var month = dateTime.substring(5, 7);
  var day=dateTime.substring(8,10);
  return year + "" + doHandleMonth(month) + "" + doHandleMonth(day);
}

function doHandleMonth(month) {
      var m = month;
      if (month.toString().length == 1) {
         m = "0" + month;
      }
      return m;
}


/**
 * 数组移除重复元素
 */
function unique(array) {
  return Array.from(new Set(array))
}
/**
 * 对象数组移除重复元素
 */
function uniqueObjById(array,id) {
  let res = []
  let obj = {}
  for (let i = 0; i < array.length; i++) {
    if (!obj[array[i].PRODID]) { // name  对应数组中的name
      res.push(array[i])
      obj[array[i].PRODID] = true
    }
  }
  
  return res
}

// var result = []
// getAllDept(carr, item => {
//   return item.STAFFORDEPT === "S"
// }, result)

function getAllStaffs(deptId,result){ 
  let array =getDownDept(deptId)
  if(array.length==0){
    return
  }
  array.forEach(item => {
    if (item.STAFFORDEPT === "D") {
      getAllStaffs( item.DOWNSTAFFSEQ, result)
    } else {     
        result.push(item)   
    }
  })
}
function getDownDept(deptId) {

  return getDownDeptbyState(deptId,false);
}
function getDownDeptbyState(deptId,state) {
  let structs = getApp().globalData.companyStructs
  let struct1 = new Array()
  for (let x = 0; x < structs.length; x++) {
    // console.log("getDownDept:"+JSON.stringify(structs))
    if (deptId == structs[x].DEPTID) {
      structs[x].Checked = state
      struct1.push(structs[x])     
    }
  }
  return struct1;
}
function getWeekDay(index) {
  let show_day = new Array('周日', '周一', '周二', '周三', '周四', '周五', '周六');
  return show_day[index];
}

function filterEmoji(name){
  var str = name.replace(/[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig, "");
   return str;
  }

function getAfterAdjustScore(score, scale) {
  var afterScore = score * (100 + scale) / 100;
  return afterScore.toFixed(1);
}
 

module.exports = {
  getDate: getDate,
  getDay: getDay,
  formatTime:formatTime,
  stringToJson: stringToJson,
  jsonToString: jsonToString,
  mapToJson: mapToJson,
  jsonToMap: jsonToMap,
  strMapToObj: strMapToObj,
  objToStrMap: objToStrMap,

  getPicUrlsFromArrStr: getPicUrlsFromArrStr,//将图片转化为url
  tenThousandths2Percent: tenThousandths2Percent,
  changeMoney: changeMoney,
  calcuteTimeDiff: calcuteTimeDiff,
  calcuteDaysDiff: calcuteDaysDiff,
  str2Date: str2Date,
  unique: unique,
  uniqueObjById: uniqueObjById,
  getDownDept: getDownDept,
  getAllStaffs: getAllStaffs,
  getDownDeptbyState:getDownDeptbyState,
  getWeekDay:getWeekDay,
  calcDateTime: calcDateTime,
  calcDateDay: calcDateDay,
  doHandleMonth: doHandleMonth,
  calcDateYearMonth: calcDateYearMonth,
  getPreMonthTime: getPreMonthTime,
  getPreMonthDateTime: getPreMonthDateTime,
  convertToMonth:convertToMonth,
  convertToDay: convertToDay,
  str2DateByFormat:str2DateByFormat,
  filterEmoji: filterEmoji,
  getAfterAdjustScore: getAfterAdjustScore,
  getDateWithrMonth:getDateWithrMonth
}