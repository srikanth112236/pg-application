const mongoose = require('mongoose');

// Test if all required modules can be loaded
console.log('Testing module imports...');

try {
  // Test middleware imports
  console.log('Testing middleware imports...');
  const authMiddleware = require('./src/middleware/auth.middleware');
  const validationMiddleware = require('./src/middleware/validation.middleware');
  const fileUploadMiddleware = require('./src/middleware/fileUpload.middleware');
  const rateLimitMiddleware = require('./src/middleware/rateLimit.middleware');
  const errorHandlerMiddleware = require('./src/middleware/errorHandler.middleware');
  console.log('✅ All middleware modules loaded successfully');

  // Test model imports
  console.log('Testing model imports...');
  const User = require('./src/models/user.model');
  const PG = require('./src/models/pg.model');
  const Room = require('./src/models/room.model');
  const Floor = require('./src/models/floor.model');
  const Branch = require('./src/models/branch.model');
  const Payment = require('./src/models/payment.model');
  const Ticket = require('./src/models/ticket.model');
  const Onboarding = require('./src/models/onboarding.model');
  console.log('✅ All model modules loaded successfully');

  // Test service imports
  console.log('Testing service imports...');
  const authService = require('./src/services/auth.service');
  const pgService = require('./src/services/pg.service');
  const floorService = require('./src/services/floor.service');
  const roomService = require('./src/services/room.service');
  const branchService = require('./src/services/branch.service');
  const emailService = require('./src/services/email.service');
  const onboardingService = require('./src/services/onboarding.service');
  console.log('✅ All service modules loaded successfully');

  // Test route imports
  console.log('Testing route imports...');
  const authRoutes = require('./src/routes/auth.routes');
  const userRoutes = require('./src/routes/user.routes');
  const pgRoutes = require('./src/routes/pg.routes');
  const ticketRoutes = require('./src/routes/ticket.routes');
  const paymentRoutes = require('./src/routes/payment.routes');
  const analyticsRoutes = require('./src/routes/analytics.routes');
  const reportRoutes = require('./src/routes/report.routes');
  const auditRoutes = require('./src/routes/audit.routes');
  const onboardingRoutes = require('./src/routes/onboarding.routes');
  const branchRoutes = require('./src/routes/branch.routes');
  console.log('✅ All route modules loaded successfully');

  // Test config imports
  console.log('Testing config imports...');
  const connectDB = require('./src/config/database');
  console.log('✅ All config modules loaded successfully');

  // Test utils imports
  console.log('Testing utils imports...');
  const logger = require('./src/utils/logger');
  const sampleData = require('./src/utils/sampleData');
  console.log('✅ All utils modules loaded successfully');

  console.log('\n🎉 All modules loaded successfully! The server should start without errors.');
  console.log('\nTo start the server, run: npm run dev');

} catch (error) {
  console.error('❌ Error loading modules:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 