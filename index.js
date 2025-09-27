// const userController= require("./controller/UserController")
const userRoutes = require("./routes/UserRoutes")
const productRoutes = require("./routes/ProductRoutes")
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')


require('dotenv').config();
const app = express()
const PORT =5000
app.use(cors())
app.use(express.json())

app.use("/users",userRoutes)
app.use("/products",productRoutes)


mongoose.connect(process.env.MONGO_URI, {
    family:4
})
.then(() => {
  console.log("✅ Successfully connected to MongoDB...");


}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})