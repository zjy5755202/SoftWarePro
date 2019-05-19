const app = getApp();
let page = 0;

Page({
    data: {
        top: 0,
        products: app.memories.products,
        atEnding: false
    },

    onLoad: function() {
        this.setData({
            top: app.config.menu.height + app.config.menu.top + 9
        });
        this.getProducts();
    },

    /**
     * 加载内容
     */
    getProducts: function() {
        const that = this;
      app.request('/Goods/queryGoodsByTime', {
            page: ++page
        }, function(res) {
            if (res.state) {
                if (res.data == null) {
                    that.setData({
                        atEnding: true
                    });
                } else {
                    that.setData({
                        products: that.data.products.concat(res.data)
                    });
                }
            } else {
                app.showModal({
                    content: res.message
                });
            }
        });
    },

    /**
     * 触底加载
     */
    onReachBottom: function() {
        this.getProducts();
    },

    goToPost: function() {
        wx.chooseImage({
            count: 3,
            success: function(res) {
                app.caches.tempFilePaths = res.tempFilePaths;
                wx.navigateTo({
                    url: 'post'
                });
            },
        });
    }
});