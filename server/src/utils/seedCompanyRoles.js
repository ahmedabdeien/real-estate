require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Role = require('../models/Role');
const buildDefaultCompanyRoles = require('../constants/defaultCompanyRoles');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const companies = await Company.find({});
  console.log(`Found ${companies.length} companies\n`);

  for (const company of companies) {
    console.log(`[${company.name}]`);
    for (const roleData of buildDefaultCompanyRoles(company._id)) {
      await Role.findOneAndUpdate(
        { name: roleData.name, companyId: company._id },
        roleData,
        { upsert: true, new: true }
      );
      console.log(`  - ${roleData.label}`);
    }
  }

  console.log('\nDone.');
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
