const express = require("express");

const { connectedDb } = require("./config/db");
const UserRoute = require("./routes/user");
const ProductRoutes = require("./routes/product");
const CommentRoutes = require("./routes/comment");
const CategoryRoutes = require("./routes/category");
const app = express();
connectedDb();
app.use(express.json());
app.use("/user", UserRoute);
app.use("/products", ProductRoutes);
app.use("/comments", CommentRoutes);
app.use("/categories", CategoryRoutes);
app.listen(3000, () => console.log("server started"));
