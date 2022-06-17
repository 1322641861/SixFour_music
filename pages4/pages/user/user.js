import moment from "moment";
import utils from "../../../utils/config"
import request from "../../../utils/request"
import area from "../../../utils/city"

const citySelector = requirePlugin('citySelector');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},

    birthday: '未知',
    birthdayStamp: 0,

    selectorVisible: false,
    selectedProvince: null,
    selectedCity: null,
    key: "PXZBZ-IYU6K-G7UJJ-ASUPV-W3Y5H-SWFBN", // 使用在腾讯位置服务申请的key
    referer: utils.appName, // 调用插件的app的名称
    hotCitys: '北京,上海,广州,深圳', // 用户自定义的的热门城市
    initCity: '',

    genderList: ['保密', '男性', '女性'],
    gender: 0,

    nickname: '',
    signature: '', // 签名
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userInfo = JSON.parse(wx.getStorageSync('userInfo'))
    console.log(userInfo, utils.appName);
    let birthday = this.getBirthday(userInfo.birthday)
    let initCity = area[userInfo.province] + ' ' + area[userInfo.city];
    this.setData({
      userInfo, birthday, 
      gender: userInfo.gender, 
      birthdayStamp: userInfo.birthday,
      nickname: userInfo.nickname,
      signature: userInfo.signature,
      initCity
    })
  },

  getBirthday(timeStamp) {
    if (!timeStamp) return '未知'
    const time = moment(timeStamp).format("yyyy-MM-DD");
    return time;
  },

  /**
   * 城市选择
   */
  getCity() {
    // const {key, referer, hotCitys} = this.data;
    // console.log(referer);
    // wx.navigateTo({
    //   url: `plugin://citySelector/index?key=${key}&referer=${referer}&hotCitys=${hotCitys}`,
    // })
    this.showSelector()
  },
  // 显示组件
  showSelector() {
    this.setData({
      selectorVisible: true,
    });
  },
  // 当用户选择了组件中的城市之后的回调函数
  onSelectCity(e) {
    const { province, city } = e.detail;
    this.setData({
      selectedProvince: province,
      selectedCity: city,
    });
    this.userInfoUpdate();
  },

  /**
   * 修改资料
   * 接口暂不支持
   */
  userInfoUpdate() { 
    const { gender, birthdayStamp, nickname, signature, selectedProvince, selectedCity, userInfo } = this.data;
    Object.assign(userInfo, {
      gender,
      signature,
      city: selectedCity.id,
      nickname,
      birthday: birthdayStamp,
      province: selectedProvince.id
    })
    wx.showLoading({
      title: '加载中...',
    })
    setTimeout(() => {
      wx.setStorageSync('userInfo', JSON.stringify(userInfo))
      this.setData({userInfo})
      // let info = {
      //   gender,
      //   signature,
      //   city: selectedCity.id,
      //   nickname,
      //   birthday: birthdayStamp,
      //   province: selectedProvince.id
      // }
      // console.log('info', info);
      wx.hideLoading()
    }, 2000)
    // let res = await request({url: '/user/update', data: info})
  },

  goToChange(event) {
    let type = event.currentTarget.dataset.type
    wx.navigateTo({
      url: '/pages4/pages/userChange/userChange?type=' + type,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({userInfo: JSON.parse(userInfo)})
    // 从城市选择器插件返回后，在页面的onShow生命周期函数中能够调用插件接口，获取cityInfo结果对象
    // const selectedCity = citySelector.getCity(); // 选择城市后返回城市信息对象，若未选择返回null
    // console.log('selectedCity', selectedCity);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时清空插件数据，防止再次进入页面，getCity返回的是上次的结果
    citySelector.clearCity();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})