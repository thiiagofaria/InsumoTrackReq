from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/locais-aplicacao",
    tags=["Locais de Aplicação"]
)


@router.post("/", response_model=schemas.LocalAplicacaoResponse)
def criar_local_aplicacao(local_data: schemas.LocalAplicacaoBase, db: Session = Depends(get_db)):
    obra = db.query(models.Obra).filter(models.Obra.codigo_projeto == local_data.codigo_projeto).first()
    if not obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada")

    novo_local = models.LocalAplicacao(**local_data.model_dump())
    
    db.add(novo_local)
    db.commit()
    db.refresh(novo_local)

    return novo_local


@router.get("/", response_model=list[schemas.LocalAplicacaoResponse])
def listar_locais_aplicacao(db: Session = Depends(get_db)):
    return db.query(models.LocalAplicacao).all()


@router.get("/{local_id}", response_model=schemas.LocalAplicacaoResponse)
def buscar_local_aplicacao(local_id: int, db: Session = Depends(get_db)):
    local = db.query(models.LocalAplicacao).filter(models.LocalAplicacao.id == local_id).first()
    if not local:
        raise HTTPException(status_code=404, detail="Local de aplicação não encontrado")
    return local


@router.put("/{local_id}", response_model=schemas.LocalAplicacaoResponse)
def atualizar_local_aplicacao(local_id: int, local_update: schemas.LocalAplicacaoBase, db: Session = Depends(get_db)):
    local = db.query(models.LocalAplicacao).filter(models.LocalAplicacao.id == local_id).first()
    if not local:
        raise HTTPException(status_code=404, detail="Local de aplicação não encontrado")

    for key, value in local_update.model_dump(exclude_unset=True).items():
        setattr(local, key, value)

    db.commit()
    db.refresh(local)

    return local


@router.delete("/{local_id}", response_model=dict)
def deletar_local_aplicacao(local_id: int, db: Session = Depends(get_db)):
    local = db.query(models.LocalAplicacao).filter(models.LocalAplicacao.id == local_id).first()
    if not local:
        raise HTTPException(status_code=404, detail="Local de aplicação não encontrado")

    db.delete(local)
    db.commit()

    return {"message": "Local de aplicação removido com sucesso"}
