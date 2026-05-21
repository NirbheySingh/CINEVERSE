import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a theatre name'],
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    facilities: {
      type: [String],
      default: ['Parking', 'Food Court'],
    },
    images: {
      type: [String],
    },
    screens: [
      {
        name: { type: String, required: true }, // e.g., "Screen 1", "IMAX"
        capacity: { type: Number, required: true },
        seatLayout: [
          {
            row: { type: String, required: true }, // e.g., 'A', 'B'
            seats: [
              {
                number: { type: Number, required: true },
                type: { type: String, enum: ['regular', 'premium', 'vip', 'couple'], default: 'regular' },
                price: { type: Number, required: true },
              }
            ]
          }
        ]
      }
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const Theatre = mongoose.model('Theatre', theatreSchema);
export default Theatre;
