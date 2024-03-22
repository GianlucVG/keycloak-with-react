import axios from 'axios';
import { useState } from 'react';
import { useNavigate  } from 'react-router-dom';

export default function NewPasswordPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate  = useNavigate(); // Inicializa el hook useHistory

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/forgot', {
        username: username,
        password: password,
      });

      console.log('Response:', response.data);
      // Verifica si el código de estado de la respuesta es 200 y redirige al usuario
      if (response.status === 200) {
        navigate('/newPassword');// Redirige al usuario a /newPassword
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  let imgs = [
    'https://as1.ftcdn.net/v2/jpg/03/39/70/90/1000_F_339709048_ZITR4wrVsOXCKdjHncdtabSNWpIhiaR7.jpg',
  ];
  
  return (
    <div>
      <div className="container h-100">
        <div className="container-fluid h-custom">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <form onSubmit={handleSubmit}>
                <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                  <p className="lead fw-normal mb-0 me-3">
                    Verificar contraseña
                  </p>
                </div>

                <div className="form-outline mb-4">
                  <input
                    type="text"
                    id="form3Example3"
                    className="form-control form-control-lg"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="form-outline mb-4">
                  <input
                    type="password"
                    id="form3Example3"
                    className="form-control form-control-lg"
                    placeholder="Enter a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              <img src={imgs[0]} className="img-fluid" alt="Forgot password" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
