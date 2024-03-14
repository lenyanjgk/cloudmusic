var app = getApp(); // 获取小程序实例
var bsurl = require('../../../utils/bsurl.js'); // 引入网络请求地址
var id2Url = require('../../../utils/base64md5.js'); // 引入base64md5.js
var nt = require("../../../utils/nt.js") // 引入通知组件
var common = require('../../../utils/util.js'); // 引入通用工具函数

Page({
  data: {
    list: [], // 列表数据
    curplay: {}, // 当前播放音乐
    pid: 0, // 歌单ID
    cover: '', // 封面图片
    music: {}, // 音乐信息
    playing: false, // 播放状态
    playtype: 1, // 播放模式
    loading: true, // 加载状态
    toplist: false, // 是否为排行榜
    user: wx.getStorageSync('user') || {} // 用户信息
  },
  // 切换播放状态
  toggleplay: function () {
    common.toggleplay(this, app);
  },
  // 播放下一首
  playnext: function (e) {
    app.nextplay(e.currentTarget.dataset.pt)
  },
  // 更新音乐信息
  music_next: function (r) {
    this.setData({
      music: r.music,
      playtype: r.playtype,
      curplay: r.music.id
    })
  },
  // 切换音乐
  music_toggle: function (r) {
    this.setData({
      playing: r.playing,
      music: r.music,
      playtype: r.playtype,
      curplay: r.music.id
    })
  },
  // 页面显示时触发
  onShow: function () {
    nt.addNotification("music_next", this.music_next, this);
    nt.addNotification("music_toggle", this.music_toggle, this);
    this.setData({
      curplay: app.globalData.curplay.id,
      music: app.globalData.curplay,
      playing: app.globalData.playing,
      playtype: app.globalData.playtype
    })
  },
  // 页面隐藏时触发
  onHide: function () {
    nt.removeNotification("music_next", this)
    nt.removeNotification("music_toggle", this)
  },
  // 喜欢歌曲
  lovesong: function () {
    common.songheart(this, app, 0, (this.data.playtype == 1 ? this.data.music.st : this.data.music.starred));
  },
  // 页面加载时触发
  onLoad: function (options) {
    var that = this
    // 发起网络请求获取歌单详情
    wx.request({
      url: bsurl + 'playlist/detail',
      data: {
        id: options.pid,
        limit: 1000
      },
      success: function (res) {
        var canplay = [];
        for (let i = 0; i < res.data.playlist.tracks.length; i++) {
          if (res.data.privileges[i].st >= 0) {
            canplay.push(res.data.playlist.tracks[i])
          }
        }
        // 更新页面数据
        that.setData({
          list: res.data,
          canplay: canplay,
          toplist: (options.from == 'stoplist' ? true : false),
          cover: id2Url.id2Url('' + (res.data.playlist.coverImgId_str || res.data.playlist.coverImgId))
        });

        wx.setNavigationBarTitle({
          title: res.data.playlist.name
        })
      }, fail: function (res) {
        wx.navigateBack({
          delta: 1
        })
      }
    });
  },
  // 查看用户歌单
  userplaylist: function (e) {
    var userid = e.currentTarget.dataset.userid;
    wx.redirectTo({
      url: '../user/index?id=' + userid
    })
  },
  // 播放全部
  playall: function (event) {
    this.setplaylist(this.data.canplay[0], 0);
    app.seekmusic(1)
  },
  // 设置播放列表
  setplaylist: function (music, index) {
    app.globalData.curplay = app.globalData.curplay.id != music.id ? music : app.globalData.curplay;
    app.globalData.index_am = index;
    app.globalData.playtype = 1;
    var shuffle = app.globalData.shuffle;
    app.globalData.list_sf = this.data.canplay;
    app.shuffleplay(shuffle);
    app.globalData.globalStop = false;
  },
  // 播放音乐
  playmusic: function (event) {
    let music = event.currentTarget.dataset.idx;
    let st = event.currentTarget.dataset.st;
    if (st * 1 < 0) {
      wx.showToast({
        title: '歌曲已下架',
        icon: 'success',
        duration: 2000
      });
      return;
    }
    music = this.data.list.playlist.tracks[music];
    this.setplaylist(music, event.currentTarget.dataset.idx)
  }
});
