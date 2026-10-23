import express from 'express'

const app = express();
const PORT = 8000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Root GET route
app.get("/", (req, res) => {
  res.send("Hello from Express.js!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
