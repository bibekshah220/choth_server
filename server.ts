import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import user_routes from "./src/routes/user.routes.js";
import product_routes from "./src/routes/product.routes.js";
import auth_routes from "./src/routes/auth.routes.js";
import order_routes from "./src/routes/order.routes.js";
import category_routes from "./src/routes/category.routes.js";
import cart_routes from "./src/routes/cart.routes.js";
import wishlist_routes from "./src/routes/wishlist.routes.js";
import review_routes from "./src/routes/review.routes.js";
import dashboard_routes from "./src/routes/dashboard.routes.js";

import { errorHandler } from "./src/middlewares/error-handler.middleware.js";
import { connect_db } from "./src/config/mongodb.config.js";

const PORT = process.env.PORT || 8080;

connect_db();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads/"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "server is up & running" });
});

app.use("/api/user", user_routes);
app.use("/api/product", product_routes);
app.use("/api/auth", auth_routes);
app.use("/api/order", order_routes);
app.use("/api/category", category_routes);
app.use("/api/cart", cart_routes);
app.use("/api/wishlist", wishlist_routes);
app.use("/api/review", review_routes);
app.use("/api/dashboard", dashboard_routes);

app.use((req, res, next) => {
  const message = `Cannot ${req.method} on ${req.originalUrl}`;
  next({ message, statusCode: 404, status: "error" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Press Ctrl + C to stop the server`);
});