// pages/index/recommendSong/recommendSong.js
import PubSub from 'pubsub-js';
import request from '../../../utils/request';
import { navigateToLogin, getRandomIndex } from '../../../utils/util';
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
    songData: {}
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
    // this.subscribeChangeMusic();
  },
  /**
   * 获取当前正在播放/暂停状态的歌曲
   */
  getCurrentMusic() {
    let isPlay = appInstance.globalData.isPlayMusic;
    let songInfo = wx.getStorageSync('songInfo');
    let songData = wx.getStorageSync('songData');
    this.setData({isPlay, songInfo, songData});
  },
  /**
   * 切换下一首
   * 注意是否随机模式(type:2)
   */
  // subscribeChangeMusic() {
  //   PubSub.subscribe("changeMusic", (msg, type) => {
  //     this.getCurrentMusic();
  //     let audioPlayType = wx.getStorageSync('audioPlayType');
      
  //     /// 需要修改一下 recommendList => 改成当前播放歌单
  //     /// 本地缓存, 组件中直接获取即可
  //     let {recommendList, songData} = this.data;
  //     if (!recommendList || !recommendList.length) {
  //       wx.showToast({
  //         title: '请下拉刷新页面',
  //         icon: 'none'
  //       });
  //       PubSub.publish("getMusicId", null);
  //       return;
  //     }
  //     let index = recommendList.findIndex(item => item['id'] === songData['musicId']);
  //     let lastIndex = recommendList.length - 1;
  //     if (audioPlayType === 2) {
  //       let randomIndex = getRandomIndex(lastIndex);
  //       index = randomIndex;
  //     } else {
  //       if (type === 'next') {
  //         index = index === lastIndex ? 0 : ++index;
  //       } else {
  //         index = index === 0 ? lastIndex : --index;
  //       }
  //     }
  //     this.setData({index});
  //     let id = recommendList[index].id;
  //     PubSub.publish("getMusicId", id);
  //   })
  // },
  /// 播放全部
  playAllSongSheet() {
    wx.setStorageSync('currentSongSheet', this.data.recommendList);
    wx.setStorageSync('currentSongId', this.data.searchDetailList[0].id);
    this.navigatePage(null, 0);
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
    this.getCurrentMusic();
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