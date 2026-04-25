module.exports = {
  apps: [
    {
      name: "restaurant-premium-demo",
      cwd: "/home/anmol/projects/restaurant-premium-demo",
      script: ".next/standalone/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
        PM2_HOME: "/home/anmol/.pm2-restaurant",
        DATABASE_URL: "postgresql://postgres:password@localhost:5432/restaurant_demo",
        NEXT_PUBLIC_APP_URL: "https://your-domain.com",
        DEMO_RESTAURANT_SLUG: "mirch-masala",
        PUBLIC_IMAGES_DIR: "/path/to/project/public/images",
        AUTH_URL: "https://your-domain.com",
        AUTH_SECRET: "your-auth-secret-here",
        AUTH_TRUST_HOST: "true",
        GOOGLE_CLIENT_ID: "your-google-client-id",
        GOOGLE_CLIENT_SECRET: "your-google-client-secret",
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: "your-vapid-public-key",
        VAPID_PRIVATE_KEY: "your-vapid-private-key",
        VAPID_EMAIL: "mailto:your-email@example.com",
      },
    },
  ],
};
