require('dotenv').config({ path: './.env' })

const express = require('express');
const cors = require('cors');
const app = express(); 

// security
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

// connectDB
const connectDB = require('./db/connect')

// routers
const authRouter = require('./routes/auth');
const tripRoutes = require('./routes/trip');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const auth = require('./middleware/authentication');
const vehicle = require('./routes/vehicleRoutes')

app.use(cors());
app.use(express.json());

app.use(rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
}));

app.use(helmet());
app.use(xss());
// routes
app.use("/api/v1/auth", auth)
app.use("/api/v1/vehicle", vehicle)

// routes (SIMPLE)
app.use("/api/auth", authRouter);
app.use("/api/trips", tripRoutes);

// error handlers (ALWAYS LAST)
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
