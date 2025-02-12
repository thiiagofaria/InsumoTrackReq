from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

hash_no_banco = "$2b$12$4aokhiC4SWlMdSqI/eNG3OblUtkcDqA2bbVzIBjXghGzwM.MaKYTu"
senha_digitada = "minha_senha_segura"  # ou qualquer outra

resultado = pwd_context.verify(senha_digitada, hash_no_banco)
print(resultado)  # True ou False?
