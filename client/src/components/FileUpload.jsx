import { useState } from 'react';
import axios from 'axios';
import '../styles/FileUpload.css';

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

export default function FileUpload({ homeworkId, commentId, onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    try {
      setUploading(true);
      setError('');

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const endpoint = homeworkId
          ? `/file/homework/${homeworkId}/upload`
          : `/file/comment/${commentId}/upload`;

        const response = await API.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      }

      setUploading(false);
    } catch (err) {
      setError(err.response?.data?.error || '파일 업로드 실패');
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
      >
        <input
          type="file"
          id="file-input"
          onChange={handleFileSelect}
          multiple
          style={{ display: 'none' }}
          disabled={uploading}
        />
        <label htmlFor="file-input" className="file-label">
          <span className="icon">📁</span>
          <p>파일을 여기로 드래그하거나 클릭하여 선택</p>
          <small>PDF, DOC, DOCX, JPG, PNG (최대 10MB)</small>
        </label>
      </div>

      {uploading && <p className="uploading">업로드 중...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
