const cmdID = require('./DevCmdID.js');
var ret = {
  'code': -1,
  msg: '',
  decodeData:'',
  content: {}
}

function parseData(srcData, cmdId) {
  ret = {
    'code': -1,
    msg: '',
    decodeData:'',
    content: {}
  }
  switch (cmdId) {
    case cmdID.INQ:
      parseINQ(srcData)
      break;
    case cmdID.INIT:
      parseINITData(srcData)
      break;
    case cmdID.CLOCK:
      parseCLOCKData(srcData)
      break;
    case cmdID.KEY:
      parseKEYData(srcData)
      break;
    case cmdID.BUILD:
      parseBUILDData(srcData)
      break;
    case cmdID.LOSS:
      parseLOSTData(srcData)
      break;
    case cmdID.FIND:
      parseFINDData(srcData)
      break;
      case cmdID.RECORD:
        parseRECORDData(srcData)
      break;
  }
  
  return ret
}
//0506303035353031333034383030303035312020303031313034323830353234383639383232303132313138303030
function parseINQ(value) {
  var len = hex2Str(value.substring(4, 12))
  var lenInt = stringParseInt(len) * 2
  console.log("parseINQ", lenInt)
  console.log("parseINQ", value)
  console.log("parseINQ", value.length)
  var decodeData = hex2Str(value.substring(12))
  ret.decodeData=decodeData
  if(value.length==lenInt+12){//01            1  1010000000066v1.0.020211127152030000
 
  ret.code = 0
  ret.msg = "解析成功"

  console.log("parseINQ", decodeData)
  ret.content.cmdId = decodeData.substring(0, 2)
  ret.content.custId = decodeData.substring(2, 14)
  ret.content.acDevId = decodeData.substring(14, 17)
  var devSnLen = stringParseInt(decodeData.substring(17, 19))
  ret.content.devSn = decodeData.substring(19, 19 + devSnLen)
  var verLen = stringParseInt(decodeData.substring(19 + devSnLen, 19 + devSnLen + 1))
  ret.content.ver = decodeData.substring(19 + devSnLen + 1, 19 + devSnLen + 1 + verLen)
  ret.content.DevTime = decodeData.substring(19 + devSnLen + 1 + verLen, 19 + devSnLen + 1 + verLen + 14)
  ret.content.RespCode = decodeData.substring(19 + devSnLen + 1 + verLen + 14)


  }else{
    ret.code= 101
    ret.msg="数据长度错误"
    }

}
/**
 * 0506303032303037333034383030303036302020303031303030
 * @param {*} value 
 */
function parseINITData(value) {
  var len = hex2Str(value.substring(4, 12))
  var lenInt = stringParseInt(len) * 2
  var decodeData = hex2Str(value.substring(12))
  ret.decodeData=decodeData
  if(value.length==lenInt+12){
    ret.code = 0
  ret.msg = "解析成功"
  console.log("parseINITData", decodeData)
  ret.content.cmdId = decodeData.substr(0, 2)
  ret.content.custId = decodeData.substr(2, 12)
  ret.content.acDevId = decodeData.substr(14, 3)
  ret.content.RespCode = decodeData.substr(17, 3)
  }else{
    ret.code= 101
    ret.msg="数据长度错误"
    }
}
/**
 * 050630303134303558494d4f2020202020303030
 * @param {原数据} value 
 */
function parseCLOCKData(value) {
  var len = hex2Str(value.substring(4, 12))
  var lenInt = stringParseInt(len) * 2
  var decodeData = hex2Str(value.substring(12))
  ret.decodeData=decodeData
  if(value.length==lenInt+12){
  console.log("parseCLOCKData", decodeData)
  ret.code= 0
  ret.msg="解析成功"
  ret.content.cmdId = decodeData.substr(0, 2)
  ret.content.CoopId = decodeData.substr(2, 9)
  ret.content.RespCode = decodeData.substr(11, 3)

 
  }else{
    ret.code= 101
    ret.msg="数据长度错误"
   
    }
}

/**
 * 0506303032303037333034383030303036302020303031303030
 * @param {原数据} value 
 */
function parseKEYData(value) {
  var len = hex2Str(value.substring(4, 12))
  var lenInt = stringParseInt(len) * 2
  var decodeData = hex2Str(value.substring(12))
  if(value.length==lenInt+12){
    ret.code = 0
  ret.msg = "解析成功"
  console.log("parseKEYKData", decodeData)
  ret.content.cmdId = decodeData.substr(0, 2)
  ret.content.custId = decodeData.substr(2, 12)
  ret.content.acDevId = decodeData.substr(14, 3)

  ret.content.RespCode = decodeData.substr(17, 3)
  }else{
    ret.code= 101
    ret.msg="数据长度错误"
    }
}
/**
 * 0506303032303037333034383030303036302020303031303030
 * @param {原数据} value 
 */
function parseBUILDData(value) {
  var len = hex2Str(value.substring(4, 12))
  var lenInt = stringParseInt(len) * 2
  var decodeData = hex2Str(value.substring(12))
  if(value.length==lenInt+12){
    ret.code = 0
  ret.msg = "解析成功"
  console.log("parseKEYKData", decodeData)
  ret.content.cmdId = decodeData.substr(0, 2)
  ret.content.custId = decodeData.substr(2, 12)
  ret.content.acDevId = decodeData.substr(14, 3)

  ret.content.RespCode = decodeData.substr(17, 3)
  }else{
    ret.code= 101
    ret.msg="数据长度错误"
    }
}
/**
 * 0506303032303037333034383030303036302020303031303030
 * @param {原数据} value 
 */
function parseLOSTData(value) {
  var len = hex2Str(value.substring(4, 12))
  var lenInt = stringParseInt(len) * 2
  var decodeData = hex2Str(value.substring(12))
  if(value.length==lenInt+12){
    ret.code = 0
  ret.msg = "解析成功"
  console.log("parseKEYKData", decodeData)
  ret.content.cmdId = decodeData.substr(0, 2)
  ret.content.custId = decodeData.substr(2, 12)
  ret.content.RespCode = decodeData.substr(14, 3)

  }else{
    ret.code= 101
    ret.msg="数据长度错误"
    }
}
/**
 * 0506303032303037333034383030303036302020303031303030
 * @param {原数据} value 
 */
function parseFINDData(value) {
  var len = hex2Str(value.substring(4, 12))
  var lenInt = stringParseInt(len) * 2
  var decodeData = hex2Str(value.substring(12))
  if(value.length==lenInt+12){
    ret.code = 0
  ret.msg = "解析成功"
  console.log("parseKEYKData", decodeData)
  ret.content.cmdId = decodeData.substr(0, 2)
  ret.content.custId = decodeData.substr(2, 12)
  ret.content.RespCode = decodeData.substr(14, 3)

  }else{
    ret.code= 101
    ret.msg="数据长度错误"
    }
}

/**
 * 0506303032303037333034383030303036302020303031303030
 * @param {原数据} value 
 */
function parseRECORDData(value) {
  var len = hex2Str(value.substring(4, 12))
  var lenInt = stringParseInt(len) * 2
  // var decodeData = hex2Str(value.substring(12))
  if(value.length==lenInt+12){
    ret.code = 0
  ret.msg = "解析成功"
  var decodeData = value.substring(12)
  // console.log("parseRECORDData", decodeData)
  ret.content.cmdId = hex2Str(decodeData.substr(0, 4))
  ret.content.custId = hex2Str(decodeData.substr(4, 24))
  let recordLen =stringParseInt( hex2Str(decodeData.substr(28, 8)))
  ret.content.record = decodeData.substr(36,recordLen*2)
  ret.content.IsLeft = hex2Str(decodeData.substr(36+recordLen*2, 2))
  ret.content.RespCode = hex2Str(decodeData.substr(38+recordLen*2, 6))

  }else{
    ret.code= 101
    ret.msg="数据长度错误"
    }
}
/**
 * 
 * @param {传输数据} str 
 */
function str2Hex(str) {
  let hexStr = ""

  for (var i = 0; i < str.length; i++) {
    console.log("str2Hex  o: " + str[i] + "  r:" + str[i].charCodeAt(i).toString(16))

    if (hexStr == "") {
      hexStr = str.charCodeAt(i).toString(16)
    } else {
      hexStr += str.charCodeAt(i).toString(16)
    }
  }
  // console.log("str2Hex  o: "+str+"  r:"+hexStr)
  return hexStr;
}

function hex2Str(hex) {
  let hexArr = hex.split("")
  let str = ""

  for (var i = 0; i < hexArr.length / 2; i++) {
    let temp = "0x" + hexArr[i * 2] + hexArr[i * 2 + 1]
    let charValue = String.fromCharCode(temp);
    str += charValue
  }
  // console.log("hex2Str  o: " + hex + "  r:" + str)
  return str;
}

function stringParseInt(string) {
  var stringNumber = string.replace(/[^0-9]+/g, '');
  if (stringNumber !== "") {
    return parseInt(stringNumber);
  }
  return NaN;
}


function ab2hex(buffer) {
  let hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2);
    }
  )
  return hexArr.join('');
}

module.exports = {
  parseData: parseData,
  hex2Str:hex2Str

}