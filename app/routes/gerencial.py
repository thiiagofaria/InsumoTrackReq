from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List
import urllib.parse
import pandas as pd
from io import BytesIO
from app.database import get_db
from app import models, schemas
from app.models import GerencialObra
from app.routes.auth import get_current_user


router = APIRouter(
    prefix="/gerencial",
    tags=["Gerencial Obra"]
)

@router.get("/obras/", response_model=List[str])
def listar_obras(db: Session = Depends(get_db)):
    obras = db.query(models.Obra).all()
    if not obras:
        raise HTTPException(status_code=404, detail="Nenhuma obra encontrada")
    return [obra.codigo for obra in obras]


@router.get("/subgrupos1/{codigo_projeto}", response_model=List[str])
def listar_subgrupos1(codigo_projeto: str, db: Session = Depends(get_db)):
    subgrupos1 = db.query(models.GerencialObra.subgrupo_1).filter(
        models.GerencialObra.codigo_projeto == codigo_projeto
    ).distinct().all()
    if not subgrupos1:
        raise HTTPException(status_code=404, detail="Nenhum subgrupo 1 encontrado para esse código_projeto")
    return [subgrupo.subgrupo_1 for subgrupo in subgrupos1]

@router.get("/subgrupos2/{codigo_projeto}/{subgrupo1}", response_model=List[str])
def listar_subgrupos2(codigo_projeto: str, subgrupo1: str = Path(..., title="Subgrupo 1"), db: Session = Depends(get_db)):
    subgrupos2 = db.query(models.GerencialObra.subgrupo_2).filter(
        models.GerencialObra.codigo_projeto == codigo_projeto,
        models.GerencialObra.subgrupo_1 == subgrupo1
    ).distinct().all()
    
    if not subgrupos2:
        raise HTTPException(status_code=404, detail="Nenhum subgrupo 2 encontrado para essa combinação")
    
    return [subgrupo.subgrupo_2 for subgrupo in subgrupos2]

@router.get("/subgrupos3/{codigo_projeto}/{subgrupo1}/{subgrupo2}", response_model=List[str])
def listar_subgrupos3(codigo_projeto: str, subgrupo1: str, subgrupo2: str, db: Session = Depends(get_db)):
    subgrupos3 = db.query(models.GerencialObra.subgrupo_3).filter(
        models.GerencialObra.codigo_projeto == codigo_projeto,
        models.GerencialObra.subgrupo_1 == subgrupo1,
        models.GerencialObra.subgrupo_2 == subgrupo2
    ).distinct().all()
    
    if not subgrupos3:
        raise HTTPException(status_code=404, detail="Nenhum subgrupo 3 encontrado para essa combinação")
    
    return [subgrupo.subgrupo_3 for subgrupo in subgrupos3]


@router.get("/servicos/{codigo_projeto}/{subgrupo1}/{subgrupo2}/{subgrupo3}", response_model=List[str])
def listar_servicos(codigo_projeto: str, subgrupo1: str, subgrupo2: str, subgrupo3: str, db: Session = Depends(get_db)):
    servicos = db.query(models.GerencialObra.servico).filter(
        models.GerencialObra.codigo_projeto == codigo_projeto,
        models.GerencialObra.subgrupo_1 == subgrupo1,
        models.GerencialObra.subgrupo_2 == subgrupo2,
        models.GerencialObra.subgrupo_3 == subgrupo3
    ).distinct().all()
    
    if not servicos:
        return []  
    
    return [srv.servico for srv in servicos]


@router.get("/descricoes/{codigo_projeto}/{subgrupo1}/{subgrupo2}/{subgrupo3}/{servico}", response_model=List[str])
def listar_descricoes(codigo_projeto: str, subgrupo1: str, subgrupo2: str, subgrupo3: str, servico: str, db: Session = Depends(get_db)):
    descricoes = db.query(models.GerencialObra.descricao).filter(
        models.GerencialObra.codigo_projeto == codigo_projeto,
        models.GerencialObra.subgrupo_1 == subgrupo1,
        models.GerencialObra.subgrupo_2 == subgrupo2,
        models.GerencialObra.subgrupo_3 == subgrupo3,
        models.GerencialObra.servico == servico
    ).distinct().all()
    
    if not descricoes:
        raise HTTPException(status_code=404, detail="Nenhuma descrição encontrada para essa combinação")
    
    return [desc.descricao for desc in descricoes]

@router.get("/unidades/{codigo_projeto}/{subgrupo1}/{subgrupo2}/{subgrupo3}/{servico}/{descricao}", response_model=List[str])
def listar_unidades(
    codigo_projeto: str, subgrupo1: str, subgrupo2: str, subgrupo3: str, servico: str, descricao: str, db: Session = Depends(get_db)
):
    unidades = db.query(models.GerencialObra.unidade_medida).filter(
        models.GerencialObra.codigo_projeto == codigo_projeto,
        models.GerencialObra.subgrupo_1 == subgrupo1,
        models.GerencialObra.subgrupo_2 == subgrupo2,
        models.GerencialObra.subgrupo_3 == subgrupo3,
        models.GerencialObra.servico == servico,
        models.GerencialObra.descricao == descricao
    ).distinct().all()
    
    if not unidades:
        return [] 
    
    return [unidade.unidade_medida for unidade in unidades]

column_mapping = {
    "DATA FECHAMENTO": "data_fechamento",
    "CÓDIGO DO PROJETO": "codigo_projeto",
    "OBRA": "obra",
    "CÓDIGO ESTRUTURADO": "codigo_estruturado",
    "GRUPO": "grupo",
    "SUBGRUPO 1": "subgrupo_1",
    "SUBGRUPO 2": "subgrupo_2",
    "SUBGRUPO 3": "subgrupo_3",
    "SERVIÇO": "servico",
    "DESCRIÇÃO": "descricao",
    "UN. MEDIDA": "unidade_medida",
    "ORÇAMENTO INICIAL QTD": "orcamento_inicial_qtd",
    "ORÇAMENTO INICIAL VALOR": "orcamento_inicial_valor",
    "TENDÊNCIA ANTERIOR QTD": "tendencia_anterior_qtd",
    "TENDÊNCIA ANTERIOR VALOR": "tendencia_anterior_valor",
    "TENDÊNCIA ATUAL QTD": "tendencia_atual_qtd",
    "TENDÊNCIA ATUAL VALOR": "tendencia_atual_valor",
    "TENDÊNCIA ATUAL X ANTERIOR": "tendencia_atual_x_anterior",
    "REALIZADO NO PERÍODO QTD": "realizado_periodo_qtd",
    "REALIZADO NO PERÍODO VALOR": "realizado_periodo_valor",
    "REALIZADO ACUMULADO ATUAL QTD": "realizado_acumulado_qtd",
    "REALIZADO ACUMULADO ATUAL VALOR": "realizado_acumulado_valor",
    "ORDEM DE COMPRA QTD": "ordem_compra_qtd",
    "ORDEM DE COMPRA VALOR": "ordem_compra_valor",
    "SALDO DE CONTRATO QTD": "saldo_contrato_qtd",
    "SALDO DE CONTRATO VALOR": "saldo_contrato_valor",
    "PROJEÇÃO QTD": "projecao_qtd",
    "PROJEÇÃO VALOR": "projecao_valor",
    "EVOLUÇÃO FÍSICA": "evolucao_fisica",
    "À GASTAR QTD": "a_gastar_qtd",
    "À GASTAR VALOR": "a_gastar_valor",
    "TIPO DE PROJEÇÃO": "tipo_projecao",
    "DESVIO QTD": "desvio_qtd",
    "DESVIO VALOR": "desvio_valor",
    "OBSERVAÇÃO": "observacao",
    "TIPO": "tipo"
}

colunas_float = [
    "orcamento_inicial_qtd",
    "orcamento_inicial_valor",
    "tendencia_anterior_qtd",
    "tendencia_anterior_valor",
    "tendencia_atual_qtd",
    "tendencia_atual_valor",
    "tendencia_atual_x_anterior",
    "realizado_periodo_qtd",
    "realizado_periodo_valor",
    "realizado_acumulado_qtd",
    "realizado_acumulado_valor",
    "ordem_compra_qtd",
    "ordem_compra_valor",
    "saldo_contrato_qtd",
    "saldo_contrato_valor",
    "projecao_qtd",
    "projecao_valor",
    "evolucao_fisica",
    "a_gastar_qtd",
    "a_gastar_valor",
    "desvio_qtd",
    "desvio_valor",
]

@router.post("/upload-excel/")
async def upload_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: schemas.UsuarioResponse = Depends(get_current_user)
):
    """
    Faz upload de um arquivo Excel, realiza o delete dos registros existentes
    (filtrados pelo codigo_projeto do usuário logado) e insere os novos dados na tabela GerencialObra.
    """
    try:
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents), engine="openpyxl")

        df.rename(columns=column_mapping, inplace=True)

        if "data_fechamento" in df.columns:
            df["data_fechamento"] = pd.to_datetime(df["data_fechamento"], format="%d/%m/%Y", errors="coerce")
        
        required_columns = set(column_mapping.values())
        missing_columns = required_columns - set(df.columns)
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Colunas ausentes no arquivo: {missing_columns}"
            )

        for coluna in colunas_float:
            if coluna in df.columns:
                df[coluna] = pd.to_numeric(df[coluna], errors="coerce").fillna(0)

        if "tipo_projecao" in df.columns:
            df["tipo_projecao"] = df["tipo_projecao"].astype(str)
        if "observacao" in df.columns:
            df["observacao"] = df["observacao"].astype(str)

        codigo_projeto = current_user.codigo_projeto
        db.query(models.GerencialObra).filter(
            models.GerencialObra.codigo_projeto == codigo_projeto
        ).delete(synchronize_session=False)
        db.commit()

        for _, row in df.iterrows():
            nova_entrada = GerencialObra(**row.to_dict())
            db.add(nova_entrada)

        db.commit()

        return {"message": "Dados inseridos com sucesso!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo: {str(e)}")