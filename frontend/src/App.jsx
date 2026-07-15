import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ConfigForm from './pages/ConfigForm';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import Progress from './pages/Progress';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import Login from './pages/Login';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/config" element={<ConfigForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lesson/:id" element={<Lesson />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
