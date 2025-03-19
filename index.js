<<<<<<< HEAD
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
=======
const express = require("express")
const {connectedDb} = require("./config/db")
const UserRoute = require("./routes/user")
const app = express()
connectedDb()
app.use(express.json())
app.use("/user",UserRoute)

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
>>>>>>> a7e92124bcb20fd1ff817c62ae49daa6aa839af3
