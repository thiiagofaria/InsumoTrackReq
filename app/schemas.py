from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# 📌 SCHEMA PARA GERENCIAL OBRA
class GerencialObraBase(BaseModel):
    data_fechamento: datetime
    codigo_projeto: str
    obra: str
    codigo_estruturado: str
    grupo: str
    subgrupo_1: str
    subgrupo_2: str
    subgrupo_3: str
    servico: str
    descricao: str
    unidade_medida: str

    orcamento_inicial_qtd: float
    orcamento_inicial_valor: float
    tendencia_anterior_qtd: float
    tendencia_anterior_valor: float
    tendencia_atual_qtd: float
    tendencia_atual_valor: float
    tendencia_atual_x_anterior: float
    realizado_periodo_qtd: float
    realizado_periodo_valor: float
    realizado_acumulado_qtd: float
    realizado_acumulado_valor: float
    ordem_compra_qtd: float
    ordem_compra_valor: float
    saldo_contrato_qtd: float
    saldo_contrato_valor: float
    projecao_qtd: float
    projecao_valor: float
    evolucao_fisica: float
    a_gastar_qtd: float
    a_gastar_valor: float
    tipo_projecao: str
    desvio_qtd: float
    desvio_valor: float
    observacao: Optional[str] = None
    tipo: str

class GerencialObraResponse(GerencialObraBase):
    id: int

    class Config:
        from_attributes = True


# 📌 SCHEMAS PARA REQUISIÇÕES
class RequisicaoBase(BaseModel):
    usuario_id: Optional[int]
    usuario_aprovador_id: Optional[int]
    codigo_projeto: str
    empresa_id: int
    status_id: int
    justificativa: Optional[str]
    data_aprovacao: Optional[datetime]

class RequisicaoResponse(RequisicaoBase):
    id: int
    data_criacao: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


# 📌 SCHEMAS PARA ITENS DA REQUISIÇÃO
class ItensRequisicaoBase(BaseModel):
    subgrupo_1: str = Field(..., min_length=3, max_length=255)
    subgrupo_2: str = Field(..., min_length=3, max_length=255)
    subgrupo_3: str = Field(..., min_length=3, max_length=255)
    servico: str = Field(..., min_length=3, max_length=255)
    descricao: str = Field(..., min_length=3, max_length=255)
    unidade_medida: str = Field(..., min_length=1, max_length=10)
    quantidade_requisitada: float = Field(..., gt=0)  # Não pode ser 0 ou negativo
    local_aplicacao: str = Field(..., min_length=3, max_length=255)

class ItensRequisicaoCreate(ItensRequisicaoBase):
    requisicao_id: int

class ItensRequisicaoResponse(ItensRequisicaoBase):
    id: int
    requisicao_id: int

    class Config:
        from_attributes = True


# 📌 SCHEMAS PARA BAIXA DE ITENS
class BaixaItemRequisicaoBase(BaseModel):
    usuario_baixa_id: int = Field(..., description="ID do usuário que realizou a baixa")
    quantidade_baixada: float = Field(..., gt=0, description="Quantidade de itens baixados")

class BaixaItemRequisicaoCreate(BaixaItemRequisicaoBase):
    item_requisicao_id: int

class BaixaItemRequisicaoResponse(BaixaItemRequisicaoBase):
    id: int
    item_requisicao_id: int
    data_baixa: datetime

    class Config:
        from_attributes = True


# 📌 SCHEMAS PARA USUÁRIOS
class UsuarioBase(BaseModel):
    nome: str
    email: str
    cargo: Optional[str]

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    cargo: Optional[str] = None
    senha: str
    codigo_projeto: Optional[str] = None

class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: str
    codigo_projeto: str
    ativo: bool  # Verifique se este campo existe e se é obrigatório

    class Config:
        from_attributes = True

class RequisicaoCreate(BaseModel):  # 🛠️ Herda diretamente de BaseModel
    usuario_id: int
    codigo_projeto: str
    empresa_id: int
    status_id: int
    justificativa: Optional[str] = None  # Certifique-se que seja realmente opcional


# 📌 SCHEMAS PARA EMPRESAS
class EmpresaBase(BaseModel):
    nome: str
    cnpj: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    tipo_empresa: Optional[str] = None

class EmpresaResponse(EmpresaBase):
    id: int

    class Config:
        from_attributes = True


# 📌 SCHEMAS PARA STATUS DE REQUISIÇÃO
class StatusRequisicaoBase(BaseModel):
    descricao: str

class StatusRequisicaoResponse(StatusRequisicaoBase):
    id: int

    class Config:
        from_attributes = True


# 📌 SCHEMAS PARA HISTÓRICO DE STATUS
class HistoricoStatusRequisicaoBase(BaseModel):
    requisicao_id: int
    status_id: int
    usuario_id: int
    data_alteracao: datetime = Field(default_factory=datetime.utcnow)

class HistoricoStatusRequisicaoCreate(HistoricoStatusRequisicaoBase):
    pass

class HistoricoStatusRequisicaoResponse(HistoricoStatusRequisicaoBase):
    id: int

    class Config:
        from_attributes = True


# 📌 SCHEMAS PARA OBRAS E LOCAIS DE APLICAÇÃO
class ObraBase(BaseModel):
    codigo_projeto: str
    nome: str

class ObraResponse(ObraBase):
    class Config:
        from_attributes = True

class LocalAplicacaoBase(BaseModel):
    nome: str
    codigo_projeto: str

class LocalAplicacaoResponse(LocalAplicacaoBase):
    id: int

    class Config:
        from_attributes = True


# 📌 SCHEMA PARA AUTENTICAÇÃO
class LoginRequest(BaseModel):
    username: str
    password: str
