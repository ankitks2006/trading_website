import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/course.js';
import userRoutes from './routes/users.js';
import webinarRoutes from './routes/webinars.js';
import subscriptionRoutes from './routes/subscriptions.js';
import uploadRoutes from './routes/upload.js';


dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/webinars', webinarRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/upload', uploadRoutes);


// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.get('/',(req,res)=>{
  res.send({
    activestatus:True
  })
})
// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/volpebyfx')
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
