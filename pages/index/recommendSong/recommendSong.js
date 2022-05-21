// pages/index/recommendSong/recommendSong.js
import request from '../../../utils/request';
import { redirectToLogin } from '../../../utils/util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '',
    month: '',
    recommendList: []
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
    let userInfo = wx.getStorageSync('userInfo');
    if (!recommendList && !userInfo) {
      redirectToLogin();
    } else if (!recommendList && userInfo) {
      this.getRecommendList();
    } else {
      this.setData({recommendList});
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
    console.log(res);
    if (res && res.data) {
      this.setData({
        recommendList: res.data.dailySongs
      })
      wx.setStorageSync('recommendList', res.data.dailySongs);
    }
  },
  navigatePage(event) {
    let musicId = event.currentTarget.dataset.musicid;
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId=' + musicId,
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