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
                    {
                        name: '我曾',
                        artist: '隔壁老樊',
                        url: 'https://qn.zdctech.top/%E9%9A%94%E5%A3%81%E8%80%81%E6%A8%8A%20-%20%E6%88%91%E6%9B%BE.mp3',
                        cover: 'https://qn.zdctech.top/%E9%9A%94%E5%A3%81%E8%80%81%E6%A8%8A-%E6%88%91%E6%9B%BE.jpg'
                    },
                    {
                        name: 'Kiss the Rain',
                        artist: 'Richard Abel',
                        url: 'https://qn.zdctech.top/Kiss-the-Rain.mp3',
                        cover: 'https://qn.zdctech.top/kiss-the-rain.jpg'
                    },
                    {
                        name: '这一生关于你的风景',
                        artist: '枯木逢春',
                        url: 'https://qn.zdctech.top/%E8%BF%99%E4%B8%80%E7%94%9F%E5%85%B3%E4%BA%8E%E4%BD%A0%E7%9A%84%E9%A3%8E%E6%99%AF.mp3',
                        cover: 'https://qn.zdctech.top/%E8%BF%99%E4%B8%80%E7%94%9F%E5%85%B3%E4%BA%8E%E4%BD%A0%E7%9A%84%E9%A3%8E%E6%99%AF.jpg'
                    },
                    {
                        name: '那女孩对我说',
                        artist: 'Uu',
                        url: 'https://qn.zdctech.top/%E9%82%A3%E5%A5%B3%E5%AD%A9%E5%AF%B9%E6%88%91%E8%AF%B4.mp3',
                        cover: 'https://qn.zdctech.top/%E9%82%A3%E5%A5%B3%E5%AD%A9%E5%AF%B9%E6%88%91%E8%AF%B4.jpg'
                    },
                    {
                        name: '盗将行',
                        artist: '花粥',
                        url: 'https://qn.zdctech.top/%E7%9B%97%E5%B0%86%E8%A1%8C.mp3',
                        cover: 'https://qn.zdctech.top/%E7%9B%97%E5%B0%86%E8%A1%8C.jpg'
                    },
                    {
                        name: '光年之外',
                        artist: 'G.E.M.邓紫棋',
                        url: 'https://qn.zdctech.top/%E5%85%89%E5%B9%B4%E4%B9%8B%E5%A4%96.mp3',
                        cover: 'https://qn.zdctech.top/%E5%85%89%E5%B9%B4%E4%B9%8B%E5%A4%96.jpg'
                    },
                    {
                        name: '起风了',
                        artist: '买辣椒也用券',
                        url: 'https://qn.zdctech.top/%E8%B5%B7%E9%A3%8E%E4%BA%86.mp3',
                        cover: 'https://qn.zdctech.top/%E8%B5%B7%E9%A3%8E%E4%BA%86.jpg'
                    },
                    {
                        name: '空空如也',
                        artist: '任然',
                        url: 'https://qn.zdctech.top/%E7%A9%BA%E7%A9%BA%E5%A6%82%E4%B9%9F.mp3',
                        cover: 'https://qn.zdctech.top/%E7%A9%BA%E7%A9%BA%E5%A6%82%E4%B9%9F.jpg'
                    },
                    {
                        name: '往后余生',
                        artist: '马良',
                        url: 'https://qn.zdctech.top/%E5%BE%80%E5%90%8E%E4%BD%99%E7%94%9F.mp3',
                        cover: 'https://qn.zdctech.top/%E5%BE%80%E5%90%8E%E4%BD%99%E7%94%9F.jpg'
                    },
                    {
                        name: '其实都没有',
                        artist: '杨宗纬',
                        url: 'https://qn.zdctech.top/%E5%85%B6%E5%AE%9E%E9%83%BD%E6%B2%A1%E6%9C%89.mp3',
                        cover: 'https://qn.zdctech.top/%E5%85%B6%E5%AE%9E%E9%83%BD%E6%B2%A1%E6%9C%89.jpg'
                    },
                    {
                        name: '可能否',
                        artist: '面筋哥',
                        url: 'https://qn.zdctech.top/%E5%8F%AF%E8%83%BD%E5%90%A6.mp3',
                        cover: 'https://qn.zdctech.top/%E5%8F%AF%E8%83%BD%E5%90%A6.jpg'
                    },
                    {
                        name: '世间美好与你环环相扣',
                        artist: '柏松',
                        url: 'https://qn.zdctech.top/%E4%B8%96%E9%97%B4%E7%BE%8E%E5%A5%BD%E4%B8%8E%E4%BD%A0%E7%8E%AF%E7%8E%AF%E7%9B%B8%E6%89%A3.mp3',
                        cover: 'https://qn.zdctech.top/%E4%B8%96%E9%97%B4%E7%BE%8E%E5%A5%BD%E4%B8%8E%E4%BD%A0%E7%8E%AF%E7%8E%AF%E7%9B%B8%E6%89%A3.jpg'
                    },
                    {
                        name: '孤身',
                        artist: '徐秉龙',
                        url: 'https://qn.zdctech.top/%E5%AD%A4%E8%BA%AB.mp3',
                        cover: 'https://qn.zdctech.top/%E5%AD%A4%E8%BA%AB.jpg'
                    },
                    {
                        name: '多想在平庸的生活拥抱你',
                        artist: '隔壁老樊',
                        url: 'https://qn.zdctech.top/%E5%A4%9A%E6%83%B3%E5%9C%A8%E5%B9%B3%E5%BA%B8%E7%9A%84%E7%94%9F%E6%B4%BB%E6%8B%A5%E6%8A%B1%E4%BD%A0.mp3',
                        cover: 'https://qn.zdctech.top/%E5%A4%9A%E6%83%B3%E5%9C%A8%E5%B9%B3%E5%BA%B8%E7%9A%84%E7%94%9F%E6%B4%BB%E6%8B%A5%E6%8A%B1%E4%BD%A0.jpg'
                    },
                    {
                        name: '讲真的',
                        artist: '曾惜',
                        url: 'https://qn.zdctech.top/%E8%AE%B2%E7%9C%9F%E7%9A%84.mp3',
                        cover: 'https://qn.zdctech.top/%E8%AE%B2%E7%9C%9F%E7%9A%84.jpg'
                    },
                    {
                        name: '忘川彼岸',
                        artist: '零一九零贰',
                        url: 'https://qn.zdctech.top/%E5%BF%98%E5%B7%9D%E5%BD%BC%E5%B2%B8.mp3',
                        cover: 'https://qn.zdctech.top/%E5%BF%98%E5%B7%9D%E5%BD%BC%E5%B2%B8.jpg'
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