from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Obra
from app.schemas import ObraBase, ObraResponse

router = APIRouter()

@router.post("/obras/", response_model=ObraResponse)
def create_obra(obra: ObraBase, db: Session = Depends(get_db)):
    """
    Cria uma nova obra no banco de dados.
    """
    db_obra = Obra(codigo_projeto=obra.codigo_projeto, nome=obra.nome)
    db.add(db_obra)
    db.commit()
    db.refresh(db_obra)
    return db_obra

@router.get("/obras/", response_model=List[ObraResponse])
def get_obras(db: Session = Depends(get_db)):
    """
    Retorna todas as obras cadastradas.
    """
    return db.query(Obra).all()

@router.get("/obras/{codigo_projeto}", response_model=ObraResponse)
def get_obra_by_codigo(codigo_projeto: str, db: Session = Depends(get_db)):
    """
    Retorna uma obra pelo código do projeto.
    """
    obra = db.query(Obra).filter(Obra.codigo_projeto == codigo_projeto).first()
    if not obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada")
    return obra

@router.put("/obras/{codigo_projeto}", response_model=ObraResponse)
def update_obra(codigo_projeto: str, obra: ObraBase, db: Session = Depends(get_db)):
    """
    Atualiza os dados de uma obra pelo código do projeto.
    """
    db_obra = db.query(Obra).filter(Obra.codigo_projeto == codigo_projeto).first()
    if not db_obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada")

    db_obra.nome = obra.nome
    db.commit()
    db.refresh(db_obra)
    return db_obra

@router.delete("/obras/{codigo_projeto}")
def delete_obra(codigo_projeto: str, db: Session = Depends(get_db)):
    """
    Remove uma obra do banco de dados pelo código do projeto.
    """
    db_obra = db.query(Obra).filter(Obra.codigo_projeto == codigo_projeto).first()
    if not db_obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada")

    db.delete(db_obra)
    db.commit()
    return {"message": "Obra removida com sucesso"}
