import express from 'express';
import { config } from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import appRouter from './routers/index.js';
import cookieParser from 'cookie-parser';

config();

const app = express();

// Middleware to log requests
app.use(morgan("dev"));

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// Routes
app.use("/api/v1", appRouter);

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Internal Server Error');
// });
app.use((err, req, res, next) => {
  console.error("Error stack:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});



export default app;
