const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 跳转登录
 */
const navigateToLogin = () => {
  wx.showModal({
    content: '请先登录',
    success(res) {
      if (res.confirm) {
        wx.navigateTo({
          url: '/pages/auth/login/login',
        })
      }
    }
  })
}

/**
 * 递归, 避免随机模式时, 出现随机重复同一首歌
 * @param {*} len 歌单长度下标
 */
const getRandomIndex = function (len) {
  let randomIndex = parseInt(Math.random() * len);
  if (this.randomIndex === randomIndex) {
    return getRandomIndex(len);
  } else {
    this.randomIndex = randomIndex;
    return randomIndex;
  }
}

/**
 * 防抖
 */
const debounce = (fn, delay = 800) => {
  let timer1;
  return function () {
    if (timer1) clearTimeout(timer1);
    let that = this;
    let args = arguments;
    timer1 = setTimeout(function () {
      fn.apply(that, args);
    }, delay);
  }
}
/**
 * 节流
 */
const throttle1 = (fn, timeLen = 800) => {
  let flag = false;
  return function () {
    if (!flag) {
      flag = true;
      setTimeout(() => {
        flag = false;
        fn.apply(this, arguments);
      }, timeLen);
    }
  }
}
function throttle (fn, time = 800) {
  let startTime = Date.now();
  // let startTime = 0;
  let timer = null;
  let that = this;
  return function() {
      let nowTime = Date.now();
      clearTimeout(timer);
      // console.log(nowTime - startTime >= time, nowTime, startTime);
      if (nowTime - startTime >= time){ // 时间范围允许立即执行
          fn.apply(that, arguments);
          startTime = Date.now();
      } else {
          timer = setTimeout(()=>{
              fn.apply(that, arguments)
          }, time)
      }
  }
}

const appInstance = getApp();
/**
 * 获取当前播放歌曲
 */
const getCurrentMusic = function (that) {
  let isPlay = appInstance.globalData.isPlayMusic;
  let songInfo = wx.getStorageSync('songInfo');
  let songData = wx.getStorageSync('songData');
  that.setData({isPlay, songInfo, songData});
}
/**
 * 播放全部
 */
const playAllSongSheet = function (songList) {
  console.log('util playAllSongSheet', songList);
  wx.setStorageSync('currentSongSheet', songList);
  wx.setStorageSync('currentSongId', songList[0].id);
  wx.navigateTo({
    url: '/pages/songDetail/songDetail?musicId=' + songList[0].id,
  })
}

module.exports = {
  formatTime,
  navigateToLogin,
  debounce,
  throttle,
  getRandomIndex,
  getCurrentMusic,
  playAllSongSheet
}
