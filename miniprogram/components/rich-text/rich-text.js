// components/rt/rt.js
const app=getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    readOnly: {
      type: Boolean,
      value: false
    },
    button_text: {
      type: String,
      value: '保存'
    },
    html: {
      type: String,
      value: ''
    },
    height:{
      type:Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    selected_function1:'文本',
    function1:['文本','段落','插入'],
    wenben:[
      {img:'./images/H1.png',text:'标题1',name:'header',value:1},
      {img:'./images/H2.png',text:'标题2',name:'header',value:2},
      {img:'./images/H3.png',text:'标题3',name:'header',value:3},
      {img:'./images/B.png',text:'加粗',name:'bold'},
      {img:'./images/I.png',text:'斜体',name:'italic'},
      {img:'./images/U.png',text:'下划线',name:'underline'}],
    duanluo:[
      {img:'./images/left.png',text:'左对齐',name:'align',value:'left'},
      {img:'./images/center.png',text:'居中',name:'align',value:'center'},
      {img:'./images/right.png',text:'右对齐',name:'align',value:'right'},
      {img:'./images/liangduan.png',text:'两端',name:'align',value:'justify'}],
    charu:[
      {img:'./images/img.png',text:'图片'},
      {img:'./images/rili.png',text:'日期'},
      {img:'./images/line.png',text:'分隔线'},
      {img:'./images/task.png',text:'待办',name:'list',value:'unchecked'},
      {img:'./images/youxu.png',text:'编号',name:'list',value:'ordered'},
      {img:'./images/wuxu.png',text:'列表',name:'list',value:'bullet'}]
  },

  attached(){
    this.setData({
      function2:this.data.wenben
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    change_function1(e){
      var selected=e.currentTarget.dataset.selected
      if(selected=='文本'){
        var function2=this.data.wenben
      }else if(selected=='段落'){
        var function2=this.data.duanluo
      }else if(selected=='插入'){
        var function2=this.data.charu
      }
      this.setData({
        selected_function1:selected,
        function2
      })
    },

    //编辑器初始化完成时触发
    onEditorReady() {
      //console.log('编辑器初始化完成时触发')
      // 返回一个 SelectorQuery 对象实例。在自定义组件或包含自定义组件的页面中，应使用this.createSelectorQuery()来代替。
      // https://developers.weixin.qq.com/miniprogram/dev/api/wxml/wx.createSelectorQuery.html 
      this.createSelectorQuery().select('#editor').context(res => {
        console.log('createSelectorQuery=>', res)
        this.editorCtx = res.context;
        this.setContents(this.data.html); //设置富文本内容
      }).exec();
    },

    //设置富文本内容
    setContents(richtext) {
      this.editorCtx.setContents({
        html: richtext,
        success: res => {
          //console.log('[setContents success--]', res)
        }
      })
    },

    // 通过 Context 方法改变编辑器内样式时触发，返回选区已设置的样式
    onStatusChange(res) {
      const formats = res.detail;
      var function2=this.data.function2
      if(JSON.stringify(formats)=='{}'){//format为空时，清空所有选中
        for(var i=0;i<function2.length;i++)function2[i]['selected']=false
      }

      for(var i=0;i<function2.length;i++){//循环function2列表
        for(var key in formats){//循环formats获取键值对
          if(function2[i]['name']==key){//function2中对name，对应formats中对键
            if(!function2[i]['value']){//若function2中，只有name，没有value，则当name和key一样时，就是被选中
              function2[i]['selected']=true
              break;//如果此function2是被选中的，那么就终止format循环，并判断下一个function2是否被选中
            }
            else if(function2[i]['value']==formats[key]){//function2中对value，对应formats中的值
              function2[i]['selected']=true//值相等，肯定是被选中的
              break;
            }
            else{
              function2[i]['selected']=false
            }
          }
          else{
            function2[i]['selected']=false
          }
        }
      }
      this.setData({
        function2
      })
      
      //console.log('onStatusChange=>',formats,'\n',function2)
    },

    //每次点击功能栏时，都会触发此函数
    format(res) {
      let {
        name,
        value
      } = res.currentTarget.dataset;
      if (!name) this.insert(res);
      this.editorCtx.format(name,value);
    },

    insert(e){
      var text=e.currentTarget.dataset.text
      if(text=="图片"){
        this.insert_img()
      }else if(text=="日期"){
        this.insert_date()
      }else if(text=="分隔线"){
        this.insert_line()
      }
    },

    /*下面一段，都是十分简单的，调用一下接口而已，看起来复杂，其实很简单*/
    undo(){
      this.editorCtx.undo();
    },

    redo(){
      this.editorCtx.redo();
    },

    clear() {
      this.editorCtx.clear()
    },

    insert_img(){
      var that=this;
      wx.chooseImage({
        count: 1,
        success: res => {
          var path = res.tempFilePaths[0];
          //调用子组件方法，图片应先上传再插入，不然预览时无法查看图片。
          that.insertImageMethod(path).then(res => {
            console.log('[insert image success callback]=>', res)
          }).catch(res => {
            console.log('[insert image fail callback]=>', res)
          });
        }
      })
    },
    insertImageMethod(path) {
      return new Promise((resolve, reject) => {
        this.editorCtx.insertImage({
          src: path,
          data: {
            id: 'imgage',
          },
          success: res => {
            resolve(res);
          },
          fail: res => {
            reject(res);
          }
        })
      })
    },

    insert_date(){
      const formatNumber = n => {
        n = n.toString()
        return n[1] ? n : '0' + n
      }

      const str_date=date=>{
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
      
        return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
      }
      this.editorCtx.insertText({
        text:str_date(new Date())
      })
    },

    insert_line(){
      this.editorCtx.insertDivider({
        success: res => {
          console.log('[insert line success]', res)
        }
      })
    },
    /*上面一段，都是十分简单的，调用一下接口而已，看起来复杂，其实很简单*/

    set_html(){
      this.editorCtx.getContents({
        success: res => {
          /*
          如果想要把数据返回到父级页面，就在点击保存时，加入下面的代码
          记得在父级页面，创建一个get_content(e){}函数，用来接收数据
          并在父级页面，挂载此组件的地方，加bind:get_content="get_content"
          */
          //this.triggerEvent('get_content',{html:res.html});
          app.globalData.html=res.html
        }
      })
    },
  }
})
