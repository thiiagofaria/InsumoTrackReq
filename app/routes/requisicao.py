from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
import datetime
from pydantic import ValidationError
import json
from sqlalchemy.exc import SQLAlchemyError



router = APIRouter(
    prefix="/requisicoes",
    tags=["Requisições"]
)

# ✅ Criar uma requisição (CREATE)
@router.post("/", response_model=schemas.RequisicaoResponse)
def criar_requisicao(requisicao: schemas.RequisicaoCreate, db: Session = Depends(get_db)):
    try:
        print("\n📥 **Payload recebido no backend:**")
        print(json.dumps(requisicao.model_dump(), indent=4, default=str))

        # Criar requisição
        nova_requisicao = models.Requisicao(
            usuario_id=requisicao.usuario_id,
            codigo_projeto=requisicao.codigo_projeto,
            empresa_id=requisicao.empresa_id,
            status_id=requisicao.status_id,
            justificativa=requisicao.justificativa,
            data_criacao=datetime.datetime.utcnow(),
        )

        db.add(nova_requisicao)
        db.commit()
        db.refresh(nova_requisicao)

        # Criar histórico de status
        historico = models.HistoricoStatusRequisicao(
            requisicao_id=nova_requisicao.id,
            status_id=nova_requisicao.status_id,
            usuario_id=nova_requisicao.usuario_id,
            data_alteracao=datetime.datetime.utcnow(),
        )
        db.add(historico)
        db.commit()

        return nova_requisicao

    except ValidationError as e:
        print("\n❌ **Erro de validação no Pydantic:**")
        print(json.dumps(e.errors(), indent=4))
        raise HTTPException(status_code=422, detail=e.errors())

    except SQLAlchemyError as e:
        print("\n❌ **Erro no banco de dados:**", str(e))
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro no banco de dados")

    except Exception as e:
        print("\n❌ **Erro inesperado:**", str(e))
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro interno ao criar requisição")


# ✅ Listar todas as requisições (READ)
@router.get("/", response_model=list[schemas.RequisicaoResponse])
def listar_requisicoes(db: Session = Depends(get_db)):
    return db.query(models.Requisicao).all()


# ✅ Buscar uma requisição por ID (READ)
@router.get("/{requisicao_id}", response_model=schemas.RequisicaoResponse)
def buscar_requisicao(requisicao_id: int, db: Session = Depends(get_db)):
    requisicao = db.query(models.Requisicao).filter(models.Requisicao.id == requisicao_id).first()
    if not requisicao:
        raise HTTPException(status_code=404, detail="Requisição não encontrada")
    return requisicao


# ✅ Atualizar uma requisição (UPDATE)
@router.put("/{requisicao_id}", response_model=schemas.RequisicaoResponse)
def atualizar_requisicao(requisicao_id: int, requisicao_update: schemas.RequisicaoCreate, db: Session = Depends(get_db)):
    requisicao = db.query(models.Requisicao).filter(models.Requisicao.id == requisicao_id).first()
    if not requisicao:
        raise HTTPException(status_code=404, detail="Requisição não encontrada")
    
    for key, value in requisicao_update.model_dump(exclude_unset=True).items():
        setattr(requisicao, key, value)

    db.commit()
    db.refresh(requisicao)

    # Criar um registro no histórico de status se o status mudou
    if requisicao.status_id != requisicao_update.status_id:
        historico = models.HistoricoStatusRequisicao(
            requisicao_id=requisicao.id,
            status_id=requisicao.status_id,
            usuario_id=requisicao_update.usuario_id,
            data_alteracao=datetime.datetime.utcnow()
        )
        db.add(historico)
        db.commit()

    return requisicao


# ✅ Deletar uma requisição (DELETE)
@router.delete("/{requisicao_id}", status_code=204)
def deletar_requisicao(requisicao_id: int, db: Session = Depends(get_db)):
    requisicao = db.query(models.Requisicao).filter(models.Requisicao.id == requisicao_id).first()
    if not requisicao:
        raise HTTPException(status_code=404, detail="Requisição não encontrada")
    
    db.delete(requisicao)
    db.commit()
    return None


# ✅ Adicionar um item à requisição
@router.post("/{requisicao_id}/itens", response_model=list[schemas.ItensRequisicaoResponse])
def adicionar_itens_requisicao(requisicao_id: int, itens: list[schemas.ItensRequisicaoCreate], db: Session = Depends(get_db)):
    try:
        print(f"📌 Tentando adicionar itens à requisição {requisicao_id}")
        
        requisicao = db.query(models.Requisicao).filter(models.Requisicao.id == requisicao_id).first()
        if not requisicao:
            print("❌ Requisição não encontrada!")
            raise HTTPException(status_code=404, detail="Requisição não encontrada")

        novos_itens = []
        for item_data in itens:
            print(f"📥 Processando item: {item_data.model_dump()}")
            novo_item = models.ItensRequisicao(**item_data.model_dump())  # 🚀 Corrigido
            db.add(novo_item)
            novos_itens.append(novo_item)

        db.commit()
        print("✅ Itens adicionados com sucesso!")

        return novos_itens

    except SQLAlchemyError as e:
        print("\n❌ **Erro no banco de dados ao adicionar itens:**", str(e))
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro no banco de dados ao adicionar itens")


# ✅ Listar os itens de uma requisição
@router.get("/{requisicao_id}/itens", response_model=list[schemas.ItensRequisicaoResponse])
def listar_itens_requisicao(requisicao_id: int, db: Session = Depends(get_db)):
    return db.query(models.ItensRequisicao).filter(models.ItensRequisicao.requisicao_id == requisicao_id).all()


# ✅ Atualizar um item dentro da requisição
@router.put("/{requisicao_id}/itens/{item_id}", response_model=schemas.ItensRequisicaoResponse)
def atualizar_item_requisicao(requisicao_id: int, item_id: int, item_update: schemas.RequisicaoBase, db: Session = Depends(get_db)):
    item = db.query(models.ItensRequisicao).filter(
        models.ItensRequisicao.id == item_id,
        models.ItensRequisicao.requisicao_id == requisicao_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item da requisição não encontrado")

    for key, value in item_update.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)

    return item


# ✅ Deletar um item da requisição
@router.delete("/{requisicao_id}/itens/{item_id}", response_model=dict)
def deletar_item_requisicao(requisicao_id: int, item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.ItensRequisicao).filter(
        models.ItensRequisicao.id == item_id,
        models.ItensRequisicao.requisicao_id == requisicao_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item da requisição não encontrado")

    db.delete(item)
    db.commit()

    return {"message": "Item removido com sucesso"}


# ✅ Criar uma baixa de item
@router.post("/{requisicao_id}/itens/{item_id}/baixa", response_model=schemas.BaixaItemRequisicaoResponse)
def dar_baixa_item(
    requisicao_id: int,
    item_id: int,
    baixa_data: schemas.BaixaItemRequisicaoCreate,
    db: Session = Depends(get_db)
):
    requisicao = db.query(models.Requisicao).filter(models.Requisicao.id == requisicao_id).first()
    if not requisicao:
        raise HTTPException(status_code=404, detail="Requisição não encontrada")

    item = db.query(models.ItensRequisicao).filter(
        models.ItensRequisicao.id == item_id,
        models.ItensRequisicao.requisicao_id == requisicao_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado na requisição")

    nova_baixa = models.BaixaItemRequisicao(
        item_requisicao_id=item_id,
        usuario_baixa_id=baixa_data.usuario_baixa_id,
        quantidade_baixada=baixa_data.quantidade_baixada,
        data_baixa=datetime.datetime.utcnow()
    )

    db.add(nova_baixa)
    db.commit()
    db.refresh(nova_baixa)

    return nova_baixa
