from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
import jwt
import datetime
from dotenv import load_dotenv
import os
from app.database import get_db
from app.models import Usuario, Obra
from app.schemas import LoginRequest, UsuarioResponse

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)

load_dotenv() 

SECRET_KEY = os.getenv("SECRET_KEY")

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/login", response_model=UsuarioResponse)
def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    print("Recebido:", login_request.username, login_request.password)

    user = db.query(Usuario).filter(Usuario.email == login_request.username).first()
    if not user:
        print("Usuário não encontrado no banco")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha inválidos"
        )

    print("Encontrou user:", user.nome, user.senha_hash)
    if not verify_password(login_request.password, user.senha_hash):
        print("Senha inválida ao verificar o hash")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha inválidos"
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    print(f"Usuário autenticado com sucesso! Obra associada: {user.codigo_projeto}")

    return UsuarioResponse(
        id=user.id,
        nome=user.nome,
        email=user.email,
        cargo=user.cargo,
        codigo_projeto=user.codigo_projeto,
        ativo=user.ativo,
        token=access_token  
    )


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    print("Token recebido:", token) 
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        print("Payload decodificado:", payload)  
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    except Exception as e:
        print("Erro ao decodificar token:", e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    return user
