from fastapi import FastAPI
from app.routes import gerencial, requisicao, empresas, locais_aplicacao, auth, usuarios, obras, status_requisicao, unidades
from fastapi.middleware.cors import CORSMiddleware

import sys
import os

# Garante que o diretório raiz esteja no path do Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI(title="InsumoTrackReq API")

app.include_router(gerencial.router)
app.include_router(requisicao.router)
app.include_router(empresas.router)
app.include_router(locais_aplicacao.router)
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(obras.router)
app.include_router(status_requisicao.router)
app.include_router(unidades.router)

@app.get("/")
def root():
    return {"message": "API InsumoTrackReq está rodando!"}

# Defina quais origens serão permitidas
origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
