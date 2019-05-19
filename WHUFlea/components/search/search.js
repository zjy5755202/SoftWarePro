const app = getApp();
const menu = app.config.menu;
const system = app.config.system;

Component({
    properties: {
        text: {
            type: String,
            value: '搜索'
        },
        type: {
            type: String,
            value: ''
        }
    },

    data: {
        left: 0,
        top: 0,
        height: 0
    },

    attached: function() {
        const left = system.windowWidth - menu.right;
        const right = left + left + left + menu.width;
        const top = menu.top;
        const height = menu.height;
        this.setData({
            left,
            right,
            top,
            height
        });
    },

    methods: {
        search: function(e) {
            let keyword = e.detail.value;
            if (!keyword) {
                return;
            }
            wx.navigateTo({
                url: '/pages/' + this.data.type + '/search?keyword=' + keyword
            });
        }
    }
});