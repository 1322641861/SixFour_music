export default {
  domain: 'https://cloud-music-api-inky.vercel.app',
  localDomain: "http://localhost:3000",
  hideLoadingApi: [
    '/playlist/detail',
    "/video/url",
    "/song/detail",
    "/song/url"
  ],
  loginApi: ["/login/cellphone"],
}