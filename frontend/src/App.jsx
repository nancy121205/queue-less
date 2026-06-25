import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import DoctorDashboard from './pages/doctorDashboard';
import PrivateRoute from './components/privateRoute';
import DoctorProfile from './pages/doctorProfile';
import Appointments from './pages/appointments';

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
        <Route path="/doctor-profile/:id" element={<DoctorProfile/>}/>
        <Route path="/appointments/" element={<Appointments/>}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;