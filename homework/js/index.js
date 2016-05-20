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
                // url: 'http://fed.hz.netease.com/api/getFriendsLatestBlogs?userid=testblog',
                success: function(data) {
                    if(!data || !data.length) {
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

        loadPosts: function () {
            var self = this;

            _.ajax({
                url: 'data/getblogs.json',
                // url: 'http://fed.hz.netease.com/api/getFriendsLatestBlogs?userid=testblog',
                success: function(data) {
                    if(!data || !data.length) {
                        return;
                    }

                    self.renderPosts(data);
                }
            });
        },

        renderPosts: function(data) {
            var html;

            html = _.tmpl('tmplpostlist', {
                items:data
            });

            $('#j-postlist').innerHTML = html;
        },

        bindFormReset: function () {
            $('#j-btnreset').onclick = function () {
                document.forms['j-formpost'].reset();
                return false;
            };
        },

        bindScrollList: function () {
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

                if(isHovered) {
                    return;
                }

                _.animation(ul,1000, 'top', index * -50, -50 * (index + 1),true, function () {
                    timeId = setTimeout(move,2000);
                });

                index++;

                if(index >= times) {
                    index = 0;
                }
            }

            _.addEvent(ul, 'mouseenter', function(){

                isHovered = true;
                clearTimeout(timeId);
            });
            _.addEvent(ul, 'mouseleave', function(){
                isHovered = false;
                timeId = setTimeout(move,2000);
            });

            move();
        }
    };

    index.init();

})(Util);
