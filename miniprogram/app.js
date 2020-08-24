//app.js
App({
  async onLaunch(){
    this.globalData.total_width=wx.getSystemInfoSync().windowWidth
    this.globalData.total_height=wx.getSystemInfoSync().windowHeight
    this.globalData.ratio = this.globalData.total_width / 750
    //console.log("ssss",wx.getSystemInfoSync())

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'radar-001',
        traceUser: true,
      })
    }

    var res3=await this.q('setting',JSON.stringify({}),1,0)
    this.globalData.setting=JSON.parse(res3)[0]
    if(this.settingCallback){this.settingCallback()}
    console.log("--getted--settting",this.globalData.setting)

    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          console.log("already auth")
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.my_login({userInfo:res.userInfo},(r=>{}))
            }
          })
        }
        else{
          wx.showToast({
            title: '授权后方可使用所有功能',
            icon:'none',
            duration:3000
          })
        }
      }
    })
  },
  globalData:{
    ratio:0.5,
    auth:[0,0,0]
  },

  //调用云函数登录接口
  async my_login(data={},callback){
    var that=this;
    wx.showLoading({title: '自动登录',mask:true})
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: data,
      async success(res){
        console.log('[云函数] [login] user openid: ', res.result.userInfo._id)
        wx.hideLoading()
        that.globalData.userInfo=res.result.userInfo
        that.globalData.openid = res.result.userInfo._id
        //判断是否是管理员
        if(that.globalData.setting.admin.indexOf(that.globalData.openid)>-1)
          that.globalData.if_admin=true
        if(that.openidReadyCallback){
          that.openidReadyCallback(that.globalData.openid)}
        callback()
      },
      fail: err => {
        wx.showToast({
          title: '登录失败',
          icon:'none',
          duration:2000
        })
      }
    })
  },

  //添加数据接口
  async add(table,data){
    const db = wx.cloud.database()
    const _ = db.command
    var r;
    data['create_time']=new Date()
    await db.collection(table).add({data:data})
    .then(res => {r=res}).catch(err=>{console.log("err",err)})
    console.log(r)
    if(r['errMsg']=='collection.add:ok'){
      wx.showToast({
        title: '操作成功',
      })
    }
    else{
      wx.showToast({
        title: '操作失败',
        icon:'none'
      })
    }
    return JSON.stringify(r)
  },

  //查询数据接口
  async q(table,where={},limit=20,skip=0,orderBy='create_time',direction='desc'){
    const db = wx.cloud.database()
    const _ = db.command
    var data;
    console.log("where",where)
    await db.collection(table).where(where).limit(limit).skip(skip).orderBy(orderBy,direction).get().then(res => {
      // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
      data=res.data
    })
    return JSON.stringify(data)
  },

  //更新一条数据接口
  async update(table,doc,data,show_toast=true){
    const db = wx.cloud.database()
    const _ = db.command
    var r;
    console.log("update_data",data)
    await db.collection(table).doc(doc).update({data:data})
          .then(res=>{r=res}).catch(err=>{console.log("err",err)})
    if(r['errMsg']=='document.update:ok'){
      if(show_toast)
        wx.showToast({
          title: '操作成功',
        })
    }
    else{
      if(show_toast)
        wx.showToast({
          title: '操作失败',
          icon:'none'
        })
    }
    return JSON.stringify(r)
  },

  //删除一条数据接口
  async delete(table,doc){
    const db = wx.cloud.database()
    const _ = db.command
    var r;
    await db.collection(table).doc(doc).remove()
    .then(res => {r=res}).catch(err=>{console.log("err",err)})
    console.log(r)
    if(r['errMsg']=='document.remove:ok'){
      wx.showToast({
        title: '操作成功',
      })
    }
    else{
      wx.showToast({
        title: '操作失败',
        icon:'none'
      })
    }
    return JSON.stringify(r)
  },

  //使用promise_all,批量上传图片接口
  async upload_file(files,name){
    //files为要上传的文件的本地缓存，为一个列表
    //name为构造cloudPath时，用到的名称
    wx.showLoading({
      title: '上传中',
    })

    var all_p=[]
    for(var i=0;i<files.length;i++){
      if(files[i].indexOf('//tmp')>=0 || files[i].indexOf('wxfile://')>=0){
        const filePath = files[i]
        // 上传图片
        const cloudPath = name+String(Number(new Date()))+filePath.match(/\.[^.]+?$/)[0]
        var p=await wx.cloud.uploadFile({
          cloudPath,
          filePath
        }).catch(err=>{return {fileID:files[i]}})
      }
      else{
        var p={fileID:files[i]}
      }
      all_p.push(p)
    }
    var final_files=[]
    if(all_p.length>0)
      await Promise.all(all_p).then((res)=>{
        for(var i=0;i<res.length;i++){
          final_files.push(res[i].fileID)
        }
      })
    wx.hideLoading()
    return final_files
  },

  //打开设置页面授权接口，callback风格
  cancel_auth(content,url,callback){
    var that=this;
    wx.showModal({
      title:'提示',
      content:content,
      cancelText:'不授权',
      confirmText:'去授权',
      success:res=>{
        if(res.confirm){
          wx.openSetting({
            success (res) {
              console.log(res.authSetting)
              that.globalData.auth=[0,0,0]
              if(res.authSetting['scope.camera']){
                that.globalData.auth[0]=1
              }
              if(res.authSetting['scope.record']){
                that.globalData.auth[1]=1
              }
              if(res.authSetting['scope.userLocation']){
                that.globalData.auth[2]=1
              }
              callback()
            }
          })
        }
        else if(res.cancel){
          if(url)
            wx.switchTab({
              url: url,
            })
        }
      }
    })
  },
})
