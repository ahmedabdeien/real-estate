import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "admin" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function main() {
  await mongoose.connect(process.env.MONGO);
  const email = "admin@elsarh.com";
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }
  const password = await bcrypt.hash("Admin@2025", 10);
  await User.create({ name: "مدير النظام", email, password, role: "admin" });
  console.log("✅ Admin created:", email, "password: Admin@2025");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
