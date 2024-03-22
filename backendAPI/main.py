from fastapi import FastAPI, Depends, HTTPException, APIRouter
from sqlalchemy import create_engine, select, Column, Integer, String, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from flask_bcrypt import Bcrypt
from config import settings
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import httpx
from flask_bcrypt import Bcrypt
from fastapi import Depends, HTTPException, Request
from fastapi import APIRouter, HTTPException
from httpx import AsyncClient


engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

bcrypt = Bcrypt()

@app.on_event("startup")
async def startup_event():
    try:
        with SessionLocal() as session:
            result = session.execute(text("SELECT 1"))
            value = result.fetchone()[0]
            if value == 1:
                print("Conexión a la base de datos establecida con éxito.")
                user_query = session.execute(text("SELECT username FROM tb_usuario WHERE id = 3"))
                user_data = user_query.fetchone()
                if user_data:
                    print(f"Dato del usuario con id 3: {user_data[0]}")
                else:
                    print("No se encontró ningún dato para el usuario con id 3.")
            else:
                print("No se pudo establecer la conexión a la base de datos.")
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

class User(Base):
    __tablename__ = "tb_usuario"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    password = Column(String)

class SignupRequest(BaseModel):
    username: str
    password: str

async def get_keycloak_token():
    url = "http://localhost:8890/realms/master/protocol/openid-connect/token"
    payload = {
        "client_id": "admin-cli",
        "client_secret": "aANNfD88HVFn8egKlzLFEVvq6y9n54Bo",
        "grant_type": "client_credentials"
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=payload)
        if response.status_code == 200:
            token = response.json()["access_token"]
            return token
        else:
            return None

async def get_user_id_from_keycloak(username: str):
    url = f"http://localhost:8890/admin/realms/flask-app/users?username={username}"
    token = await get_keycloak_token()
    if token:
        headers = {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                user_data = response.json()
                if user_data:
                    # Extraer el ID del primer usuario encontrado
                    user_id = user_data[0]['id']
                    print(user_id)
                    return user_id
                else:
                    print("No se encontró ningún usuario con el nombre de usuario proporcionado")
                    return None
            else:
                print("Error al obtener usuario de Keycloak:", response.status_code, response.text)
                return None
    else:
        print("Error al obtener el token de acceso de Keycloak")
        return None

async def register_user_in_keycloak(username, password):
    token = await get_keycloak_token()
    if token:
        url = "http://localhost:8890/admin/realms/flask-app/users"
        headers = {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
        data = {
            "enabled": True,
            "username": username,
            "email": "",
            "firstName": "",
            "lastName": "",
            "credentials": [
                {
                    "type": "password",
                    "value": password,
                    "temporary": False
                }
            ],
            "requiredActions": [
                "",
                ""
            ],
            "groups": [],
            "attributes": {
                "locale": [
                    "en"
                ]
            }
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=data)
            if response.status_code == 201:
                print("Usuario registrado exitosamente en Keycloak")
            else:
                print("Error al registrar usuario en Keycloak:", response.status_code, response.text)
    else:
        print("Error al obtener el token de acceso de Keycloak")

@router.post("/signup")
async def signup(request_data: SignupRequest, db: Session = Depends(get_db)):
    await register_user_in_keycloak(request_data.username, request_data.password)
        
    # Verificar si el usuario ya existe en la base de datos
    user_exists = db.query(User).filter(User.username == request_data.username).first()
    if user_exists:
        raise HTTPException(status_code=409, detail="Usuario already exists")

    # Hashear la contraseña y crear un nuevo usuario
    hashed_password = bcrypt.generate_password_hash(request_data.password).decode('utf-8')
    new_user = User(username=request_data.username, password=hashed_password)
    db.add(new_user)
    db.commit()
    
    return {"id": new_user.id, "username": new_user.username}


@router.post("/forgot")
async def forgot_password(request_data: dict, db: Session = Depends(get_db)):
    username = request_data.get("username")
    password = request_data.get("password")
    
    # Buscar al usuario en la base de datos
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verificar si la contraseña ingresada es correcta
    if not bcrypt.check_password_hash(user.password, password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    # Obtener el ID del usuario de Keycloak
    user_id = await get_user_id_from_keycloak(username)
    if not user_id:
        raise HTTPException(status_code=404, detail="User ID not found in Keycloak")
    
    return {"user_id": user_id, "message": "Password verified successfully"}

async def reset_password_in_keycloak(user_id: str, new_password: str):
    url = f"http://localhost:8890/admin/realms/flask-app/users/{user_id}/reset-password"
    token = await get_keycloak_token()
    if token:
        headers = {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
        data = {
            "type": "password",
            "temporary": False,
            "value": new_password
        }
        async with httpx.AsyncClient() as client:
            response = await client.put(url, headers=headers, json=data)
            if response.status_code == 204:
                print("Contraseña restablecida exitosamente en Keycloak")
            else:
                print("Error al restablecer la contraseña en Keycloak:", response.status_code, response.text)
    else:
        print("Error al obtener el token de acceso de Keycloak")
        
@router.put("/reset-password")
async def reset_password(request_data: dict, db: Session = Depends(get_db)):
    username = request_data.get("username")
    new_password = request_data.get("newPassword")
    
    # Buscar al usuario en la base de datos
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Obtener el ID del usuario de Keycloak
    user_id = await get_user_id_from_keycloak(username)
    if not user_id:
        raise HTTPException(status_code=404, detail="User ID not found in Keycloak")
    
    # Restablecer la contraseña en Keycloak
    await reset_password_in_keycloak(user_id, new_password)
    
    return {"message": "Password reset successfully"}

KEYCLOAK_URL = "http://localhost:8890/realms/flask-app/protocol/openid-connect/token"

async def get_http_client():
    return AsyncClient()

@router.post("/login")
async def login_to_keycloak(request_data: dict, client: AsyncClient = Depends(get_http_client)):
    login_data = {
        "client_id": "admin-cli",
        "grant_type": "password",
        "username": request_data["username"],
        "password": request_data["password"],
        "client_secret": "i9mL0mdy1qhrdpqwZ8rD8gwtuRqwZr4N"
    }

    response = await client.post(KEYCLOAK_URL, data=login_data)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

@app.get("/items/")
async def read_items(db: Session = Depends(get_db)):
    items = db.execute(select(Item)).all()
    return items

app.include_router(router)

if __name__=="__main__":
    uvicorn.run("main:app", port=8000, reload=True)
