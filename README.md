# qiniu-node-upload
#### 功能描述
一键上传文件夹中所有图片到七牛云。
#### 使用流程
* 确保已经安装node
* 安装qiniu的官方插件: npm install qiniu
* 获取代码 git clone
* 更改 qiniu-node-uploader.js 中相关参数
    * 七牛的 AK, SK, BUCKET, URL
    * 本地文件夹的路径
* 打开shell, node qiniu-node-uploader.js
#### TODO
* 与markdown文件结合，直接自动上传并替换md中的图片为链接
#### 参考文献
* [Hexo折腾记——性能优化篇]https://yq.aliyun.com/articles/8608
* [七牛官方文档]https://developer.qiniu.com/kodo/sdk/1289/nodejs
