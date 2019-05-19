App({
    onLaunch: function() {
        // 获取系统存储
        let memories = wx.getStorageSync('memories');
        if (memories) {
            this.memories = memories;
        }
    },

    config: {
        api: 'http://127.0.0.1:8080',
        system: wx.getSystemInfoSync(),
        menu: wx.getMenuButtonBoundingClientRect()
    },

    memories: {
        token: '',
        user: {
            id: ''
        },
        products: [{
            id: '1',
            user: {
                id: '',
                avatar: 'http://img4.imgtn.bdimg.com/it/u=1275036544,4277632390&fm=214&gp=0.jpg',
                nickname: '用户名'
            },
            images: ['https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1557387809877&di=cb98af6e5092381ab21fbab0b3b33a6d&imgtype=0&src=http%3A%2F%2F5b0988e595225.cdn.sohucs.com%2Fimages%2F20171205%2F81a6010df89c4578a9c8aaf205e63fd8.jpeg'],
            title: '商品名商品名商名商品名商品名商品名商品名商品名商品名商品名',
            price: '100.00'
        }, {
            id: '2',
            user: {
                id: '',
                avatar: 'http://img4.imgtn.bdimg.com/it/u=1275036544,4277632390&fm=214&gp=0.jpg',
                nickname: '用户名'
            },
            images: ['https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1557388845828&di=40128c60e0fcde861bf770ed3b6c7543&imgtype=0&src=http%3A%2F%2Fimg.11665.com%2Fimg.alicdn.com%2Fbao%2Fuploaded%2Fi1%2F2213078054%2FTB1Kx_DvlnTBKNjSZPfXXbf1XXa_%2521%25210-item_pic.jpg'],
            title: '测试商品名测试商品',
            price: '99.00'
        }, {
            id: '3',
            user: {
                id: '',
                avatar: 'http://img4.imgtn.bdimg.com/it/u=1275036544,4277632390&fm=214&gp=0.jpg',
                nickname: '用户名'
            },
            images: ['https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1557388845828&di=40128c60e0fcde861bf770ed3b6c7543&imgtype=0&src=http%3A%2F%2Fimg.11665.com%2Fimg.alicdn.com%2Fbao%2Fuploaded%2Fi1%2F2213078054%2FTB1Kx_DvlnTBKNjSZPfXXbf1XXa_%2521%25210-item_pic.jpg'],
            title: '测试商品名测试商品商品视频视频',
            price: '99.00'
        }]
    },

    caches: {},

    /**
     * 对原生Request进行适配性封装
     */
    request: function(url, data, success) {
        const that = this;
        wx.request({
            url: that.config.api + url,
            header: {
                Token: that.memories.token
            },
            data: data,
            method: 'POST',
            dataType: 'json',
            success: function(res) {
                success(res.data);
            }
        });
    },

    /**
     * 对原生的showModal进行封装
     */
    showModal: function(params) {
        wx.showModal({
            title: params.title ? params.title : '提示',
            content: params.content ? params.content : '未得到服务器响应，请稍后重试。',
            confirmText: params.confirmText || '好的',
            showCancel: params.showCancel || false,
            cancelColor: '#353535',
            confirmColor: params.warn ? '#e64340' : '#73abda',
            success: params.success || null
        });
    },

    /**
     * 对原生的showToast进行封装
     */
    showToast: function(success, title) {
        wx.showToast({
            title: title,
            icon: 'success',
            image: success ? '' : '/assets/img/fail.png',
            duration: 1000,
            mask: true
        });
    },

    /**
     * 对原生的showLoading进行封装
     */
    showLoading: function(title) {
        wx.showLoading({
            title: title,
            mask: true
        });
    },

    /**
     * 保存缓存
     */
    setMemories: function() {
        const that = this;
        wx.setStorage({
            key: 'memories',
            data: that.memories
        });
    }
});