import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HomeworkCreation from './pages/HomeworkCreation';
import Statistics from './pages/Statistics';
import AcademyManagement from './pages/AcademyManagement';
import StudentRegistration from './pages/StudentRegistration';
import ClassManagement from './pages/ClassManagement';
import TextbookManagement from './pages/TextbookManagement';
import TextbookOrderForm from './pages/TextbookOrderForm';
import StudentCurriculum from './pages/StudentCurriculum';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/homework/new" element={<HomeworkCreation />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/academy/management" element={<AcademyManagement />} />
        <Route path="/student/registration" element={<StudentRegistration />} />
        <Route path="/class/management" element={<ClassManagement />} />
        <Route path="/textbook/management" element={<TextbookManagement />} />
        <Route path="/textbook-order/new" element={<TextbookOrderForm />} />
        <Route path="/curriculum" element={<StudentCurriculum />} />
        <Route path="/curriculum/:studentId" element={<StudentCurriculum />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
