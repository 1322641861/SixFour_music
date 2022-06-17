import { debounce } from "../../../utils/util"
import request from "../../../utils/request"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    type: '',
    tip: '',
    userInfo: {},
    nickname: "",
    candidateNicknames: [], // 备用昵称
    checkOk: true, // 昵称可用
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('options', options);
    let userInfo = JSON.parse(wx.getStorageSync('userInfo'))
    let title = '';
    switch (options.type) {
      case "nickname":
        title = '修改昵称'
        break;
      case "signature":
        title = '修改简介'
        break;
      default:
        break;
    }
    this.setData({title, type: options.type, userInfo, nickname: userInfo.nickname})
  },

  clearValue() {
    this.setData({nickname: '', tip: "昵称不能少于2个汉字或4个英文字母", checkOk: false})
  },
  /// 选择备用名
  checkOtherName(event) {
    let otherName = event.currentTarget.dataset.other;
    this.setData({nickname: otherName, tip: '昵称可用~', checkOk: true, candidateNicknames: []})
  },
  handleNickname(event) {
    let nickname = event.detail.value
    this.setData({nickname})

    let valid = /^[\u4e00-\u9fa5a-zA-Z0-9\-\_]+$/;
    let valid2 = /[\u4e00-\u9fa5]/g;
    let hanReg = nickname.match(valid2);
    let nicknameLen = (hanReg ? hanReg.join("").length : 0) + nickname.length
    if (!nickname || nicknameLen < 4) {
      this.setData({tip: "昵称不能少于2个汉字或4个英文字母", checkOk: false});
    } else if (valid.test(valid)) {
      this.setData({tip: "昵称只支持中英文、数字和-_两个字符", checkOk: false});
    } else if (nicknameLen >= 30) {
      this.setData({tip: "超出字数限制", checkOk: false});
    } else {
      this.checkNicknameExist()
    }
  },

  checkNicknameExist: debounce(function() {
    this.nicknameExistApi();
  }, 800),
  /**
   * 检测昵称是否重复
   */
  async nicknameExistApi() {
    const {nickname} = this.data;
    let res = await request({url: "/nickname/check", data: {nickname}})
    if (res && res.code === 200) {
      if (res.duplicated) {
        this.setData({tip: "昵称已被注册, 可以选择下列名称", candidateNicknames: res.candidateNicknames, checkOk: false})
      } else {
        this.setData({tip: '昵称可用~', candidateNicknames: [], checkOk: true})
      }
    }
    console.log(res);
  },

  submit(event) {
    let value = event.currentTarget.dataset.name
    const { userInfo, nickname, checkOk } = this.data;
    if (value === 'nickname' && checkOk) {
      userInfo.nickname = nickname
      wx.setStorageSync('userInfo', JSON.stringify(userInfo))
      wx.navigateBack({
        delta: 1,
      })
    }
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