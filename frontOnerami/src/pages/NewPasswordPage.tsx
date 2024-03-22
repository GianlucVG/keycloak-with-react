import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewPasswordPage() {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    try {
      const response = await axios.put('http://localhost:8000/reset-password', {
        username: username,
        newPassword: newPassword,
      });

      if (response.status === 200) {
        console.log('Contraseña restablecida exitosamente');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="container h-100">
        <div className="container-fluid h-custom">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <form onSubmit={handleSubmit}>
                <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                  <p className="lead fw-normal mb-0 me-3">
                    Ingresar Nueva contraseña
                  </p>
                </div>

                <div className="form-outline mb-4">
                  <input
                    type="text"
                    id="username"
                    className="form-control form-control-lg"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="form-outline mb-4">
                  <input
                    type="password"
                    id="newPassword"
                    className="form-control form-control-lg"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="text-center text-lg-start mt-4 pt-2">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Submit
                  </button>
                </div>
              </form>
            </div>
            <div className="col-md-9 col-lg-6 col-xl-5">
              {/* Aquí va tu imagen */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
