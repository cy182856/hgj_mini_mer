var api = require('../const/api');
import storage from "./storageUtils";

const _ = {
  // method type
  POST: 'POST',
  GET: 'GET',
  DELETE: 'DELETE',
  PUT: 'PUT',
  CONTENT_TYPE_JSON: 'application/json',
  CONTENT_TYPE_OTHER: 'application/x-www-form-urlencoded',
  // dataType 返回值类型
  DATA_TYPE_JSON: 'json',
};

class req {
  constructor() {
    this._header = {
      'content-type': 'application/json',
      'Cookie': new storage().getCookies().toString(),
      'token':new storage().getToken().toString(),
    }
  }

  error() {
    var errObj = {};
    var data = {};
    errObj['data'] = data;
    data['respCode'] = 'EEE';
    data['RESPCODE'] = 'EEE';
    data['errDesc'] = '网络异常，请稍后再试';
    data['ERRDESC'] = '网络异常，请稍后再试';
    return errObj;
  }
  setCookie(cookie) {
    this._header.Cookie = new storage().getSessionId;
  }

  setTemp(url, data, header, method) {
    this._url = url;
    this._data = data;
    this._header = header;
    this._method = method;
  }

  /**
   * GET类型的网络请求
   */
  getRequest(url, data, header = this._header) {
    var token = new storage().getToken().toString();
    if(token == null || token == ""){
      wx.redirectTo ({
        url: '../../../../pages/home/home',
      })
      return;
    }
    if (!this.checkLogin(url)) {
      console.log('session失效，重新登录');
      var that = this;
      var result;
      return new Promise((resolve, reject) => {
        this.doLogin(0).then(value => {
          var header = {
            'Cookie': new storage().getCookies().toString(),
            'content-type': 'application/json',
            'token': new storage().getToken().toString()
          }
          that.requestAll(url, data, header, _.GET).then(res => {
            result = res;
            resolve(result);
          })
        })
        resolve(result);
      })

    } else {
      var header = {
        'Cookie': new storage().getCookies().toString(),
        'content-type': 'application/json',
        'token': new storage().getToken().toString()
      }
      return this.requestAll(url, data, header, _.GET)
    }
  }

  /**
   * DELETE类型的网络请求
   */
  deleteRequest(url, data, header = this._header) {
    return this.requestAll(url, data, header, _.DELETE)
  }


  /**
   * PUT类型的网络请求
   */
  putRequest(url, data, header = this._header) {
    return this.requestAll(url, data, header, _.PUT)
  }

  /**
   * POST类型的网络请求
   */
  postRequest(url, data, header = this._header) {
    var token = new storage().getToken().toString();
    if(token == null || token == ""){
      wx.redirectTo ({
        url: '../../../../pages/home/home',
      })
      return;
    }
    if (!this.checkLogin(url)) {
      console.log('session失效，重新登录');
      var that = this;
      var result;
      return new Promise((resolve, reject) => {
        this.doLogin(0).then(value => {
          var header = {
            'Cookie': new storage().getCookies().toString(),
            'content-type': 'application/json',
            'token': new storage().getToken().toString()
          }
          that.requestAll(url, data, header, _.POST).then(res => {
            resolve(res);
          })
        })
      })
    } else {
      var header = {
        'Cookie': new storage().getCookies().toString(),
        'content-type': 'application/json',
        'token': new storage().getToken().toString()
      }
      return this.requestAll(url, data, header, _.POST);
    }

  }

  /**
   * 登录
   * 0 - 默认刷新
   * 1 - 默认登录，直接进入小程序的登录
   * 2 - 菜单进入小程序
   * 3 - 模版消息进入小程序
   * 4 - 账户切换
   */
  doLogin(source, custId, hgjOpenId, wxSeqId, huSeqId, cstCode, wxOpenId, proNum) {
    wx.removeStorageSync('COOKIES');
    let s = new storage();
    let localCustId = s.getCustId();
    let localWxSeqId = s.getWxSeqId();
    let localHgjOpenId = s.getHgjOpenId();

    switch (source) {
      case 0:
        if (localCustId == '' || localCustId == undefined) {
          return this.loginByDefault();
        } else {
          return this.loginByFlush(localCustId, localWxSeqId, localHgjOpenId);
        }
        case 1:
          return this.loginByDefault(localCustId);
        case 2:
          return this.loginFromMenu(custId);
        case 3:
          return this.loginFromTemplet(custId, huSeqId);
        case 4:
          return this.loginByChangeCount(custId, wxSeqId, hgjOpenId);
        case 5:
          return this.loginByChangeCount5(cstCode, wxOpenId, proNum);
        default:
          return this.loginByDefault(localCustId);
    }
  }

  //从菜单进入，进行登录
  loginFromMenu(custId) {
    console.log('network loginFromMenu', custId);
    let that = this;
    let d = {};
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          // console.log('菜单进来的登录结果',res);
          if (res.code) {
            //发起网络请求
            d['code'] = res.code;
            d['custId'] = custId;
            console.log('菜单进来的登录,登录参数', d);
            this.requestBase(api.LOGIN, d, _.POST).then(value => {
              if (value.data.respCode == 'EEE') {
                resolve(this.error());
              } else if (value.data.respCode != '000') {
                console.log('from menu login,login fail ...', value);
                that.toErrorPage(value.data.errDesc);
                resolve(value);
              } else {
                //设置缓存
                that.setCache(value);
                resolve(value);
              }
            })
          } else {
            console.log('微信的登录接口获取code失败，菜单进来登录失败！' + res.errMsg)
          }
        },
        fail: res => {
          console.log('微信登录接口登录失败', res);
          resolve(this.error());
        }
      })
    });
  }

  //从模版消息进入，进行登录
  loginFromTemplet(custId, huSeqId) {
    console.log('network loginFromTemplet', custId, huSeqId);
    let that = this;
    let d = {};
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          console.log(res);
          if (res.code) {
            //发起网络请求
            d['code'] = res.code;
            d['custId'] = custId;
            d['huSeqId'] = huSeqId;
            console.log('模版消息进来的', d);
            this.requestBase(api.LOGIN, d, _.POST).then(value => {
              if (value.data.respCode == 'EEE') {
                resolve(this.error());
              } else if (value.data.respCode != '000') {
                that.toErrorPage(value.data.errDesc);
                resolve(value);
              } else {
                that.setCache(value);
                resolve(value);
              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        },
        fail: res => {
          console.log('微信的登录接口失败', res);
          resolve(this.error());
        }
      })
    });
  }

  //用户切换登录
  loginByChangeCount(custId, wxSeqId, hgjOpenId) {
    console.log('network loginByChangeCount', custId, wxSeqId, hgjOpenId);
    let that = this;
    let d = {};
    d['custId'] = custId;
    d['wxSeqId'] = wxSeqId;
    d['hgjOpenId'] = hgjOpenId;
    //发起网络请求
    return new Promise((resolve, reject) => {
      that.requestBase(api.LOGIN, d, _.POST).then(value => {
        if (value.data.respCode == 'EEE') {
          resolve(this.error());
        } else if (value.data.respCode != '000') {
          var desc = value.data.errDesc;
          that.toErrorPage(desc);
          resolve(this.error());
        } else {
          that.setCache(value);
          resolve(value);
        }
      })
    });
  }

  //用户切换登录
  loginByChangeCount5(cstCode, wxOpenId, proNum) {
    console.log('network loginByChangeCount5', cstCode, wxOpenId, proNum);
    let that = this;
    let d = {};
    d['cstCode'] = cstCode;
    d['wxOpenId'] = wxOpenId;
    d['proNum'] = proNum;
    //发起网络请求
    return new Promise((resolve, reject) => {
      that.requestBase(api.LOGIN, d, _.POST).then(value => {
        if (value.data.respCode == 'EEE') {
          resolve(this.error());
        } else if (value.data.respCode != '000') {
          var desc = value.data.errDesc;
          that.toErrorPage(desc);
          resolve(this.error());
        } else {
          that.setCache(value);
          resolve(value);
        }
      })
    });
  }

  //10分钟的本地刷新，
  loginByFlush(localCustId, localWxSeqId, localHgjOpenId) {
    console.log('network loginByFlush', localCustId, localWxSeqId, localHgjOpenId);
    let that = this;
    let d = {};
    d['custId'] = localCustId;
    d['wxSeqId'] = localWxSeqId;
    d['hgjOpenId'] = localHgjOpenId;
    //发起网络请求
    return new Promise((resolve, reject) => {
      that.requestBase(api.LOGIN, d, _.POST).then(value => {
        if (value.data.respCode == 'EEE') {
          resolve(this.error());
        } else if (value.data.respCode != '000') {
          var desc = value.data.errDesc;
          that.toErrorPage(desc);
          resolve(this.error());
        } else {
          that.setCache(value);
          resolve(value);
        }
      })
    });
  }

  //直接进入小程序,默认登录
  loginByDefault(custId) {
    console.log('network default', custId);
    let that = this;
    let d = {};
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          if (res.code) {
            //发起网络请求
            d['code'] = res.code;
            d['custId'] = custId;
            this.requestBase(api.LOGIN, d, _.POST).then(value => {
              if (value.data.respCode == 'EEE') {
                resolve(this.error());
              } else if (value.data.respCode != '000') {
                console.log('login fail ...', value);
                let desc = value.data.errDesc;
                that.toErrorPage(desc);
                resolve(value);
              } else {
                that.setCache(value);
                resolve(value);
              }
            })
          } else {
            console.log('默认登录失败！' + res.errMsg)
            resolve(res);
          }
        },
        fail: res => {
          console.log('微信小程序登录接口失败', res);
          resolve(this.error());
        }
      })
    });
  }



  //进入错误的提示页面
  toErrorPage(errorDesc) {
    let desc = errorDesc;
    if (desc == '' || desc == undefined) {
      desc = '请联系相关物业管理人员开通后再登录小程序！';
    }
    // wx.reLaunch({
    //   url: '/pages/noauth/noauth?errDesc=' + desc
    // });
  }

  //设置缓存
  setCache(value) {
    let obj = new storage();
    obj.setLoginInfo(value.data);
    obj.setCookies(value.cookies);
    obj.setSessionId(value.data.sessionId);
    obj.setHuSeqId(value.data.huSeqId);
    obj.setCustId(value.data.custId);
    obj.setHouseSeqId(value.data.houseSeqId);
    obj.setLoginTime(new Date().getTime());
    obj.setWxSeqId(value.data.wxSeqId);
    obj.setHgjOpenId(value.data.hgjOpenId);
  }

  checkLogin(url) {
    console.log('start check', url);
    if (url.indexOf(".do") != -1) {
      console.log('need check session' + url.indexOf(".do"));
      var seeionId = new storage().getSessionId();
      if (!(seeionId && seeionId != null)) {
        console.log('session is no use,do login again');
        return false;
      }
      console.log('session is ok');
      return true;
    } else if (url.indexOf("doLogin") != -1) {
      console.log('登录,直接调用登录...');
      return false;
    } else {
      console.log('not need check session');
      return true;
    }

  }



  /**
   * 网络请求
   */
  requestAll(url, data, header, method) {
    var token = new storage().getToken().toString();
    if(token == null || token == ""){
      wx.redirectTo ({
        url: '../../../../pages/home/home',
      })
      return;
    }
    console.log('send data is :', data);
    let that = this;
    var header = {
      'Cookie': new storage().getCookies().toString(),
      'content-type': 'application/json',
      'token': new storage().getToken().toString()
    }
    console.log('当前访问的header', url, header)
    return new Promise((resolve, reject) => {
      let req = wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        success: (res => {
          //104是session失效的特殊返回码，需重新登录
          var result = res;
          console.log('result:', res);
          //if (res.data.respCode == '104' && url.indexOf("doLogin") == -1) {
            if (res.statusCode == '401' && url.indexOf("doLogin") == -1) {
            that.setTemp(url, data, header, method);
            // var that = this;
            console.log('need doLogin again');
            // debugger;
            that.doLogin(0).then(v => {
              that.requestBase(that._url, that._data, that._method).then(v1 => {
                // debugger;
                console.log('回掉成功了');
                result = v1;
                // wx.hideLoading();
                if (result.statusCode === 200) {
                  //200: 服务端业务处理正常结束
                  resolve(result)
                } else {
                  resolve(this.error());
                }
              }).catch(res => {
                resolve(this.error());
              });
            })
          } else {
            if (res.statusCode === 200) {
              //200: 服务端业务处理正常结束
              resolve(res)
            } else {
              //其它错误，提示用户错误信息
              resolve(this.error());
            }
          }
        }),
        fail: (res => {
          that.toErrorPage('网络异常，请稍后再试!')
          resolve(this.error());
        })
      })

    })
  }


  /**
   * 网络请求基础方法
   */
  requestBase(url, data, method) {
    let that = this;
    var header = {
      'Cookie': new storage().getCookies().toString(),
      'content-type': 'application/json'
    }
    console.log('send data is :', data);
    console.log('当前访问的header', url, header)
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        success: (res => {
          console.log('cookie .......', res);
          if (res.statusCode === 200) {
            //200: 服务端业务处理正常结束
            resolve(res)
          } else {
            resolve(this.error());
          }

        }),
        fail: (res => {
          that.toErrorPage('网络异常，请稍后再试！');
          resolve(this.error());
        })
      })
    })
  }

}



export default req