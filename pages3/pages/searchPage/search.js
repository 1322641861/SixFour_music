import request from "../../../utils/request";
import {debounce, getCurrentMusic, playAllSongSheet} from "../../../utils/util"
const appInstance = getApp();

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
    enteredDetail: false,
    systemBarHeight: "",
    index: 0,
    isPlay: false,
    songInfo: {},
    songData: {}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let keyword = options.keyword;
    if (!keyword) {
      this.getSearchDefault();
    } else {
      this.setData({keyword});
    }

    try {
      let systemInfo = wx.getSystemInfoSync();
      this.setData({systemBarHeight: `${systemInfo.statusBarHeight * 2 + 20}px`});
    } catch (error) {
      console.log(error);
    }

    this.getHistoryList();
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
   * 跳转
   */
  navigatePage(event, i) {
    let index;
    let musicid;
    if (i >= 0) {
      index = i;
      musicid = this.data.searchDetailList.length && this.data.searchDetailList[i].id;
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
  goBack() {
    const {entered, searchSingleList, searchDetailList} = this.data;
    if (entered || searchDetailList.length) {
      this.clearInputValue();
    } else {
      wx.navigateBack({
        delta: 1,
      })
    }
  },
  /// 播放全部
  playAllSongSheet() {
    playAllSongSheet(this.data.searchDetailList);
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
    if (currentValue && !allData.includes(currentValue)) {
      if (allData.length === 20) allData.pop();
      allData.unshift(currentValue);
      this.setData({historyList: allData});
      wx.setStorageSync('historyList', allData);
    }
  },
  clearHistoryList() {
    wx.showModal({
      content: "确定清空全部历史记录?",
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('historyList');
          this.setData({historyList: []});
        }
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
        this.getSearchSuggest();
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
      showTrimValue: false,
      searchDetailList: [],
      enteredDetail: false
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
   * getSearchSuggest 模糊查询
   * getSearchDetail 详情
   */
  async getSearchSuggest() {
    this.setData({enteredDetail: false, searchDetailList: []});

    let {inputValue, keyword, showTrimValue} = this.data;
    let searchValue = showTrimValue ? trimValue : inputValue ? inputValue : keyword;
    let res = await request({url: "/search/suggest", data: {keywords: searchValue, type: "mobile"}});
    if (res && res.code == 200 && res.result.allMatch) {
      this.setData({searchSingleList: res.result.allMatch});
    } else {
      this.setData({searchSingleList: []});
    }
  },
  /**
   * type: 搜索类型；默认为 1 即单曲 , 取值意义 : 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频, 1018:综合, 2000:声音(搜索声音返回字段格式会不一样)
   */
  async getSearchDetail(event) {
    wx.showLoading({
      title: '加载中...',
    })
    let submitValue = event.currentTarget.dataset.submit;
    this.setData({enteredDetail: true, inputValue: submitValue});
    let {inputValue, keyword, historyList} = this.data;
    this.setHistoryList(historyList, inputValue);
    let searchValue = submitValue ? submitValue : inputValue ? inputValue : keyword;
    // /search 或者 /cloudsearch(更全)
    let res = await request({url: "/cloudsearch", data: {
      keywords: searchValue,
      limit: 30,
      offset: 1
      // type: 1018
    }});
    wx.hideLoading();
    // console.log('搜索详情', res);
    if (res && res.code == 200 && res.result.songCount) {
      this.setData({searchDetailList: res.result.songs});
    } else {
      this.setData({searchDetailList: []});
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