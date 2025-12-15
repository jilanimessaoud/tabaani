import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Advertisement from './components/Advertisement';
import Home from './pages/Home';
import SectionPage from './pages/SectionPage';
import ArticleDetail from './pages/ArticleDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminArticles from './pages/admin/AdminArticles';
import AdminConfig from './pages/admin/AdminConfig';
import AdminPreview from './pages/admin/AdminPreview';
import AdminSections from './pages/admin/AdminSections';
import AdminAds from './pages/admin/AdminAds';
import PrivateRoute from './components/PrivateRoute';
import './App.css';
import './styles/DarkMode.css';
import './styles/AdminDarkMode.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <Router>
              <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<><Navbar /><Sidebar /><div className="content-with-sidebar"><Home /><Footer /></div></>} />
              <Route path="/section/:sectionName" element={<><Navbar /><Sidebar /><div className="content-with-sidebar"><SectionPage /><Footer /></div></>} />
              <Route path="/article/:id" element={<><Navbar /><Sidebar /><div className="content-with-sidebar"><ArticleDetail /><Footer /></div></>} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/articles"
                element={
                  <PrivateRoute>
                    <AdminArticles />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/config"
                element={
                  <PrivateRoute>
                    <AdminConfig />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/sections"
                element={
                  <PrivateRoute>
                    <AdminSections />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/ads"
                element={
                  <PrivateRoute>
                    <AdminAds />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/preview"
                element={
                  <PrivateRoute>
                    <AdminPreview />
                  </PrivateRoute>
                }
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
        </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </DndProvider>
  );
}

export default App;

