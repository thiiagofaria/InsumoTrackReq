from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from typing import List

router = APIRouter(
    prefix="/empresas",
    tags=["Empresas"]
)

#  Listar todas as empresas
@router.get("/", response_model=List[schemas.EmpresaResponse])
def listar_empresas(db: Session = Depends(get_db)):
    empresas = db.query(models.Empresa).all()
    if not empresas:
        raise HTTPException(status_code=404, detail="Nenhuma empresa encontrada")
    return empresas


# Buscar uma empresa por ID
@router.get("/{empresa_id}", response_model=schemas.EmpresaResponse)
def buscar_empresa(empresa_id: int, db: Session = Depends(get_db)):
    empresa = db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return empresa


# Criar uma nova empresa
@router.post("/", response_model=schemas.EmpresaResponse, status_code=201)
def criar_empresa(empresa: schemas.EmpresaBase, db: Session = Depends(get_db)):
    nova_empresa = models.Empresa(
        nome=empresa.nome,
        cnpj=empresa.cnpj,
        endereco=empresa.endereco,
        telefone=empresa.telefone,
        tipo_empresa=empresa.tipo_empresa
    )
    db.add(nova_empresa)
    db.commit()
    db.refresh(nova_empresa)
    return nova_empresa


# Atualizar uma empresa
@router.put("/{empresa_id}", response_model=schemas.EmpresaResponse)
def atualizar_empresa(empresa_id: int, empresa_update: schemas.EmpresaBase, db: Session = Depends(get_db)):
    empresa = db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    # Atualizar apenas os campos enviados
    for key, value in empresa_update.model_dump(exclude_unset=True).items():
        setattr(empresa, key, value)

    db.commit()
    db.refresh(empresa)

    return empresa


# Deletar uma empresa
@router.delete("/{empresa_id}", response_model=dict)
def deletar_empresa(empresa_id: int, db: Session = Depends(get_db)):
    empresa = db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    db.delete(empresa)
    db.commit()

    return {"message": "Empresa removida com sucesso"}
