/*
author: HOU Yuxin
date: 2018-01-11
*/

//相关依赖
const fs = require("fs");
var qiniu = require("qiniu");

//定义你存储图片的本地文件夹
const path = "YOUR DIR LOCATION";

//你的 Access Key 和 Secret Key, 登录七牛可以找到
var ACCESS_KEY = 'YOURAK**************';
var SECRET_KEY = 'YOURSK**************';

//根据AK, SK构建鉴权对象
var mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);

//定义你将要上传到哪一个bucket中
var bucket = 'YOUR BUCKET NAME';


//构建上传策略函数
function uptoken(bucket, key) {
    //更多相关选项见官方文档 https://developer.qiniu.com/kodo/manual/1206/put-policy
    var options = {
        scope: bucket + ":" + key,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":"$(fsize)","bucket":"$(bucket)","name":"$(x:name)"}'
    }
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadPolicy = putPolicy.uploadToken(mac)
    return uploadPolicy;
}

/**
 * 读取文件后缀名称，并转化成小写
 * @param file_name
 * @returns
 */
function getFilenameSuffix(file_name) {
    if (file_name == '.DS_Store') {
        return '.DS_Store';
    }
    if (file_name == null || file_name.length == 0)
        return null;
    var result = /\.[^\.]+/.exec(file_name);
    return result == null ? null : (result + "").toLowerCase();
}

//日期格式化函数，用于文件命名
function getDate() {
    var date = new Date();
    var year = date.getFullYear().toString()
    var month = date.getMonth() + 1;
    var month_string
    if (month < 10) {
        month_string = '0' + month.toString()
    } else {
        month_string = month.toString()
    }
    var day = date.getDate()
    var day_string
    if (day < 10) {
        day_string = '0' + day.toString()
    } else {
        day_string = day.toString()
    }
    return (year + '-' + month_string + '-' + day_string)
}

//主函数
fs.readdir(path, function (err, files) {
    if (err) {
        return;
    }
    var output = {};
    (function iterator(index) {
        if (index == files.length) {
            //将文件名与对于url写入文档
            fs.writeFile("./output.json", JSON.stringify(output, null, '\n'));
            return;
        }

        fs.stat(path + "/" + files[index], function (err, stats) {
            if (err) {
                return;
            }
            if (stats.isFile()) {
                var suffix = getFilenameSuffix(files[index]);
                if (!(suffix == '.js' || suffix == '.DS_Store')) {
                    //要上传文件的本地路径
                    let filePath = path + '/' + files[index];
                    console.log('上传文件: ' + files[index]);

                    //上传到七牛后保存的文件名,可以自定义
                    var today = getDate()
                    let key = today + '-' + files[index];

                    //生成上传 Token
                    let token = uptoken(bucket, key);

                    //上传参数
                    var config = new qiniu.conf.Config();

                    //文件上传器
                    var resumeUploader = new qiniu.resume_up.ResumeUploader(config);
                    var PutExtra = new qiniu.resume_up.PutExtra();

                    // 异步执行
                    resumeUploader.putFile(token, key, filePath,PutExtra, function(respErr, respBody, respInfo) {
                        if(respErr) {
                            throw respErr;
                        }

                        if (respInfo.statusCode == 200) {
                            console.log(respBody);
                            //arr.push(files[index])
                        } else {
                            console.log(respInfo.statusCode);
                            console.log(respBody)
                        }
                    })
                    let url = 'YOUR URL/' + key
                    output[files[index]] = url
                }

            }
            iterator(index + 1);
        })
    }(0));
    return;
});