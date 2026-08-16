// Entry point untuk Vercel Serverless Function
// Mengimpor Express app dari backend tanpa memanggil app.listen()
const app = require('../backend/src/app');

module.exports = app;
