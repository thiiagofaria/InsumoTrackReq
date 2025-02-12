import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import React from "react";

const CreateRequisicao = () => {
  const { user } = useAuth();
  console.log("Usuário autenticado:", user);

  // ======================
  // 1) Estados gerais
  // ======================

  const [novaRequisicaoCriada, setNovaRequisicaoCriada] = useState(null);
  const [mostrarResumo, setMostrarResumo] = useState(false);

  const [obras, setObras] = useState([]);
  const [obraSelecionada, setObraSelecionada] = useState(user?.codigo_projeto || "");

  const [classificacoes1, setClassificacoes1] = useState([]);
  const [classificacao1Selecionada, setClassificacao1Selecionada] = useState("");

  const [classificacoes2, setClassificacoes2] = useState([]);
  const [classificacao2Selecionada, setClassificacao2Selecionada] = useState("");

  const [classificacoes3, setClassificacoes3] = useState([]);
  const [classificacao3Selecionada, setClassificacao3Selecionada] = useState("");

  const [servicos, setServicos] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState("");

  const [descricoes, setDescricoes] = useState([]);
  const [descricaoSelecionada, setDescricaoSelecionada] = useState("");

  const [unidades, setUnidades] = useState([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState("");

  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");

  const [locais, setLocais] = useState([]);
  const [localSelecionado, setLocalSelecionado] = useState("");

  const [quantidade, setQuantidade] = useState("");

  // ===============================
  // 2) Estado para itens adicionados
  // ===============================
  const [itens, setItens] = useState([]);

  // ===============================
  // 3) Estado para dados da requisição
  // ===============================
  const [justificativa, setJustificativa] = useState("");

  // ======================
  // Constantes fixas
  // ======================
  const usuarioId = user?.id || null;
  const statusId = 1; // 1 = pendente
  const codigoProjetoPadrao = user?.codigo_projeto || "";


  // ------------------------------
  // Estilos em linha (exemplo)
  // ------------------------------
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

  // ========================================================
  // A) Efeitos para buscar dados (Obras, Classificações etc.)
  // ========================================================

  // 2) Buscar subgrupos1
  useEffect(() => {
    if (!obraSelecionada) return;
    fetch(`http://127.0.0.1:8000/gerencial/subgrupos1/${obraSelecionada}`)
      .then((res) => {
        if (!res.ok) {
          console.warn("Não encontrou subgrupos1. Status:", res.status);
          setClassificacoes1([]);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setClassificacoes1(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar subgrupos1:", err);
        setClassificacoes1([]);
      });
  }, [obraSelecionada]);

  // 3) Buscar subgrupos2
  useEffect(() => {
    if (!classificacao1Selecionada) return;
    fetch(`http://127.0.0.1:8000/gerencial/subgrupos2/${obraSelecionada}/${classificacao1Selecionada}`)
      .then((res) => {
        if (!res.ok) {
          console.warn("Não encontrou subgrupos2. Status:", res.status);
          setClassificacoes2([]);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setClassificacoes2(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar subgrupos2:", err);
        setClassificacoes2([]);
      });
  }, [classificacao1Selecionada, obraSelecionada]);

  // 4) Buscar subgrupos3
  useEffect(() => {
    if (!classificacao2Selecionada) return;
    fetch(`http://127.0.0.1:8000/gerencial/subgrupos3/${obraSelecionada}/${classificacao1Selecionada}/${classificacao2Selecionada}`)
      .then((res) => {
        if (!res.ok) {
          console.warn("Não encontrou subgrupos3. Status:", res.status);
          setClassificacoes3([]);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setClassificacoes3(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar subgrupos3:", err);
        setClassificacoes3([]);
      });
  }, [classificacao2Selecionada, classificacao1Selecionada, obraSelecionada]);

  // 5) Buscar serviços
  useEffect(() => {
    if (!classificacao3Selecionada) return;
    fetch(`http://127.0.0.1:8000/gerencial/servicos/${obraSelecionada}/${classificacao1Selecionada}/${classificacao2Selecionada}/${classificacao3Selecionada}`)
      .then((res) => {
        if (!res.ok) {
          console.warn("Não encontrou serviços. Status:", res.status);
          setServicos([]);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setServicos(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar serviços:", err);
        setServicos([]);
      });
  }, [classificacao3Selecionada, classificacao2Selecionada, classificacao1Selecionada, obraSelecionada]);

  // 6) Buscar descrições
  useEffect(() => {
    if (!servicoSelecionado) return;
    fetch(`http://127.0.0.1:8000/gerencial/descricoes/${obraSelecionada}/${classificacao1Selecionada}/${classificacao2Selecionada}/${classificacao3Selecionada}/${servicoSelecionado}`)
      .then((res) => {
        if (!res.ok) {
          console.warn("Não encontrou descrições. Status:", res.status);
          setDescricoes([]);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setDescricoes(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar descrições:", err);
        setDescricoes([]);
      });
  }, [servicoSelecionado, classificacao3Selecionada, classificacao2Selecionada, classificacao1Selecionada, obraSelecionada]);

  // 7) Buscar unidades
  useEffect(() => {
    fetch("http://127.0.0.1:8000/gerencial/unidades")
      .then((res) => {
        if (!res.ok) {
          console.warn("Erro ao buscar unidades. Status:", res.status);
          setUnidades([]);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUnidades(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar unidades:", err);
        setUnidades([]);
      });
  }, []);

  // 8) Buscar empresas
  useEffect(() => {
    fetch("http://127.0.0.1:8000/empresas/")
      .then((res) => {
        if (!res.ok) {
          console.warn("Erro ao buscar empresas. Status:", res.status);
          setEmpresas([]);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setEmpresas(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar empresas:", err);
        setEmpresas([]);
      });
  }, []);

  // 9) Buscar locais de aplicação
  useEffect(() => {
    fetch("http://127.0.0.1:8000/locais-aplicacao/")
      .then((res) => {
        if (!res.ok) {
          console.warn("Erro ao buscar locais. Status:", res.status);
          setLocais([]);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setLocais(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar locais:", err);
        setLocais([]);
      });
  }, []);

  // ========================================================
  // B) Função para adicionar item
  // ========================================================
  const handleAddItem = (e) => {
    e.preventDefault();
    const novoItem = {
      subgrupo_1: classificacao1Selecionada,
      subgrupo_2: classificacao2Selecionada,
      subgrupo_3: classificacao3Selecionada,
      servico: servicoSelecionado,
      descricao: descricaoSelecionada,
      unidade_medida: unidadeSelecionada,
      quantidade_requisitada: parseFloat(quantidade),
      local_aplicacao: localSelecionado,
    };

    if (!novoItem.subgrupo_1 || novoItem.subgrupo_1.length < 3) {
      return alert("Classificação 1 deve ter pelo menos 3 caracteres.");
    }
    if (!novoItem.subgrupo_2 || novoItem.subgrupo_2.length < 3) {
      return alert("Classificação 2 deve ter pelo menos 3 caracteres.");
    }
    if (!novoItem.subgrupo_3 || novoItem.subgrupo_3.length < 3) {
      return alert("Classificação 3 deve ter pelo menos 3 caracteres.");
    }
    if (!novoItem.servico || novoItem.servico.length < 3) {
      return alert("Serviço deve ter pelo menos 3 caracteres.");
    }
    if (!novoItem.descricao || novoItem.descricao.length < 3) {
      return alert("Descrição deve ter pelo menos 3 caracteres.");
    }
    if (!novoItem.local_aplicacao || novoItem.local_aplicacao.length < 3) {
      return alert("Local de aplicação deve ter pelo menos 3 caracteres.");
    }
    if (!novoItem.unidade_medida) {
      return alert("Selecione a unidade de medida.");
    }
    if (!novoItem.quantidade_requisitada || novoItem.quantidade_requisitada <= 0) {
      return alert("Quantidade deve ser maior que 0.");
    }

    setItens([...itens, novoItem]);
    setClassificacao1Selecionada("");
    setClassificacao2Selecionada("");
    setClassificacao3Selecionada("");
    setServicoSelecionado("");
    setDescricaoSelecionada("");
    setUnidadeSelecionada("");
    setQuantidade("");
    setLocalSelecionado("");
  };

  // ========================================================
  // C) Remover item
  // ========================================================
  const handleRemoveItem = (index) => {
    const listaAtualizada = [...itens];
    listaAtualizada.splice(index, 1);
    setItens(listaAtualizada);
  };

  // ========================================================
  // D) Criar a requisição e inserir itens
  // ========================================================

  const handleCreateRequisicao = async (e) => {
    e.preventDefault();
  
    if (itens.length === 0) {
      return alert("Adicione pelo menos um item antes de criar a requisição.");
    }
  
    const requisicaoPayload = {
      usuario_id: usuarioId,
      codigo_projeto: codigoProjetoPadrao,
      empresa_id: parseInt(empresaSelecionada) || 0,
      status_id: statusId,
      justificativa: justificativa || "",
    };
  
    try {
      const response = await fetch("http://127.0.0.1:8000/requisicoes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requisicaoPayload),
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error("Erro ao criar a requisição: " + JSON.stringify(errorResponse));
      }
  
      const novaRequisicao = await response.json();
      console.log(`✅ Requisição criada com sucesso! ID: ${novaRequisicao.id}`);
  
      const itensPayload = itens.map((item) => ({
        requisicao_id: novaRequisicao.id,
        ...item,
      }));
  
      await fetch(`http://127.0.0.1:8000/requisicoes/${novaRequisicao.id}/itens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itensPayload),
      });
  
      // 📌 Armazena os dados da requisição criada
      setNovaRequisicaoCriada({
        id: novaRequisicao.id,
        empresa: empresas.find((emp) => emp.id === parseInt(empresaSelecionada))?.nome || "Não informado",
        justificativa,
        itens,
      });
  
      // 📌 Pergunta ao usuário se deseja imprimir
      const desejaImprimir = window.confirm("Requisição criada com sucesso! Deseja imprimir?");
      setMostrarResumo(desejaImprimir);
  
      if (!desejaImprimir) {
        setItens([]); 
        setJustificativa(""); 
        setEmpresaSelecionada(""); 
      }
  
    } catch (error) {
      console.error("❌ Erro ao criar requisição:", error);
      alert(error.message || "Erro ao criar a requisição");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNovaRequisicao = () => {
    setItens([]);
    setJustificativa("");
    setEmpresaSelecionada("");
    setNovaRequisicaoCriada(null);
    setMostrarResumo(false); // 🔥 Importante: Isso faz voltar para o formulário!
  };
  
  

  // ========================================================
  // E) Renderização
  // ========================================================
  if (mostrarResumo) {
    return (
      <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "Arial, sans-serif", padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "10px" }}>Resumo da Requisição</h1>
  
        <div style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}>
          <p><strong>ID:</strong> {novaRequisicaoCriada?.id}</p>
          <p><strong>Empresa:</strong> {novaRequisicaoCriada?.empresa}</p>
          <p><strong>Justificativa:</strong> {novaRequisicaoCriada?.justificativa}</p>
  
          <h3 style={{ marginTop: "20px", borderBottom: "2px solid #ccc", paddingBottom: "5px" }}>Itens Requisitados</h3>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
            backgroundColor: "#fff"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "#fff", textAlign: "left" }}>
                <th style={thtdStyle}>Subgrupo 1</th>
                <th style={thtdStyle}>Subgrupo 2</th>
                <th style={thtdStyle}>Subgrupo 3</th>
                <th style={thtdStyle}>Serviço</th>
                <th style={thtdStyle}>Descrição</th>
                <th style={{ ...thtdStyle, textAlign: "center" }}>Quantidade</th>
                <th style={{ ...thtdStyle, textAlign: "center" }}>Unidade</th>
                <th style={thtdStyle}>Local de Aplicação</th>
              </tr>
            </thead>
            <tbody>
              {novaRequisicaoCriada?.itens.map((item, index) => (
                <tr key={index} style={{
                  borderBottom: "1px solid #ddd",
                  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white",
                }}>
                  <td style={thtdStyle}>{item.subgrupo_1}</td>
                  <td style={thtdStyle}>{item.subgrupo_2}</td>
                  <td style={thtdStyle}>{item.subgrupo_3}</td>
                  <td style={thtdStyle}>{item.servico}</td>
                  <td style={thtdStyle}>{item.descricao}</td>
                  <td style={{ ...thtdStyle, textAlign: "center" }}>{item.quantidade_requisitada}</td>
                  <td style={{ ...thtdStyle, textAlign: "center" }}>{item.unidade_medida}</td>
                  <td style={thtdStyle}>{item.local_aplicacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
  
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button style={{ ...buttonStyle, marginRight: "10px" }} onClick={handlePrint}>
              🖨️ Imprimir
            </button>
            <button style={buttonStyle} onClick={handleNovaRequisicao}>
              ➕ Nova Requisição
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  
  
  // Aqui continua o return original do formulário
  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Nova Requisição</h1>
      
      {/* 1) Form para adicionar itens */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Adicionar Item</h2>
        <form onSubmit={handleAddItem}>
          <div style={formRowStyle}>
  
            <div style={labelContainerStyle}>
              <label>Classif. 1:</label>
              <select
                value={classificacao1Selecionada}
                onChange={(e) => setClassificacao1Selecionada(e.target.value)}
                style={inputStyle}
              >
                <option value="">Selecione...</option>
                {classificacoes1.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
  
            <div style={labelContainerStyle}>
              <label>Classif. 2:</label>
              <select
                value={classificacao2Selecionada}
                onChange={(e) => setClassificacao2Selecionada(e.target.value)}
                style={inputStyle}
                disabled={!classificacao1Selecionada}
              >
                <option value="">Selecione...</option>
                {classificacoes2.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
  
            <div style={labelContainerStyle}>
              <label>Classif. 3:</label>
              <select
                value={classificacao3Selecionada}
                onChange={(e) => setClassificacao3Selecionada(e.target.value)}
                style={inputStyle}
                disabled={!classificacao2Selecionada}
              >
                <option value="">Selecione...</option>
                {classificacoes3.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
  
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Serviço:</label>
              <select
                value={servicoSelecionado}
                onChange={(e) => setServicoSelecionado(e.target.value)}
                style={inputStyle}
                disabled={!classificacao3Selecionada}
              >
                <option value="">Selecione...</option>
                {servicos.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>
  
            <div style={labelContainerStyle}>
              <label>Descrição:</label>
              <select
                value={descricaoSelecionada}
                onChange={(e) => setDescricaoSelecionada(e.target.value)}
                style={inputStyle}
                disabled={!servicoSelecionado}
              >
                <option value="">Selecione...</option>
                {descricoes.map((desc) => (
                  <option key={desc} value={desc}>
                    {desc}
                  </option>
                ))}
              </select>
            </div>
  
            <div style={labelContainerStyle}>
              <label>Unidade:</label>
              <select
                value={unidadeSelecionada}
                onChange={(e) => setUnidadeSelecionada(e.target.value)}
                style={inputStyle}
              >
                <option value="">Selecione...</option>
                {unidades.map((un, idx) => (
                  <option key={idx} value={un}>
                    {un}
                  </option>
                ))}
              </select>
            </div>
  
            <div style={labelContainerStyle}>
              <label>Quantidade:</label>
              <input
                type="number"
                step="any"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
  
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Local Aplicação:</label>
              <select
                value={localSelecionado}
                onChange={(e) => setLocalSelecionado(e.target.value)}
                style={inputStyle}
              >
                <option value="">Selecione...</option>
                {locais.map((loc) => (
                  <option key={loc.id} value={loc.nome}>
                    {loc.nome}
                  </option>
                ))}
              </select>
            </div>
  
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" style={buttonStyle}>
                Adicionar Item
              </button>
            </div>
          </div>
        </form>
      </div>
  
      {/* 2) Tabela de ITENS adicionados */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Itens Adicionados</h3>
        {itens.length === 0 ? (
          <p style={{ fontStyle: "italic" }}>Nenhum item adicionado ainda.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thtdStyle}>Subgrupo1</th>
                <th style={thtdStyle}>Subgrupo2</th>
                <th style={thtdStyle}>Subgrupo3</th>
                <th style={thtdStyle}>Serviço</th>
                <th style={thtdStyle}>Descrição</th>
                <th style={thtdStyle}>Unidade</th>
                <th style={thtdStyle}>Quantidade</th>
                <th style={thtdStyle}>Local</th>
                <th style={thtdStyle}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, index) => (
                <tr key={index}>
                  <td style={thtdStyle}>{item.subgrupo_1}</td>
                  <td style={thtdStyle}>{item.subgrupo_2}</td>
                  <td style={thtdStyle}>{item.subgrupo_3}</td>
                  <td style={thtdStyle}>{item.servico}</td>
                  <td style={thtdStyle}>{item.descricao}</td>
                  <td style={thtdStyle}>{item.unidade_medida}</td>
                  <td style={thtdStyle}>{item.quantidade_requisitada}</td>
                  <td style={thtdStyle}>{item.local_aplicacao}</td>
                  <td style={thtdStyle}>
                    <button type="button" style={removeBtnStyle} onClick={() => handleRemoveItem(index)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
        {/* 3) Form de criação da requisição */}
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Dados da Requisição</h2>
            <form onSubmit={handleCreateRequisicao}>
              <div style={formRowStyle}>
                <div style={labelContainerStyle}>
                  <label>Empresa:</label>
                  <select
                    value={empresaSelecionada}
                    onChange={(e) => setEmpresaSelecionada(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Selecione...</option>
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={labelContainerStyle}>
                  <label>Justificativa:</label>
                  <textarea
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    rows={3}
                    style={inputStyle}
                  />
                </div>
    </div>

    <button type="submit" style={buttonStyle}>
      Criar Requisição Completa
    </button>
  </form>
</div>


    </div>
  );
}

  export default CreateRequisicao;
