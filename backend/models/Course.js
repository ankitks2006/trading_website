import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  duration: String,
  isFree: { type: Boolean, default: false }
});

const moduleSchema = new mongoose.Schema({
  title: String,
  videos: [videoSchema]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String },
  instructor: { type: String, default: 'VolpebyFX Expert' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all'], default: 'all' },
  isFree: { type: Boolean, default: false },
  modules: [moduleSchema],
  rating: { type: Number, default: 4.5 },
  studentsCount: { type: Number, default: 0 },
  category: { type: String, default: 'forex' }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
