import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // e.g., "10:30 AM"
      required: true,
    },
    // Array of locked or booked seat IDs (e.g., 'A1', 'A2')
    bookedSeats: [
      {
        row: String,
        number: Number,
        status: { type: String, enum: ['booked', 'locked'], default: 'booked' },
        lockedAt: Date, // For expiring locks if payment fails
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Show = mongoose.model('Show', showSchema);
export default Show;
