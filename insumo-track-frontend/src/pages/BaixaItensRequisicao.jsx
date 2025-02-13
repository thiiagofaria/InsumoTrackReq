// pages/BaixaItensRequisicao.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const BaixaItensRequisicao = () => {
  const { user } = useAuth();
  const [reqId, setReqId] = useState("");
  const [requisicao, setRequisicao] = useState(null);
  const [baixasInput, setBaixasInput] = useState({}); // { item_id: novaBaixa }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumo, setResumo] = useState(null); // Resumo dos itens baixados

  // Estilos (ajuste conforme sua necessidade)
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

  const thtdStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "left",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    backgroundColor: "#fff",
  };

  // Função para buscar a requisição pelo ID
  const handleBuscar = async () => {
    setLoading(true);
    setError("");
    setRequisicao(null);
    setBaixasInput({});
    setResumo(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/requisicoes/${reqId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Requisição não encontrada");
      }
      const data = await res.json();
      // Somente permitir requisições aprovadas (status 2)
      if (data.status_id !== 2) {
        throw new Error(
          data.status_id === 1
            ? "A requisição está pendente e não pode ser baixada."
            : "A requisição foi reprovada e não pode ser baixada."
        );
      }
      setRequisicao(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcula o total já baixado e o saldo atual para um item
  const calcularBaixasESaldo = (item) => {
    // Soma as quantidades já baixadas a partir do relacionamento "baixas"
    const totalBaixado = item.baixas ? item.baixas.reduce((acc, baixa) => acc + baixa.quantidade_baixada, 0) : 0;
    const saldoAtual = item.quantidade_requisitada - totalBaixado;
    return { totalBaixado, saldoAtual };
  };

  // Atualiza a entrada de baixa para um item
  const handleInputBaixa = (itemId, value, saldoAtual) => {
    const novaBaixa = parseFloat(value);
    // Valida se o valor é um número, maior que zero e não ultrapassa o saldo atual
    if (isNaN(novaBaixa) || novaBaixa < 0) return;
    if (novaBaixa > saldoAtual) {
      alert("A quantidade para baixa não pode ser maior que o saldo atual.");
      return;
    }
    setBaixasInput({ ...baixasInput, [itemId]: novaBaixa });
  };

  // Função para realizar a baixa (envia uma única requisição com todos os itens)
  const handleRealizarBaixa = async () => {
    if (!requisicao) return;
    const payload = requisicao.itens
      .filter((item) => {
        const novaBaixa = baixasInput[item.id];
        return novaBaixa && novaBaixa > 0;
      })
      .map((item) => ({
        requisicao_id: requisicao.id, // Certifique-se de enviar o requisicao_id
        item_requisicao_id: item.id,
        usuario_baixa_id: user.id,
        quantidade_baixada: parseFloat(baixasInput[item.id]),
      }));
  
    if (payload.length === 0) {
      alert("Nenhuma quantidade para baixa foi informada.");
      return;
    }
  
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://127.0.0.1:8000/requisicoes/${requisicao.id}/baixa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao realizar a baixa");
      }
      const result = await res.json();
      setResumo(result); // Armazena o resultado para exibição/impressão
      alert("Baixa realizada com sucesso!");
      // Não resetamos imediatamente os dados, para que o resumo permaneça na tela.
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para cancelar e resetar a tela
  const handleCancelar = () => {
    setReqId("");
    setRequisicao(null);
    setBaixasInput({});
    setError("");
    setResumo(null);
  };

  return (
    <div style={containerStyle}>
      {resumo ? (
        // Se o resumo existir, mostra apenas a área de resumo
        <div style={cardStyle}>
          <h2>Resumo da Baixa</h2>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "#fff", textAlign: "left" }}>
                <th style={thtdStyle}>Material</th>
                <th style={thtdStyle}>Quantidade Baixada</th>
                <th style={thtdStyle}>Data da Baixa</th>
              </tr>
            </thead>
            <tbody>
              {resumo.map((baixa) => {
                const item = requisicao.itens.find((it) => it.id === baixa.item_requisicao_id);
                return (
                  <tr key={baixa.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={thtdStyle}>{item ? item.descricao : "N/A"}</td>
                    <td style={thtdStyle}>{baixa.quantidade_baixada}</td>
                    <td style={thtdStyle}>
                      {new Date(baixa.data_baixa).toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button onClick={() => window.print()} style={{ ...buttonStyle, marginTop: "10px" }}>
            Imprimir Resumo
          </button>
          <button onClick={handleCancelar} style={{ ...buttonStyle, marginTop: "10px", marginLeft: "10px" }}>
            Nova Baixa
          </button>
        </div>
      ) : (
        // Caso não haja resumo, exibe a tela completa para busca e baixa
        <>
          {/* Campo para buscar a requisição */}
          <div style={cardStyle}>
            <div style={formRowStyle}>
              <div style={labelContainerStyle}>
                <label>Número da Requisição:</label>
                <input
                  type="text"
                  value={reqId}
                  onChange={(e) => setReqId(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={labelContainerStyle}>
                <label>&nbsp;</label>
                <button onClick={handleBuscar} style={buttonStyle}>
                  Buscar
                </button>
              </div>
            </div>
            {loading && <p>Carregando...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
  
          {/* Exibe os detalhes da requisição, se encontrada */}
          {requisicao && (
            <div style={cardStyle}>
              <h2>Detalhes da Requisição</h2>
              <p><strong>ID:</strong> {requisicao.id}</p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(requisicao.data_criacao).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </p>
              <p>
                <strong>Usuário Criador:</strong> {requisicao.usuario_criador?.nome || "N/A"}
              </p>
              <p>
                <strong>Empresa:</strong> {requisicao.empresa?.nome || "N/A"}
              </p>
              <p>
                <strong>Observação da Requisição:</strong> {requisicao.justificativa || "N/A"}
              </p>
              <h3>Itens da Requisição</h3>
              {requisicao.itens && requisicao.itens.length > 0 ? (
                <table style={tableStyle}>
                  <thead>
                    <tr style={{ backgroundColor: "#007bff", color: "#fff", textAlign: "left" }}>
                      <th style={thtdStyle}>Grupo de Serviço</th>
                      <th style={thtdStyle}>Material</th>
                      <th style={thtdStyle}>Unidade</th>
                      <th style={{ ...thtdStyle, textAlign: "center" }}>Qtd Requisitada</th>
                      <th style={thtdStyle}>Local de Aplicação</th>
                      <th style={{ ...thtdStyle, textAlign: "center" }}>Total Baixado</th>
                      <th style={{ ...thtdStyle, textAlign: "center" }}>Saldo Atual</th>
                      <th style={{ ...thtdStyle, textAlign: "center" }}>Nova Baixa</th>
                      <th style={{ ...thtdStyle, textAlign: "center" }}>Novo Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requisicao.itens.map((item, index) => {
                      const { totalBaixado, saldoAtual } = calcularBaixasESaldo(item);
                      const novaBaixa = baixasInput[item.id] || 0;
                      const novoSaldo = saldoAtual - novaBaixa;
                      return (
                        <tr
                          key={index}
                          style={{
                            borderBottom: "1px solid #ddd",
                            backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white",
                          }}
                        >
                          <td style={thtdStyle}>{item.subgrupo_2}</td>
                          <td style={thtdStyle}>{item.descricao}</td>
                          <td style={thtdStyle}>{item.unidade_medida}</td>
                          <td style={{ ...thtdStyle, textAlign: "center" }}>{item.quantidade_requisitada}</td>
                          <td style={thtdStyle}>{item.local_aplicacao}</td>
                          <td style={{ ...thtdStyle, textAlign: "center" }}>{totalBaixado}</td>
                          <td style={{ ...thtdStyle, textAlign: "center" }}>{saldoAtual}</td>
                          <td style={{ ...thtdStyle, textAlign: "center" }}>
                            <input
                              type="number"
                              min="0"
                              max={saldoAtual}
                              value={baixasInput[item.id] || ""}
                              onChange={(e) => handleInputBaixa(item.id, e.target.value, saldoAtual)}
                              style={{ ...inputStyle, width: "80px", textAlign: "center" }}
                            />
                          </td>
                          <td style={{ ...thtdStyle, textAlign: "center" }}>{novoSaldo}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p>Nenhum item encontrado.</p>
              )}
  
              <div style={{ marginTop: "20px" }}>
                <button onClick={handleRealizarBaixa} style={{ ...buttonStyle, marginRight: "10px" }}>
                  Realizar Baixa
                </button>
                <button onClick={handleCancelar} style={buttonStyle}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BaixaItensRequisicao;
