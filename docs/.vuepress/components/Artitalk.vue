<template>
  <div>
    <Navbar v-if="shouldShowNavbar" />
    <div class="artitalk-wraper">
      <div id="artitalk_main" />
    </div>
  </div>
</template>

<script>
import Navbar from "vuepress-theme-reco/components/Navbar";

export default {
  components: { Navbar },
  mounted() {
    function addScript(url) {
      var s = document.createElement("script");
      s.id = "at";
      url.indexOf("appId") == -1 ? (s.src = url) : (s.innerHTML = url);
      document.head.appendChild(s);
    }
    addScript(`
      new Artitalk({
          appId: 'DoSvyEKcqjWoviK5ujHi8ktC-gzGzoHsz',
          appKey: '6gLTWDi4N6jy309QICj5syhy',
          serverURL: 'https://leancloudapi.zdctech.top',
          pageSize: 10,
          shuoPla: '今日想说',
          atComment: 0,
          bgImg: 'http://lc-DoSvyEKc.cn-n1.lcfile.com/f0de4c098cf19c21220e.jpg/shuoshuo-bg.jpg',
          atEmoji: {
                  baiyan: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/baiyan.png",
                  bishi: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/bishi.png",
                  bizui: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/bizui.png",
                  chan: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/chan.png",
                  daku: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/daku.png",
                  dalao: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/dalao.png",
                  dalian: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/dalian.png",
                  dianzan: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/dianzan.png",
                  doge: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/doge.png",
                  facai: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/facai.png",
                  fadai: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/fadai.png",
                  fanu: "https://cdn.jsdelivr.net/gh/Artitalk/Artitalk-emoji/fanu.png",
            },
      })
    `);
  },
  destroyed() {
    document
      .querySelectorAll("#at")
      .forEach((element) => element.parentNode.removeChild(element));
    // delete window.AV;
  },
  computed: {
    shouldShowNavbar() {
      const { themeConfig } = this.$site;
      const { frontmatter } = this.$page;

      if (frontmatter.navbar === false || themeConfig.navbar === false)
        return false;

      return (
        this.$title ||
        themeConfig.logo ||
        themeConfig.repo ||
        themeConfig.nav ||
        this.$themeLocaleConfig.nav
      );
    },
  },
  methods: {},
};
</script>

<style lang="stylus">
@media (max-width: $MQMobile) {
  .artitalk-wraper {
    width: 100% !important;
    padding: 0 !important;
  
    #artitalk_main {
      width: 100% !important;
    }
  }
}

.artitalk-wraper {
  padding: 50px 40px;
  border-radius: 8px;
  background: var(--card-bg);
  -webkit-box-shadow: 0 4px 8px 6px rgba(7, 17, 27, 0.06);
  box-shadow: 0 4px 8px 6px rgba(7, 17, 27, 0.06);
  width: 75%;
  margin: 0 auto;
  margin-top: 80px;

  #artitalk_main {
    width: 75%;
    margin: 0 auto;

    .shuoshuo_text {
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }
  }
}
</style>