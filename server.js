const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const corsOptions = {
  origin: "http://localhost:5173", 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
};


const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "152002", 
  database: "auth_db",

});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

const JWT_SECRET = "your_jwt_secret"; 




app.post("/register", (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = "INSERT INTO users (name, password) VALUES (?, ?)";
  db.query(sql, [name, password], (err, result) => {
    if (err) return res.status(500).json({ error: "User already exists" });

    res.status(201).json({ message: "User registered successfully" });
  });
});


app.post("/login", (req, res) => {
  const { name, password } = req.body;

  const sql = "SELECT * FROM users WHERE name = ? AND password = ?";
  db.query(sql, [name, password], (err, results) => {
    if (err) return res.status(500).json({ error: "Server error" });

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const user = results[0];

    
    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
