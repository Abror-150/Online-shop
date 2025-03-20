const express = require("express");
const { connectedDb } = require("./config/db");
const UserRoute = require("./routes/user");
const ProductRoute = require("./routes/product");
const OrderRoute = require("./routes/order");
const RegionRoute = require("./routes/region");
const CommentRoute = require("./routes/comment");
const CategoryRoute = require("./routes/category");
const setupSwagger = require("./swagger");
const app = express();
app.use(express.json());
connectedDb();
setupSwagger(app);
app.use("/user", UserRoute);
app.use("/product", ProductRoute);
app.use("/comment", CommentRoute);
app.use("/region", RegionRoute);
app.use("/order", OrderRoute);
app.use("/category", CategoryRoute);

app.listen(3000, () => console.log("server started"));
