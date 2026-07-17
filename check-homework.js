const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/homework-manager')
  .then(async () => {
    console.log('MongoDB connected');
    try {
      const homeworks = await mongoose.connection.collection('homeworks').find({}).toArray();
      console.log('\nTotal Homeworks:', homeworks.length);
      homeworks.forEach((hw, i) => {
        console.log(`\n${i + 1}. ${hw.description || hw.title}`);
        console.log(`   Subject: ${hw.subject}`);
        console.log(`   Assigned to: ${hw.assignedTo?.length || 0} students`);
        console.log(`   Due: ${hw.dueDate}`);
      });
    } catch (err) {
      console.log('Error:', err.message);
    }

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
