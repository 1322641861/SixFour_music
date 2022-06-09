App({
  globalData: {
    musicId: 0,
    isPlayMusic: false,
    songInfo: {},
    songData: {},
    audioPlayType: 0, // 0 列表循环 1 单曲循环 2 随机播放
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    let songInfo = wx.getStorageSync('songInfo');
    let songData = wx.getStorageSync('songData');
    let musicId = songData.musicId;
    Object.assign(this.globalData, {songInfo, songData, musicId});
  },
  /**
   * 监听全局变量变化
   */
  watch: function (variate, method) {
    let obj = this.globalData;
    let val = obj[variate];
    Object.defineProperty(obj, variate, {
      configurable: false,
      enumerable: true,
      set: function (value) {
        val = value;
        method(variate, value);
      },
      get: function () {
        // 在其他界面调用getApp().globalData.variate的时候，这里就会执行。
        return val;
      }
    })
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})
