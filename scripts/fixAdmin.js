import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGO);
  const db = mongoose.connection.db;
  const users = db.collection("users");

  const admin = await users.findOne({ email: "admin@elsarh.com" });
  if (admin) {
    const password = await bcrypt.hash("Admin@2025", 10);
    await users.updateOne(
      { email: "admin@elsarh.com" },
      { $set: { role: "admin", isActive: true, password, name: admin.name || "مدير النظام" } }
    );
    console.log("✅ Admin updated:", "admin@elsarh.com", "password: Admin@2025");
  } else {
    const password = await bcrypt.hash("Admin@2025", 10);
    await users.insertOne({ name: "مدير النظام", email: "admin@elsarh.com", password, role: "admin", isActive: true, createdAt: new Date() });
    console.log("✅ Admin created");
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
