// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  ssr: false,
  imports: {
    autoImport: false,
  },
  devtools: {
    enabled: true,
  },
  app: {
    head: {
      title: "Earthworm - 本地版",
      link: [{ rel: "icon", href: "/favicon.ico" }],
    },
  },
  css: ["~/assets/css/globals.css"],
  modules: [
    "@nuxt/ui",
    "@vueuse/nuxt",
  ],
  build: {
    transpile: ["vue-sonner"],
  },
});
