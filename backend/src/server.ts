import app from './app.js';
import { initDatabase } from './config/db.js';

const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  // Ensure DB connection and tables exist before listening to traffic
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`Monolith server running securely on port ${PORT}`);
  });
};

bootstrap();