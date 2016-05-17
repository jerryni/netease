;(function(_) {
    var index;
    var $ = function (id) {
        return document.getElementById(id);
    };

    var $tabContainer = $('j-tab');

    index = {
        init: function() {
            this.initTab($tabContainer);
            _.checkboxHelper($('j-selectall'), $('j-postlist'));
        },

        initTab: function($con) {
            _.addEvent($con, 'click', function(e) {
                var target = e.target;

                if(!target || 
                    (target.nodeName !== 'LI'&& target.nodeName !== 'A')) {
                    return;
                }

                if(target.nodeName === 'A') {
                    target = target.parentElement;
                }

                _.addClass(target, 'current');
                _.removeSibingsClass(target, 'current');

                // content切换
                _.showCurrent($(target.dataset.id));
            });
        }
    };

    index.init();
})(Util);
