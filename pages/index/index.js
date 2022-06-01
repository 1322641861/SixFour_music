import request from '../../utils/request';
import {getCurrentMusic} from '../../utils/util';
import PubSub from "pubsub-js";
const appInstance = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    personalized: [],
    topList: [],
    isPlay: false,
    songInfo: {},
    songData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.subscribeChangeMusic();
    getCurrentMusic(this); 
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
  /**
   * 顶部导航
   * @param {*} event 
   */
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
   * 切换下一首
   * 注意是否随机模式(type:2)
   */
  subscribeChangeMusic() {
    PubSub.subscribe("changeMusic", (msg, type) => {
      getCurrentMusic(this);
      let audioPlayType = wx.getStorageSync('audioPlayType');
      
      /// 本地缓存, 当前播放歌单列表
      let currentSongSheet = wx.getStorageSync('currentSongSheet');
      let currentSongId = wx.getStorageSync('currentSongId');
      console.log("currentSongSheet", currentSongSheet);
      console.log("currentSongId", currentSongId);
      if (!currentSongSheet || !currentSongSheet.length) {
        // wx.showToast({
        //   title: '请下拉刷新页面',
        //   icon: 'none'
        // });
        PubSub.publish("getMusicId", null);
        return;
      }
      let index = currentSongSheet.findIndex(item => item['id'] === currentSongId);
      console.log("currentSongId => index", index, type);
      let lastIndex = currentSongSheet.length - 1;
      if (audioPlayType === 2) {
        let randomIndex = getRandomIndex(lastIndex);
        index = randomIndex;
      } else {
        if (type === 'next') {
          index = (Object.prototype.toString.call(index) !== '[object Number]' || index === lastIndex) ? 0 : ++index;
        } else {
          index = index === 0 ? lastIndex : --index;
        }
      }
      this.setData({index});
      wx.setStorageSync('currentSongId', currentSongSheet[index].id);
      let id = currentSongSheet[index].id;
      PubSub.publish("getMusicId", id);
    })
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
    console.log('index onShow');
    getCurrentMusic(this); 
    console.log(this.data.songData);
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