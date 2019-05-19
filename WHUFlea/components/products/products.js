const app = getApp();

Component({
    properties: {
        top: {
            type: Number,
            value: 0
        },
        products: {
            type: Array,
            value: null
        }
    },

    methods: {
        goToDetail: function(e) {
            app.caches.product = this.data.products[e.target.dataset.index];
            wx.navigateTo({
                url: '/pages/products/detail'
            });
        }
    }
});