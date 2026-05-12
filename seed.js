import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// ─── Models ─────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: String, username: String, email: { type: String, unique: true },
  password: String, avatar: String, number: String,
  isAdmin: { type: Boolean, default: false },
  isBroker: { type: Boolean, default: false },
  role: { type: String, default: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const listingSchema = new mongoose.Schema({
  name: { en: String, ar: String },
  description: { en: String, ar: String },
  address: { en: String, ar: String },
  price: Number, regularPrice: Number, discountPrice: Number,
  propertyType: String, propertySize: Number, rooms: Number,
  bathrooms: Number, numberFloors: Number,
  available: { type: String, default: 'available' },
  imageUrls: [String], imageApartments: [String], videoUrl: String,
  slug: String, userRef: String,
  city: { en: String, ar: String },
}, { timestamps: true });

const configSchema = new mongoose.Schema({
  siteName: { type: String, default: 'الصرح للعقارات' },
  logo: String, primaryColor: String, accentColor: String,
  contact: { phone: String, email: String, hotline: String, maadiBranchAddress: String, maadiBranchLink: String, beniSuefBranchAddress: String, beniSuefBranchLink: String },
  socialLinks: { facebook: String, instagram: String, whatsapp: String },
  hero: { title: { en: String, ar: String }, subtitle: { en: String, ar: String }, images: [String] },
  translations: { en: { type: Map, of: String, default: {} }, ar: { type: Map, of: String, default: {} } },
}, { timestamps: true });

const User    = mongoose.models.User    || mongoose.model('User', userSchema);
const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
const Config  = mongoose.models.Config  || mongoose.model('Config', configSchema);

// ─── Seed ───────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO);
  console.log('✅ Connected to:', process.env.MONGO);

  // ── Config ──────────────────────────────────────────
  const existing = await Config.findOne();
  if (!existing) {
    await Config.create({
      siteName: 'الصرح للعقارات',
      logo: '/assets/images/logoElsarh.png',
      primaryColor: '#8A6924',
      accentColor: '#DFBA6B',
      contact: {
        phone: '+20 121 262 2210',
        email: 'elsarhegypt@gmail.com',
        hotline: '19000',
        maadiBranchAddress: '14 شارع مختار، المعادي الجديدة، القاهرة',
        maadiBranchLink: 'https://maps.app.goo.gl/X7yrBmiK7zjvaVB59',
        beniSuefBranchAddress: 'شارع محمد حميدة، بني سويف',
        beniSuefBranchLink: 'https://maps.app.goo.gl/UW32R6UBaoMqSCqT6',
      },
      socialLinks: {
        facebook: 'https://facebook.com/elsarh',
        instagram: 'https://instagram.com/elsarh',
        whatsapp: 'https://wa.me/201212622210',
      },
      hero: {
        title: { en: 'Find Your Dream Home', ar: 'ابحث عن منزل أحلامك' },
        subtitle: { en: 'The best real estate platform in Egypt', ar: 'أفضل منصة عقارية في مصر' },
        images: [],
      },
    });
    console.log('✅ Config created');
  } else {
    console.log('ℹ️  Config already exists');
  }

  // ── Admin User ───────────────────────────────────────
  const admin = await User.findOne({ email: 'admin@elsarh.com' });
  if (!admin) {
    await User.create({
      name: 'مسؤول النظام',
      username: 'admin',
      email: 'admin@elsarh.com',
      password: bcryptjs.hashSync('admin123456', 10),
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=admin',
      isAdmin: true,
      role: 'Admin',
      number: '+201212622210',
    });
    console.log('✅ Admin user created: admin@elsarh.com / admin123456');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // ── Sample Listings ──────────────────────────────────
  const count = await Listing.countDocuments();
  if (count === 0) {
    const imgs = [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ];

    const listings = [
      {
        name: { en: 'Luxury Villa Maadi', ar: 'فيلا فاخرة بالمعادي' },
        description: { en: 'Stunning luxury villa in the heart of Maadi with modern finishes and private garden.', ar: 'فيلا فاخرة رائعة في قلب المعادي بتشطيبات عصرية وحديقة خاصة.' },
        address: { en: '14 Mokhtar St, New Maadi, Cairo', ar: '14 شارع مختار، المعادي الجديدة، القاهرة' },
        price: 8500000, regularPrice: 9000000, propertyType: 'villa',
        propertySize: 450, rooms: 5, bathrooms: 4, numberFloors: 3,
        available: 'available', imageUrls: [imgs[0], imgs[1], imgs[4]],
        slug: 'luxury-villa-maadi-' + Math.random().toString(36).slice(-4),
        city: { en: 'Cairo', ar: 'القاهرة' },
      },
      {
        name: { en: 'Modern Apartment New Capital', ar: 'شقة عصرية بالعاصمة الإدارية' },
        description: { en: 'Modern apartment in the New Administrative Capital with stunning city views.', ar: 'شقة عصرية في العاصمة الإدارية الجديدة بإطلالات رائعة على المدينة.' },
        address: { en: 'R5 District, New Administrative Capital', ar: 'حي R5، العاصمة الإدارية الجديدة' },
        price: 3200000, regularPrice: 3500000, propertyType: 'apartment',
        propertySize: 185, rooms: 3, bathrooms: 2, numberFloors: 1,
        available: 'available', imageUrls: [imgs[1], imgs[2], imgs[5]],
        slug: 'modern-apartment-new-capital-' + Math.random().toString(36).slice(-4),
        city: { en: 'New Capital', ar: 'العاصمة الإدارية' },
      },
      {
        name: { en: 'Commercial Office 6th October', ar: 'مكتب تجاري بالسادس من أكتوبر' },
        description: { en: 'Prime commercial office space in 6th October City, fully finished.', ar: 'مساحة مكتبية تجارية متميزة في مدينة السادس من أكتوبر، مشطبة بالكامل.' },
        address: { en: 'Central District, 6th October City', ar: 'المنطقة المركزية، مدينة السادس من أكتوبر' },
        price: 1800000, regularPrice: 2000000, propertyType: 'commercial',
        propertySize: 120, rooms: 4, bathrooms: 2, numberFloors: 1,
        available: 'available', imageUrls: [imgs[2], imgs[3]],
        slug: 'commercial-office-6th-october-' + Math.random().toString(36).slice(-4),
        city: { en: '6th October', ar: 'السادس من أكتوبر' },
      },
      {
        name: { en: 'Duplex Sheikh Zayed', ar: 'دوبلكس بالشيخ زايد' },
        description: { en: 'Elegant duplex apartment in Sheikh Zayed with premium finishes and compound amenities.', ar: 'دوبلكس أنيق في الشيخ زايد بتشطيبات فاخرة ومرافق الكمبوند.' },
        address: { en: 'Compound Green Belt, Sheikh Zayed', ar: 'كمبوند الحزام الأخضر، الشيخ زايد' },
        price: 5600000, regularPrice: 6000000, propertyType: 'duplex',
        propertySize: 280, rooms: 4, bathrooms: 3, numberFloors: 2,
        available: 'available', imageUrls: [imgs[3], imgs[0], imgs[5]],
        slug: 'duplex-sheikh-zayed-' + Math.random().toString(36).slice(-4),
        city: { en: 'Sheikh Zayed', ar: 'الشيخ زايد' },
      },
      {
        name: { en: 'Penthouse New Cairo', ar: 'بنتهاوس بالقاهرة الجديدة' },
        description: { en: 'Spectacular penthouse in New Cairo with panoramic views and private roof terrace.', ar: 'بنتهاوس مذهل في القاهرة الجديدة بإطلالة بانورامية وتراس خاص على السطح.' },
        address: { en: 'Fifth Settlement, New Cairo', ar: 'التجمع الخامس، القاهرة الجديدة' },
        price: 12000000, regularPrice: 13000000, propertyType: 'penthouse',
        propertySize: 600, rooms: 6, bathrooms: 5, numberFloors: 2,
        available: 'not available', imageUrls: [imgs[4], imgs[1], imgs[3]],
        slug: 'penthouse-new-cairo-' + Math.random().toString(36).slice(-4),
        city: { en: 'New Cairo', ar: 'القاهرة الجديدة' },
      },
      {
        name: { en: 'Studio Apartment Maadi', ar: 'استوديو بالمعادي' },
        description: { en: 'Cozy studio apartment in Maadi, perfect for young professionals.', ar: 'استوديو دافئ في المعادي، مثالي للمهنيين الشباب.' },
        address: { en: 'Corniche El Maadi, Cairo', ar: 'كورنيش المعادي، القاهرة' },
        price: 950000, regularPrice: 1100000, propertyType: 'apartment',
        propertySize: 65, rooms: 1, bathrooms: 1, numberFloors: 1,
        available: 'available', imageUrls: [imgs[5], imgs[2]],
        slug: 'studio-apartment-maadi-' + Math.random().toString(36).slice(-4),
        city: { en: 'Cairo', ar: 'القاهرة' },
      },
    ];

    await Listing.insertMany(listings);
    console.log(`✅ ${listings.length} sample listings created`);
  } else {
    console.log(`ℹ️  ${count} listings already exist`);
  }

  console.log('\n🎉 Database ready!');
  console.log('   Admin login → admin@elsarh.com / admin123456');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
