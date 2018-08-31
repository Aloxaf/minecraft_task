# minecraft算法分析及游戏简介

【BAD-CAMP】小组 互联网应用开发基础训练大作业

## 如何参与开发

### 准备工作

#### 安装必要软件

[Node.js 10.9.0 x64](https://nodejs.org/dist/v10.9.0/node-v10.9.0-x64.msi)

[Git 2.18.0 x64](https://github.com/git-for-windows/git/releases/download/v2.18.0.windows.1/Git-2.18.0-64-bit.exe)

#### 拉取项目

`git clone git@github.com:Vertical923/minecraft_task.git`

#### npm 换源

在 cmd 中执行  
`npm config set registry http://npmreg.mirrors.ustc.edu.cn`

#### 安装依赖

在 minecraft_task 文件夹中打开 cmd/git bash,
依次执行以下命令

```bash
npm install gulp browser-sync -g
npm install
```

### 开发

在 minecraft_task 文件夹中打开 cmd/git bash 窗口,  
并执行 `gulp watch` 以监控文件变化

在 minecraft_task/docs 文件夹中打开 cmd/git bash 窗口,  
并执行 `browser-sync start -server --files "*"` 以在浏览器中实时预览网页

注: **不要关闭这两个窗口**

然后可以在 src 目录中修改代码

<div style="font-size:150%">

### 注意事项
 
- **在 src 目录中修改代码!**  
- **在 src 目录中修改代码!**  
- **在 src 目录中修改代码!**

- **不要直接往 master 分支 commit, 需要合并分支请发起 pull request**

</div>

## 开发日志

### 2018.8.31

- 加入侧边栏
- 丰富网站内容

### 2018.8.30

- 美化文本框, 加入边框
- 使用 gulp 构建代码, 大幅调整结构
- 将 markdown 的渲染放到了本地进行
- 加入背景图片

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
