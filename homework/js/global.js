;
(function() {
    var util = {};

    util.addEvent = function(el, type, cb) {
        if (el.addEventListener) {
            el.addEventListener(type, cb, false);
        } else {
            el.attachEvent('on' + type, cb);
        }
    };

    util.getChildren = function(n, skipMe) {
        var r = [];
        for (; n; n = n.nextSibling)
            if (n.nodeType == 1 && n != skipMe)
                r.push(n);
        return r;
    };

    util.getSiblings = function(n) {
        return this.getChildren(n.parentNode.firstChild, n);
    };

    util.addClass = function(node, className) {
        var _c = node.className;

        if (_c.indexOf(className) > -1) {
            return;
        }

        node.className += className;

        return this;
    };

    util.removeSibingsClass = function(node, className) {
        var siblings = this.getSiblings(node);

        for (var i = 0; i < siblings.length; i++) {

            siblings[i].className = siblings[i].className
                .replace(className, '');
        }

        return this;
    };

    util.showCurrent = function(node) {
        var siblings = this.getSiblings(node);

        node.style.display = 'block';

        for (var i = 0; i < siblings.length; i++) {
            siblings[i].style.display = 'none';
        }
    };

    util.checkboxHelper = function(selectAllEl, listCon) {


        this.addEvent(selectAllEl, 'click', function(e) {
            var chks = listCon.querySelectorAll('input[type=checkbox]'),
                len = chks.length,
                i,
                tar = e.srcElement || e.target;

            for (i = 0; i < len; i++) {
                chks[i].checked = tar.checked;
            }
        });

        //列表选项的检查
        this.addEvent(listCon, 'click', function(e) {
            var tar = e.target || e.srcElement,
                chks = listCon.querySelectorAll('input[type=checkbox]'),
                len = chks.length,
                i;

            if (tar.type.toUpperCase() === 'CHECKBOX') {

                // 如果是去掉勾, 那么去掉全选的勾
                if (!tar.checked) {
                    selectAllEl.checked = false;
                    return;
                }

                // 选中的话, 如果大家都选中, 那么全选也要选中
                for (i = 0; i < len; i++) {
                    if (!chks[i].checked) {
                        return;
                    }
                }

                selectAllEl.checked = true;
            }
        });
    };

    /* obj => a=xx&&b=yy */
    util.objToParams = function (obj) {
        var str = '';
        for(var key in obj) {
            if(!obj.hasOwnProperty(key)){
                continue;
            }

            if(str !== '') {
                str += '&';
            }

            str += key + '=' + encodeURIComponent(obj[key]);
        }

        return str;
    };

    util.ajax = function(option) {
        var _opt = {
            type: 'GET'
        },
        data = '';

        this.extend(_opt, option);
        
        if(option.data){
            data = util.objToParams(option.data);
        }

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            var serverData;

            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 0) {
                    
                    try {
                        serverData = JSON.parse(xhr.responseText);
                    } catch(e){
                        console.log('ajax json parse error:', e);
                    }

                    _opt.success(serverData);
                } else {
                    console.log("unsucessful" + xhr.status);
                }
            }
        };

        // xhr.responseType = 'json';
        xhr.open(_opt.type, _opt.url, true);
        xhr.send(data);
    };

    util.extend = function(target, src, deep) {
        var prop;

        for (prop in src) {
            if (deep && typeof(src[prop]) === 'object' || Object.prototype.toString.call(src[prop]) === '[object array]') {

                this.extend(target[prop], src[prop]);
            } else if (Object.prototype.hasOwnProperty.call(src, prop)) {
                target[prop] = src[prop];
            }
        }
    };

    util.animation = function(el, dur, attr, from, to, hasHoverPaused, cb) {
        var timeId,
            startTime,
            distance = to - from,
            leftDur,
            nowPos,

            FRAME_TIME = 13;

        function move() {

            var per = Math.min(1.0, (new Date - startTime) / dur);

            if (per >= 1) {
                clearInterval(timeId);
                el.onmouseenter = null;
                el.onmouseleave = null;
                cb();
            } else {
                el.style[attr] = from + Math.round(distance * per) + 'px';
            }
        }

        function start() {
            startTime = new Date;
            timeId = setInterval(move, FRAME_TIME);
        }

        if (hasHoverPaused) {
            el.onmouseenter = function() {
                var per = Math.min(1.0, (new Date - startTime) / dur);

                leftDur = dur * (1 - per);
                nowPos = from + Math.round(distance * per);

                clearInterval(timeId);
            };

            el.onmouseleave = function() {
                util.animation(el, leftDur, attr, nowPos, to, true, cb);

            };
        }
        start();
    };

    var tempCache = {};

    /**
     * 模板渲染方法
     * @modify nirizhe
     * @date   2016-05-20
     * @param  {[String]}   str  模板id或者string
     * @param  {[Object]}   data 渲染数据
     * @return {[String]}        最终结果
     */
    util.tmpl = function tmpl(str, data) {
        var fn = !/\W/.test(str) ?
            tempCache[str] = tempCache[str] ||
            tmpl(document.getElementById(str).innerHTML) :
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +
                "with(obj){p.push('" +
                str
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'") + "');}return p.join('');");
        return data ? fn(data) : fn;
    };


    window._ = window.Util = util;

    var api = {};

    api = {
        'deletePosts': 'http://fed.hz.netease.com/api/deleteBlogs',
        'addBlog': 'http://fed.hz.netease.com/api/addBlog',
        'editBlog': 'http://fed.hz.netease.com/api/editBlog',
        'getFriendsLatestBlogs': 'http://fed.hz.netease.com/api/getFriendsLatestBlogs',
        'topBlog': 'http://fed.hz.netease.com/api/topBlog',
        'untopBlog': 'http://fed.hz.netease.com/api/untopBlog',
        'getBlogs': 'http://fed.hz.netease.com/api/getblogs'
    };

    window.API = api;
})();

