import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage(){
 
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
     
    const logInUser = () => {
        if(usuario.length === 0){
          alert("Usuario ha dejado el campo vacío!");
        }
        else if(password.length === 0){
          alert("Contraseña ha dejado el campo vacío!");
        }
        else{
            axios.post('http://127.0.0.1:8000/login', {
                username: usuario, // Cambiado a 'username'
                password: password
            })
            .then(function (response) {
                console.log(response);
                navigate("/");
            })
            .catch(function (error) {
                console.log(error, 'error');
                if (error.response.status === 401) {
                    alert("Credenciales inválidas");
                }
            });
        }
    }
 
    let imgs = [
      'https://as1.ftcdn.net/v2/jpg/03/39/70/90/1000_F_339709048_ZITR4wrVsOXCKdjHncdtabSNWpIhiaR7.jpg',
    ];
     
    return (
        <div>
            <div className="container h-100">
              <div className="container-fluid h-custom">
                <div className="row d-flex justify-content-center align-items-center h-100">
                  <div className="col-md-9 col-lg-6 col-xl-5">
                    <img src={imgs[0]} className="img-fluid"/>
                  </div>
                  <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                    <form>
                      <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                        <p className="lead fw-normal mb-0 me-3">Iniciar Sesión</p>
                      </div>
           
                      <div className="form-outline mb-4">
                        <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} id="form3Example3" className="form-control form-control-lg" placeholder="Ingrese su usuario" />
                        <label className="form-label" htmlFor="form3Example3">Usuario</label>
                      </div>
           
                      <div className="form-outline mb-3">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} id="form3Example4" className="form-control form-control-lg" placeholder="Ingrese su contraseña" />
                        <label className="form-label" htmlFor="form3Example4">Contraseña</label>
                      </div>
           
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="form-check mb-0">
                          <input className="form-check-input me-2" type="checkbox" value="" id="form2Example3" />
                          <label className="form-check-label" htmlFor="form2Example3">
                            Recordarme
                          </label>
                        </div>
                        <a href="#!" className="text-body">¿Olvidó su contraseña?</a>
                      </div>
           
                      <div className="text-center text-lg-start mt-4 pt-2">
                        <button type="button" className="btn btn-primary btn-lg" onClick={logInUser} >Iniciar Sesión</button>
                        <p className="small fw-bold mt-2 pt-1 mb-0">¿No tiene una cuenta? <a href="/register" className="link-danger">Registrarse</a></p>
                      </div>
           
                    </form>
                  </div>
                </div>
              </div>
            </div>
        </div>
    );
}
