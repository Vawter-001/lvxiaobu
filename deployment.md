# 项目部署说明
1. 全局设置
   - 给小程序的环境ID，设置未登录用户访问权限，以保证可以分享到朋友圈

2. 数据库集合(表)、介绍及权限

   |集合(表)名称|集合(表)介绍|集合(表)权限|
   |:-:|:-:|:-:|
   |ChatRoom|聊天记录|`{"read": true,"write":true}`|
   |GroupId|聊天室|`{"read": true,"write":true}`|
   |blog|文章|`{"read": true,"write":true}`|
   |comments|文章评论|所有用户可读，仅创建者可读写|
   |danmu|视频弹幕|所有用户可读，仅创建者可读写|
   |inform|互动通知|`{"read": true,"write":true}`|
   |setting|基础设置|`{"read": true,"write":true}`|
   |user|用户数据|`{"read": true,"write":true}`|
   |video|视频|`{"read": true,"write":true}`|
   
3. 存储权限
   - 所有用户可读，仅创建者可读写

4. 导入代码
   - [点此]()查看视频教程
   - 克隆项目：`git clone https://github.com/Vawter-001/lvxiaobu.git`
   - 修改project.config.json，把"appid"，修改为自己的
   - 修改app.js，把env修改为自己对云环境
   - 打开开发者工具，导入项目，选择刚刚clone下来的项目目录
   - 对所有云函数执行：右键-在外部终端打开-`npm install`-上传并部署所有文件
   - timer_inform云函数还需要上传触发器   

5. 云函数
   - 所有云函数环境变量设置都为：Key:TZ   Value:Asia/Shanghai
   - 云函数：get_blogs/get_video/fresh/get_danmu/get_comments，确保权限如下：
   ```
	{
	  "*": {
		"invoke": true
	  }
	}
   ```






