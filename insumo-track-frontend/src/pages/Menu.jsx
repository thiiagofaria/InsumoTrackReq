import React from "react";
import { Link } from "react-router-dom";

const Menu = () => {
  return (
    <div id="root">

      <div className="card">
        <h1>Menu Principal</h1>
        <nav style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
          <Link to="/criar-requisicao">
            <button style={{ padding: "1rem 2rem", fontSize: "1.2rem", cursor: "pointer" }}>
              Criar Requisição
            </button>
          </Link>
          <Link to="/aprovar-requisicao">
            <button style={{ padding: "1rem 2rem", fontSize: "1.2rem", cursor: "pointer" }}>
              Aprovar Requisição
            </button>
          </Link>
          <Link to="/fitrar-requisicoes">
            <button style={{ padding: "1rem 2rem", fontSize: "1.2rem", cursor: "pointer" }}>
              Filtrar Requisições
            </button>
          </Link>
          {/* Adicione outros botões conforme sua necessidade */}
        </nav>
      </div>

      <p className="read-the-docs">
        Consulte a documentação para mais informações.
      </p>
    </div>
  );
};

export default Menu;
