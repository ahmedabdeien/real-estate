const mongoose = require('mongoose');

/* migration idempotent: الأدوار القديمة بدون scope كانت سبب تداخل
   أدوار المنصة مع أدوار الشركات — نصنّفها مرة واحدة حسب companyId */
const migrateRoleScopes = async () => {
  try {
    const Role = require('../models/Role');
    const r1 = await Role.updateMany(
      { scope: { $exists: false }, companyId: { $ne: null } },
      { $set: { scope: 'company' } }
    );
    const r2 = await Role.updateMany(
      { scope: { $exists: false }, companyId: null },
      { $set: { scope: 'platform' } }
    );
    if (r1.modifiedCount || r2.modifiedCount) {
      console.log(`Role scope migration: ${r1.modifiedCount} company, ${r2.modifiedCount} platform`);
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
