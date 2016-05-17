/*	公共方法说明
	addevent：为对象添加事件
	placeholder：模拟html5中placeholder
	ajax：ajax请求
*/
var Util={};
var xhr= new XMLHttpRequest();
/*  添加事件 */
Util.addevent=function(obj,type,fn){
	if(obj.addEventListener)
		obj.addEventListener(type,fn,false);
	else
		obj.attachEvent('on'+type,fn);
}
/*  模拟placeholder 
    方法：动态创建label，添加样式，绑定focus和blur事件
    这里存在一个bug，label是覆盖在input上的，因此当点击在label上时，没有反应，如何解决？
*/
Util.placeholder=function(obj,text,style){
	var label=document.createElement('label');
	label.innerHTML=text;
	label.className=style;
	obj.parentNode.insertBefore(label,obj);
	Util.addevent(obj,'focus',function(){
		label.innerHTML='';
	})
	Util.addevent(obj,'blur',function(){
		if(obj.value==='')
			label.innerHTML=text;
	});
	return label;
}
Util.ajax=function(url,data,callback){
	if(!!xhr){
		xhr.onreadystatechange=null;
		xhr.abort();
	}
	xhr= new XMLHttpRequest();
	var response;
	xhr.onreadystatechange=function(){	
		if(xhr.readyState===4)
		{
			callback(xhr.responseText);		
		}		
	}
	xhr.open('GET',url,true);
	xhr.setRequestHeader('Content-Type','text/plain');
	xhr.send(null);
}

/*
var _r =[];
Function.prototype.bind= function() {
	var _args = arguments,
		_object = arguments[0],
		_function = this;
	return function(){
		// not use slice for chrome 10 beta and Array.apply for android
		var _argc = _r.slice.call(_args,1);
		_r.push.apply(_argc,arguments);
		return _function.apply(_object||window,_argc);
	};
};
*/

