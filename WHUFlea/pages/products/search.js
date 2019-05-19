const app = getApp();
let keyword = "",
    page = 0;

Page({
    data: {
        products: app.memories.products,
        atEnding: false
    },

    onLoad: function(params) {
        keyword = params.ketword;
        this.getProducts();
    },

    getProducts: function() {
        const that = this;
        app.request('/products/search', {
            keyword: keyword,
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
    }
});