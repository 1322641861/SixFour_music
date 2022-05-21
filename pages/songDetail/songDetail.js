// pages/songDetail/songDetail.js
import request from '../../utils/request';
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    playMusic: false,
    songInfo: [],
    songUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let musicId = options.musicId;
    this.getMusicInfo(musicId);
    this.getMusicUrl(musicId);

    if (appInstance.globalData.musicId === musicId && appInstance.globalData.isPlayMusic) {
      this.changePlayMusic(true);
    }

    /// 监听背景音频管理器
    this.backgroundAudioManger = wx.getBackgroundAudioManager();
    this.backgroundAudioManger.onPlay(() => {
      this.changePlayMusic(true);
      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManger.onPause(() => {
      this.changePlayMusic(false);
    });
    this.backgroundAudioManger.onStop(() => {
      this.changePlayMusic(false);
    });

    try {
      let systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight
      })
    } catch (error) {
      console.log(error);
    }
  },
  /**
   * 获取歌曲信息
   */
  async getMusicInfo(musicId) {
    let res = await request({url: '/song/detail', data: {ids: musicId}});
    if (res) {
      this.setData({songInfo: res.songs[0]})
    }
  },
  /**
   * 获取歌曲url
   */
  async getMusicUrl(id) {
    let res = await request({url: '/song/url', data: {id: id}});
    if (res) {
      this.setData({songUrl: res.data[0].url});
    }
  },
  changePlayMusic(playMusic) {
    this.setData({playMusic});
    appInstance.globalData.isPlayMusic = playMusic;
  },
  play() {
    let playMusic = this.data.playMusic;
    this.musicControl(playMusic);
  },
  musicControl(playMusic) {
    let data = this.data;
    let timer;
    if (!playMusic && data.songUrl) {
      // this.backgroundAudioManger.play();
      this.changePlayMusic(true);
      timer = setTimeout(() => {
        this.backgroundAudioManger.src = data.songUrl;
        this.backgroundAudioManger.title = data.songInfo.name;
      }, 500)
    } else {
      clearTimeout(timer);
      timer = null;
      this.backgroundAudioManger.pause();
    }
  },
  goBack() {
    wx.navigateBack({
      delta: 1
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