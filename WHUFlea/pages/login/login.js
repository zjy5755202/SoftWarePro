const app = getApp();
let id = '',
    password = '';

Page({
    /**
     * 输入学号
     */
    setId: function(e) {
        id = e.detail.value;
    },

    /**
     * 输入密码
     */
    setPassword: function(e) {
        password = e.detail.value;
    },

    /**
     * 执行登录
     */
    login: function(e) {
        // app.showLoading('登录中...');
        // setTimeout(function() {
        //     wx.hideLoading();
        //     app.showToast(true, '登录成功');
        //     setTimeout(function() {
        //         wx.switchTab({
        //             url: '/pages/products/products'
        //         });
        //     }, 1000);
        // }, 2000);
        // return;
        if (!id || !password) {
            return;
        }
        if (e.detail.errMsg != 'getUserInfo:ok') {
            app.showToast(false, '登录失败');
            return;
        }
        const that = this;
        app.showLoading('登录中...');
        app.request('/user/checkLogin', {
            userid: id,
            password: password,
            nickname: e.detail.userInfo.nickName,
            avatar: e.detail.userInfo.avatarUrl
        }, function(res) {
            wx.hideLoading();
            if (res.state) {
                app.showToast(true, '登录成功');
                setTimeout(function() {
                    wx.switchTab({
                        url: '/pages/products/products'
                    });
                }, 1000);
                app.memories.user.id = id;
                app.setMemories();
            } else {
                app.showModal({
                    content: res.message
                });
            }
        });
    }
});