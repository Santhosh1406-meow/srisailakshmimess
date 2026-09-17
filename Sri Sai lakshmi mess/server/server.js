const app = require('./src/app');
const config = require('./src/config');
const { initDb } = require('./src/config/db');

const PORT = config.port;

const server = app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🍛 Sri Sai Lakshmi Mess API Server is running!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Mode: ${config.nodeEnv}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`📋 Menu:   http://localhost:${PORT}/api/menu`);
  console.log(`=======================================================`);

  // Initialize Neon DB connection & tables if DATABASE_URL provided
  await initDb();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (e.g. Render zero-downtime reloads)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Gracefully shutting down server...');
  server.close(() => {
    console.log('💥 Server terminated.');
  });
});
