# Usa a imagem base oficial Python 3.11
FROM python:3.11

# Define o diretório de trabalho
WORKDIR /app

# Copia o requirements e instala dependências
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código para dentro do container
COPY . .  

# Definir a variável de ambiente para o Alembic encontrar o alembic.ini
ENV PYTHONPATH="/app"

# Comando para rodar as migrações e subir a API
CMD ["sh", "-c", "cd app && alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"]
