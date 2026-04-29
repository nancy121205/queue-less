import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import DoctorDashboard from './pages/doctorDashboard';
import PrivateRoute from './components/privateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/doctor-dashboard" element={
          <PrivateRoute><DoctorDashboard/></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;