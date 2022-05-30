import request from "../../utils/request";
import {debounce} from "../../utils/util"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotList: [],
    historyList: [],
    entered: false,
    inputValue: '',
    showTrimValue: false, // 用户是否只输入 " "
    keyword: '',
    searchSingleList: [], // input模糊查询
    searchDetailList: [],
    systemBarHeight: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    try {
      let systemInfo = wx.getSystemInfoSync();
      this.setData({systemBarHeight: `${systemInfo.statusBarHeight * 2 + 20}px`});
    } catch (error) {
      console.log(error);
    }
    this.getHistoryList();
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
      for (const item of res.data) {
        item['iconWidth'] = this.getIconWidth(item['iconType']);
      }
      this.setData({ hotList: res.data });
    }
  },
  /**
   * 获取本地搜索历史记录
   */
  getHistoryList() {
    let historyList = wx.getStorageSync('historyList') ? wx.getStorageSync('historyList') : [];
    if (Object.prototype.toString.call(historyList) !== "[object Array]") {
      wx.removeStorageSync('historyList');
      this.setData({historyList: []});
    } else {
      this.setData({historyList});
    }
  },
  setHistoryList(allData, currentValue) {
    if (!allData.includes(currentValue)) {
      if (allData.length === 20) allData.pop();
      allData.unshift(currentValue);
      this.setData({historyList: allData});
      wx.setStorageSync('historyList', allData);
    }
  },
  clearHistoryList() {
    wx.showModal({
      content: "确定清空全部历史记录?",
      success: function () {
        wx.removeStorageSync('historyList');
        this.setData({historyList: []});
      }
    })
  },
  /**
   * 监听input输入
   * @param {*} event 
   */
  handleInput: debounce(function (event) {
    let value = event.detail.value;
    let entered = value.length ? true : false;
    if (entered) {
      if (value.trim()) {
        this.setData({
          entered,
          inputValue: value,
          showTrimValue: false
        });
        this.getSearchDetail();
      } else {
        this.setData({entered, inputValue: value, showTrimValue: true, searchSingleList: []})
      }
    } else {
      this.clearInputValue();
    }
  }, 200),
  clearInputValue() {
    this.setData({
      inputValue: '',
      searchSingleList: [],
      entered: false,
      showTrimValue: false
    });
  },
  /**
   * 根据iconType改变image长度
   * @param {*} iconType 
   */
  getIconWidth(iconType) {
    let width;
    switch (iconType) {
      case 1:
      case 2:
        width = "38rpx"
        break;
      case 5:
        width = "22rpx";
        break;
      default:
        width = "38rpx"
        break;
    }
    return width;
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
  async getSearchDetail(event) {
    let {inputValue, keyword, showTrimValue, historyList} = this.data;
    let submitType = event && event.currentTarget.dataset.submit;
    if (submitType) {
     this.setHistoryList(historyList, inputValue);
    }

    let trimValue = inputValue.trim();
    let searchValue = showTrimValue ? trimValue : inputValue ? inputValue : keyword;
    let res = await request({url: "/search", data: {
      keywords: searchValue,
      limit: 10,
      // type: 1018
    }});
    if (res && res.code == 200 && res.result.songCount) {
      this.setData({searchSingleList: res.result.songs});
    } else {
      this.setData({searchSingleList: []});
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