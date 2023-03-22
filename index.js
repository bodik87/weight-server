import express, { json } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import { corsOptions } from "./config/corsOptions.js";
import {
  deleteUser,
  getUserData,
  login,
  logout,
  refresh,
  register,
  updateUserWeight,
} from "./controllers/userController.js";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "./controllers/productController.js";
import {
  createMeal,
  deleteMeal,
  updateMeal,
} from "./controllers/mealController.js";

dotenv.config();
const PORT = process.env.PORT || 4444;
const app = express();
app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());

mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("DB error", err));

app.post("/register", register);
app.post("/login", login);
app.get("/refresh", refresh);
app.post("/logout", logout);

app.delete("/users", deleteUser);
app.patch("/users", updateUserWeight);
app.get("/users", getUserData);

app.post("/products", createProduct);
app.patch("/products", updateProduct);
app.delete("/products", deleteProduct);

app.get("/test", (req, res) => res.send("OK!"));

app.post("/meals", createMeal);
app.patch("/meals", updateMeal);
app.delete("/meals", deleteMeal);

app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log(`Server is working OK on port ${PORT}`);
});
