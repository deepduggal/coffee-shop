import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
const app = express();
import cors from "cors";
import mongoose from "mongoose";
import productRouter from "./src/routes/products.js";

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
  dbName: process.env.MONGO_DB_NAME,
})
  .then(() => {
    console.log("Connected to MongoDB.");
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


// JSON middleware
app.use(express.json());

app.use(cors())

// Use the product routes
app.use('/products', productRouter);

const notFound404 = (req, res, next) => {
  res.status(404).send({ error: "Resource not found." });
};

const error = (error, req, res, next) => {
  res.status(500).send({ error: error.message });
};

app.use(notFound404);

app.use(error);

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});