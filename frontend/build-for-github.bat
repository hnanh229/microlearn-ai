@echo off
echo Creating production build for GitHub Pages deployment...

rem Set production environment variables 
echo VITE_API_URL=https://microlearn-ai.onrender.com/api > .env.production

rem Build the project
npm run build

rem Copy 404.html to dist for GitHub Pages SPA routing
copy public\404.html dist\404.html

echo Build completed! Deploy the contents of the dist folder to GitHub Pages.
echo.
echo The verification URL will now be: https://hnanh229.github.io/microlearn-ai/verify-email?token=...
echo.
