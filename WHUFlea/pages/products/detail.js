const app = getApp();

Page({
    data: {
        id: '',
        product: null
    },

    onLoad: function() {
        this.setData({
            id: app.memories.user.id,
            product: app.caches.product
        });
    },

    previewImage: function(e) {
        const that = this;
        wx.previewImage({
            current: that.data.product.images[e.target.dataset.index],
            urls: that.data.product.images
        });
    },

    deleteProduct: function() {}
});