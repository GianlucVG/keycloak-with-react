import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPage from './pages/ForgotPage';
import NewPasswordPage from './pages/NewPasswordPage';

function App() {

  return (
<div className="vh-100 gradient-custom">
    <div className="container">
      <h1 className="page-header text-center">React and Python Flask Login Register</h1>
   
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot" element={<ForgotPage />} />
            <Route path="/newPassword" element={<NewPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </div>
    </div>
  )
}

export default App
