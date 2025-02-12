import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from alembic import context
from app.database import Base  # Importa os modelos para Alembic
from app import models  # Certifique-se de que todos os modelos são carregados
import urllib.parse


# Carregar variáveis de ambiente do .env
load_dotenv(override=True)

# Obter credenciais do banco do .env
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT", "5432")  # Padrão PostgreSQL

# Verificar se todas as variáveis foram carregadas corretamente
if not all([DB_HOST, DB_USER, DB_PASS, DB_NAME]):
    raise ValueError("❌ ERRO: Algumas variáveis do banco não foram carregadas corretamente!")

# Codificar senha para evitar erros com caracteres especiais
DB_PASS_ENCODED = urllib.parse.quote(DB_PASS)

# Construir a URL de conexão
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASS_ENCODED}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Criar conexão com o banco de dados
engine = create_engine(DATABASE_URL)
target_metadata = Base.metadata  # Agora o Alembic sabe quais tabelas criar


def run_migrations_offline():
    """Executa migrations no modo offline."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,  # Permite detectar mudanças no tipo das colunas
        version_table_schema="public",  # Especificando o schema correto
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Executa migrations no modo online."""
    with engine.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            compare_type=True  # Detecta mudanças no tipo das colunas
        )
        with context.begin_transaction():
            context.run_migrations()


# Determina se devemos rodar em modo online ou offline
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
