module.exports = {
    theme: 'reco',
    cache: false,
    title: '墨萧随笔',
    description: '墨萧随笔-让时间见证我们共同的成长',
    head: [
        ['link', { rel: 'icon', href: '/favicon.png' }],
        ['script', {  src: "https://cdn.jsdelivr.net/npm/artitalk" }],
    ],
    themeConfig: {
        logo: '/favicon.png',
        type: 'blog',
        subSidebar: 'auto',
        author: "墨萧",
        smoothScroll: true,
        // sidebar: {
        //     '/frontend/': [
        //         'ui-resource-for-developer',
        //         'Keystone5-user-identify',
        //         'Cache-API',
        //         'TypeScript-understand',
        //         'npm-history-docs',
        //         'javascript-requestpayment',
        //         'web-components',
        //         'DOM-measure',
        //         'visualization-js-library',
        //         'async-func',
        //     ],
        //     '/summary/': [
        //         'ubuntu-odoo12',
        //         'linux-bootsrap',
        //         'deno-intrdu'
        //     ]
        // },
        search: true,
        friendLink: [
            {
                title: '午后南杂',
                desc: 'Enjoy when you can, and endure when you must.',
                email: 'recoluan@qq.com',
                link: 'https://www.recoluan.com'
            },
            {
                title: '虚位以待',
                desc: '您可以联系我或留言您的网站链接、标题、描述、logo信息，欢迎互换友链！',
                logo: "/favicon.png",
                link: 'http://blog.zdctech.top/'
            },
        ],
        nav: [
            { text: '时间轴', link: '/timeline/', icon: 'reco-date' },
            { text: '日常动态', link: '/diary/', icon: 'reco-date' },
            {
                text: 'python资源',
                items: [
                    {
                        text: 'web服务',
                        items: [
                            { text: 'Django', link: 'https://docs.djangoproject.com/zh-hans/3.0/', target: '_blank' },
                            { text: 'Twisted', link: 'https://www.twistedmatrix.com/trac/', target: '_blank' },
                            { text: 'Flask', link: 'https://dormousehole.readthedocs.io/en/latest/', target: '_blank' },
                            { text: 'uWSGI', link: 'https://uwsgi-docs-zh.readthedocs.io/zh_CN/latest/', target: '_blank' },
                        ]
                    },
                    {
                        text: '工具包/库',
                        items: [
                            { text: 'Jinja2', link: 'http://docs.jinkan.org/docs/jinja2/', target: '_blank' },
                            { text: 'Requests', link: 'https://cn.python-requests.org/zh_CN/latest/user/quickstart.html', target: '_blank' },
                            { text: 'Beautiful Soup', link: 'https://www.crummy.com/software/BeautifulSoup/bs4/doc/index.zh.html', target: '_blank' },
                            { text: 'NumPy', link: 'https://www.numpy.org.cn/en/', target: '_blank' },
                            { text: 'Pandas', link: 'https://www.pypandas.cn/', target: '_blank' },
                            { text: 'Matplotlib', link: 'https://www.matplotlib.org.cn/', target: '_blank' },
                            { text: 'OpenCV', link: 'https://opencv.org/', target: '_blank' },
                            { text: 'SQLAlchemy', link: 'https://www.osgeo.cn/sqlalchemy/orm/tutorial.html', target: '_blank' },
                            { text: 'tkinter', link: 'https://docs.python.org/3/library/tkinter.html#module-tkinter', target: '_blank' },
                            { text: 'PyQt5', link: 'https://pypi.org/project/PyQt5/', target: '_blank' },
                        ]
                    },
                    {
                        text: '深度学习',
                        items: [
                            { text: 'TensorFlow', link: 'https://tensorflow.google.cn/', target: '_blank' },
                            { text: 'Keras', link: 'https://keras.io/zh/', target: '_blank' },
                            { text: 'PyTorch', link: 'https://pytorch.org/', target: '_blank' },
                            // { text: 'Kivy', link: 'https://kivy.org/#home', target: '_blank' },
                        ]
                    },
                ]
            }
        ],
        authorAvatar: '/avatar.jpg',
        // 博客配置
        blogConfig: {
            category: {
                location: 1,     // 在导航栏菜单中所占的位置，默认2
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
        [require('vue-github-buttons/plugins/vuepress'), {
            useCache: true
        }],
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
        // 文档地址：https://sns.goyfe.com/guide/#configurations
        ['social-share', {
            networks: ['twitter', 'facebook', 'weibo', 'qq', 'douban', 'email'],
            email: '2426548297@qq.com',
            isPlain: true,
            twitterUser: 'harry',
            fallbackImage: '/fallbackimage.png',
        }],
        ["vuepress-plugin-code-copy", {
            successText: '复制成功!'
        }
        ],
        [
            'crisp', {
                siteID: "20de650e-477b-4d5d-b048-0c26c12f3cfb" // if you don't have a crisp account go to <https://crisp.chat/en/> and create an account then get the website ID and put it here.
            }
        ],
        ['vuepress-plugin-baidu-autopush'],
        [
            '@vuepress/last-updated',
            {
                transformer: (timestamp, lang) => {
                    const moment = require('moment')
                    moment.locale(lang)
                    return moment(timestamp).format("YYYY MM DD HH:mm")
                }
            }
        ],
        // 更新刷新插件
        ['@vuepress/pwa', {
            serviceWorker: true,
            updatePopup: {
                message: "发现新内容可用",
                buttonText: "刷新"
            }
        }],
        // ['seo'],
        // ['sitemap', {
        //     hostname: 'https://blog.zdctech.top',
        //     transformer: (timestamp, lang) => {
        //         return new Date(timestamp).toLocaleDateString();
        //     }
        // }],
        // ['@vuepress-reco/vuepress-plugin-bulletin-popover', {
        //     width: '300px', // 默认 260px
        //     title: '消息提示',
        //     body: [
        //         {
        //             type: 'title',
        //             content: '欢迎加入QQ交流群 🎉🎉🎉',
        //             style: 'text-aligin: center;'
        //         },
        //         {
        //             type: 'image',
        //             src: '/rvcode_qq.png'
        //         }
        //     ],
        //     footer: [
        //         {
        //             type: 'button',
        //             text: '打赏',
        //             link: '/donate'
        //         },
        //         {
        //             type: 'button',
        //             text: '打赏',
        //             link: '/donate'
        //         }
        //     ]
        // }],
        [
            'vuepress-plugin-helper-live2d', {
                live2d: {
                    // 是否启用(关闭请设置为false)(default: true)
                    enable: true,
                    // 模型名称(default: hibiki)>>>取值请参考：
                    // https://github.com/JoeyBling/hexo-theme-yilia-plus/wiki/live2d%E6%A8%A1%E5%9E%8B%E5%8C%85%E5%B1%95%E7%A4%BA
                    model: 'haru/01',
                    display: {
                        position: "right", // 显示位置：left/right(default: 'right')
                        width: 95, // 模型的长度(default: 135)
                        height: 200, // 模型的高度(default: 300)
                        hOffset: 80, //  水平偏移(default: 65)
                        vOffset: 0, //  垂直偏移(default: 0)
                    },
                    mobile: {
                        show: false // 是否在移动设备上显示(default: false)
                    },
                    react: {
                        opacity: 0.8 // 模型透明度(default: 0.8)
                    }
                }
            }
        ],
        // 音乐插件，暂时用下面的
        // ['meting', {
        //     //metingApi: "https://meting.sigure.xyz/api/music",
        //     meting: {
        //         // 网易
        //         server: "netease",
        //         // 读取歌单
        //         type: "playlist",
        //         mid: "696441716",
        //     },
        //     // 不配置该项的话不会出现全局播放器
        //     aplayer: {
        //         // 吸底模式
        //         fixed: true,
        //         mini: true,
        //         // 自动播放
        //         autoplay: true,
        //         // 歌曲栏折叠
        //         listFolded: true,
        //         // 颜色
        //         theme: '#f9bcdd',
        //         // 播放顺序为随机
        //         order: 'random',
        //         // 初始音量
        //         volume: 0.1,
        //         // 关闭歌词显示
        //         lrcType: 0
        //     },
        //     mobile: {
        //         // 手机端去掉cover图
        //         cover: false,
        //     }
        // }],
        [
            '@vuepress-reco/vuepress-plugin-bgm-player',
            {
                autoShrink: true,
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
                    {
                        name: '烟火人间',
                        artist: '添儿呗',
                        url: 'https://qn.zdctech.top/%E7%83%9F%E7%81%AB%E4%BA%BA%E9%97%B4.mp3',
                        cover: 'https://qn.zdctech.top/%E7%83%9F%E7%81%AB%E4%BA%BA%E9%97%B4.jpg'
                    },
                    {
                        name: '赤伶',
                        artist: 'HITA',
                        url: 'https://qn.zdctech.top/%E8%B5%A4%E4%BC%B6.mp3',
                        cover: 'https://qn.zdctech.top/%E8%B5%A4%E4%BC%B6.jpg'
                    },
                    {
                        name: '执迷不悟',
                        artist: '铁脑袋mp3',
                        url: 'https://qn.zdctech.top/%E6%89%A7%E8%BF%B7%E4%B8%8D%E6%82%9F.mp3',
                        cover: 'https://qn.zdctech.top/%E6%89%A7%E8%BF%B7%E4%B8%8D%E6%82%9F.jpg'
                    },
                    {
                        name: '大天蓬',
                        artist: '李袁杰',
                        url: 'https://qn.zdctech.top/%E5%A4%A7%E5%A4%A9%E8%93%AC.mp3',
                        cover: 'https://qn.zdctech.top/%E5%A4%A7%E5%A4%A9%E8%93%AC.jpg'
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