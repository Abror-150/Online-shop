<<<<<<< HEAD
const express = require("express")
const {connectedDb} = require("./config/db")
const UserRoute = require("./routes/user")
const ProductRoute =require("./routes/product")
const OrderRoute = require("./routes/order")
const RegionRoute = require("./routes/region")
const CommentRoute = require("./routes/comment")
const CategoryRoute = require('./routes/category')
const app = express()
connectedDb()
app.use(express.json())
app.use("/user",UserRoute)
app.use("/product",ProductRoute)
app.use("/comment",CommentRoute)
app.use("/region",RegionRoute)
app.use("/order",OrderRoute)
app.use("/category",CategoryRoute)



app.listen(3000,()=>console.log("server started")
)
=======
const express = require("express");
const { connectedDb } = require("./config/db");
const UserRoute = require("./routes/user");
const ProductRoutes = require("./routes/product");
const CommentRoutes = require("./routes/comment");
const CategoryRoutes = require("./routes/category");
const RegionRoutes = require("./routes/region");
const app = express();
connectedDb();
app.use(express.json());
app.use("/user", UserRoute);
app.use("/products", ProductRoutes);
app.use("/comments", CommentRoutes);
app.use("/categories", CategoryRoutes);
app.use("/regions", RegionRoutes);
app.listen(3000, () => console.log("server started"));

>>>>>>> 4ee8d9a29d4d6305c1aefec3ca35fc841b3e1a03
