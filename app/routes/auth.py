# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Usuario, Obra
from app.schemas import LoginRequest, UsuarioResponse
from passlib.context import CryptContext

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)

# Configuração do Passlib para segurança de senhas
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ✅ Login de Usuário
@router.post("/login", response_model=UsuarioResponse)
def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    print("Recebido:", login_request.username, login_request.password)

    # 🔹 Buscar usuário pelo e-mail (ou nome se preferir)
    user = db.query(Usuario).filter(Usuario.email == login_request.username).first()
    
    if not user:
        print("Usuário não encontrado no banco")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha inválidos"
        )

    print("Encontrou user:", user.nome, user.senha_hash)
    
    # 🔹 Verificar senha com hash
    if not verify_password(login_request.password, user.senha_hash):
        print("Senha inválida ao verificar o hash")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha inválidos"
        )
    
    print(f"Usuário autenticado com sucesso! Obra associada: {user.codigo_projeto}")


    # 🔹 Retorno do usuário autenticado
    return UsuarioResponse(
        id=user.id,
        nome=user.nome,
        email=user.email,
        cargo=user.cargo,
        codigo_projeto=user.codigo_projeto,  # ✅ Agora incluso no retorno
        ativo=user.ativo
    )
