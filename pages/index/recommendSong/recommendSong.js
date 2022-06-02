import request from '../../../utils/request';
import { navigateToLogin, getCurrentMusic, playAllSongSheet } from '../../../utils/util';
const appInstance = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '',
    month: '',
    recommendList: [],
    index: 0,
    isPlay: false,
    songInfo: {},
    songData: {},
    musicId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    appInstance.watch('musicId', this.watchCb);

    let date = new Date();
    this.setData({
      day: date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
      month: date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1,
      musicId: appInstance.globalData.musicId
    });

    let recommendList = wx.getStorageSync('recommendList');
    if (recommendList) {
      this.setData({recommendList});
    } else {
      this.initLoad();
    }
  },
  /**
   * 监听songData变化
   */
  watchCb(name, value) {
    if (name === 'musicId') this.setData({musicId: value});
  },
  /// 播放全部
  playAllSongSheet() {
    playAllSongSheet(this.data.recommendList);
  },
  initLoad() {
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.stopPullDownRefresh();
      navigateToLogin();
    } else {
      this.getRecommendList();
    }
  },
  /**
   * 每日推荐歌单
   */
  async getRecommendList() {
    wx.showLoading({
      title: '加载中',
    });
    let res = await request({url: '/recommend/songs'});
    wx.hideLoading();
    wx.stopPullDownRefresh();
    if (res && res.data) {
      this.setData({
        recommendList: res.data.dailySongs
      })
      wx.setStorageSync('recommendList', res.data.dailySongs);
    }
  },
  navigatePage(event, i) {
    let index;
    let musicid;
    if (i >= 0) {
      index = i;
      musicid = this.data.recommendList.length && this.data.recommendList[i].id;
    } else {
      const dataset = event.currentTarget.dataset;
      index = dataset.index;
      musicid = dataset.musicid;
    }
    this.setData({index});
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId=' + musicid,
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
    getCurrentMusic(this);
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
    this.initLoad();
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