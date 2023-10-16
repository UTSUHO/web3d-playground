// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/default/DefaultLayout.vue"),
    children: [
      {
        path: "",
        name: "layout",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        redirect: "/home",
        children: [
          {
            path: "wave",
            name: "wave",
            component: () => import("@/views/cases/wave/Wave.vue"),
          },
          {
            path: "home",
            name: "home",
            component: () =>
              import("@/views/Home.vue"),
          },
          {
            path: "scroll",
            name: "scroll",
            component: () =>
              import("@/views/cases/scroll-based-3dAnimation/Index.vue"),
          },
          {
            path: "city",
            name: "city",
            component: () =>
              import("@/views/cases/city-model/Index.vue"),
          },
          {
            path: "flyline",
            name: "flyline",
            component: () =>
              import("@/views/cases/flylines/Index.vue"),
          },
          {
            path: "lottie",
            name: "lottie",
            component: () =>
              import("@/views/cases/lottie/Index.vue"),
          },
          {
            path: "WebGPU",
            name: "WebGPU",
            component: () =>
              import("@/views/cases/WebGPU/Index.vue"),
          },
          {
            path: "shader-practice",
            name: "shader-practice",
            component: () =>
              import("@/views/cases/shader-practice/Index.vue"),
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
