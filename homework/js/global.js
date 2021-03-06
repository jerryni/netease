;
(function() {
    var util = {};

    util.addEvent = function(el, type, cb) {
        var i;

        for (i = 0; i < el.length; i++) {

            if (el[i].addEventListener) {
                el[i].addEventListener(type, cb, false);
            } else {
                el[i].attachEvent('on' + type, cb);
            }
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

        node.className += ' ' + className;

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

    util.removeClass = function(node, className) {
        var i;

        for (i = 0; i < node.length; i++) {


            node[i].className = node[i].className.replace(className, '');

        }
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
            var chks = listCon[0].querySelectorAll('input[type=checkbox]'),
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
                chks = listCon[0].querySelectorAll('input[type=checkbox]'),
                len = chks.length,
                i;

            if (tar.type && tar.type.toUpperCase() === 'CHECKBOX') {

                // 如果是去掉勾, 那么去掉全选的勾
                if (!tar.checked) {
                    selectAllEl[0].checked = false;
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
    util.objToParams = function(obj) {
        var str = '';
        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }

            if (str !== '') {
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

        if (option.data) {
            data = util.objToParams(option.data);
        }

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            var serverData;

            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 0) {

                    try {
                        serverData = JSON.parse(xhr.responseText);
                    } catch (e) {
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

    util.animationStop = function (el) {

        // 如果没在移动, 那么也就不需要停止了
        if(!el.isMoving) {
            return;
        }

        var params = el.moveParams,
            distance = params.to - params.from;

        var per = Math.min(1.0, (new Date - params.startTime) / params.dur);

        params.dur *=  (1 - per);
        params.from += Math.round(distance * per);

        clearInterval(params.timeId);

        // 通知重新开始的
        el.neesResume = true;
    };

    util.animationResume = function (el) {
        if(!el.neesResume) {
            return;
        }

        util.animation(el.moveParams);

        el.neesResume = false;
    };

    util.animation = function(params) {
        var timeId,
            startTime,
            distance = params.to - params.from,
            // leftDur,
            // nowPos,
            _el = params.el,

            FRAME_TIME = 13;

        _el.isMoving = false;
        function move() {

            _el.isMoving = true;
            var per = Math.min(1.0, (new Date - startTime) / params.dur);

            if (per >= 1) {
                clearInterval(timeId);
                _el.isMoving = false;
                params.cb && params.cb();
            } else {
                _el.style[params.attr] = params.from + Math.round(distance * per) + 'px';
            }
        }

        function start() {
            params.startTime = startTime = new Date;
            params.timeId = timeId = setInterval(move, FRAME_TIME);
        }

        // if (hasHoverPaused) {
            // _el.onmouseenter = function() {
            //     var per = Math.min(1.0, (new Date - startTime) / dur);

            //     leftDur = dur * (1 - per);
            //     nowPos = from + Math.round(distance * per);

            //     clearInterval(timeId);
            // };

            // _el.onmouseleave = function() {
            //     util.animation(_el, leftDur, attr, nowPos, to, true, cb);
            // };
        // }
        start();

        _el['moveParams'] = params;

        return 
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

    util.sortBy = function(arr, key) {
        var fnCompareDate = function(a, b) {


            if (a[key] > b[key]) {

                return -1;
            }
            if (a[key] < b[key]) {

                return 1;
            }

            if (a[key] == b[key]) {

                return 0;
            }

        };

        arr.sort(fnCompareDate);

        return arr;
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


if (typeof Element.prototype.matches !== 'function') {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector || function matches(selector) {
        var element = this;
        var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
        var index = 0;

        while (elements[index] && elements[index] !== element) {
            ++index;
        }

        return Boolean(elements[index]);
    };
}

if (typeof Element.prototype.closest !== 'function') {
    Element.prototype.closest = function closest(selector) {
        var element = this;

        while (element && element.nodeType === 1) {
            if (element.matches(selector)) {
                return element;
            }

            element = element.parentNode;
        }

        return null;
    };
}

if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError
    // exception. // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}