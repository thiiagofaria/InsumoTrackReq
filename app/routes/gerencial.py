from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List
import urllib.parse
import pandas as pd
from io import BytesIO

# Importe a função de obtenção da sessão com o banco
from app.database import get_db
from app import models, schemas
from app.models import GerencialObra

router = APIRouter(
    prefix="/gerencial",
    tags=["Gerencial Obra"]
)

# ====================================================
# 1) Listar Obras
# ====================================================
@router.get("/obras/", response_model=List[str])
def listar_obras(db: Session = Depends(get_db)):
    obras = db.query(models.Obra).all()
    if not obras:
        raise HTTPException(status_code=404, detail="Nenhuma obra encontrada")
    # Exemplo: retornando apenas os códigos
    return [obra.codigo for obra in obras]

# ====================================================
# 2) Listar Subgrupo 1 baseado no código de projeto
# ====================================================
@router.get("/subgrupos1/{codigo_projeto}", response_model=List[str])
def listar_subgrupos1(codigo_projeto: str, db: Session = Depends(get_db)):
    subgrupos1 = db.query(models.GerencialObra.subgrupo_1).filter(
        models.GerencialObra.codigo_projeto == codigo_projeto
    ).distinct().all()
    if not subgrupos1:
        raise HTTPException(status_code=404, detail="Nenhum subgrupo 1 encontrado para esse código_projeto")
    return [subgrupo.subgrupo_1 for subgrupo in subgrupos1]

# ====================================================
# 3) Listar Subgrupo 2 baseado no Subgrupo 1 escolhido
# ====================================================
@router.get("/subgrupos2/{codigo_projeto}/{subgrupo1}", response_model=List[str])
def listar_subgrupos2(codigo_projeto: str, subgrupo1: str = Path(..., title="Subgrupo 1"), db: Session = Depends(get_db)):
    subgrupos2 = db.query(models.GerencialObra.subgrupo_2).filter(
        models.GerencialObra.codigo_projeto == codigo_projeto,
        models.GerencialObra.subgrupo_1 == subgrupo1
    ).distinct().all()
    
    if not subgrupos2:
        raise HTTPException(status_code=404, detail="Nenhum subgrupo 2 encontrado para essa combinação")
    
    return [subgrupo.subgrupo_2 for subgrupo in subgrupos2]

# ====================================================
# 4) Listar Subgrupo 3 baseado no Subgrupo 2 escolhido
# ====================================================
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

# ====================================================
# 5) Listar Serviços baseado no Subgrupo 3 escolhido
# ====================================================
@router.get("/servicos/{codigo_projeto}/{subgrupo1}/{subgrupo2}/{subgrupo3}", response_model=List[str])
def listar_servicos(codigo_projeto: str, subgrupo1: str, subgrupo2: str, subgrupo3: str, db: Session = Depends(get_db)):
    servicos = db.query(models.GerencialObra.servico).filter(
        models.GerencialObra.codigo_projeto == codigo_projeto,
        models.GerencialObra.subgrupo_1 == subgrupo1,
        models.GerencialObra.subgrupo_2 == subgrupo2,
        models.GerencialObra.subgrupo_3 == subgrupo3
    ).distinct().all()
    
    if not servicos:
        return []  # retorna lista vazia em vez de erro
    
    return [srv.servico for srv in servicos]

# ====================================================
# 6) Listar Descrições baseadas no Serviço escolhido
# ====================================================
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

# ====================================================
# 7) Listar Unidades de medida
# ====================================================
@router.get("/unidades", response_model=List[str])
def listar_unidades_medida(db: Session = Depends(get_db)):
    unidades = db.query(models.GerencialObra.unidade_medida).distinct().all()
    
    if not unidades:
        raise HTTPException(status_code=404, detail="Nenhuma unidade de medida encontrada")
    
    return [unidade.unidade_medida for unidade in unidades]



# ================================================
#           MAPEAMENTO E UPLOAD DE EXCEL
# ================================================

# Dicionário de rename (nomes originais do Excel -> nomes do modelo)
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

# Lista de colunas numéricas (que devem ser float)
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
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Faz upload de um arquivo Excel, renomeia colunas conforme `column_mapping`
    e insere dados na tabela GerencialObra.
    """
    try:
        # 1️⃣ Ler o arquivo Excel
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents), engine="openpyxl")

        # 2️⃣ Renomear as colunas de acordo com o mapeamento
        df.rename(columns=column_mapping, inplace=True)

        # 3️⃣ Verificar se todas as colunas obrigatórias estão presentes
        #    (usando os valores do mapeamento como 'conjunto final' esperado)
        required_columns = set(column_mapping.values())
        missing_columns = required_columns - set(df.columns)
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Colunas ausentes no arquivo: {missing_columns}"
            )

        # 4️⃣ Converter colunas numéricas para float (substituindo texto/NaN por 0.0)
        for coluna in colunas_float:
            if coluna in df.columns:
                df[coluna] = pd.to_numeric(df[coluna], errors="coerce").fillna(0)

        # 5️⃣ Converter campos de texto se necessário (exemplo: tipo_projecao, observacao)
        if "tipo_projecao" in df.columns:
            df["tipo_projecao"] = df["tipo_projecao"].astype(str)
        if "observacao" in df.columns:
            df["observacao"] = df["observacao"].astype(str)

        # 6️⃣ Inserir no banco de dados
        for _, row in df.iterrows():
            nova_entrada = GerencialObra(**row.to_dict())
            db.add(nova_entrada)

        db.commit()

        return {"message": "Dados inseridos com sucesso!"}

    except Exception as e:
        # Se ocorrer qualquer erro, lançamos 500 com a descrição
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo: {str(e)}")
