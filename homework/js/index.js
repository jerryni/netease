;
(function(_) {
    var index;
    var $ = function(selector) {

        return document.querySelectorAll(selector);
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
            this.bindDropDownEvent();
        },

        bindDropDownEvent: function () {
            _.addEvent(document.querySelectorAll('body'), 'click' ,function (e) {
                var tar = e.target || e.srcElement;

                if(tar.className.indexOf('j-operationmore') > -1 ||
                    tar.parentElement.className.indexOf('j-operationmore') > -1) {
                    return;
                }

                _.removeClass($('.j-operationmore'), 'active');
            });
        },

        bindBatchDelEvent: function () {
            var self = this,
                ids;

            _.addEvent($('#j-batchdel'), 'click', function () {

                ids = self.getCheckedIds();

                if(!ids.length){
                    alert('请选择删除项');
                    return;
                }

                self.delBlogs(ids.join('&'));
            });
        },

        getCheckedIds: function () {
            var elList = $('#j-postlist')[0],
                ids = [];

            var els = elList.querySelectorAll('input');

            for(var i=0;i<els.length;i++){
                if(els[i].checked == true) {
                    ids.push(els[i].closest('[data-id]').getAttribute('data-id'));
                }
            }

            return ids;
        },

        editingId: null,
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
                    self.editingId = id;
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


                // 更多 菜单
                if(tar.className.indexOf('j-operationmore') > -1 ||
                    tar.parentElement.className.indexOf('j-operationmore') > -1) {
                    
                    tar = tar.className.indexOf('j-operationmore') > -1 ? 
                        tar : tar.closest('.j-operationmore');

                    _.removeClass($('.j-operationmore'), 'active');

                    console.log(tar);
                    _.addClass(tar, 'active');
                }

                // 置顶
                if(tar.className.indexOf('j-totop') > -1 ||
                    tar.parentElement.className.indexOf('j-totop') > -1) {

                    elLi = tar.closest('[data-id]');

                    id = elLi.getAttribute('data-id');
                    
                    self.totop(id);
                    return;
                }

                // 取消置顶
                if(tar.className.indexOf('j-canceltop') > -1 ||
                    tar.parentElement.className.indexOf('j-canceltop') > -1) {

                    elLi = tar.closest('[data-id]');

                    id = elLi.getAttribute('data-id');
                    
                    self.canceltop(id);
                    return;
                }
            });
        },

        canceltop: function (id) {
            var self = this;

            function successCb() {
                self._postData.forEach(function (item) {
                    if(item.id == id) {

                        item.rank = 0;
                        return false;
                    }
                });

                self.sortData(self._postData, 'modifyTime');
                self.renderPosts(self._postData);    
            }
            

            _.ajax({
                url: 'data/untopBlog.json',
                params: {
                    id: id
                },
                success: function(data) {
                    if (data === 1) {
                        alert('取消置顶成功');
                        successCb();
                    } else {
                        alert('取消置顶失败');
                    }
                }

            });

            
        },

        totop: function (id) {
            var self = this;

            function successCb() {
                self._postData.forEach(function (item) {
                    if(item.id == id) {

                        item.rank = 1;
                        return false;
                    }
                });

                self.sortData(self._postData, 'modifyTime');
                self.renderPosts(self._postData);
            }

            _.ajax({
                url: 'data/topBlog.json',
                params: {
                    id: id
                },
                success: function(data) {
                    if (data === 1) {
                        alert('置顶成功');
                        successCb();
                    } else {
                        alert('置顶失败');
                    }
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
                    } else {
                        alert('删除失败');
                    }
                }

            });
        },

        removeDeletedPost: function(ids) {
            var _ids = ids.split('&'),
                elList = $('#j-postlist')[0],
                i,j;

            for(i=0;i<_ids.length;i++){

                // 从postData数据中移除
                for(j=this._postData.length -1;j>=0;j--){
                    if(this._postData[j].id == _ids[i]){
                        this._postData.splice(j,1);
                    }
                }

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

        isEditing: false,
        renderToEditForm: function (data) {
            var _data = data[0];

            $('#j-ipttitle').value = _data.title;
            $('#j-txacontent').value = _data.blogContent;

            this.isEditing = true;

        },

        // 发布按钮
        bindAddBlog: function() {
            var self = this;

            _.addEvent($('#j-addblog'), 'click', function() {
                var params = {},
                    title,
                    url,
                    dialogText,
                    content;

                title = $('#j-ipttitle')[0].value;
                content = $('#j-txacontent')[0].value;

                if (!title) {
                    alert('请输入标题');
                    return;
                }
                if (!content) {
                    alert('请输入内容');
                    return;
                } 

                // 判断是添加还是修改
                if(self.editingId) {
                    url = 'data/editBlog.json';
                    dialogText = '修改';

                    self.editingId && self._postData.forEach(function(item, index){
                        if(item.id == self.editingId) {
                            params = item;
                            self._postData.splice(index, 1);
                            return false;
                        }
                    });

                    params.title = title;
                    params.blogContent = content;
                    params.modifyTime = new Date().getTime();

                } else {
                    url = 'data/addBlog.json';
                    dialogText = '添加';
                    params = {
                        title: title, //日志标题
                        blogContent: content, //日志内容
                        // modifyTime: 'xxxxx', //日志创建时间
                        accessCount: 0, //阅读数
                        allowView: -100, //阅读权限
                        classId: 'xxxxxxxxx', //日志分类
                        commentCount: 0, //日志评论数
                        id: this.editingId || new Date().getTime(), //日志ID,客户端随机生成
                        userId: 126770605, //用户ID
                        userName: 'testblog1', //用户名
                        userNickname: 'testblog' //用户昵称
                    };
                }


                _.ajax({
                    url: url,
                    params: params,
                    success: function(data) {
                        if (data === 1) {
                            alert(dialogText + '成功');
                            
                            // 修改dom
                            self._postData.push(params);
                            self.sortData(self._postData, 'modifyTime');
                            self.renderPosts(self._postData);

                            self.resetForm();
                            self.editingId = null;
                        } else {
                            alert(dialogText + '失败');
                        }
                    }

                });

                return false;
            });
        },

        // 按照key进行排序, rank优先级最高
        sortData: function (data) {
            _.sortBy(data, 'modifyTime');
            _.sortBy(data, 'rank');
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
                _.showCurrent($('#' + target.getAttribute('data-id'))[0]);
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

            $('#j-friendsposts')[0].innerHTML = html;
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
                    // console.log(data);
                    self.sortData(data, 'modifyTime');
                    // console.log(data);
                    self.renderPosts(data);
                }
            });
        },

        renderPosts: function(data) {
            var html;

            html = _.tmpl('tmplpostlist', {
                items: data
            });

            $('#j-postlist')[0].innerHTML = html;
        },

        resetForm: function () {
            // $('#j-btnreset').onclick = function () {
                document.forms['j-formpost'].reset();
                this.editingId = null;
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
                isHoverStoped = false,
                timeId;

            height = ul[0].clientHeight;
            childs = ul[0].querySelectorAll('li');
            cLen = childs.length;
            times = cLen - 5;

            function move() {

                if (isHoverStoped) {
                    return;
                }

                var params = {
                    el: ul[0],
                    dur: 1000,
                    attr: 'top',
                    from: index * -50,
                    to: -50 * (index + 1),         
                    cb: function() {
                        timeId = setTimeout(move, 2000);
                    }
                };

                _.animation(params);

                index++;

                if (index >= times) {
                    index = 0;
                }
            }

            _.addEvent(ul, 'mouseenter', function() {

                // 防止在移动的时候再次添加事件
                if(ul[0].isMoving) {
                    _.animationStop(ul[0]);
                    return;
                }

                isHoverStoped = true;
                clearTimeout(timeId);

            });

            _.addEvent(ul, 'mouseleave', function() {
                
                _.animationResume(ul[0]);

                // 只有在hoverStoped离开的时候, 才会重新添加定时器
                if(isHoverStoped) {
                    isHoverStoped = false;
                    
                    timeId = setTimeout(move, 2000);
                }
            });

            move();
        }
    };

    index.init();

})(Util);
