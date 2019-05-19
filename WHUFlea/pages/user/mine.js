const app = getApp();
let productPage = 0;

Page({
    data: {
        navigation: 0,
        products: app.memories.products,
        productAtEnding: false
    },

    onLoad: function() {},

    changeNavigation: function(e) {
        this.setData({
            navigation: e.detail.current
        });
    },

    getProducts: function() {
        const that = this;
        app.request('/user/collection/products', {
            page: ++productPage
        }, function(res) {
            if (res.state) {
                if (res.data == null) {
                    that.setData({
                        productAtEnding: true
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
    }
});