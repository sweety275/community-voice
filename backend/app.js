
import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import concernRoutes from "./routes/concernRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/concerns", concernRoutes);
app.use("/api/auth", authRoutes);

export default app;
