// pages/cloud/cloud.js
import request from "../../utils/request";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupList: [],
    activedId: 0,
    videoList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    /// 标签/分类列表
    this.getVideoGroupList();
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
    /// 获取分类视频
    this.getCurrentVideoList(this.data.activedId);
  },
  /**
   * 当前分类所有视频
   *  */ 
  async getCurrentVideoList(videoId) {
    wx.showLoading({title: '加载中'});
    let res = await request({
      url: "/video/group",
      data: {
        id: videoId,
        // offset: 1
      },
    });
    wx.hideLoading()
    let videoList = res.datas.map((item, index) => {
      item.id = index;
      this.getRelatedVideo(item.data.vid, index);
      return item;
    });
    this.setData({videoList});
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
  async getRelatedVideo(id, index) {
    let res = await request({ url: "/video/url", data: {id} });
    console.log('getRelatedVideo', res);
    let url = res.urls && res.urls.length ? res.urls[0].url : '';
    let videoList = this.data.videoList;
    videoList[index].videoUrl = url;
    this.setData({videoList})
  },
  /*
    点击tab切换视频列表
  */
  changeTab(event) {
    let activedId = event.currentTarget.dataset.id;
    this.setData({activedId, videoList: []})
    this.getCurrentVideoList(activedId);
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