import request from "../../../utils/request";
import { getCurrentMusic, playAllSongSheet} from "../../../utils/util"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    recentList: [],
    total: 0,
    isPlay: false,
    songInfo: {},
    songData: {},
    currentSongId: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    getCurrentMusic(this);
    this.getRecentSong();
    let currentSongId = wx.getStorageSync('currentSongId');
    this.setData({currentSongId});
  },
  /**
   * 最近播放
   */
  async getRecentSong() {
    let res = await request({url: "/record/recent/song", data: {limit: 300}});
    if (res && res.code === 200) {
      this.setData({recentList: res.data.list, total: res.data.total});
    }
    console.log(res);
  },

  /// 播放全部
  playAllSongSheet() {
    playAllSongSheet(this.data.recentList);
  },

  /**
   * 跳转
   */
  navigatePage(event, i) {
    let index;
    let musicid;
    if (i >= 0) {
      index = i;
      musicid = this.data.recentList.length && this.data.recentList[i].id;
    } else {
      const dataset = event.currentTarget.dataset;
      index = dataset.index;
      musicid = dataset.musicid;
    }
    this.setData({index});
    wx.navigateTo({
      url: '/pages2/pages/songDetail/songDetail?musicId=' + musicid,
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