import request from "../../../utils/request";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    password: '',
    disabled: false,
    isLayout: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.isLayout) {
      this.setData({isLayout: options.isLayout});
    }
  },
  closeCurrentPage() {
    if (this.data.isLayout) {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    } else {
      wx.navigateBack({
        delta: 1,
      })
    }
  },
  handleInput(event) {
    /// let type = event.currentTarget.dataset.type;
    let type = event.currentTarget.id;
    this.setData({
      [type]: event.detail.value
    })
  },
  valid() {
    let {phone, password} = this.data;
    if (!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: "none"
      });
      return false;
    }

    let phoneValid = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
    if (!phoneValid.test(phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: "none"
      });
      return false;
    }

    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: "none"
      });
      return false;
    }
    return true;
  },
  login() {
    if (!this.valid()) return;

    /// 前端校验成功
    let {phone, password} = this.data;
    this.setData({disabled: true});
    request({
      url: '/login/cellphone',
      data: {phone, password, isLogin: true}
    }).then(res => {
      this.setData({disabled: false});
      if (res.code === 200) {
        wx.showToast({
          title: '登录成功'
        });
        /// 用户数据
        wx.setStorageSync("userInfo", JSON.stringify(res.profile));
        wx.reLaunch({
          url: '/pages/index/index',
        })
      } else if (res.code === 400) {
        wx.showToast({
          title: '手机号错误',
          icon: "none"
        });
      } else if (res.code === 502) {
        wx.showToast({
          title: '密码错误',
          icon: "none"
        });
      } else {
        wx.showToast({
          title: res.msg,
          icon: "none"
        });
      }
    })
  },

  toPhoneLoginPage(event) {
    let register = event.currentTarget.dataset['register'];
    let isChangePassword = event.currentTarget.dataset['password'];
    if (register) {
      wx.navigateTo({
        url: '/pages/auth/phoneLogin/phoneLogin?register=' + register,
      })
    } else if (isChangePassword) {
      wx.navigateTo({
        url: '/pages/auth/phoneLogin/phoneLogin?isChangePassword=' + isChangePassword,
      })
    } else {
      wx.navigateTo({
        url: '/pages/auth/phoneLogin/phoneLogin',
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