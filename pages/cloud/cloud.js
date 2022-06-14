// pages/cloud/cloud.js
import request from "../../utils/request";
import {getCurrentMusic} from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupList: [],
    activedId: 0,
    videoList: [],
    currentVid: '',
    triggered: false, // 刷新
    offset: 0, // 分页参数,
    hasMore: true, // 是否可以触发上拉加载
    scrollTop: 0,
    keyword: '', // 搜索框内的默认关键字
    isPlay: false,
    songInfo: {},
    songData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getSearchDefault();
    getCurrentMusic(this); 

    /// 标签/分类列表
    let groupList = wx.getStorageSync('groupList');
    if (!groupList) {
      this.getVideoGroupList();
    } else {
      this.setData({groupList, activedId: groupList[0].id});
      this.getCurrentVideoList(this.data.activedId);
    }
    /// 分类列表
    // this.getVideoTimeline();
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    getCurrentMusic(this); 
  },

  /**
   * 获取tab
   */
  async getVideoGroupList() {
    let res = await request({ url: "/video/group/list" });
    this.setData({
      groupList: res.data.slice(0, 11),
      activedId: res.data[0].id
    })
    wx.setStorageSync('groupList', this.data.groupList)
    /// 获取分类视频
    this.getCurrentVideoList(this.data.activedId);
  },

  /**
   * 当前分类所有视频
   *  */ 
  async getCurrentVideoList(videoId, isPullMore=false) {
    let res = await request({
      url: "/video/group",
      data: {
        id: videoId,
        offset: this.data.offset
      },
    });
    if (res && res.datas) {
      let videoList = res.datas.map(item => {
        item.id = item.data.vid;
        item.countHeight = `${96 * item.data.height / item.data.width}vw`;
        this.getRelatedVideo(item.data.vid);
        return item;
      });
      let oldVideoList = this.data.videoList;
      this.setData({
        videoList: isPullMore ? oldVideoList.concat(videoList) : videoList, 
        triggered: false, 
        hasMore: res.hasmore
      });
    }
  },

  // async getVideoTimeline() {
  //   let res = await request({ url: "/video/category/list" });
  //   this.setData({
  //     groupList: res.data,
  //     activedId: res.data[0].id
  //   })
  //   this.getCurrentVideoList(this.data.activedId);
  //   console.log('getVideoTimeline', res);
  // },
  /** 
   * 视频地址
   * @param id 视频vid
   * @param index 视频列表下标
   * */ 
  async getRelatedVideo(id) {
    let res = await request({ url: "/video/url", data: {id} });
    let url = res.urls && res.urls.length ? res.urls[0].url : '';
    let videoList = this.data.videoList;
    if (videoList.length) {
      videoList = videoList.map(item => {
        if (item.data.vid === id) item.videoUrl = url;
        return item;
      })
      this.setData({videoList});
    }
  },

  /*
    点击tab切换视频列表
  */
  changeTab(event) {
    let activedId = event.currentTarget.dataset.id;
    this.setData({
      activedId, 
      videoList: [], 
      offset: 0, 
      hasMore: true,
      scrollTop: 0
    })
    this.getCurrentVideoList(activedId);
  },

  /**
   * 滑动video自动播放
   * @param {*} event 
   */
  handleTouchEnd(event) {
    let id = event.currentTarget.id;
    // let currentVid = this.data.currentVid;
    // currentVid !== id && this.videoContext && this.videoContext.stop();
    this.setData({currentVid: id})
    this.videoContext = wx.createVideoContext(id);
    /// 跳转到指定位置
    /// second 的获取 => video标签添加bindtimeupdate监听
    /// 注意: 视频结束时要把second重置
    // this.videoContext.seek(second)
    this.videoContext.play();
  },

  handleError(event) {
    console.log('handleError', event);
    wx.showToast({
      title: '内容超时',
      icon: "error"
    });
    this.getCurrentVideoList(this.data.activedId);
  },
  /**
   * 转发视频到聊天
   * @param {} event 
   */
  shareVideoMessage(event) {
    console.log(event);
    let vid = event.currentTarget.dataset.vid;
    let videoInfo = this.data.videoList.find(item => item.data.vid === vid );
    console.log(videoInfo);
    wx.shareVideoMessage({
      videoPath: '/pages/cloud/cloud',
      success() {},
      fail: console.error,
    })
  },
  
  /**
   * 下拉刷新
   */
  refreshPulling(event) {
    this.setData({
      triggered: true
    });
    this.getCurrentVideoList(this.data.activedId);
  },
  /**
   * 上拉加载
   */
  refreshPullUp(event) {
    let allData = this.data;
    console.log(event, this.data);
    if (allData.hasMore) {
      allData.offset++;
      this.setData({offset: allData.offset});
      console.log('refreshPullUp', this.data);
      this.getCurrentVideoList(allData.activedId, true);
    }
  },
  /**
   * 跳转搜索
   */
  goSearchPage() {
    wx.navigateTo({
      url: '/pages3/pages/searchPage/search?keyword=' + this.data.keyword,
    })
  },
  /**
   * 获取搜索框内的默认文字
   */
  async getSearchDefault() {
    let res = await request({url: "/search/default"});
    if (res && res.code == 200) {
      this.setData({keyword: res.data.showKeyword});
    }
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
    this.getVideoGroupList();
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