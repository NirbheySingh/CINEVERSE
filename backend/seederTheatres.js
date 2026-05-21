import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Theatre from './models/Theatre.js';
import User from './models/User.js';

dotenv.config();

const theatreNames = [
  'PVR Cinemas', 'INOX', 'Cinepolis', 'Carnival Cinemas', 'Sathyam Cinemas',
  'Miraj Cinemas', 'Mukta A2 Cinemas', 'SRS Cinemas', 'Wave Cinemas', 'Gold Cinema',
  'Rajhans Cinemas', 'E-Square Talkies', 'Prasads IMAX', 'Asian Cinemas', 'SVK Cinemas',
  'AGS Cinemas', 'Mayajaal', 'SPI Cinemas', 'KG Cinemas', 'NY Cinemas',
  'Cineverse Multiplex', 'Galaxy Theatre', 'Regal Cinemas', 'AMC Theatres', 'Cinemark'
];

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Chandigarh', 'Jaipur'];

const generateSeatLayout = () => {
  const layout = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  rows.forEach((row, rowIndex) => {
    const seats = [];
    let type = 'regular';
    let price = 150;

    if (rowIndex > 7) {
      type = 'vip';
      price = 350;
    } else if (rowIndex > 4) {
      type = 'premium';
      price = 250;
    }

    for (let i = 1; i <= 15; i++) {
      seats.push({
        number: i,
        type: type,
        price: price
      });
    }
    layout.push({
      row,
      seats
    });
  });
  return layout;
};

const importTheatres = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding Theatres...');

    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@cineverse.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('Admin user created for theatre ownership.');
    }

    const theatres = [];
    const baseLayout = generateSeatLayout();

    for (let i = 0; i < 25; i++) {
      theatres.push({
        name: `${theatreNames[i]} - ${cities[i % cities.length]}`,
        city: cities[i % cities.length],
        address: `123, Main Street, ${cities[i % cities.length]}, 1000${i}`,
        facilities: ['Parking', 'Food Court', 'Recliner Seats', 'Dolby Atmos'],
        images: ['https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
        owner: adminUser._id,
        screens: [
          {
            name: 'Screen 1',
            capacity: 150,
            seatLayout: baseLayout
          },
          {
            name: 'Screen 2 (IMAX)',
            capacity: 150,
            seatLayout: baseLayout
          }
        ]
      });
    }

    await Theatre.deleteMany();
    await Theatre.insertMany(theatres);

    console.log(`${theatres.length} Theatres Imported successfully!`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importTheatres();
