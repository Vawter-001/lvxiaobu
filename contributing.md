# 未来改进方向

## 短视频模块
1. 发布视频过程中，从视频发布页面返回，或从视频剪辑页面返回，无法保留原来的视频数据
	- 尝试过保留原数据，但极容易闪退，未解决。
	
2. 视频录制无美颜；视频录制时长最多30秒；视频选择最大50M

3. 首页刷视频时，只能上下滑动无法左右滑动
	- 左右滑动在video组件中会导致视频的进度变化，冲突

4. 原生组件弹幕位置无法下调，弹幕位置无法随机出现。
	- 尝试使用自定义弹幕组件，做了两天，功能上是实现了，但自定义组件对系统负荷太大，容易卡顿发热

5. ios系统自带动画，和wxs的上下滑动动画产生了冲突
	- ~~已废弃wxs~~

6. 视频发布时，用户必须要等视频上传完成之后才能离开发布页面，视频往往很大，用户要等很长时间
	- ~~已修复，可以后台上传~~

7. ios下，视频经常无法初始化bindloadedmeatadata
	- ~~已修复，视频src链接中有中文导致ios无法播放~~

8. 视频切换时较卡
	- ~~已修复~~

9. 首页无法分享到朋友圈，获取不到参数

## 图文攻略模块

1. 富文本编辑图片时图片改变大小操作太不方便

2. 富文本placeholder黑色无法修改，富文本自动focus

3. 分享到朋友圈，富文本数据无法渲染

## 实时通讯模块

无

## 消息提醒模块

无

## 直播模块

1. 本想做的，但是连申请权限的资格都没有，加上直播功能，小程序商业模式才算完善

## 搜索模块

1. 无法推荐搜索

2. 目前是简单的正则搜索，无法实现高水平的模糊搜索