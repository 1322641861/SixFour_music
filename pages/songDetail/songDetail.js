// pages/songDetail/songDetail.js
import request from '../../utils/request';
import PubSub from "pubsub-js";
import moment from "moment";

const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    playMusic: false, // 当前音频是否播放中
    songInfo: [],
    songUrl: '',
    loading: false, // url获取中
    currentTime: '00:00',
    durationTime: "00:00",
    progressMoving: false, // 拖动状态
    currentWidth: 0, // 进度条
    isPlayedMusic: false, // 当前音频是否播放过
    musicId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let musicId = JSON.parse(options.musicId, 10);

    console.log('globalData', appInstance.globalData, options);
    let isPlayedMusic = appInstance.globalData.musicId === musicId;
    this.setData({isPlayedMusic, musicId});
    if (isPlayedMusic && appInstance.globalData.isPlayMusic) {
      this.changePlayMusic(true);
      this.setData(Object.assign(
        appInstance.globalData.songData, 
        {songInfo: appInstance.globalData.songInfo}
      ));
    } else if (isPlayedMusic && !appInstance.globalData.isPlayMusic) {
      this.setData(Object.assign(
        appInstance.globalData.songData, 
        {songInfo: appInstance.globalData.songInfo}
      ));
    } else {
      this.getMusicInfo(musicId).then(() => {
        this.getMusicUrl(musicId);
      });
    }

    /// 监听背景音频管理器
    this.handleBgAudioMangerAll(musicId);

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
      let song = res.songs[0];
      let durationTime = moment(song.dt).format("mm:ss");
      // let musicSecTimeLen = Math.round(song.dt / 1000);
      this.setData({
        songInfo: song,
        durationTime
      });
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

  /**
   * 音频监听大全
   */
  handleBgAudioMangerAll(musicId) {
    this.backgroundAudioManger = wx.getBackgroundAudioManager();
    this.backgroundAudioManger.onPlay(() => {
      this.changePlayMusic(true);
      appInstance.globalData.musicId = this.data.musicId;
      console.log('play....', appInstance.globalData);
      this.setData({isPlayedMusic: true});
    });
    this.backgroundAudioManger.onPause(() => {
      console.log('pause...');
      this.changePlayMusic(false);
      // 暂停时缓存当前音乐
      this.setMusicData();
    });
    this.backgroundAudioManger.onStop(() => {
      this.changePlayMusic(false);
    });
    this.backgroundAudioManger.onTimeUpdate(() => {
      let data = this.data;
      if (data.progressMoving || data.loading) return;
      let bgCurrentTime = this.backgroundAudioManger.currentTime;
      let bgDurationTime = this.backgroundAudioManger.duration;
      let currentTime = moment(bgCurrentTime * 1000).format("mm:ss");
      let currentWidth = bgCurrentTime / bgDurationTime * Math.floor(bgDurationTime * 1000);
      this.setData({currentTime, currentWidth});
      // 只缓存当前正在播放的音乐
      if (data.isPlayedMusic) this.setMusicData();
    });
    this.backgroundAudioManger.onEnded(() => {
      console.log('next');
      this.changePreNextMusic(this, 'next');
    });
    this.backgroundAudioManger.onError(() => {
      wx.showToast({
        title: '音频错误',
        icon: "none"
      })
      this.changePreNextMusic(this, 'next');
    });
    this.backgroundAudioManger.onWaiting(() => {
      console.log('onWaiting...');
    });
    this.backgroundAudioManger.onCanplay(() => {
      console.log('onCanplay...');
    })
  },
  /// 全局缓存当前歌曲的进度
  setMusicData() {
    const data = this.data;
    appInstance.globalData.songInfo = data.songInfo;
    appInstance.globalData.songData = {
      currentTime: data.currentTime, 
      durationTime: data.durationTime,
      songUrl: data.songUrl,
      currentWidth: data.currentWidth,
      musicId: data.musicId
    }
  },
  /**
   * 播放/暂停音乐
   * @param {*} playMusic 
   */
  changePlayMusic(playMusic) {
    this.setData({playMusic});
    appInstance.globalData.isPlayMusic = playMusic;
  },
  play() {
    let playMusic = this.data.playMusic;
    this.musicControl(playMusic);
  },
  musicControl(playMusic) {
    console.log('musicControl..', playMusic, this.backgroundAudioManger.src);
    let data = this.data;
    let timer;
    if (!playMusic && data.songUrl) {
      // this.backgroundAudioManger.play();
      if (data.songUrl !== this.backgroundAudioManger.src) this.backgroundAudioManger.stop();
      console.log('stop...', this.backgroundAudioManger.src);
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
  /// 跳转的位置，单位 s。精确到小数点后 3 位，即支持 ms 级别精确度
  musicToSeek(currentTime) {
    this.backgroundAudioManger.seek(currentTime);
  },
  /**
   * 切换上/下一首
   * PubSub 订阅发布
   */
  changePreNextMusic(event, flag) {
    console.log('changePreNextMusic', this.data.loading);
    if (this.data.loading) return;
    this.backgroundAudioManger.pause();
    this.setData({
      loading: true, 
      currentWidth: 0, 
      currentTime: "00:00",
      durationTime: "00:00",
      playMusic: false
    });
    let type = flag ?? event.currentTarget.dataset.type;
    PubSub.publish("changeMusic", type);
    PubSub.subscribe('getMusicId', (msg, id) => {
      this.getMusicInfo(id).then(() => {
        this.getMusicUrl(id).then(() => {
          this.setData({loading: false, musicId: id});
          this.musicControl(false);
        });
      });
      PubSub.unsubscribe("getMusicId");
    })
  },
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },
  /**
   * 音频滑块
   */
  handleMoving(value) {
    let current = value.detail.value;
    let currentTime = moment(current).format("mm:ss");
    console.log('handleMoving', value);
    this.setData({
      currentTime,
      progressMoving: true
    })
  },
  handleEnd(value) {
    let current = value.detail.value;
    let currentTime = moment(current).format("mm:ss");
    this.musicToSeek(current / 1000);
    this.setData({
      progressMoving: false,
      currentTime
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