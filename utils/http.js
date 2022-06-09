import request from "./request";

module.exports =  {
  /**
   * 喜欢音乐
   * @param {*} id 
   * @param {*} like 
   */
  async changeLikeMusic(id, like = true) {
     let res = await request({url: "/like", data: {id, like}});
     return res;
  }
}