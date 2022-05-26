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
let timer1;
const debounce = (fn, delay = 800) => {
  if (timer1) clearTimeout(timer1);
  timer1 = setTimeout(() => {
    fn.apply(this, arguments);
  }, delay);
}
/**
 * 节流
 */
let flag = false;
const throttle = (fn, timeLen = 800) => {
  if (flag) return;
  flag = true;
  fn();
  setTimeout(() => {
    flag = false;
  }, timeLen);
}

module.exports = {
  formatTime,
  navigateToLogin,
  debounce,
  throttle,
  getRandomIndex
}
