import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data)
};

export const homework = {
  create: (data) => API.post('/homework', data),
  getByAcademy: (academyId) => API.get(`/homework/academy/${academyId}`),
  update: (id, data) => API.put(`/homework/${id}`, data),
  submit: (id) => API.post(`/homework/${id}/submit`),
  delete: (id) => API.delete(`/homework/${id}`)
};

export const enrollment = {
  getMyAcademies: () => API.get('/enrollment/my-academies'),
  enroll: (academyId) => API.post('/enrollment', { academyId }),
  unenroll: (enrollmentId) => API.delete(`/enrollment/${enrollmentId}`)
};

export const academy = {
  create: (data) => API.post('/academy', data),
  getById: (id) => API.get(`/academy/${id}`),
  update: (id, data) => API.put(`/academy/${id}`, data),
  getStudents: (id) => API.get(`/academy/${id}/students`),
  enrollStudent: (academyId, studentId) => API.post(`/academy/${academyId}/enroll`, { studentId }),
  unenrollStudent: (academyId, studentId) => API.delete(`/academy/${academyId}/enroll/${studentId}`)
};

export const admin = {
  createStudents: (academyId, students) => API.post('/admin/create-students', { academyId, students }),
  updateStudent: (academyId, studentId, data) => API.put(`/admin/academy/${academyId}/students/${studentId}`, data)
};

export const classApi = {
  create: (data) => API.post('/class', data),
  getByAcademy: (academyId) => API.get(`/class/academy/${academyId}`),
  update: (id, data) => API.put(`/class/${id}`, data),
  delete: (id) => API.delete(`/class/${id}`)
};

export const textbook = {
  create: (data) => API.post('/textbook', data),
  getByAcademy: (academyId, subject) => API.get(`/textbook/academy/${academyId}`, { params: subject ? { subject } : {} }),
  update: (id, data) => API.put(`/textbook/${id}`, data),
  delete: (id) => API.delete(`/textbook/${id}`)
};

export const textbookOrder = {
  create: (data) => API.post('/textbook-order', data),
  getByAcademy: (academyId) => API.get(`/textbook-order/academy/${academyId}`)
};

export const learningHistory = {
  check: (studentIds, textbookIds) => API.get('/learning-history/check', {
    params: { studentIds: studentIds.join(','), textbookIds: textbookIds.join(',') }
  }),
  getByStudent: (studentId) => API.get(`/learning-history/student/${studentId}`)
};

export default API;
