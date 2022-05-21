// pages/index/index.js
import request from '../../utils/request';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    personalized: [],
    topList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    /// 轮播图
    this.getBanners();
    /// 推荐歌单
    this.getRecommend();
    /// 排行榜
    this.getTopList();
  },
  getBanners() {
    request({
      url: '/banner',
      data: {
        type: 2
      }
    }).then(res => {
      this.setData({
        banners: res.banners
      })
    });
  },
  getRecommend() {
    request({
      url: "/personalized",
      data: {
        limit: 6
      }
    }).then(res => {
      this.setData({
        personalized: res.result
      })
    });
  },
  async getTopList() {
    let i = 0;
    let topList = [];
    let topData = await request({ url: '/topList' });
    while (i < 5) {
      let topRes = await request({url: "/playlist/detail",data: { id: topData.list[i++].id }});
      topList.push({
        name: topRes.playlist.name,
        desc: topRes.playlist.description,
        list: topRes.playlist.tracks.slice(0, 3)
      });
      this.setData({topList})
    }
    console.log('topList ==> ', topList);
  },
  navigateToPage(event) {
    let index = parseInt(event.currentTarget.dataset.index);
    switch (index) {
      case 0:
        wx.navigateTo({
          url: '/pages/index/recommendSong/recommendSong',
        })
        break;
    
      default:
        break;
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 0
        })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})