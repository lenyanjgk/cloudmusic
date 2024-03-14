// 导入名为Encrypt的模块
var Encrypt = require('./crypto.js');
// 导入名为express的模块
var express = require('express');
// 导入名为http的模块
var http = require('http');
// 导入名为crypto的模块
var crypto = require('crypto');
// 导入名为request的模块
var reqhttp = require("request");
// 创建一个express实例
var app = express();
// 设置变量dir为字符串"/v1"，版本1的API端点的基础路径。
var dir = "/v1";
// 初始化变量cookie为null
var cookie = null;
// 初始化对象user为空对象
var user = {};
// 生成一个随机字符串作为jsessionid的值
var jsessionid = randomString('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKMNOPQRSTUVWXYZ\/+', 176) + ':' + (new Date).getTime();
// 生成一个随机字符串作为nuid的值
var nuid = randomString('0123456789abcdefghijklmnopqrstuvwxyz', 32);

// 定义函数randomString，接受模式(pattern)和长度(length)作为参数
function randomString(pattern, length) {
	// 使用Array对象的apply方法创建一个指定长度的数组，传入null作为this值
	// 调用map方法对数组进行遍历，生成一个新的数组，长度为length
	// 在每次遍历中，选择pattern字符串中的随机字符，通过Math.floor(Math.random() * pattern.length)生成随机索引
	// 使用join方法将生成的字符拼接成一个字符串并返回
	return Array.apply(null, { length: length }).map(() => (pattern[Math.floor(Math.random() * pattern.length)])).join('');
}


// 定义变量baseCookie，存储一个字符串，包含多个cookie值
var baseCookie = `JSESSIONID-WYYY=${jsessionid}; _iuqxldmzr_=32; _ntes_nnid=${nuid},${(new Date).getTime()}; _ntes_nuid=${nuid}`;

// 定义函数createWebAPIRequest，接受路径(path)、数据(data)、参数(c)、响应对象(response)和HTTP请求方法(method)作为参数
function createWebAPIRequest(path, data, c, response, method) {
	// 如果method存在，则使用该值，否则将其设为"POST"
	method = method ? method : "POST"
	// 定义变量music_req，用于存储响应数据
	var music_req = '';
	// 对数据进行加密
	var cryptoreq = Encrypt(data);
	// 创建一个HTTP请求的客户端
	var http_client = http.request({
		hostname: 'music.163.com', // 请求的主机名
		method: method, // 请求方法
		path: path, // 请求路径
		headers: {
			'Accept': '*/*',//指定客户端能够接收的内容类型
			'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
			'Connection': 'keep-alive',
			'Content-Type': 'application/x-www-form-urlencoded',
			'Referer': 'http://music.163.com', // 请求的来源
			'Host': 'music.163.com', // 请求的主机
			'Cookie': cookie, // 发送的Cookie
			'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/602.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/602.1' // 用户代理
		}
	}, function (res) { // 监听响应事件
		res.on('error', function (err) { // 响应错误处理
			response.status(502).send('fetch error'); // 返回状态码502，发送错误消息
		});
		res.setEncoding('utf8'); // 设置响应数据的编码方式为utf8
		if (res.statusCode != 200) { // 如果响应状态码不等于200
			createWebAPIRequest(path, data, c, response, method); // 重新发起请求
			return;
		} else {
			res.on('data', function (chunk) { // 监听响应数据事件
				music_req += chunk; // 将响应数据拼接到music_req变量中
			});
			res.on('end', function () { // 监听请求结束事件
				if (music_req == '') { // 如果music_req为空
					createWebAPIRequest(path, data, c, response, method); // 重新发起请求
					return;
				}
				if (res.headers['set-cookie']) { // 如果响应头中存在set-cookie字段
					cookie = baseCookie + ';' + res.headers['set-cookie']; // 更新cookie值
					response.send({ // 发送响应
						code: 200,//表示响应的状态码为200，这通常表示请求成功。
						i: JSON.parse(music_req) // JSON 字符串解析为对象
					});
					user = JSON.parse(music_req); // 更新user对象
					return;
				}
				response.send(music_req); // 发送响应
			})
		}
	});

	// 向服务器发送请求体数据
	http_client.write('params=' + cryptoreq.params + '&encSecKey=' + cryptoreq.encSecKey);
	http_client.end(); // 结束请求
}

// 定义函数createRequest，接受路径(path)、方法(method)、数据(data)和回调函数(callback)作为参数
function createRequest(path, method, data, callback) {
	// 定义变量ne_req，用于存储响应数据
	var ne_req = '';
	// 创建一个HTTP请求的客户端
	var http_client = http.request({
		hostname: 'music.163.com', // 请求的主机名
		method: method, // 请求方法
		path: path, // 请求路径
		headers: {
			'Referer': 'http://music.163.com', // 请求的来源
			'Cookie': 'appver=1.5.6', // 发送的Cookie
			'Content-Type': 'application/x-www-form-urlencoded', // 发送的数据类型
		},
	}, function (res) { // 监听响应事件
		res.setEncoding('utf8'); // 设置响应数据的编码方式为utf8
		res.on('data', function (chunk) { // 监听响应数据事件
			ne_req += chunk; // 将响应数据拼接到ne_req变量中
		});
		res.on('end', function () { // 监听请求结束事件
			callback(ne_req); // 调用回调函数，并传递ne_req作为参数
		})
	});

	if (method == 'POST') { // 如果请求方法为POST
		http_client.write(data); // 发送请求体数据
	}
	http_client.end(); // 结束请求
}

// 歌单类型列表
app.get(dir + '/playlist/catlist', function (request, response) {
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : ''); // 获取Cookie
	//从请求头中获取名为 'Cookie' 的信息
	var data = {
		"csrf_token": "" // csrf token为空
	};
	createWebAPIRequest('/weapi/playlist/catalogue', data, cookie, response); // 调用createWebAPIRequest函数发送请求
});

// 歌单类型列表-热门类型
app.get(dir + '/playlist/hot', function (request, response) {
	// 获取请求中的 Cookie，如果不存在则使用查询参数中的 cookie，如果都不存在则为空字符串
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {};
	// 创建WebAPI请求，调用'/api/playlist/hottags'接口，传递cookie和响应对象
	createWebAPIRequest('/api/playlist/hottags', data, cookie, response);
});

// // 推荐新音乐
app.get(dir + '/personalized/newsong', function (request, response) {
	// 获取请求中的 Cookie，如果不存在则使用查询参数中的 cookie，如果都不存在则为空字符串
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {
		type: "recommend"
	};
	// 创建WebAPI请求，调用'/api/personalized/newsong'接口，传递cookie、数据和响应对象
	createWebAPIRequest('/api/personalized/newsong', data, cookie, response);
});

// // 推荐歌单
app.get(dir + '/personalized', function (request, response) {
	// 获取请求中的 Cookie，如果不存在则使用查询参数中的 cookie，如果都不存在则为空字符串
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {};
	// 创建WebAPI请求，调用'/api/personalized/playlist'接口，传递cookie和响应对象
	createWebAPIRequest('/api/personalized/playlist', data, cookie, response);
});

// // 独家放送
app.get(dir + '/personalized/privatecontent', function (request, response) {
	// 获取请求中的 Cookie，如果不存在则使用查询参数中的 cookie，如果都不存在则为空字符串
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {};
	// 创建WebAPI请求，调用'/api/personalized/privatecontent'接口，传递cookie和响应对象
	createWebAPIRequest('/api/personalized/privatecontent', data, cookie, response);
});

// //每日推荐歌曲
app.get(dir + '/recommend/songs', function (request, response) {
	// 获取请求中的Cookie，如果不存在则使用查询参数中的cookie值
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	// 创建请求数据对象
	var data = {
		"offset": 0,
		"total": true,
		"limit": 20,
		"csrf_token": ""
	};
	// 调用createWebAPIRequest函数，发起相应的Web API请求
	createWebAPIRequest('/weapi/v1/discovery/recommend/songs', data, cookie, response)
});
// //取消推荐
app.get(dir + '/recommend/dislike', function (request, response) {
	// 获取请求中的Cookie，如果不存在则使用查询参数中的cookie值
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	// 创建请求数据对象
	var data = {
		resId: request.query.id,
		resType: request.query.type,
		alg: request.query.alg, //'itembased2',
		"csrf_token": ""
	};
	// 调用createWebAPIRequest函数，发起相应的Web API请求
	createWebAPIRequest('/weapi/discovery/recommend/dislike', data, cookie, response)
});

// //  每日推荐歌单
app.get(dir + '/recommend/resource', function (request, response) {
	// 获取请求中的Cookie，如果不存在则使用查询参数中的cookie值
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	// 创建请求数据对象
	var data = {
		'offset': 0,//偏移量
		'limit': 20,//限制数量
		'total': 'True',//是否返回总数信息
		"csrf_token": ""
	};
	// 调用createWebAPIRequest函数，发起相应的Web API请求
	createWebAPIRequest('/weapi/v1/discovery/recommend/resource', data, cookie, response)
});

//收藏单曲到歌单，从歌单删除歌曲 op=del,add;pid=歌单id,tracks=歌曲id
app.get(dir + '/playlist/tracks', function (request, response) {
	// 获取操作类型、歌单ID和歌曲ID
	var op = request.query.op
	var pid = request.query.pid;
	var tracks = request.query.tracks;
	// 获取请求中的Cookie，如果不存在则使用查询参数中的cookie值
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	// 创建请求数据对象
	var data = {
		"op": op,
		"pid": pid,
		"tracks": tracks,
		"trackIds": JSON.stringify([tracks]),
		"csrf_token": "",
	};
	// 调用createWebAPIRequest函数，发起相应的Web API请求
	createWebAPIRequest('/weapi/playlist/manipulate/tracks', data, cookie, response)
});

//歌词
app.get(dir + '/lyric', function (request, response) {
	var id = request.query.id;// 从请求参数中获取歌曲id
	// 调用createRequest函数向特定API发送请求并获取歌曲歌词数据
	createRequest('/api/song/lyric?os=osx&id=' + id + '&lv=-1&kv=-1&tv=-1', 'GET', null, function (res) {
		response.setHeader("Content-Type", "application/json");
		response.send(res);// 将获取到的歌词数据作为响应发送给客户端
	});
});

//热门歌手 
app.get(dir + '/top/artist', function (request, response) {
	var data = {
		'offset': request.query.offset,// 从请求参数中获取偏移量
		'total': false,
		"type": request.query.type,// 从请求参数中获取歌手类型
		'limit': request.query.limit// 从请求参数中获取获取数量限制
	}
	// 调用createWebAPIRequest函数向特定API发送请求并获取热门歌手数据 
	createWebAPIRequest('/weapi/artist/top', data, cookie, response);
});
//新歌上架 ,type ALL, ZH,EA,KR,JP
app.get(dir + '/top/songs', function (request, response) {
	var data = {
		'type': request.query.type,// 从请求参数中获取音乐类型
		'area': request.query.type,// 从请求参数中获取音乐地区
		'cat': request.query.type,// 从请求参数中获取音乐分类
		"csrf_token": ""
	}
	// 调用createWebAPIRequest函数向特定API发送请求并获取新歌上架数据
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/weapi/v1/discovery/new/songs', data, cookie, response);
});
//新碟上架 ,type ALL, ZH,EA,KR,JP
app.get(dir + '/top/album', function (request, response) {
	var data = {
		'offset': request.query.offset,// 从请求参数中获取偏移量
		'total': true,
		'limit': request.query.limit, // 从请求参数中获取获取数量限制
		'area': request.query.type,// 从请求参数中获取音乐地区
		"csrf_token": ""
	}
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	// 调用createWebAPIRequest函数向特定API发送请求并获取新碟上架数据
	createWebAPIRequest('/weapi/album/new', data, cookie, response);
});
// 获取排行榜MV信息，根据type参数确定地区类型
app.get(dir + '/top/mv', function (request, response) {
	var data = {
		'offset': request.query.offset,  // 偏移量（起始位置）
		'total': true,  // 是否返回总数
		'limit': request.query.limit,  // 结果数量限制
		'area': request.query.type,  // MV所属地区类型
		'type': request.query.type,  // MV所属类型
		"csrf_token": ""  // 防跨站请求伪造token
	}
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/weapi/mv/toplist', data, cookie, response);
});

// 根据type参数获取分类歌单
app.get(dir + '/top/playlist', function (request, response) {
	var data = {
		'offset': request.query.offset,  // 偏移量（起始位置）
		'order': request.query.order || 'hot',  // 歌单排序方式，默认为热门排序
		'limit': request.query.limit,  // 结果数量限制
		'cat': request.query.type,  // 歌单类型分类
		"csrf_token": ""  // 防跨站请求伪造token
	}
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/weapi/playlist/list', data, cookie, response);
});

// 获取精品歌单，根据type参数确定歌单类型
app.get(dir + '/top/playlist/highquality', function (request, response) {
	var data = {
		'cat': request.query.type,  // 歌单类型分类
		'offset': request.query.offset,  // 偏移量（起始位置）
		"limit": request.query.limit,  // 结果数量限制
		"csrf_token": ""  // 防跨站请求伪造token
	}
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/weapi/playlist/highquality/list', data, cookie, response);
});

// 获取相似歌单
app.get(dir + '/simi/playlist', function (request, response) {
	var data = {
		'songid': request.query.id,  // 歌曲ID
		"csrf_token": ""
	}
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/weapi/discovery/simiPlaylist', data, cookie, response);  // 调用后端接口获取相似歌单数据
});

// 获取相似歌曲
app.get(dir + '/simi/song', function (request, response) {
	var data = {
		'songid': request.query.id,  // 歌曲ID
		"csrf_token": ""
	}
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/weapi/v1/discovery/simiSong', data, cookie, response);  // 调用后端接口获取相似歌曲数据
});

// 获取相似用户
app.get(dir + '/simi/user', function (request, response) {
	var data = {
		'songid': request.query.id,  // 歌曲ID
		"csrf_token": ""
	}
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/weapi/discovery/simiUser', data, cookie, response);  // 调用后端接口获取相似用户数据
});

// 获取艺术家信息
app.get(dir + '/artist', function (request, response) {
	var id = request.query.id;  // 艺术家ID
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {
		"csrf_token": ""
	};
	createWebAPIRequest('/weapi/v1/artist/' + id, data, cookie, response);  // 调用后端接口获取艺术家信息数据
});

//单曲详情
app.get(dir + '/music/detail', function (request, response) {
	var id = parseInt(request.query.id); // 获取单曲id
	var data = {
		"id": id,
		'c': JSON.stringify([{
			id: id
		}]),
		"ids": '[' + id + ']',
		"csrf_token": ""
	};
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/weapi/v3/song/detail', data, cookie, response) // 创建对音乐API的请求，获取单曲详情并返回给客户端
});

//专辑详情
app.get(dir + '/album/detail', function (request, response) {
	var id = parseInt(request.query.id); // 获取专辑id
	var data = {
		"csrf_token": ""
	};
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/weapi/v1/album/' + id, data, cookie, response) // 创建对音乐API的请求，获取专辑详情并返回给客户端
});

//单曲播放地址
app.get(dir + '/music/url', function (request, response) {
	var id = parseInt(request.query.id); // 获取单曲id
	var br = parseInt(request.query.br); // 获取比特率
	var data = {
		"ids": [id],
		"br": br,
		"csrf_token": ""
	};
	createWebAPIRequest('/weapi/song/enhance/player/url', data, null, response) // 创建对音乐API的请求，获取单曲播放地址并返回给客户端
});

// 获取歌单详情
app.get(dir + '/playlist/detail', function (request, response) { 
    var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : ''); 
    var data = { 
        "id": request.query.id, 
        "offset": request.query.offset || '0', 
        "total": false, 
        "n": request.query.limit || 20, 
        "limit": request.query.limit || 20, 
        "csrf_token": "" 
    }; 
    createWebAPIRequest('/weapi/v3/playlist/detail', data, cookie, response)
});

// 获取歌单详情（旧的方法），用于获取封面
app.get(dir + '/playlist/img', function (request, response) {
    createWebAPIRequest('/api/playlist/detail?id=' + request.query.id, null, null, response)
});

// 签到
app.get(dir + '/daily_signin', function (request, response) { 
    var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : ''); 
    var data = { 
        'type': request.query.type, 
    } 
    createWebAPIRequest('/weapi/point/dailyTask', data, cookie, response)
});

app.get(dir + '/log/web', function (request, response) {
	// 获取请求中的Cookie，如果没有则为空字符串
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {
		"action": request.query.action,// 获取请求参数中的动作
		"json": request.query.json,// 获取请求参数中的JSON数据
		"csrf_token": "",// CSRF令牌，暂时为空
	};
	// 创建Web API请求，获取Web日志并返回响应
	createWebAPIRequest('/weapi/log/web', data, cookie, response)
});
app.get(dir + '/id2url', function (req, res) {
	res.setHeader("Content-Type", "application/json");// 设置响应头的内容类型为JSON
	res.send(id2Url(req.query.id));// 将传入的ID转换为URL并返回响应
})
// 获取排行榜信息
app.get(dir + '/toplist', function (request, response) {
	// 获取请求中的Cookie，如果没有则为空字符串
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {
		"csrf_token": "",// CSRF令牌，暂时为空
	};
	// 创建Web API请求，获取排行榜信息并返回响应
	createWebAPIRequest('/weapi/toplist', data, cookie, response)
})
// 获取所有歌单分类
app.get(dir + '/playlist/all', function (request, response) {
	// 获取请求中的Cookie，如果没有则为空字符串
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {
		"csrf_token": "",// CSRF令牌，暂时为空
	};
	 // 创建Web API请求，获取所有歌单分类并返回响应
	createWebAPIRequest('/weapi/playlist/category/list', data, cookie, response)
})

//排行榜详细
app.get(dir + '/toplist/detail', function (request, response) {
	// 获取请求中的Cookie，如果没有则为空字符串
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {
		id: request.query.id, // 获取请求参数中的排行榜ID
		limit: 20,// 限制数量为20
		"csrf_token": "", // CSRF令牌，暂时为空
	};
	// 创建Web API请求，获取排行榜详细信息并返回响应
	createWebAPIRequest('/weapi/toplist/detail', data, cookie, response)
})
//艺术家分类
app.get(dir + '/toplist/artist', function (request, response) {
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {
		type: request.query.type,
		"csrf_token": "",
	};
	createWebAPIRequest('/weapi/toplist/artist', data, cookie, response)
})

// 设置通用的请求头参数
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");//允许所有域名的请求访问资源
    res.header("Access-Control-Allow-Headers", "X-Requested-With");//允许请求头中带有 X-Requested-With 的信息
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");//允许的 HTTP 请求方法
    res.header("X-Powered-By", ' 3.2.1');//设置自定义的 X-Powered-By 头信息。
    res.header("Content-Type", "application/json;charset=utf-8");//设置响应的内容类型为 JSON 格式
    next();
});

// 启动服务器，监听端口3000
var server = app.listen(3000, function () {
    console.log("启动App");
});

// 将字符转换为URL参数
function id2Url(pic_str) {
    var magic = str2Arr('3go8&$8*3*3h0k(2)2');
    var songId = str2Arr(pic_str);
    for (var i = 0; i < songId.length; i++) {
        songId[i] = songId[i] ^ magic[i % magic.length];
    }
    var md5 = crypto.createHash('md5');
    md5 = md5.update(arr2Str(songId));
    console.info(md5);
    var res = md5.digest('base64');
    res = res.replace(/\//g, '_');
    res = res.replace(/\+/, '-');
    return res;
}

// 将字符串转换为字节数组
function str2Arr(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        bytes.push(str.charAt(i).charCodeAt(0));
    }
    return bytes;
}

// 将字节数组转换为字符串
function arr2Str(bytes) {
    var str = '';
    for (var i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return str;
}
