// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Replace 'your-repository-name' with the name of your GitHub repository
  // You can remove this line if you're deploying to a custom domain or using username.github.io repository
  base: '/AkhilBod.github.io/',
  build: {
    outDir: 'dist',
  }
});
