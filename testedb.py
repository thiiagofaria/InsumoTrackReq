import psycopg2
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv(override=True)

# Obter credenciais
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = int(os.getenv("DB_PORT", 5432)) # Porta padrão do PostgreSQL

print(DB_HOST)
print(DB_USER)
print(DB_PASS)
print(DB_NAME)
print(DB_PORT)  # Porta padrão do PostgreSQL

# Criar conexão manualmente
try:
    conn = psycopg2.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        dbname=DB_NAME,
        port=DB_PORT,
        client_encoding="UTF8"  # 🔹 Define a codificação UTF-8 na conexão
    )
    print("✅ Conexão bem-sucedida!")
    conn.close()
except Exception as e:
    print("❌ Erro na conexão:", e)
