// pages/profile/profile.js
import {getCurrentMusic} from '../../utils/util';
import request from "../../utils/request";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    actionList: [
      { icon: 'icon-play', text: '最近播放', name: 'recentlyPlayed' },
      { icon: 'icon-download', text: '本地/下载', name: 'download' },
      { icon: 'icon-cloud', text: '云盘', name: 'cloud' },
      { icon: 'icon-shopping', text: '已购', name: 'purchased' },
      { icon: 'icon-friend', text: '我的好友', name: 'friends' },
      { icon: 'icon-collect', text: '收藏和赞', name: 'collection' },
      { icon: 'icon-boke', text: '我的播客', name: 'podcast' },
      { icon: 'icon-box', text: '音乐盒子', name: 'musicBox' },
    ],
    userInfo: {},
    isPlay: false,
    songInfo: {},
    songData: {},
    createdList: [], // 创建的歌单
    subscribedList: [], // 收藏的歌单
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    getCurrentMusic(this); 
    let userInfo = wx.getStorageSync("userInfo");
    this.setData({
      userInfo: userInfo ? JSON.parse(userInfo) : {}
    })
    this.getPlayList();
  },
  actionNavigate(event) {
    let routerName = event.currentTarget.dataset.name;
    console.log(event, routerName);
  },
  toLogin() {
    wx.navigateTo({
      url: '/pages/auth/login/login'
    })
  },
  /**
   * 跳转歌单
   */
  toSongSheetPage(event) {
    let id  = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/songSheetPage/songSheet?id=' + id,
    })
  },
  /**
   * 获取所有歌单
   * 需要登录, 获取用户uid
   */
  async getPlayList() {
    let uid = this.data.userInfo && this.data.userInfo.userId;
    if (!uid) return;
    // let res = request({url: "/likelist", data: {uid}});
    let res = await request({url: "/user/playlist", data: {uid}});
    if (res && res.code === 200) {
      if (res.playlist && res.playlist.length > 0) {
        let createdList = [];
        let subscribedList = [];
        for (const item of res.playlist) {
          if (item['subscribed']) {
            subscribedList.push(item);
          } else {
            createdList.push(item);
          }
        }
        this.setData({createdList, subscribedList});
      }
    }
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
    if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 2
        })
    }
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