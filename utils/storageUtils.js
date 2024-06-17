const _ = {
    ENV: "ENV",
    CUST_ID: "CUST_ID",
    HU_SEQ_ID:'HU_SEQ_ID',
    HOUSE_SEQ_ID:'HOUSE_SEQ_ID',
    LOGIN_INFO:"LOGIN_INFO",
    SESSION_ID:'SESSION_ID',
    COOKIES:'COOKIES',
    LOGIN_TIME:'LOGIN_TIME',
    WX_SEQ_ID:'WX_SEQ_ID',
    HGJ_OPEN_ID:'HGJ_OPEN_ID',
    USR_LIST:'USR_LIST',
    WX_OPEN_ID:'WX_OPEN_ID',
    CST_CODE:'CST_CODE',
    PRO_NUM:'PRO_NUM',
    TOKEN_KEY:'TOKEN_KEY',
    USER_AVATAR_URL:'USER_AVATAR_URL',
    USER_NAME:'USER_NAME',
    CORP_ID:'CORP_ID',
}
/**
 * 缓存处理类
 */
class storage {
    constructor() {

    }

    setStorage(key, value) {
        wx.setStorage(key, value)
    }

    setStorageSync(key, value) {
        wx.setStorageSync(key, value)
    }

    //基本的get类
    getStorage(key) {
        return wx.getStorage(key)
    }

    getStorageSync(key) {
        return wx.getStorageSync(key)
    }

    /**获取用户客户号*/
    getCustId() {
        return  wx.getStorageSync(_.CUST_ID)
    }

    setCustId(value) {
        wx.setStorageSync(_.CUST_ID, value)
    }

    /**获取环境信息*/
    getEnv() {
        return wx.getStorageSync(_.ENV)
    }

    setEnv(value) {
        wx.setStorageSync(_.ENV, value)
    }

    /**获取用户登录信息*/
    getLoginInfo() {
        return wx.getStorageSync(_.LOGIN_INFO)
    }

    /**设置用户登录信息*/
    setLoginInfo(value) {
        wx.setStorageSync(_.LOGIN_INFO, value)
    }


    setSessionId(value){
        wx.setStorageSync(_.SESSION_ID,value);
    }

    setCookies(value){
        wx.setStorageSync(_.COOKIES,value);
    }

    getCookies(){
        return wx.getStorageSync(_.COOKIES);
    }

    getSessionId(){
        return wx.getStorageSync(_.SESSION_ID);
    }

    setHuSeqId(value){
        wx.setStorageSync(_.HU_SEQ_ID, value);
    }
    getHuSeqId(){
        return wx.getStorageSync(_.HU_SEQ_ID);
    }
    setHouseSeqId(value){
        wx.setStorageSync(_.HOUSE_SEQ_ID, value);
    }
    getHouseSeqId(){
        return wx.getStorageSync(_.HOUSE_SEQ_ID);
    }

    setLoginTime(value){
        wx.setStorageSync(_.LOGIN_TIME, value);
    }
    getLoginTime(){
        return wx.getStorageSync(_.LOGIN_TIME);
    }

    setWxSeqId(value){
        wx.setStorageSync(_.WX_SEQ_ID, value);
    }
    getWxSeqId(){
        return wx.getStorageSync(_.WX_SEQ_ID);
    }

    setHgjOpenId(value){
        wx.setStorageSync(_.HGJ_OPEN_ID, value);
    }
    getHgjOpenId(){
        return wx.getStorageSync(_.HGJ_OPEN_ID);
    }
    setUsrList(value){
        wx.setStorageSync(_.USR_LIST, value);
    }
    getUsrList(){
        return wx.getStorageSync(_.USR_LIST);
    }
    setWxOpenId(value){
        wx.setStorageSync(_.WX_OPEN_ID, value);
    }
    getWxOpenId(){
        return wx.getStorageSync(_.WX_OPEN_ID);
    }

    setCstCode(value){
        wx.setStorageSync(_.CST_CODE, value);
    }
    getCstCode(){
        return wx.getStorageSync(_.CST_CODE);
    }
    setCorpId(value){
        wx.setStorageSync(_.CORP_ID, value);
    }
    getCorpId(){
        return wx.getStorageSync(_.CORP_ID);
    }
    setProNum(value){
        wx.setStorageSync(_.PRO_NUM, value);
    }
    getProNum(){
        return wx.getStorageSync(_.PRO_NUM);
    }
    setToken(value){
        wx.setStorageSync(_.TOKEN_KEY, value);
    }
    getToken(){
        return wx.getStorageSync(_.TOKEN_KEY);
    }
    setUserAvatarUrl(value){
        wx.setStorageSync(_.USER_AVATAR_URL, value);
    }
    getUserAvatarUrl(){
        return wx.getStorageSync(_.USER_AVATAR_URL);
    }
    setUserName(value){
        wx.setStorageSync(_.USER_NAME, value);
    }
    getUserName(){
        return wx.getStorageSync(_.USER_NAME);
    }

    /**清除所有的缓存 */
    clearAll(){
        try {
            wx.removeStorageSync(_.CUST_ID);
            wx.removeStorageSync(_.HOUSE_SEQ_ID);
            wx.removeStorageSync(_.HU_SEQ_ID);
            wx.removeStorageSync(_.LOGIN_INFO);
            wx.removeStorageSync(_.SESSION_ID);
            wx.removeStorageSync(_.COOKIES);
            wx.removeStorageSync(_.LOGIN_TIME);
            wx.removeStorageSync(_.WX_SEQ_ID);
            wx.removeStorageSync(_.HGJ_OPEN_ID);
            wx.removeStorageSync(_.USR_LIST);
            wx.removeStorageSync(_.WX_OPEN_ID);
            wx.removeStorageSync(_.CST_CODE);
            wx.removeStorageSync(_.PRO_NUM);
            wx.removeStorageSync(_.TOKEN_KEY);
            wx.removeStorageSync(_.USER_AVATAR_URL);
            wx.removeStorageSync(_.USER_NAME);

            wx.clearStorageSync();
        } catch (error) {
            
        }
    }

    cleanSessionId(){
        wx.removeStorageSync(_.SESSION_ID);
    }
    

}
export default storage