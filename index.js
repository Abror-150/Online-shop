const express = require("express")
const {connectedDb} = require("./config/db")
const UserRoute = require("./routes/user")
const app = express()
connectedDb()
app.use(express.json())
app.use("/user",UserRoute)

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));