const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/homework-manager')
  .then(async () => {
    console.log('MongoDB connected');
    try {
      // Update teacher001's academies array
      const result = await mongoose.connection.collection('users').updateOne(
        { accessCode: 'teacher001' },
        { $addToSet: { academies: new mongoose.Types.ObjectId('6a32a37a65e1b41cfaf89787') } }
      );
      console.log('Teacher updated:', result);
    } catch (err) {
      console.log('Error updating teacher:', err.message);
    }

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
