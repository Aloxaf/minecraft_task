# MOD安装教程

1. 准备一个正常可用的解压缩软件，推荐7z或者winRAR，确保你使用的非阉割版本。

2. 下载一个完全纯净版本的minecraft。用本站启动器的可以选择更新得到一个纯净版本。正版用户则可清除游戏目录下文件后强制升级来得到最新的纯净版本。请注意确保你使用了完全纯净的版本。

3. 准备需要安装的mod。如可能请仔细阅读作者关于其mod的说明，弄清版本以及安装需求。

4. 通常一个纯净版本的minecraft的游戏目录包括：

目录 | 说明
--|--
bin | 主要文件
resources | 资源(声音，音乐等)
texturepacks | 第三方材质包存放地址
saves | 存档/地图
options.txt | 设置文档

打开bin文件夹，一般包括下面这些文件:

目录 | 说明
--|--
natives | 忽略
lwjgl,jar | 忽略
minecraft.jar | minecraft主文件
jinput.jar | 忽略
lwjgl_utility.jar | 忽略
version file | 版本文件

用解压缩软件打开minecraft.jar(如图)

![](./img/no4.png)

5. 对于不需要API的mod，一般的安装方法是将其拖入jar中。注意你下到的通常都是压缩包，请先解压。一般被拖动的文件的格式是class和一些特定名字的文件夹，如果不是，请查看你是否正确地解压文件。

6. 对于大部分mod的安装方法(请按推荐顺序)如下：

 1. 备份你的minecraft.jar。删除minecraft.jar内的META-INF文件夹。许多mod需要你这样做。
 2. 安装modloader，把modloader解压后拖入jar中。
 3. 可选，如需要第三方音效。安装AudioMod，方法同第二步。
 4. 可选，如需要安装某些多人mod。安装modloaderMP。
 5. 可选，如需要安装某些需求forge的mod。安装forge。
 6. 可选，安装某些支持中文输入或者第三方皮肤支持的mod。某些画面增益的mod也放在这一步比较合适。
 7. 可选，安装高清补丁或者optionFINE，请务必务必放在最后安装!

在安装了modloader后运行一次游戏。测试游戏是否能正常运行。