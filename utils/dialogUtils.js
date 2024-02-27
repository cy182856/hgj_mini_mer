import Dialog from '../miniprogram_npm/@vant/weapp/dialog/dialog';
//弹窗
class dialogUtils {
  constructor() {}
  //msg大于7个字符，使用dialog，否则原生太的dialog
  alert(msg){
    if(msg.length > 7){
      Dialog.alert({
        message: msg,
      }).then(() => {
      })
    }else{
      wx.showToast({
        title: msg,
        icon:'none',
      })
    }
  }
  dialog(msg){
    Dialog.alert({
      message: msg,
    }).then(() => {
    })
  }
  //点击确定，执行回调方法
  alertBack(msg,callback){
    Dialog.alert({
      message: msg,
      asyncClose:true,
    }).then(res => {
      callback
    })
  }
}

export default dialogUtils;
