// pages/index/recommendSong/recommendSong.js
import PubSub from 'pubsub-js';
import request from '../../../utils/request';
import { navigateToLogin } from '../../../utils/util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '',
    month: '',
    recommendList: [],
    index: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let date = new Date();
    this.setData({
      day: date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
      month: date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
    });

    let recommendList = wx.getStorageSync('recommendList');
    if (recommendList) {
      this.setData({recommendList});
    } else {
      this.initLoad();
    }
    /// 订阅切换上/下一首
    this.subscribeChangeMusic();
  },
  subscribeChangeMusic() {
    PubSub.subscribe("changeMusic", (msg, type) => {
      let {recommendList, index} = this.data;
      let lastIndex = recommendList.length - 1;
      if (type === 'next') {
        index = index === lastIndex ? 0 : ++index;
      } else {
        index = index === 0 ? lastIndex : --index;
      }
      this.setData({index});
      let id =  recommendList[index].id;
      PubSub.publish("getMusicId", id);
    })
  },
  initLoad() {
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
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
    if (res && res.data) {
      this.setData({
        recommendList: res.data.dailySongs
      })
      wx.setStorageSync('recommendList', res.data.dailySongs);
    }
  },
  navigatePage(event) {
    let {index, musicid} = event.currentTarget.dataset;
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
    console.log(111);
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