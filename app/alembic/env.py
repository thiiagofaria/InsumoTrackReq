import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from alembic import context
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app.database import Base 
from app import models
import urllib.parse

load_dotenv(override=True)

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT", "5432") 

if not all([DB_HOST, DB_USER, DB_PASS, DB_NAME]):
    raise ValueError("ERRO: Algumas variáveis do banco não foram carregadas corretamente!")

DB_PASS_ENCODED = urllib.parse.quote(DB_PASS)

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASS_ENCODED}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
target_metadata = Base.metadata


def run_migrations_offline():
    """Executa migrations no modo offline."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        version_table_schema="public",
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Executa migrations no modo online."""
    with engine.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            compare_type=True 
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
