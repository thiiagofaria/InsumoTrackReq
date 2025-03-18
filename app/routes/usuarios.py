from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Usuario
from app.schemas import UsuarioCreate, UsuarioResponse, UsuarioUpdate  
from passlib.context import CryptContext

router = APIRouter(prefix="/usuarios", tags=["Usuários"])
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Hash da senha do usuário"""
    return pwd_context.hash(password)


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def criar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    """Cria um novo usuário no sistema"""
    usuario_existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado!")

    novo_usuario = Usuario(
        nome=usuario.nome,
        email=usuario.email,
        cargo=usuario.cargo,
        senha_hash=get_password_hash(usuario.senha),
        ativo=True,
        codigo_projeto=usuario.codigo_projeto
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario


@router.get("/", response_model=list[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    """Lista todos os usuários"""
    return db.query(Usuario).all()


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obter_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """Obtém um usuário pelo ID"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado!")
    return usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
def atualizar_usuario(usuario_id: int, usuario_atualizado: UsuarioUpdate, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado!")
    
    if usuario_atualizado.nome is not None:
         usuario.nome = usuario_atualizado.nome
    if usuario_atualizado.email is not None:
         usuario.email = usuario_atualizado.email
    if usuario_atualizado.cargo is not None:
         usuario.cargo = usuario_atualizado.cargo
    if usuario_atualizado.senha:
         usuario.senha_hash = get_password_hash(usuario_atualizado.senha)
    if usuario_atualizado.codigo_projeto is not None:
         usuario.codigo_projeto = usuario_atualizado.codigo_projeto

    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """Remove um usuário do sistema"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado!")

    db.delete(usuario)
    db.commit()
