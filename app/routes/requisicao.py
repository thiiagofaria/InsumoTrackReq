from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from datetime import date, datetime, time
from pydantic import ValidationError
import json
from sqlalchemy.exc import SQLAlchemyError
from pytz import timezone
from app.routes.auth import get_current_user
from sqlalchemy.orm import joinedload
from typing import List, Optional


local_tz = timezone("America/Sao_Paulo")

router = APIRouter(
    prefix="/requisicoes",
    tags=["Requisições"]
)

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
            data_criacao=datetime.now(local_tz),
            data_programacao_subida=requisicao.data_programacao_subida,
        )

        db.add(nova_requisicao)
        db.commit()
        db.refresh(nova_requisicao)

        historico = models.HistoricoStatusRequisicao(
            requisicao_id=nova_requisicao.id,
            status_id=nova_requisicao.status_id,
            usuario_id=nova_requisicao.usuario_id,
            data_alteracao=datetime.now(local_tz),
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


@router.get("/filter", response_model=list[schemas.RequisicaoResponse])
def filtrar_requisicoes(
    req_id: Optional[int] = Query(None, description="Número da Requisição"),
    data_criacao_inicio: Optional[date] = Query(None),
    data_criacao_fim: Optional[date] = Query(None),
    empresa: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    data_programacao_subida_inicio: Optional[date] = Query(None),
    data_programacao_subida_fim: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    query = db.query(models.Requisicao)

    # Se req_id estiver presente, retorna somente a requisição com esse ID
    if req_id is not None:
        requisicao = query\
            .options(
                joinedload(models.Requisicao.status),
                joinedload(models.Requisicao.empresa)
            )\
            .filter(models.Requisicao.id == req_id)\
            .first()

        if not requisicao:
            raise HTTPException(status_code=404, detail="Nenhuma requisição encontrada com o ID informado")

        # Retorna a lista com apenas um item (a requisição)
        return [requisicao]

    # Caso req_id não esteja presente, aplica os outros filtros
    # Filtro por data de criação
    if data_criacao_inicio:
        dt_inicio = datetime.combine(data_criacao_inicio, time.min)
        query = query.filter(models.Requisicao.data_criacao >= dt_inicio)
    if data_criacao_fim:
        dt_fim = datetime.combine(data_criacao_fim, time.max)
        query = query.filter(models.Requisicao.data_criacao <= dt_fim)

    # Filtro por data de programação de subida
    if data_programacao_subida_inicio:
        query = query.filter(models.Requisicao.data_programacao_subida >= data_programacao_subida_inicio)
    if data_programacao_subida_fim:
        query = query.filter(models.Requisicao.data_programacao_subida <= data_programacao_subida_fim)

    # Filtro por empresa (nome)
    if empresa:
        query = query.join(models.Empresa).filter(models.Empresa.nome.ilike(f"%{empresa}%"))

    # Filtro por status (descrição)
    if status:
        query = query.join(models.StatusRequisicao).filter(models.StatusRequisicao.descricao.ilike(f"%{status}%"))

    requisicoes = query\
        .options(joinedload(models.Requisicao.status), joinedload(models.Requisicao.empresa))\
        .all()

    if not requisicoes:
        raise HTTPException(status_code=404, detail="Nenhuma requisição encontrada com os filtros informados")

    return requisicoes

@router.get("/baixas", response_model=List[schemas.BaixaItemDetalhadaResponse])
def filtrar_baixas(
    requisicao_id: Optional[int] = Query(None, description="ID da requisição"),
    data_baixa_inicio: Optional[date] = Query(None, description="Data de início para baixa"),
    data_baixa_fim: Optional[date] = Query(None, description="Data final para baixa"),
    db: Session = Depends(get_db)
):
    query = db.query(models.BaixaItemRequisicao).options(
        joinedload(models.BaixaItemRequisicao.item_requisicao),
        joinedload(models.BaixaItemRequisicao.usuario_baixa),
        joinedload(models.BaixaItemRequisicao.requisicao).joinedload(models.Requisicao.empresa)
    )
    
    if requisicao_id is not None:
        query = query.filter(models.BaixaItemRequisicao.requisicao_id == requisicao_id)
    if data_baixa_inicio:
        dt_inicio = datetime.combine(data_baixa_inicio, time.min)
        query = query.filter(models.BaixaItemRequisicao.data_baixa >= dt_inicio)
    if data_baixa_fim:
        dt_fim = datetime.combine(data_baixa_fim, time.max)
        query = query.filter(models.BaixaItemRequisicao.data_baixa <= dt_fim)
    
    baixas = query.all()
    if not baixas:
        raise HTTPException(status_code=404, detail="Nenhuma baixa encontrada com os filtros informados")
    
    # Mapeamento manual para incluir os campos extras:
    baixas_detalhadas = []
    for baixa in baixas:
        baixa_detalhada = {
            "id": baixa.id,
            "requisicao_id": baixa.requisicao_id,
            "item_requisicao_id": baixa.item_requisicao_id,
            "item_descricao": baixa.item_requisicao.descricao if baixa.item_requisicao else "N/A",
            "local_aplicacao": baixa.item_requisicao.local_aplicacao if baixa.item_requisicao else "N/A",
            "unidade_medida": baixa.item_requisicao.unidade_medida if baixa.item_requisicao else "N/A",
            "quantidade_baixada": baixa.quantidade_baixada,
            "data_baixa": baixa.data_baixa,
            "usuario_baixa_id": baixa.usuario_baixa_id,
            "usuario_baixa_nome": baixa.usuario_baixa.nome if baixa.usuario_baixa else "N/A",
            "empresa": baixa.requisicao.empresa.nome if baixa.requisicao and baixa.requisicao.empresa else "N/A"
        }
        baixas_detalhadas.append(baixa_detalhada)
    
    return baixas_detalhadas

# ✅ Buscar uma requisição por ID (READ)
@router.get("/{requisicao_id}", response_model=schemas.RequisicaoResponse)
def buscar_requisicao(requisicao_id: int, db: Session = Depends(get_db)):
    requisicao = db.query(models.Requisicao)\
        .options(
            joinedload(models.Requisicao.itens).joinedload(models.ItensRequisicao.baixas),
            joinedload(models.Requisicao.usuario_criador),
            joinedload(models.Requisicao.empresa)
        )\
        .filter(models.Requisicao.id == requisicao_id)\
        .first()
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
            data_alteracao=datetime.now(local_tz)
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
        requisicao_id = requisicao_id,  # Adicionado aqui!
        item_requisicao_id=item_id,
        usuario_baixa_id=baixa_data.usuario_baixa_id,
        quantidade_baixada=baixa_data.quantidade_baixada,
        data_baixa=datetime.now(local_tz)
    )

    db.add(nova_baixa)
    db.commit()
    db.refresh(nova_baixa)

    return nova_baixa


@router.post("/{requisicao_id}/aprovar", response_model=schemas.RequisicaoResponse)
def aprovar_requisicao(
    requisicao_id: int,
    aprovacao: schemas.AprovacaoRequisicao,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Busque a requisição pelo ID
    requisicao = db.query(models.Requisicao).filter(models.Requisicao.id == requisicao_id).first()
    if not requisicao:
        raise HTTPException(status_code=404, detail="Requisição não encontrada")
    
    # Verifique se a requisição pertence à mesma obra do usuário logado
    if requisicao.codigo_projeto != current_user.codigo_projeto:
        raise HTTPException(status_code=403, detail="Você não tem permissão para aprovar esta requisição")
    
    # Defina o novo status com base na ação: 
    # Exemplo: 2 para "Aprovada", 3 para "Reprovada"
    novo_status = 2 if aprovacao.aprovado else 3

    # Atualize a requisição
    requisicao.status_id = novo_status
    requisicao.usuario_aprovador_id = current_user.id
    requisicao.data_aprovacao = datetime.now(local_tz)

    db.commit()
    db.refresh(requisicao)

    # Registre a ação no histórico de status, incluindo a observação (se houver)
    historico = models.HistoricoStatusRequisicao(
        requisicao_id=requisicao.id,
        status_id=novo_status,
        usuario_id=current_user.id,
        data_alteracao=datetime.now(local_tz),
        observacao_aprovacao=aprovacao.observacao
    )
    db.add(historico)
    db.commit()

    return requisicao


@router.post("/{requisicao_id}/baixa", response_model=list[schemas.BaixaItemRequisicaoResponse])
def realizar_baixa(requisicao_id: int, baixas: list[schemas.BaixaItemRequisicaoCreate], db: Session = Depends(get_db)):
    requisicao = db.query(models.Requisicao).filter(models.Requisicao.id == requisicao_id).first()
    if not requisicao:
        raise HTTPException(status_code=404, detail="Requisição não encontrada")
    if requisicao.status_id != 2:
        raise HTTPException(status_code=400, detail="Somente requisições aprovadas podem ter baixa")

    nova_baixa_registros = []
    for baixa_data in baixas:
        nova_baixa = models.BaixaItemRequisicao(
            requisicao_id=requisicao_id,   # <-- Adicione essa linha
            item_requisicao_id=baixa_data.item_requisicao_id,
            usuario_baixa_id=baixa_data.usuario_baixa_id,
            quantidade_baixada=baixa_data.quantidade_baixada,
            data_baixa=datetime.now(local_tz)
        )
        db.add(nova_baixa)
        nova_baixa_registros.append(nova_baixa)
    db.commit()
    for baixa in nova_baixa_registros:
        db.refresh(baixa)
    return nova_baixa_registros

