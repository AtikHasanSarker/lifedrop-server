const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const port = process.env.PORT;


// Middleware
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Server is running for tutors!");
});

app.listen(port, () => {
  console.log(`Server running on ${port} port`);
});
