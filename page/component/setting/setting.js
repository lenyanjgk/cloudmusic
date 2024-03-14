var bsurl = require('../../../utils/bsurl.js'); // 引入文件路径为'../../../utils/bsurl.js'的模块，并赋值给变量bsurl
var common = require('../../../utils/util.js'); // 引入文件路径为'../../../utils/util.js'的模块，并赋值给变量common
var async = require("../../../utils/async.js"); // 引入文件路径为'../../../utils/async.js'的模块，并赋值给变量async
var nt = require("../../../utils/nt.js"); // 引入文件路径为'../../../utils/nt.js'的模块，并赋值给变量nt

var app = getApp(); // 获取全局应用实例并赋值给变量app



Page({
  onShow: function() {
    wx.setNavigationBarTitle({
      title: '设置'
    })

    nt.addNotification("music_next", this.music_next, this); // 添加消息通知的监听事件，监听音乐更新
    nt.addNotification("music_toggle", this.music_toggle, this); 

    this.setData({
    	workTime: wx.getStorageSync('workTime'),
      restTime: wx.getStorageSync('restTime'),
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
  changeWorkTime: function(e) {
  	wx.setStorage({
  		key: 'workTime',
  		data: e.detail.value
  	})
  },
  changeRestTime: function(e) {
  	wx.setStorage({
  		key: 'restTime',
  		data: e.detail.value
  	})
  },
  playnext: function (e) {
    app.nextplay(e.currentTarget.dataset.pt);
  },

    // 播放/暂停切换函数
    toggleplay: function () {
      common.toggleplay(this, app);
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





})
