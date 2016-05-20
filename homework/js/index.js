;
(function(_) {
    var index;
    var $ = function(selector) {
        var els,
            symbol = selector[0],
            slt = selector.substring(1);

        if (symbol === '#') {
            els = document.getElementById(slt);
        }

        if (symbol === '.') {
            els = document.getElementsByClassName(slt);
        }

        return els;
    };

    var $tabContainer = $('#j-tab');

    index = {

        // 业务初始化
        init: function() {
            this.initTab($tabContainer);
            _.checkboxHelper($('#j-selectall'), $('#j-postlist'));
            this.loadPosts();
            this.loadFriendsLatestBlogs();
            this.bindAddBlog();
            this.bindListEvent();
            this.bindBatchDelEvent();
            // this.bindFormReset();
        },

        bindBatchDelEvent: function () {
            var self = this,
                ids;

            $('#j-batchdel').onclick = function () {

                ids = self.getCheckedIds();

                if(!ids.length){
                    alert('请选择删除项');
                    return;
                }

                self.delBlogs(ids.join('&'));
            };
        },

        getCheckedIds: function () {
            var elList = $('#j-postlist'),
                ids = [];

            var els = elList.querySelectorAll('input:checked');

            for(var i=0;i<els.length;i++){
                ids.push(els[i].closest('[data-id]').getAttribute('data-id'));
            }

            return ids;
        },


        bindListEvent: function () {
            var elPostList = $('#j-postlist'),
                self = this;

            _.addEvent(elPostList, 'click', function (e) {
                var tar = e.target || e.srcElement,
                    elLi,
                    id,
                    data;

                // 编辑按钮
                // 获取到当前id, 获取到内容, 然后加到编辑框里
                if(tar.className.indexOf('j-editblog') > -1) {
                    elLi = tar.parentElement.parentElement;

                    id = elLi.getAttribute('data-id');
                    data = self.getDataById(id);
                    self.renderToEditForm(data);
                    return;
                }

                // 单个删除
                if(tar.className.indexOf('j-singledel') > -1 ||
                    tar.parentElement.className.indexOf('j-singledel') > -1) {

                    elLi = tar.closest('[data-id]');

                    id = elLi.getAttribute('data-id');
                    self.delBlogs(id);
                    return;
                }

                // 置顶
                if(tar.className.indexOf('j-totop') > -1 ||
                    tar.parentElement.className.indexOf('j-totop') > -1) {

                    elLi = tar.closest('[data-id]');

                    id = elLi.getAttribute('data-id');
                    alert('置顶');
                    self.totop(id);
                    return;
                }
            });
        },

        delBlogs: function (ids) {
            var self = this,
                isMulti;

            if(ids.indexOf('&') > -1) {
                isMulti = true;
            }

            _.ajax({
                url: 'data/deleteBlogs.json',
                params: {
                    id: ids
                },
                success: function(data) {
                    if (data === 1) {
                        alert('删除成功');
                        self.removeDeletedPost(ids);
                        isMulti && self.loadPosts();
                    } else {
                        alert('删除失败');
                    }
                }

            });
        },

        removeDeletedPost: function(ids) {
            var _ids = ids.split('&'),
                elList = $('#j-postlist');

            for(var i=0;i<_ids.length;i++){

                elList.removeChild(elList
                    .querySelector('li[data-id='+ _ids[i] +']'));
            }
        },

        getDataById: function(id){
            var result;

            result = this._postData.filter(function(item){
                return item.id === id;
            });

            return result;
        },

        renderToEditForm: function (data) {
            var _data = data[0];

            $('#j-ipttitle').value = _data.title;
            $('#j-txacontent').value = _data.blogContent;
        },
        // 添加日志
        bindAddBlog: function() {
            var self = this;

            _.addEvent($('#j-addblog'), 'click', function() {
                var params = {},
                    title,
                    content;

                title = $('#j-ipttitle').value;
                content = $('#j-txacontent').value;

                if (!title) {
                    alert('请输入标题');
                    return;
                }
                if (!content) {
                    alert('请输入内容');
                    return;
                }
                params = {
                    title: title, //日志标题
                    blogContent: content, //日志内容
                    // modifyTime: 'xxxxx', //日志创建时间
                    accessCount: 0, //阅读数
                    allowView: -100, //阅读权限
                    classId: 'xxxxxxxxx', //日志分类
                    commentCount: 0, //日志评论数
                    id: 'xxxxxxxxxxx', //日志ID,客户端随机生成
                    userId: 126770605, //用户ID
                    userName: 'testblog1', //用户名
                    userNickname: 'testblog' //用户昵称
                };
                _.ajax({
                    url: 'data/addBlog.json',
                    params: params,
                    success: function(data) {
                        if (data === 1) {
                            alert('添加成功');
                            self.resetForm();
                        } else {
                            alert('添加失败');
                        }
                    }

                });
            });
        },

        initTab: function($con) {
            _.addEvent($con, 'click', function(e) {
                var target = e.target || e.srcElement;

                if (!target ||
                    (target.nodeName !== 'LI' && target.nodeName !== 'A')) {
                    return;
                }

                if (target.nodeName === 'A') {
                    target = target.parentElement;
                }

                _.addClass(target, 'current');
                _.removeSibingsClass(target, 'current');

                // content切换
                _.showCurrent($('#' + target.getAttribute('data-id')));
            });
        },

        loadFriendsLatestBlogs: function() {

            var self = this;

            _.ajax({
                url: 'data/getFriendsLatestBlogs.json',
                data: {
                    userId: 'testblog1'
                },

                success: function(data) {
                    if (!data || !data.length) {
                        return;
                    }

                    self.renderFriendsLatestBlogs(data);
                    self.bindScrollList();
                }
            });
        },

        renderFriendsLatestBlogs: function(data) {
            var html;

            html = _.tmpl('tmplfriendsposts', {
                items: data
            });

            $('#j-friendsposts').innerHTML = html;
        },

        _postData: {},
        loadPosts: function() {
            var self = this;

            _.ajax({
                url: 'data/getblogs.json',
                data: {
                    userId: 'testblog1'
                },
                // url: 'http://fed.hz.netease.com/api/getFriendsLatestBlogs?userid=testblog',
                success: function(data) {
                    if (!data || !data.length) {
                        return;
                    }

                    self._postData = data;
                    self.renderPosts(data);
                }
            });
        },

        renderPosts: function(data) {
            var html;

            html = _.tmpl('tmplpostlist', {
                items: data
            });

            $('#j-postlist').innerHTML = html;
        },

        resetForm: function () {
            // $('#j-btnreset').onclick = function () {
                document.forms['j-formpost'].reset();
                return false;
            // };
        },

        bindScrollList: function() {
            var ul = $('#j-friendsposts'),
                height,
                childs,
                cLen,
                times,
                index = 0,
                isHovered = false,
                timeId;

            height = ul.clientHeight;
            childs = ul.childNodes;
            cLen = childs.length;
            times = cLen - 5;

            function move() {

                if (isHovered) {
                    return;
                }

                _.animation(ul, 1000, 'top', index * -50, -50 * (index + 1), true, function() {
                    timeId = setTimeout(move, 2000);
                });

                index++;

                if (index >= times) {
                    index = 0;
                }
            }

            _.addEvent(ul, 'mouseenter', function() {

                isHovered = true;
                clearTimeout(timeId);
            });
            _.addEvent(ul, 'mouseleave', function() {
                isHovered = false;
                timeId = setTimeout(move, 2000);
            });

            move();
        }
    };

    index.init();

})(Util);
