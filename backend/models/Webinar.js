import mongoose from 'mongoose';

const webinarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  link: { type: String },
  instructor: { type: String },
  status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Webinar', webinarSchema);
