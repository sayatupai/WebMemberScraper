@echo off
REM Script otomatis build dan jalankan project WebMemberScraper

REM Install dependencies
npm install

REM Build project
npm run build

REM Jalankan backend
npm start

set NODE_ENV=production&& node server/dist/index.js

pause
