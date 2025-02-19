from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Float, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import date, datetime, time
from pytz import timezone

local_tz = timezone("America/Sao_Paulo")


class HistoricoStatusRequisicao(Base):
    __tablename__ = "historico_status_requisicao"

    id = Column(Integer, primary_key=True, index=True)
    requisicao_id = Column(Integer, ForeignKey("requisicoes.id", ondelete="CASCADE"))
    status_id = Column(Integer, ForeignKey("status_requisicao.id", ondelete="CASCADE"))
    data_alteracao = Column(DateTime(timezone=True), default=lambda: datetime.now(local_tz), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    observacao_aprovacao = Column(String(500), nullable=True)

    status = relationship("StatusRequisicao", back_populates="historico_status")


class StatusRequisicao(Base):
    __tablename__ = "status_requisicao"

    id = Column(Integer, primary_key=True, index=True)
    codigo_status = Column(String(20), unique=True, nullable=False)
    descricao = Column(String(50), unique=True, nullable=False)

    requisicoes = relationship("Requisicao", back_populates="status")
    historico_status = relationship("HistoricoStatusRequisicao", back_populates="status")

class GerencialObra(Base):
    __tablename__ = "gerencial_obra"

    id = Column(Integer, primary_key=True, index=True)
    data_fechamento = Column(Date, nullable=False)
    codigo_projeto = Column(String(50), ForeignKey("obras.codigo_projeto", ondelete="CASCADE"), nullable=False)
    obra = Column(String(255), nullable=False)
    codigo_estruturado = Column(String(50), nullable=False)
    grupo = Column(String(255), nullable=False)
    subgrupo_1 = Column(String(255), nullable=False)
    subgrupo_2 = Column(String(255), nullable=False)
    subgrupo_3 = Column(String(255), nullable=False)
    servico = Column(String(255), nullable=False)
    descricao = Column(String(255), nullable=False)
    unidade_medida = Column(String(10), nullable=False)

    # Valores financeiros e quantitativos
    orcamento_inicial_qtd = Column(Float, nullable=False)
    orcamento_inicial_valor = Column(Float, nullable=False)
    tendencia_anterior_qtd = Column(Float, nullable=False)
    tendencia_anterior_valor = Column(Float, nullable=False)
    tendencia_atual_qtd = Column(Float, nullable=False)
    tendencia_atual_valor = Column(Float, nullable=False)
    tendencia_atual_x_anterior = Column(Float, nullable=False)
    realizado_periodo_qtd = Column(Float, nullable=False)
    realizado_periodo_valor = Column(Float, nullable=False)
    realizado_acumulado_qtd = Column(Float, nullable=False)
    realizado_acumulado_valor = Column(Float, nullable=False)
    ordem_compra_qtd = Column(Float, nullable=False)
    ordem_compra_valor = Column(Float, nullable=False)
    saldo_contrato_qtd = Column(Float, nullable=False)
    saldo_contrato_valor = Column(Float, nullable=False)
    projecao_qtd = Column(Float, nullable=False)
    projecao_valor = Column(Float, nullable=False)
    evolucao_fisica = Column(Float, nullable=False)
    a_gastar_qtd = Column(Float, nullable=False)
    a_gastar_valor = Column(Float, nullable=False)
    tipo_projecao = Column(String(50), nullable=False)
    desvio_qtd = Column(Float, nullable=False)
    desvio_valor = Column(Float, nullable=False)
    observacao = Column(String(500), nullable=True)
    tipo = Column(String(50), nullable=False)

class Requisicao(Base):
    __tablename__ = "requisicoes"

    id = Column(Integer, primary_key=True, index=True)
    data_criacao = Column(DateTime(timezone=True), default=lambda: datetime.now(local_tz), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"))
    usuario_aprovador_id = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    codigo_projeto = Column(String(50), ForeignKey("obras.codigo_projeto", ondelete="CASCADE"), nullable=False)
    empresa_id = Column(Integer, ForeignKey("empresas.id", ondelete="CASCADE"))
    status_id = Column(Integer, ForeignKey("status_requisicao.id", ondelete="CASCADE"), nullable=False)
    justificativa = Column(Text, nullable=True)
    data_aprovacao = data_aprovacao = Column(DateTime, nullable=True)
    data_programacao_subida = Column(DateTime, nullable=True)

    # Relacionamentos
    itens = relationship("ItensRequisicao", back_populates="requisicao", cascade="all, delete-orphan")
    empresa = relationship("Empresa", back_populates="requisicoes")
    usuario_criador = relationship("Usuario", back_populates="requisicoes_criadas", foreign_keys=[usuario_id])
    usuario_aprovador_rel = relationship("Usuario", back_populates="requisicoes_aprovadas", foreign_keys=[usuario_aprovador_id])
    status = relationship("StatusRequisicao", back_populates="requisicoes")
    

class ItensRequisicao(Base):
    __tablename__ = "itens_requisicao"

    id = Column(Integer, primary_key=True, index=True)
    requisicao_id = Column(Integer, ForeignKey("requisicoes.id", ondelete="CASCADE"))
    subgrupo_1 = Column(String(255), nullable=False)
    subgrupo_2 = Column(String(255), nullable=False)
    subgrupo_3 = Column(String(255), nullable=False)
    servico = Column(String(255), nullable=False)
    descricao = Column(String(255), nullable=False)
    unidade_medida = Column(String(10), nullable=False)
    quantidade_requisitada = Column(Float, nullable=False)
    local_aplicacao = Column(String(255), nullable=False)

    requisicao = relationship("Requisicao", back_populates="itens", foreign_keys=[requisicao_id])
    baixas = relationship("BaixaItemRequisicao", back_populates="item_requisicao", cascade="all, delete-orphan")

class BaixaItemRequisicao(Base):
    __tablename__ = "baixas_itens_requisicao"

    id = Column(Integer, primary_key=True, index=True)
    requisicao_id = Column(Integer, ForeignKey("requisicoes.id", ondelete="CASCADE"), nullable=False)  # Novo campo
    item_requisicao_id = Column(Integer, ForeignKey("itens_requisicao.id", ondelete="CASCADE"), nullable=False)
    usuario_baixa_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    quantidade_baixada = Column(Float, nullable=False)
    data_baixa = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(local_tz), 
        nullable=False
    )

    item_requisicao = relationship("ItensRequisicao", back_populates="baixas")
    usuario_baixa = relationship("Usuario")

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    cargo = Column(String(100), nullable=True)
    senha_hash = Column(String(255), nullable=False)
    codigo_projeto = Column(String(50), ForeignKey("obras.codigo_projeto", ondelete="SET NULL"))
    ativo = Column(Boolean, default=True)

    # Relacionamentos
    obra = relationship("Obra")
    requisicoes_criadas = relationship("Requisicao", back_populates="usuario_criador", foreign_keys=[Requisicao.usuario_id])
    requisicoes_aprovadas = relationship("Requisicao", back_populates="usuario_aprovador_rel", foreign_keys=[Requisicao.usuario_aprovador_id])


class Obra(Base):
    __tablename__ = "obras"

    codigo_projeto = Column(String, primary_key=True, unique=True, nullable=False)
    nome = Column(String, nullable=False)

    locais_aplicacao = relationship("LocalAplicacao", back_populates="obra")

class LocalAplicacao(Base):
    __tablename__ = "locais_aplicacao"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    codigo_projeto = Column(String, ForeignKey("obras.codigo_projeto", ondelete="CASCADE"))

    obra = relationship("Obra", back_populates="locais_aplicacao")

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(20), unique=True, nullable=True)
    endereco = Column(String(255), nullable=True)
    telefone = Column(String(20), nullable=True)
    tipo_empresa = Column(String(50), nullable=True)

    # Relacionamento com requisições
    requisicoes = relationship("Requisicao", back_populates="empresa")
