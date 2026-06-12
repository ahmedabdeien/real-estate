const mongoose = require('mongoose');

/* migration idempotent: تصنيف الأدوار القديمة + إصلاح أي دور شركة وقع بـ scope='platform' خطأً */
const migrateRoleScopes = async () => {
  try {
    const Role = require('../models/Role');
    // أدوار بدون scope → صنّف حسب companyId
    const r1 = await Role.updateMany(
      { scope: { $exists: false }, companyId: { $ne: null } },
      { $set: { scope: 'company' } }
    );
    const r2 = await Role.updateMany(
      { scope: { $exists: false }, companyId: null },
      { $set: { scope: 'platform' } }
    );
    // إصلاح: أي دور عنده companyId حقيقي لكن scope='platform' → غلطة → أصلحه إلى 'company'
    const r3 = await Role.updateMany(
      { scope: 'platform', companyId: { $ne: null } },
      { $set: { scope: 'company' } }
    );
    if (r1.modifiedCount || r2.modifiedCount || r3.modifiedCount) {
      console.log(`Role scope migration: ${r1.modifiedCount} + ${r2.modifiedCount} scoped, ${r3.modifiedCount} platform→company fixed`);
    }
  } catch (err) {
    console.error(`Role migration error: ${err.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await migrateRoleScopes();
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
