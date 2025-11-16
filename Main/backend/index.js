import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import compression from "compression";

import routes from "./routes/index.js";

dotenv.config();

const app = express();

// Enable compression for all responses
app.use(compression());

app.use(
    cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    })
);
app.use(morgan("dev"));

// Serve static files (attachments)
app.use('/uploads', express.static('uploads'));

// db connection    I
mongoose.connect(process.env.MONGODB_URI, {
//   ssl: true,
//   sslValidate: true,
  serverSelectionTimeoutMS: 10000,
})
.then(() => console.log("DB Connected successfully."))
.catch((err) => console.log("Failed to connect to DB:", err));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => {
    res.status(200).json({
    message: "Welcome to TaskHub API",
    });
});

// http://localhost:5000/api-v1/
app.use("/api-v1", routes);

// error middleware
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// not found middleware
app.use((req, res)=> {
    res.status(404).json({
    message:"Not found"
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})