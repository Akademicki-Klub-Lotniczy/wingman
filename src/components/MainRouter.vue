<script>

import { createWebHistory, createRouter } from 'vue-router';
import WingsDownloader from './WingsDownloader.vue';
// import About from '@/views/About.vue';

const routes = [
  {
    path: '/',
    name: 'Wings Downloader',
    component: WingsDownloader,
  },
  // {
    // path: '/about',
    // name: 'About',
    // component: About,
  // },1
];

const MainRouter = createRouter({
  history: createWebHistory(),
  routes,
});

export default MainRouter;
</script>
