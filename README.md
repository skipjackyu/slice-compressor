## 工具开发背景：
figma（和蓝湖） 下载的切图未压缩文件较大，下载完通常需要再手动使用相关工具（tinypng 等）压缩一遍，做了重复工作。这个小插件实现了下载切图的同时压缩图片的功能。

## 环境依赖
- Chrome 或者其他基于 Chromium 的浏览器(Edge)
- server 端 nodejs 8.x.x

## 使用方法
1. clone项目到本地并进入代码根目录
2. yarn install
3. yarn start
4. Chrome（或其他Chromium内核浏览器）打开扩展程序页，选择“加载已解压的扩展程序”，选择目录中的plugin文件夹，插件会默认开启
5. 进入蓝湖或figma下载切图
