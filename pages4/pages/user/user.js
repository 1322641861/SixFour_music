import moment from "moment";
import utils from "../../../utils/config"
import area from "../../../utils/city"
import request from "../../../utils/request"
// import FormData from "../../../utils/formdate/formdata"

const citySelector = requirePlugin('citySelector');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},

    birthday: '未知',
    birthdayStamp: 0,
    endDates: '',

    selectorVisible: false,
    selectedProvince: null,
    selectedCity: null,
    key: utils.mapKey, // 使用在腾讯位置服务申请的key
    referer: utils.appName, // 调用插件的app的名称
    hotCitys: '北京,上海,广州,深圳', // 用户自定义的的热门城市
    initCity: '',
    // region: ['广东省', '广州市', '海珠区'],

    genderList: ['保密', '男性', '女性'],
    gender: 0,
    showSexToast: false,

    nickname: '',
    signature: '', // 签名
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userInfo = JSON.parse(wx.getStorageSync('userInfo'))
    const birthday = this.getBirthday(userInfo.birthday)
    const endDates = this.getBirthday(new Date())
    const initCity = area[userInfo.province] + ' ' + area[userInfo.city];
    this.setData({
      userInfo, birthday, 
      gender: userInfo.gender, 
      birthdayStamp: userInfo.birthday,
      nickname: userInfo.nickname,
      signature: userInfo.signature,
      initCity,
      endDates
    })
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
   * 修改性别
   */
  closeSex() {
    console.log('close');
    this.setData({showSexToast: false})
  },
  showSex() {
    console.log('show');
    this.setData({showSexToast: true})
  },
  selectCurrentSex(event) {
    let sex = JSON.parse(event.currentTarget.dataset.sex);
    const { userInfo } = this.data;
    userInfo.gender = sex;
    this.setData({gender: sex})
    wx.setStorageSync('userInfo', JSON.stringify(userInfo))
    this.closeSex()
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

  /** 
   * 图片选择
  */
  async updateAvatar(file) {
    console.log('file', file);
    const { userInfo } = this.data;
    userInfo.avatarUrl = file;
    
    wx.showLoading({
      title: "上传中...",
    })
    setTimeout(() => {
      this.setData({userInfo})
      wx.setStorageSync('userInfo', JSON.stringify(userInfo))
      wx.hideLoading()
    }, 1500);
    
    // let cookies = wx.getStorageSync('cookies');
    // const cookie = cookies ? cookies.find(item => item.indexOf('MUSIC_U') > -1) : ''
    // let formData = new FormData()
    // formData.append("imgFile", file)
    // formData.appendFile("imgFile", file)
    // const data = formData.getData();
    // let res = await request({
    //   url: `/avatar/upload?imgSize=200px&imgX=0&imgY=0&timestamp=${Date.now()}`,
    //   method: "POST",
    //   header: {
    //     'content-type': data.contentType
    //   },
    //   data: data.buffer
    // })

    // wx.uploadFile({
    //   url: `${config.domain}/avatar/upload?cookie=${cookie}&imgSize=200px&imgX=0&imgY=0&timestamp=${Date.now()}`,
    //   filePath: file,
    //   name: 'file',
    //   formData: {
    //     'imgFile': data.buffer
    //   },
    //   header: {
    //     'content-type': data.contentType
    //   },
    //   success (res){
    //     console.log('uploadFile', res);
    //     const data = res.data
    //     //do something
    //   }
    // })
  },
  chooseImage() {
    let that = this;
    wx.chooseMedia({
      count: 1  ,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success(res) {
        console.log(res.tempFiles);
        that.updateAvatar(res.tempFiles[0].tempFilePath)
        // that.getImgSize(res.tempFiles[0].tempFilePath)
      }
    })
  },

  /**
   * picker组件
   * 日期选择器
   */
  bindDateChange: function (e) {
    const birthday = e.detail.value
    const {userInfo} = this.data;
    userInfo.birthday = Number(this.getBirthday(birthday, true))
    wx.setStorageSync('userInfo', JSON.stringify(userInfo))
    this.setData({
      birthday,
      userInfo
    })
  },
  getBirthday(timeStamp, toStamp = false) {
    if (!timeStamp) return '未知'
    let time = !toStamp ? moment(timeStamp).format("yyyy-MM-DD") : moment(timeStamp).format("x");
    return time;
  },

  /// 省市区选择器
  // bindRegionChange: function (e) {
  //   console.log('picker发送选择改变，携带值为', e.detail.value)
  //   this.setData({
  //     region: e.detail.value
  //   })
  // },

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
    let userInfo = JSON.parse(wx.getStorageSync('userInfo'))
    this.setData({userInfo, nickname: userInfo.nickname, signature: userInfo.signature})
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