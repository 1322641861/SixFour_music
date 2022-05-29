import request from "../../utils/request";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotList: [],
    historyList: [],
    entered: false,
    inputValue: '',
    keyword: '',
    searchDetailList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let historyList = wx.getStorageSync('historyList') ? wx.getStorageSync('historyList') : [];
    this.setData({historyList});
    this.getSearchDefault();
    this.getSearchHotList();
  },
  /**
   * 获取热搜列表
   */
  async getSearchHotList() {
    wx.showLoading({
      title: '加载中...',
    });
    // let res = await request({url: "/search/hot"});
    let res = await request({url: "/search/hot/detail"});
    wx.hideLoading();
    if (res && res.code == 200) {
      this.setData({ hotList: res.data });
    }
    // console.log(res);
  },
  handleInput(event) {
    let value = event.detail.value;
    this.setData({
      entered: value.length ? true : false,
      inputValue: value
    });
    // console.log('value', value, 'inputValue',  this.data.inputValue);
  },
  clearInputValue() {
    this.setData({inputValue: ''});
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
   * 搜索
   */
  async getSearchDetail() {
    let {inputValue, keyword} = this.data;
    let searchValue = inputValue ? inputValue : keyword;
    let res = await request({url: "/search", data: {keywords: searchValue}});
    console.log(res);
    if (res && res.code == 200) {
      // this.setData({keyword: res.data.showKeyword});
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