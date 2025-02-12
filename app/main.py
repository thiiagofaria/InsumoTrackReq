from fastapi import FastAPI
from app.routes import gerencial, requisicao, empresas, locais_aplicacao, auth, usuarios  # Importamos os módulos de rota
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="InsumoTrackReq API")

# ✅ Registrar as rotas
app.include_router(gerencial.router)
app.include_router(requisicao.router)
app.include_router(empresas.router) 
app.include_router(locais_aplicacao.router)
app.include_router(auth.router)
app.include_router(usuarios.router)

# ✅ Rota principal (opcional)
@app.get("/")
def root():
    return {"message": "API InsumoTrackReq está rodando!"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Permitir requisições do frontend
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos os métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permitir todos os cabeçalhos
)
