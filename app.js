require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const connectDB = require("./db/connect");
const authRouter = require("./routes/auth");
const tripRoutes = require("./routes/trip");
const driverRoutes = require("./routes/driverRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const auth = require("./middleware/authentication");

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, limit: 100 }));
app.use(helmet());
app.use(xss());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/trips", auth, tripRoutes);
app.use("/api/v1/drivers", auth, driverRoutes);
app.use("/api/v1/vehicles", auth, vehicleRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "Server is alive" });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
