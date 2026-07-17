const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const homeworkRoutes = require('./routes/homework');
const academyRoutes = require('./routes/academy');
const enrollmentRoutes = require('./routes/enrollment');
const notificationRoutes = require('./routes/notification');
const fileRoutes = require('./routes/file');
const commentRoutes = require('./routes/comment');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');
const classRoutes = require('./routes/class');
const textbookRoutes = require('./routes/textbook');
const textbookOrderRoutes = require('./routes/textbookOrder');
const learningHistoryRoutes = require('./routes/learningHistory');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/academy', academyRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/file', fileRoutes);
app.use('/api', commentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/class', classRoutes);
app.use('/api/textbook', textbookRoutes);
app.use('/api/textbook-order', textbookOrderRoutes);
app.use('/api/learning-history', learningHistoryRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
