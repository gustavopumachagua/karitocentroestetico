import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import circularDependency from "vite-plugin-circular-dependency";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "mask-icon.svg",
        "Logo.jpg",
      ],
      manifest: {
        name: "Karito Centro Estético",
        short_name: "Karito",
        description: "Centro Estético Karito",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/Logo.jpg", sizes: "192x192", type: "image/png" },
          { src: "/Logo.jpg", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg}"],
        runtimeCaching: [
          {
            // API responses can contain medical, appointment and payment data.
            // They must always come from the network and must never enter
            // Cache Storage, even when the API is hosted on another origin.
            urlPattern: ({ url, request }) =>
              url.pathname.startsWith("/api/") ||
              request.headers.has("authorization"),
            handler: "NetworkOnly",
          },
          {
            // Cache only the immutable assets shipped with this SPA. Do not
            // cache Cloudinary/user images or any arbitrary external URL.
            urlPattern: ({ url, request }) => {
              const isSameOrigin = url.origin === self.location.origin;
              const isStaticAsset =
                url.pathname.startsWith("/assets/") ||
                [
                  "/favicon.ico",
                  "/apple-touch-icon.png",
                  "/mask-icon.svg",
                  "/Logo.jpg",
                  "/Logo_SEO.png",
                ].includes(url.pathname);

              return (
                isSameOrigin &&
                isStaticAsset &&
                ["script", "style", "image", "font"].includes(
                  request.destination,
                )
              );
            },
            handler: "CacheFirst",
            options: {
              cacheName: "karito-static-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),

    // ✅ Solo habilita circularDependency en desarrollo
    ...(mode === "development" ? [circularDependency()] : []),
  ],

  // ⚙️ Cambia minificador a esbuild (más estable con React)
  build: {
    minify: "esbuild",
  },
}));
