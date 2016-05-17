/*	该页面函数说明
	init：初始化，各种绑定事件
	getblog：获取日志
	tabclick：选项卡切换
	placeholder：为表单元素添加placeholder
	resetfn：清空按钮
*/
var index={
	init:function(){
		this.getblog();
		this.tabclick();
		this.placeholderfn();
		this.resetfn();
	},
	getblog:function(){
		var myblog=document.getElementById('j-myblog');
		/*
		var data1='[{"accessCount":"11", "allowView":"-100", "classId":"fks_0870508080067081", "className":"默认分类", "commentCount":"0",'+
' "comments":"null", "content":"", "id":"fks_0800740930068083086080067081", "ip":"60.191.86.3", "isPublished":"1", "lastAccessCountUpdateTime":"1299123080100",'+
' "modifyTime":"1277264192935", "publishTime":"1277264160592", "publishTimeStr":"11:36:00", "publisherId":"0", "publisherNickname":"null",'+
' "publisherUsername":"null", "rank":"0", "recomBlogHome":"false", "shortPublishDateStr":"2010-6-23", "title":"js高性能原则(转载)",'+
' "blogContent":"js高性能原则(转载)的日志内容就这些","userId":"126770605","userName":"testblog1","userNickname":"testblog"}]';
*/
       // data=eval('('+data1+')');
       var url='http://192.168.144.11/api/getblogs';
       Util.ajax(url,null,function(response){
       		var data=eval(response);
       		alert(data[0].accessCount);
       });	   
	},
	scrollblog:function(){
		var friend=document.getElementById('j-friend');
	},
	/*  点击tab，切换功能
   	    最初的办法：将函数绑定在每个tab边上，需循环绑定，但出现了问题，貌似是作用域和闭包什么的问题
   	    最终的办法：将函数绑定在tab的父元素ul上，在冒泡阶段检查触发事件的target，从未确定是点击了哪个tab
	*/
	tabclick:function(){		
		var tabul=document.getElementById('j-tab');//获取tab的父元素ul
		var tabs=document.getElementsByName('j-tab');//获取tab集合
		var cons=document.getElementsByName('j-con');//获取tab对应的内容集合
		Util.addevent(tabul,'click',function(ev){//console.log(ev.target);	
			var target=ev.target||ev.srcElement;
			for(var i=0,l=tabs.length;i<l;i++)
			{					
				if(tabs[i]===target)
				{
					tabs[i].className="tab f-fl current";//触发click事件的tab添加选中的class
					cons[i].className="";
				}
				else
				{
					tabs[i].className="tab f-fl";
					cons[i].className="hide";
				}
			}
		});
	},
	/*  为日志标题和内容模拟添加placeholder */
	placeholderfn:function(){
		var title=document.getElementById('j-title');
		this.titletext='日志标题';
		this.plfortitle=Util.placeholder(title,this.titletext,'plfortitle');
		var log=document.getElementById('j-log');
		this.logtext='这里可以写日志哦~';					
		this.plforlog=Util.placeholder(log,this.logtext,'plforlog');				
	},
	/*  清空按钮
		除清空表单中input和textarea的值外，需显示placeholder
	*/
	resetfn:function(){
		var resetbtn=document.getElementById('j-reset');
		var form=document.getElementById('j-form');
		Util.addevent(resetbtn,'click',function(){			
			form.reset();//清空表单
			index.plfortitle.innerHTML=index.titletext;//显示placeholder
			index.plforlog.innerHTML=index.logtext;
		});
	}

}
index.init();

/********一些有问题的程序*************/
/*
	tabclick:function(){
		var tabs=document.getElementsByName('j-tab');//获取所有的tab集合
		var cons=document.getElementsByName('j-con');//获取所有的tab对应的内容contain集合
		var l=tabs.length;//获取tab个数，contain数与tab一致
		for(var i=0;i<l;i++)//为每个tab添加click事件
		{	//var this
			Util.addevent(tabs[i],'click',function(i){					
				hander(i);
			});
		}
		function hander(i)
		{
			for(var j=0;j<l;j++)
			{						
				tabs[j].className="tab f-fl";//把所有tab的class设成不选中状态
				cons[j].className="hide";
			}
			tabs[i].className="tab f-fl current";//把点击的tab添加选中的classs
			cons[j].className="";
		}
	},
	tabclick2:function(){//最笨的办法
		var tab1=document.getElementById('j-tab1');
		var tab2=document.getElementById('j-tab2');
		var con1=document.getElementById('j-con1');
		var con2=document.getElementById('j-con2');
		Util.addevent(tab1,'click',function(){					
			tab1.className="tab f-fl current";
			tab2.className="tab f-fl ";
			con1.className="";
			con2.className="hide";
		});
		Util.addevent(tab2,'click',function(){					
			tab2.className="tab f-fl current";
			tab1.className="tab f-fl ";
			con2.className="";
			con1.className="hide";
		});
	},
*/
