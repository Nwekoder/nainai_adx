import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import "./style.css";
import App from "./App.vue";

import LoginPage from "./pages/LoginPage.vue";
import HomePage from "./pages/HomePage.vue";
import ScoresPage from "./pages/ScoresPage.vue";
import CropTestPage from "./pages/CropTestPage.vue";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
        path: '/',
        component: LoginPage
    },
    {
        path: '/home',
        component: HomePage
    },
    {
        path: '/scores',
        component: ScoresPage
    },
    {
        path: '/croptest',
        component: CropTestPage
    },
  ],
});

createApp(App).use(router).mount("#app");
