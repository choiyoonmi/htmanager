const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/homework-manager')
  .then(async () => {
    console.log('MongoDB connected');
    try {
      // Drop the email index if it exists
      await mongoose.connection.collection('users').dropIndex('email_1');
      console.log('Email index dropped successfully');
    } catch (err) {
      console.log('Email index not found or already dropped:', err.message);
    }

    // Also drop any other problematic indexes
    try {
      const indexes = await mongoose.connection.collection('users').getIndexes();
      console.log('Remaining indexes:', indexes);
    } catch (err) {
      console.log('Error getting indexes:', err.message);
    }

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
