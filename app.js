require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

const app = express();

// DB
const connectDB = require('./db/connect');

// Routes
const authRouter = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/trip');

// Middlewares
const authentication = require('./middleware/authentication');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// Security middlewares
app.use(cors());
app.use(express.json());

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
  })
);

app.use(helmet());
app.use(xss());

// ================= ROUTES =================

// Public routes (NO TOKEN REQUIRED)
app.use('/api/v1/auth', authRouter);

// Protected routes (TOKEN REQUIRED)
app.use('/api/v1/vehicles', authentication, vehicleRoutes);
app.use('/api/v1/drivers', authentication, driverRoutes);
app.use('/api/v1/trips', authentication, tripRoutes);

// ==========================================

// Error handlers
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
