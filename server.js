// server.js
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";

const app = express();
app.use(cors());
app.use(express.json());

// Dummy users
const users = [
  {
    email: "consumer@test.com",
    password: bcrypt.hashSync("password123", 10),
    userType: "consumer",
  },
  {
    email: "business@test.com",
    password: bcrypt.hashSync("bizpass456", 10),
    userType: "business",
  },
];

// Signup
app.post("/signup", async (req, res) => {
  const { email, password, userType } = req.body;
  const existing = users.find(
    (u) => u.email === email && u.userType === userType
  );
  if (existing) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword, userType });
  res.json({ message: "Signup successful" });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password, userType } = req.body;
  const user = users.find(
    (u) => u.email === email && u.userType === userType
  );
  if (!user) return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  res.json({ message: "Login successful" });
});

// ✅ Forgot Password
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) {
    // For security, don't reveal if email exists or not
    return res.json({ message: "If this email is registered, you’ll receive reset instructions shortly." });
  }

  // 👉 In real app: generate token + save + email link
  console.log(`📩 Reset link (dummy): http://localhost:5173/reset-password?token=FAKE123`);

  res.json({ message: "If this email is registered, you’ll receive reset instructions shortly." });
});

app.listen(4000, () =>
  console.log("✅ Backend running at http://localhost:4000")
);