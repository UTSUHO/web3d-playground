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
            path: "home",
            name: "home",
            component: () => import("@/views/Home.vue"),
          },
          {
            path: "wave",
            name: "wave",
            component: () => import("@/views/cases/wave/Wave.vue"),
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
            component: () => import("@/views/cases/city-model/Index.vue"),
          },
          {
            path: "flyline",
            name: "flyline",
            component: () => import("@/views/cases/flylines/Index.vue"),
          },
          {
            path: "lottie",
            name: "lottie",
            component: () => import("@/views/cases/lottie/Index.vue"),
          },
          {
            path: "WebGPU",
            name: "WebGPU",
            component: () => import("@/views/cases/WebGPU/Index.vue"),
          },
          {
            path: "shader-practice",
            name: "shader-practice",
            component: () => import("@/views/cases/shader-practice/Index.vue"),
          },
          {
            path: "bake-experiment",
            name: "bake-experiment",
            component: () => import("@/views/cases/bake-experiment/Index.vue"),
          },
          {
            path: "galaxy-generator",
            name: "galaxy-generator",
            component: () => import("@/views/cases/galaxy-generator/Index.vue"),
          },
          {
            path: "reverse-engineering",
            name: "reverse-engineering",
            component: () =>
              import("@/views/cases/reverse-engineering/particleFiber/Index.vue"),
          },
          {
            path: "tres",
            name: "tres",
            component: () => import("@/views/cases/tres/Index.vue"),
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
