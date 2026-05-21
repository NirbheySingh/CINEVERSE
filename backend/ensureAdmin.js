import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const ensureAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'admin@cineverse.com';
    let admin = await User.findOne({ email });

    if (admin && admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
      console.log(`Updated existing user ${email} to admin role.`);
    } else if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email,
        password: 'password123',
        role: 'admin',
      });
      console.log(`Created admin: ${email} / password123`);
    } else {
      console.log(`Admin already exists: ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

ensureAdmin();
