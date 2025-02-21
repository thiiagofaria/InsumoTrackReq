from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import UnidadeMedida
from app.schemas import UnidadeMedidaResponse

router = APIRouter(
    prefix="/unidades",
    tags=["Unidades de Medida"]
)

@router.get("/", response_model=List[UnidadeMedidaResponse])
def listar_unidades(db: Session = Depends(get_db)):
    unidades = db.query(UnidadeMedida).all()
    if not unidades:
        raise HTTPException(status_code=404, detail="Nenhuma unidade encontrada")
    return unidades
