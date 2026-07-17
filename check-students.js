const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/homework-manager')
  .then(async () => {
    console.log('MongoDB connected');
    try {
      // Check StudentEnrollment count
      const enrollments = await mongoose.connection.collection('studentenrollments').find({}).toArray();
      console.log('Total StudentEnrollments:', enrollments.length);
      enrollments.forEach(e => {
        console.log('Enrollment:', e);
      });

      // Check Users with role 'student'
      const students = await mongoose.connection.collection('users').find({ role: 'student' }).toArray();
      console.log('\nTotal Student Users:', students.length);
      students.forEach(s => {
        console.log('Student:', s.name, s.accessCode);
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
