import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import JitsiChatPage from './pages/JitsiChatPage';
import AboutPage from './pages/AboutPage';
import ShareLinkPage from './pages/ShareLinkPage';
import { JoinByLinkPage } from './pages/JoinByLinkPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminReportsPage from './pages/AdminReportsPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes with Layout */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
          <Route path="/chat/jitsi" element={<Layout><JitsiChatPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/share" element={<Layout><ShareLinkPage /></Layout>} />
          <Route path="/join/:linkId" element={<JoinByLinkPage />} />
          
          {/* Admin routes without Layout */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
