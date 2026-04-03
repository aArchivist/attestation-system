import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import AdminPage from './pages/AdminPage';
import HeadDashboardPage from './pages/HeadDashboardPage';
import LoginPage from './pages/LoginPage';
import TeacherProfilePage from './pages/TeacherProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/profile"
            element={(
              <PrivateRoute roles={['TEACHER']}>
                <TeacherProfilePage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/dashboard"
            element={(
              <PrivateRoute roles={['HEAD']}>
                <HeadDashboardPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/admin"
            element={(
              <PrivateRoute roles={['ADMIN']}>
                <AdminPage />
              </PrivateRoute>
            )}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
