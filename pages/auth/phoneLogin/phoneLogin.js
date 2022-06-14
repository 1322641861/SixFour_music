import request from "../../../utils/request";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRegister: false, /// 注册界面
    phone: null,
    password: '',
    captcha: null,
    isGetCaptcha: false, /// 输入验证码界面
    captchaPhone: null, // 183****9450
    countDownNum: 0, /// 倒计时
    captchaNum: null, // 验证码
    captchaFocus: false,  // 当focus为true时，键盘将弹出
    isChangePassword: false,
    nickname: '',
  },

  /**
   *  手机登录
   * @param {*} options 
   */
  async loginCellphone() {
    const {phone, password} = this.data;
    /// 1. 验证手机号格式
    let valid = this.phoneValid(phone);
    if (valid) {
      /// 2. 检查手机号是否注册
      let phoneExisted = await this.checkExistence(phone);
      if (phoneExisted) {
        ///  3. 发送验证码
        this.sentCaptcha();
      } else {
        ///  3. 注册
        wx.showModal({
          content: "该号码未注册, 是否切换注册模式?",
          success: (res) => {
            if (res.confirm) {
              this.setData({isRegister: true});
            }
          }
        })
      }
    }
    
  },
  async loginCellphoneApi() {
    let {phone, captchaNum} = this.data;
    let res = await request({url: "/login/cellphone", data: {
      phone, captcha: captchaNum
    }});
    if (res && res.code === 200) {
      /// 用户数据
      wx.setStorageSync("userInfo", JSON.stringify(res.profile));
      wx.reLaunch({
        url: '/pages/index/index',
      }).then((res) => {
        wx.showToast({
          title: '登录成功'
        });
      })
    }
  },

  /**
   * 发送验证码
   */
  async sentCaptcha() {
    const {phone, password} = this.data;
    let hideTel = this.getHideTel(phone);
    this.setData({captcha: hideTel});
    let res = await request({url: "/captcha/sent", data: {phone}});
    if (res && res.code === 200) {
      let countDownNum = 60;
      this.setData({isGetCaptcha: true, countDownNum});
      this.captchaTimer = setInterval(() => {
        countDownNum--;
        this.setData({countDownNum});
        if (countDownNum === 0) {
          this.stopInterval();
        }
      }, 1000);
    } else {
      wx.showToast({
        title: '验证码发送失败',
        icon: "error"
      })
    }
  },

  /**
   * 检查手机号是否已注册
   * @param {*} options 
   */
  async checkExistence(phone) {
    let res = await request({url: "/cellphone/existence/check", data: {phone}});
    if (res && res.code === 200 && res.exist !== -1) {
      this.setData({nickname: res.nickname});
      return true;
    } else {
      return false;
    }
  },

  /**
   * 注册
   * @param {*} options 
   */
  async register() {
    let {phone, password} = this.data;
    let phonePass = this.phoneValid(phone);
    if (!phonePass) return;
    let pswPass = this.passwordValid(password);
    ///  3. 发送验证码
    if (phonePass && pswPass) {
      this.sentCaptcha();
    }
  },
  /// 随机生成nickname
  getNickname(pre = 'sixfour') {
    let nickname = pre + Math.random().toString().split('.')[1];
    return nickname;
  },
  async registerApi() {
    let {phone, captcha, password, nickname} = this.data;
    if (!nickname) nickname = getNickname();
    let res = await request({url: "/register/cellphone", data: {
      phone,
      captcha,
      password,
      nickname,
      isChangePassword
    }});
    if (res && res.code === 200) {
      wx.showModal({
        content: (isChangePassword ? "修改成功" : "注册成功") + ", 是否立即登录?",
        success: () => {
          if (res.confirm) {
            this.loginCellphoneApi();
          } else {
            this.backToChangePhone();
          }
        }
      })
    }
  },

  /**
   * 验证验证码
   */
  async captchaVerifyApi() {
    let {phone, captchaNum, isChangePassword} = this.data;
    let res = await request({url: "/captcha/verify", data: {phone, captcha: captchaNum}});
    if (res && res.code === 200) {
      if (isChangePassword) {
        this.registerApi();
        return;
      }
      let exist = await this.checkExistence(phone);
      if (exist) {
        this.loginCellphoneApi();
      } else {
        this.registerApi();
      }
    } else if (res && res.code === 503) {
      wx.showToast({
        title: res.message,
        icon: "error"
      })
    } else {
      wx.showToast({
        title: res.message,
        icon: "验证失败"
      })
    }
  },
  passwordValid(password) {
    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: "error"
      })
      return false;
    }
    const reg = /(?!^(\d+|[a-zA-Z]+|[~!@#$%^&*?]+)$)^[\w~!@#$%^&*?]{8,20}$/;
    if (reg.test(password)) {
      return true
    } else {
      wx.showToast({
        title: '密码格式错误',
        icon: "error"
      })
      return false;
    }
  },
  phoneValid(value) {
    if (!value) {
      wx.showToast({
        title: '手机号不能为空',
        icon: "error"
      })
      return false;
    }
    if (value.length !== 11) {
      wx.showToast({
        title: '手机号码为11位数',
        icon: "error"
      })
      return false;
    }
    try {
      JSON.parse(value);
      return true;
    } catch (error) {
      console.log(error);
      wx.showToast({
        title: '手机格式错误',
        icon: "error"
      })
      return false;
    }
  },
  getHideTel(tel){
    var reg = /^(\d{3})\d{4}(\d{4})$/;  
    return tel.replace(reg, "$1****$2");
  },
  getCaptchaFocus() {
    this.setData({captchaFocus: true});
  },
  /// 切换账号登录/注册
  changeRegisterType(event) {
    let {register} = event.currentTarget.dataset;
    this.setData({isRegister: register, password: ''})
  },
  /// 返回修改手机号码
  backToChangePhone () {
    this.setData({isGetCaptcha: false, countDownNum: 0});
    this.stopInterval();
  },
  stopInterval() {
    clearInterval(this.captchaTimer);
    this.captchaTimer = null;
  },
  goBack() {
    let {isGetCaptcha} = this.data;
    if (isGetCaptcha) {
      this.backToChangePhone();
    } else {
      wx.navigateBack({
        delta: 1,
      })
    }
  },

  /**
   * 监听输入框内容
   * @param {*} event 
   */
  handleInput(event) {
    /// let type = event.currentTarget.dataset.type;
    // console.log(event);
    let type = event.currentTarget.id;
    this.setData({
      [type]: event.detail.value
    })
  },
  enterCaptcha(event) {
    let value = event.detail.value;
    this.setData({captchaNum: value});
    // if (value.length === 6) {
    //   this.captchaVerifyApi();
    // }
    if (value.length === 4) {
      this.captchaVerifyApi();
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let register = options['register'];
    let isChangePassword = options['isChangePassword'];
    if (register) this.setData({isRegister: register});
    if (isChangePassword) this.setData({isChangePassword});
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