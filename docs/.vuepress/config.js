module.exports = {
    theme: 'reco',
    cache: false,
    title: '墨萧随笔',
    description: '墨萧随笔-主要专注于前端开发技术相关的知识、经验分享，同时也会包含python等其他技术栈以及技术问题的记录和生活札记',
    themeConfig: {
        logo: '/favicon.png',
        type: 'blog',
        subSidebar: 'auto',
        sidebar: {
            '/frontend/': ['', 'Keystone5-user-identify', 'Cache-API', 'TypeScript-understand']
        },
        search: true,
        nav: [
            { text: '时间轴', link: '/timeline/', icon: 'reco-date' },
        ],
        authorAvatar: 'http://qn.zdctech.top/202005/img_1460hei-bai-2.jpg',
        // 博客配置
        blogConfig: {
            category: {
                location: 2,     // 在导航栏菜单中所占的位置，默认2
                text: '分类' // 默认文案 “分类”
            },
            tag: {
                location: 3,     // 在导航栏菜单中所占的位置，默认3
                text: '标签'      // 默认文案 “标签”
            },
        },
        valineConfig: {
            appId: 'DoSvyEKcqjWoviK5ujHi8ktC-gzGzoHsz',// your appId
            appKey: '6gLTWDi4N6jy309QICj5syhy', // your appKey
        },
        lastUpdated: '最后更新',
        // 备案
        record: '粤ICP备20031311号',
        recordLink: 'https://beian.miit.gov.cn/',
        // 项目开始时间，只填写年份
        startYear: '2017'
    },
    plugins: [
        [
            'vuepress-plugin-sponsor',
            {
                theme: 'simple',
                alipay: '/sponsor-qrcode/qrcode-alipay.jpg',
                wechat: '/sponsor-qrcode/qrcode-wechat.jpg',
                qq: '/sponsor-qrcode/qrcode-qq.jpg',
                duration: 2000
            }
        ],
        [
            '@vuepress-reco/vuepress-plugin-bgm-player',
            {
                audios: [
                    {
                        name: '平凡之路',
                        artist: '朴树',
                        url: '/music/ordinary_load.mp3',
                        cover: 'http://p2.music.126.net/Kdcrp6o0YJpD7g1apHC0FA==/109951163252275728.jpg?param=130y130'
                    },
                ]
            }
        ]
    ],
    locales: {
        '/': {
            lang: 'zh-CN'
        }
    },
    markdown: {
        lineNumbers: true
    }
}