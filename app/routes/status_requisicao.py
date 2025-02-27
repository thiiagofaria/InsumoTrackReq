from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/status-requisicao",
    tags=["Status de Requisição"]
)

@router.get("/", response_model=List[schemas.StatusRequisicaoResponse])
def listar_status(db: Session = Depends(get_db)):
    """
    Retorna a lista de todos os status de requisição.
    """
    status_list = db.query(models.StatusRequisicao).all()
    if not status_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum status de requisição encontrado"
        )
    return status_list


@router.get("/{status_id}", response_model=schemas.StatusRequisicaoResponse)
def buscar_status_por_id(status_id: int, db: Session = Depends(get_db)):
    """
    Retorna os dados de um status de requisição com base no ID.
    """
    status_req = db.query(models.StatusRequisicao).filter(models.StatusRequisicao.id == status_id).first()
    if not status_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status de requisição não encontrado"
        )
    return status_req



