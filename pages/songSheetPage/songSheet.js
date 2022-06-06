import request from "../../utils/request";
import {playAllSongSheet, getCurrentMusic} from "../../utils/util"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    creator: {},
    tracks: [],
    playlist: {},
    statusBarHeight: 0,
    isPlay: false,
    songInfo: {},
    songData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    try {
      let systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight * 2 + 20
      })
    } catch (error) {
      console.log(error);
    }
    getCurrentMusic(this);

    let id = options.id;
    this.setData({id});
    this.getPlayListDetail(id);
  },
  goBack() {
    wx.navigateBack({
      delta: 1,
    })
  },
  /**
   * 获取歌单详情
   */
  async getPlayListDetail(id) {
    wx.showLoading({
      title: '加载中...',
    })
    let res = await request({url: "/playlist/detail", data: {id}});
    wx.hideLoading();
    if (res && res.playlist) {
      this.setData({
        creator: res.playlist.creator,
        tracks: res.playlist.tracks,
        playlist: res.playlist
      })
    } else {
      wx.showToast({
        // title: '数据加载失败, 请稍后再试~',
        title: res.msg,
        icon: "none"
      }).then(() => {
        this.setTimer = setTimeout(() => {
          this.goBack();
        }, 800);
      })
    }
  },
  /**
   * 跳转
   */
  navigatePage(event, i) {
    let index;
    let musicid;
    if (i >= 0) {
      index = i;
      musicid = this.data.searchDetailList.length && this.data.searchDetailList[i].id;
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
   /// 播放全部
  playAllSongSheet() {
    playAllSongSheet(this.data.tracks);
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
    if (this.setTimer) clearTimeout(this.setTimer);
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