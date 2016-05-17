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

    util.getSiblings = function(node) {
        var arr = [],
            temp;

        temp = node;
        while (temp.previousElementSibling) {
            arr.push(temp.previousElementSibling);
            temp = temp.previousElementSibling;
        }

        temp = node;
        while (temp.nextElementSibling) {
            arr.push(temp.nextElementSibling);
            temp = temp.nextElementSibling;
        }

        return arr;

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
        

        selectAllEl.onclick = function(e) {
            var chks = listCon.querySelectorAll('input[type=checkbox]'),
                len = chks.length,
                i;

            for (i = 0; i < len; i++) {
                chks[i].checked = e.target.checked;
            }
        };

        //列表选项的检查
        this.addEvent(listCon, 'click', function (e) {
            var tar = e.target,
                chks = listCon.querySelectorAll('input[type=checkbox]'),
                len = chks.length,
                i;

            if(tar.type.toUpperCase() === 'CHECKBOX') {

                // 如果是去掉勾, 那么去掉全选的勾
                if(!tar.checked) {
                    selectAllEl.checked = false;
                    return;
                }

                // 选中的话, 如果大家都选中, 那么全选也要选中
                for(i = 0; i < len; i++){
                    if(!chks[i].checked){
                        return;
                    }
                }

                selectAllEl.checked = true;
            }
        });
    };

    util.ajax = function (option) {
        var _opt = {
            type: 'GET'
        };

        this.extend(_opt, option);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if(xhr.readyState === 4){
                if(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 0){
                    // options.onsuccess(xhr.responseText);
                    _opt.success(xhr.response);
            }
            else {
                    console.log("unsucessful" + xhr.status);
                }
            }
        };

        xhr.responseType = 'json';
        xhr.open(_opt.type, _opt.url, true);
        xhr.send();
    };

    util.extend = function (target, src, deep) {
        var prop;

        for(prop in src ) {
            if(deep && typeof(src[prop]) === 'object'
                || Object.prototype.toString.call(src[prop]) === '[object array]') {

                this.extend(target[prop],src[prop]);
            } else if(Object.prototype.hasOwnProperty.call(src, prop)) {
                target[prop] = src[prop];
            }
        }
    };

    window._ = window.Util = util;

})();
