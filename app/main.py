from fastapi import FastAPI
from app.routes import gerencial, requisicao, empresas, locais_aplicacao, auth, usuarios, obras  # Importamos os módulos de rota
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="InsumoTrackReq API")

# ✅ Registrar as rotas
app.include_router(gerencial.router)
app.include_router(requisicao.router)
app.include_router(empresas.router) 
app.include_router(locais_aplicacao.router)
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(obras.router)

# ✅ Rota principal (opcional)
@app.get("/")
def root():
    return {"message": "API InsumoTrackReq está rodando!"}


origins = [
    "http://localhost:5173",  # Adicione aqui as origens permitidas
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Permite apenas as origens especificadas
    allow_credentials=True,
    allow_methods=["*"],          # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],          # Permite todos os headers
)
