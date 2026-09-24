import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import DoctorDashboard from './pages/doctorDashboard';
import PrivateRoute from './components/privateRoute';
import DoctorProfile from './pages/doctorProfile';
import Appointments from './pages/appointments';
import QueueStatus from './pages/queueStatus';
import Landing from './pages/landing';
import PatientProfile from './pages/patientProfile';
import DoctorProfileEdit from './pages/doctorProfileEdit';
import Help from './pages/help';
import About from './pages/about';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/help" element={<Help/>} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/doctor-dashboard" element={
          <PrivateRoute><DoctorDashboard/></PrivateRoute>
        } />
        <Route path="/doctor-profile/:id" element={<DoctorProfile/>}/>
        <Route path="/appointments/" element={<Appointments/>}/>
        <Route path="/queue-status/:id" element={
          <PrivateRoute><QueueStatus/></PrivateRoute>
        } />
        <Route path="/patient-profile" element={
          <PrivateRoute><PatientProfile /></PrivateRoute>
        } />
        <Route path="/doctor-profile-edit" element={
          <PrivateRoute><DoctorProfileEdit /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
