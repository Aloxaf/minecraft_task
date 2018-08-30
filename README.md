# minecraft算法分析及游戏简介

【BAD-CAMP】小组 互联网应用开发基础训练大作业

## 如何参与开发

### 0x0 拉取项目

- 拉取项目: `git clone git@github.com:Vertical923/Vertical923.github.io.git`
- 切换分支: `git checkout src`

### 0x1 安装 [Node.js](https://nodejs.org/en/download/)

### 0x2 npm 换源

在 cmd 中执行 `npm config set registry https://registry.npm.taobao.org`

### 0x3 安装依赖

打开 cmd, 切换到项目根目录  
执行以下命令

```bash
npm install gulp -g
npm install gulp --save-dev
npm install gulp-jshint gulp-imagemin gulp-notify gulp-rename gulp-cache gulp-markdown gulp-file-include marked del --save-dev
```

### 0x4 根据需求修改代码

### 0x5 生成网页

在项目根目录打开 cmd, 执行 `gulp`

## 开发日志

### 2018.8.30

- 美化文本框, 加入边框
- 使用 gulp 构建代码, 大幅调整结构

### 2018.8.29

- 完整阅读并尝试理解代码, 参考 [bootstrap教程](http://www.runoob.com/bootstrap/bootstrap-navbar.html) 重写了首页, 彻底去掉了冗余代码并加入了下拉菜单
- 确定使用 [bootstrap](https://getbootstrap.com/) 框架与 [jQuey](https://jquery.com/) 库, 并改为使用 CDN 加载, 减小项目体积
- 使用 jQuery 插件 [FlexSlider](http://flexslider.woothemes.com/) 实现幻灯片播放效果
- 仿照首页创建了其他页面的骨架
- 加入了网站图标
- 分离导航栏到单独的 html, 简化了代码
- 使用 [markdown-js](https://github.com/evilstreak/markdown-js) 库实现以 markdown 形式编写网页内容

### 2018.8.28

- 仿照 [该网站](http://phpweb.mobanzhongxin.cn/) 建立了导航栏
- 加入背景与自定义 logo
