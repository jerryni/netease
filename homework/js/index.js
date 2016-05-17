;
(function(_) {
    var index;
    var $ = function(selector) {
        var els,
            symbol = selector[0],
            slt = selector.substring(1);

        if(symbol === '#') {
            els = document.getElementById(slt);
        }

        if(symbol === '.') {
            els = document.getElementsByClassName(slt);
        }

        return els;
    };

    var $tabContainer = $('#j-tab');

    index = {
        init: function() {
            this.initTab($tabContainer);
            _.checkboxHelper($('#j-selectall'), $('#j-postlist'));
            this.loadPosts();
            this.loadFriendsLatestBlogs();
            this.bindFormReset();
        },

        initTab: function($con) {
            _.addEvent($con, 'click', function(e) {
                var target = e.target;

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
                _.showCurrent($('#' + target.dataset.id));
            });
        },

        loadFriendsLatestBlogs: function() {

            var self = this;

            _.ajax({
                url: 'data/getFriendsLatestBlogs.json',
                // url: 'http://fed.hz.netease.com/api/getFriendsLatestBlogs?userid=testblog',
                success: function(data) {
                    console.log(data);
                    if(!data || !data.length) {
                        return;
                    }
                    
                    self.renderFriendsLatestBlogs(data);
                }
            });
        },

        renderFriendsLatestBlogs: function(data) {
            var tpl = '<li class="f-cb">' +
                '<img src="" class="avatar" alt="">' +
                '<div class="name"><a href="#">{{userNickname}}</a></div>' +
                '<div class="description"><a href="#">{{title}}</a></div>' +
                '</li>',
                html = '',
                temp;

            if(!data) {
                html = '<li>没有数据</li>';
            }

            for (var i = 0;i<data.length;i++){
                temp = tpl.replace('{{userNickname}}', data[i].userNickname)
                    .replace('{{title}}', data[i].title);

                html += temp;
            }

            $('#j-friendsposts').innerHTML = html;
        },

        loadPosts: function () {
            var self = this;

            _.ajax({
                url: 'data/getblogs.json',
                // url: 'http://fed.hz.netease.com/api/getFriendsLatestBlogs?userid=testblog',
                success: function(data) {
                    console.log(data);
                    if(!data || !data.length) {
                        return;
                    }

                    self.renderPosts(data);
                }
            });
        },

        renderPosts: function(data) {
            var tpl = '<li>' +
                        '<input type="checkbox" name="" id="">' +
                        '<a href="#" class="title">{{title}}</a>' +
                        '<div class="operations">' +
                            '<a href="#" class="edit">编辑</a>' +
                            '<div class="more">' +
                                '<a href="#">更多</a>' +
                                '<i class="u-arrowdown"></i>' +
                                '<ul>' +
                                    '<li><a href="#">删除</a></li>' +
                                    '<li><a href="#">置顶</a></li>' +
                                '</ul>' +
                            '</div>' +
                        '</div>' +
                        '<div class="info">' +
                            '<span class="date">{{shortPublishDateStr}} {{publishTimeStr}}</span>' +
                            '<span class="read">阅读量 <span class="count">{{accessCount}}</span></span>' +
                            '<span class="comments">评论 <span class="count">{{commentCount}}</span></span>' +
                        '</div>' +
                    '</li>',
                html = '',
                temp;

            for (var i = 0;i<data.length;i++){
                temp = tpl.replace('{{shortPublishDateStr}}', data[i].shortPublishDateStr)
                    .replace('{{title}}', data[i].title)
                    .replace('{{publishTimeStr}}', data[i].publishTimeStr)
                    .replace('{{commentCount}}', data[i].commentCount)
                    .replace('{{accessCount}}', data[i].accessCount);

                html += temp;
            }

            $('#j-postlist').innerHTML = html;
        },

        bindFormReset: function () {
            $('#j-btnreset').onclick = function () {
                document.forms['j-formpost'].reset();
                return false;
            };
        }
    };

    index.init();


})(Util);
