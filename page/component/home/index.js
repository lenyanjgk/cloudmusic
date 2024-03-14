var bsurl = require('../../../utils/bsurl.js'); // 引入文件路径为'../../../utils/bsurl.js'的模块，并赋值给变量bsurl
var common = require('../../../utils/util.js'); // 引入文件路径为'../../../utils/util.js'的模块，并赋值给变量common
var async = require("../../../utils/async.js"); // 引入文件路径为'../../../utils/async.js'的模块，并赋值给变量async
var nt = require("../../../utils/nt.js"); // 引入文件路径为'../../../utils/nt.js'的模块，并赋值给变量nt
var app = getApp(); // 获取全局应用实例并赋值给变量app

Page({
    // 页面数据
    data: {
      // 首页推荐
      rec: {
        idx: 0, // 索引
        loading: false, // 加载状态
      },
      // 音乐播放信息
      music: {},
      // 播放状态
      playing: false,
      // 播放类型
      playtype: {},
      // 首页Banner
      banner: [4],
      // 当前日期的天数
      thisday: (new Date()).getDate(),
      // 歌单分类是否显示
      cateisShow: false,
      // 歌单列表
      playlist: {
        idx: 1, // 索引
        loading: false, // 加载状态
        list: {}, // 列表数据
        offset: 0, // 偏移量
        limit: 20 // 单页数据量
      },
      // 歌单分类列表
      catelist: {
        res: {}, // 列表数据
        checked: {} // 当前选中项
      },
      
      // 排行榜
      sort: {
        idx: 3, // 索引
        loading: false // 加载状态
      },
      // 当前tab索引
      tabidx: 0
    },

  // 播放/暂停切换函数
  toggleplay: function () {
    common.toggleplay(this, app);
  },

  // 播放下一首歌曲
  playnext: function (e) {
    app.nextplay(e.currentTarget.dataset.pt);
  },

  // 更新当前播放的音乐信息
  music_next: function (r) {
    this.setData({
      music: r.music,
      playtype: r.playtype
    });
  },

  // 更新播放状态
  music_toggle: function (r) {
    this.setData({
      playing: r.playing
    });
  },

  // 页面加载时触发
  onLoad: function (options) {
    if (options.share == 1) { // 如果页面参数中的share为1
      var url = '../' + options.st + '/index?id=' + options.id;
      console.log(url, options.st, options.id);
      wx.navigateTo({ // 跳转到指定页面
        url: url,
        success: function () {
          console.log("tiaozhuan chenggong"); // 跳转成功后输出日志信息
        }
      });
      return;
    }
  },

  // 页面隐藏时触发
  onHide: function () {
    nt.removeNotification("music_next", this); // 移除消息通知的监听事件
    nt.removeNotification("music_toggle", this); // 移除消息通知的监听事件
  },

  // 页面展示时触发
  onShow: function () {
    nt.addNotification("music_next", this.music_next, this); // 添加消息通知的监听事件，监听音乐更新
    nt.addNotification("music_toggle", this.music_toggle, this); // 添加消息通知的监听事件，监听音乐播放状态更新
    this.setData({
      music: app.globalData.curplay,
      playing: app.globalData.playing,
      playtype: app.globalData.playtype,
    });
    if (!wx.getStorageSync('user')) { // 如果本地缓存中不存在用户信息
      wx.redirectTo({ // 重定向到登录页面
        url: '../login/index'
      });
      return;
    }
    !this.data.rec.loading && this.init(); // 若rec.loading为false，执行初始化操作
  },

  // 切换tab的回调函数
  switchtab: function (e) {
    var that = this;
    var t = e.currentTarget.dataset.t; // 获取事件绑定元素的dataset中的t值
    this.setData({ tabidx: t }); // 更新data中的tabidx值为t
    if (t == 1 && !this.data.playlist.loading) { // 如果t等于1且playlist.loading为false
      this.gplaylist(); // 调用gplaylist函数获取歌单列表
    }
    if (t == 2 && !this.data.djcate.loading) { // 如果t等于2且djcate.loading为false
      async.map(['djradio/catelist', 'program/recommend', 'djradio/recommend', 'djradio/hot'], function (item, callback) {
        wx.request({
          url: bsurl + item,
          success: function (res) {
            callback(null, res.data)
          }
        })
    
      });
    }
    if (t == 3 && !this.data.sort.loading) { // 如果t等于3且sort.loading为false
      this.data.sort.loading = false;
      this.setData({
        sort: this.data.sort
      });
      wx.request({
        url: bsurl + 'toplist/detail',
        success: function (res) {
          res.data.idx = 3;
          res.data.loading = true;
          that.setData({
            sort: res.data
          });
        }
      });
    }
  },

  

  // 获取歌单列表
  gplaylist: function (isadd) {
    var that = this;
    wx.request({
      url: bsurl + 'top/playlist',
      data: {
        limit: that.data.playlist.limit,
        offset: that.data.playlist.offset,
        type: that.data.catelist.checked.name
      },
      complete: function (res) {
        that.data.playlist.loading = true;
        if (!isadd) {
          that.data.playlist.list = res.data;
        } else {
          res.data.playlists = that.data.playlist.list.playlists.concat(res.data.playlists);
          that.data.playlist.list = res.data;
        }
        that.data.playlist.offset += res.data.playlists.length;
        that.setData({
          playlist: that.data.playlist
        });
      }
    });
  },

  // 触底事件
  onReachBottom: function () {
    if (this.data.tabidx == 1) {
      this.gplaylist(1); // 获取更多歌单
    } else if (this.data.tabidx == 2) {
      this.gdjlist(1); // 获取更多电台节目
    }
  },

  // 切换播放类型
  togglePtype: function () {
    this.setData({
      cateisShow: !this.data.cateisShow
    });
  },

  // 选择分类
  cateselect: function (e) {
    var t = e.currentTarget.dataset.catype; // 获取事件绑定元素的dataset中的catype值
    this.data.catelist.checked = t;
    this.setData({
      playlist: {
        idx: 1,
        loading: false,
        list: {},
        offset: 0,
        limit: 20
      },
      cateisShow: !this.data.cateisShow,
      catelist: this.data.catelist
    });
    this.gplaylist();
  },

  // 页面初始化
  init: function () {
    var that = this;
    var rec = this.data.rec;
    wx.request({
      url: bsurl + 'banner',
      data: { cookie: app.globalData.cookie },
      success: function (res) {
        that.setData({
          banner: res.data.banners
        });
      }
    });
    wx.request({
      url: bsurl + 'playlist/catlist',
      complete: function (res) {
        that.setData({
          catelist: {
            isShow: false,
            res: res.data,
            checked: res.data.all
          }
        });
      }
    });
    async.map(['personalized', 'personalized/newsong', 'personalized/mv', 'personalized/djprogram'], function (item, callback) {
      wx.request({
        url: bsurl + item,
        data: { cookie: app.globalData.cookie },
        success: function (res) {
          callback(null, res.data.result);
        }
      });
    }, function (err, results) {
      console.log(err);
      rec.loading = true;
      rec.re = results;
      that.setData({
        rec: rec
      });
    });
  }
  


});
