const app = getApp();
let urls = [];

Page({
    data: {
        imagePaths: []
    },

    onLoad: function() {
        this.setData({
            imagePaths: app.caches.tempFilePaths
        });
    },

    previewImage: function(e) {
        wx.previewImage({
            current: app.caches.tempFilePaths[e.target.dataset.index],
            urls: app.caches.tempFilePaths
        });
    },

    post: function(e) {
        const that = this;
        app.showLoading('发布中...');
        app.request('/Goods/addGoods', {
            userid: app.memories.user.id,
            name: e.detail.value.title,
            price: e.detail.value.price,
            cover: ''
        }, function(res) {
            wx.hideLoading();
            if (res) {
                that.uploadImages(res);
            } else {
                app.showModal({
                    content: res.message
                });
            }
        });
    },

    uploadImages: function(id) {
        app.showLoading('上传图片...');
        const that = this;
        for (let i = 0; i < this.data.imagePaths.length; i++) {
            wx.uploadFile({
                url: app.config.api + '/Goods/updateCover',
                filePath: that.data.imagePaths[i],
                name: 'cover',
                formData: {
                    goodUUID: id
                },
                success: function(res) {
                    urls.push(res.data)
                    if (urls.length == that.data.imagePaths.length) {

                        app.showToast(true, "发布成功");
                        setTimeout(function() {
                            wx.navigateBack();
                        }, 1000);
                    }
                }
            });
        }
    }
});