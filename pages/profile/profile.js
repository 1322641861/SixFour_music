// pages/profile/profile.js
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
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let userInfo = wx.getStorageSync("userInfo");
    this.setData({
      userInfo: userInfo ? JSON.parse(userInfo) : {}
    })
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