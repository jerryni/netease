;
(function(_) {
    var index;
    var $ = function(id) {
        return document.getElementById(id);
    };

    var $tabContainer = $('j-tab');

    index = {
        init: function() {
            this.initTab($tabContainer);
            _.checkboxHelper($('j-selectall'), $('j-postlist'));
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
                _.showCurrent($(target.dataset.id));
            });
        },

        loadFriendsLatestBlogs: function() {

            var self = this;

            _.ajax({
                url: 'data/getFriendsLatestBlogs.json',
                // url: 'http://fed.hz.netease.com/api/getFriendsLatestBlogs?userid=testblog',
                success: function(data) {
                    console.log(data);
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

            $('j-friendsposts').innerHTML = html;
        },

        bindFormReset: function () {
            $('j-btnreset').onclick = function () {
                document.forms['j-formpost'].reset();
                return false;
            };
        }
    };

    index.init();


})(Util);
