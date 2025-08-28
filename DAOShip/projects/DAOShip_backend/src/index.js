require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const daoRoutes = require("./routes/dao.routes");
const proposalRoutes = require("./routes/proposal.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb+srv://vedantintiproject:Vedant1@cluster0.cndieto.mongodb.net/mydb?retryWrites=true&w=majority" || "mongodb://localhost:27017/dao-creator", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/dao", daoRoutes);
app.use("/api/proposal", proposalRoutes);
app.use("/api/user", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
