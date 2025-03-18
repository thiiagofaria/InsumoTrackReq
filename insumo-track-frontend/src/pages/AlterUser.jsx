import { useState, useEffect } from "react";
import React from "react";

const API_URL = import.meta.env.VITE_API_URL;

const ManageUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [senha, setSenha] = useState("");
  const [codigoProjeto, setCodigoProjeto] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Estilos semelhantes aos usados no exemplo
  const containerStyle = {
    maxWidth: "900px",
    margin: "30px auto",
    fontFamily: "sans-serif",
  };

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "16px",
    marginBottom: "20px",
  };

  const formRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "12px",
  };

  const labelContainerStyle = {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 200px",
  };

  const inputStyle = {
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "12px",
  };

  const thtdStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "left",
  };

  const removeBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
  };

  const editBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#28a745",
  };

  // Buscar usuários ao carregar o componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios/`);
      if (!response.ok) {
        console.error("Erro ao buscar usuários. Status:", response.status);
        return;
      }
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !email || (!senha && !isEditing)) {
      return alert("Preencha os campos obrigatórios: Nome, Email e Senha.");
    }
    const payload = {
      nome,
      email,
      cargo,
      senha,
      codigo_projeto: codigoProjeto,
    };

    try {
      let response;
      if (isEditing && editingUserId) {
        // Atualiza o usuário
        response = await fetch(`${API_URL}/usuarios/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Cria um novo usuário
        response = await fetch(`${API_URL}/usuarios/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error("Erro: " + JSON.stringify(errorResponse));
      }

      await response.json();
      fetchUsuarios();
      // Limpa o formulário
      setNome("");
      setEmail("");
      setCargo("");
      setSenha("");
      setCodigoProjeto("");
      setIsEditing(false);
      setEditingUserId(null);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      alert(error.message || "Erro ao salvar usuário");
    }
  };

  const handleEdit = (usuario) => {
    setNome(usuario.nome);
    setEmail(usuario.email);
    setCargo(usuario.cargo || "");
    // Em edição, a senha deverá ser reinformada, se necessário
    setSenha("");
    setCodigoProjeto(usuario.codigo_projeto || "");
    setIsEditing(true);
    setEditingUserId(usuario.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente deletar este usuário?")) {
      try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Erro ao deletar usuário.");
        }
        fetchUsuarios();
      } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        alert(error.message || "Erro ao deletar usuário");
      }
    }
  };

  const handleCancelEdit = () => {
    setNome("");
    setEmail("");
    setCargo("");
    setSenha("");
    setCodigoProjeto("");
    setIsEditing(false);
    setEditingUserId(null);
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Gerenciamento de Usuários
      </h1>
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>
          {isEditing ? "Editar Usuário" : "Criar Novo Usuário"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Nome:</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div style={labelContainerStyle}>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Cargo:</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={labelContainerStyle}>
              <label>Código do Projeto:</label>
              <input
                type="text"
                value={codigoProjeto}
                onChange={(e) => setCodigoProjeto(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Senha:</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={inputStyle}
                required={!isEditing}
              />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            {isEditing && (
              <button
                type="button"
                style={{ ...buttonStyle, marginRight: "10px", backgroundColor: "#6c757d" }}
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
            )}
            <button type="submit" style={buttonStyle}>
              {isEditing ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Lista de Usuários</h2>
        {usuarios.length === 0 ? (
          <p style={{ fontStyle: "italic" }}>Nenhum usuário encontrado.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "#fff" }}>
                <th style={thtdStyle}>ID</th>
                <th style={thtdStyle}>Nome</th>
                <th style={thtdStyle}>Email</th>
                <th style={thtdStyle}>Cargo</th>
                <th style={thtdStyle}>Código Projeto</th>
                <th style={thtdStyle}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario, index) => (
                <tr
                  key={usuario.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white",
                  }}
                >
                  <td style={thtdStyle}>{usuario.id}</td>
                  <td style={thtdStyle}>{usuario.nome}</td>
                  <td style={thtdStyle}>{usuario.email}</td>
                  <td style={thtdStyle}>{usuario.cargo}</td>
                  <td style={thtdStyle}>{usuario.codigo_projeto}</td>
                  <td style={thtdStyle}>
                    <button
                      type="button"
                      style={{ ...editBtnStyle, marginRight: "8px" }}
                      onClick={() => handleEdit(usuario)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      style={removeBtnStyle}
                      onClick={() => handleDelete(usuario.id)}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageUsuarios;
