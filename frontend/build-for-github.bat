@echo off
echo Creating production build for GitHub Pages deployment...

rem Set production environment variables 
echo VITE_API_URL=https://microlearn-ai.onrender.com > .env.production

rem Build the project
npm run build

echo Build completed! Deploy the contents of the dist folder to GitHub Pages.
