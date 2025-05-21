import express from "express";
import dotenv from "dotenv";
import apiRoutes from "./api/v1/routes.js";
import { createClient } from "@libsql/client";
import mongoose from "mongoose";
import cors from "cors"
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser())
const corsOptions = {
  origin: ["http://localhost:5173", "https://rag-notes-frontend.vercel.app"], // your frontend domain
  credentials: true, // ✅ allow cookies to be sent
};

app.use(cors(corsOptions));

const port = process.env.port;

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongo database");
  } catch (err){
    console.error(`MongoDB connection error: ${err}`)
    process.exit(1);
  }
})();

//Initialize the tables (users, notes)
(async () => {
  await db.execute(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tags TEXT, -- JSON-encoded array of strings
            is_pinned INTEGER DEFAULT 0, -- 0 = false , 1 = true
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER
            );
            `);
  await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
            );
            `);
})();


app.use("/", apiRoutes(db));


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
