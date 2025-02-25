import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import React from "react";

const API_URL = import.meta.env.VITE_API_URL; // Pega do .env


const CreateRequisicao = () => {
  const { user } = useAuth();
  console.log("Usuário autenticado:", user);

  // ======================
  // Estados Gerais
  // ======================
  const [dataProgramacaoSubida, setDataProgramacaoSubida] = useState("");

  const [nomeObra, setNomeObra] = useState("");
  const [novaRequisicaoCriada, setNovaRequisicaoCriada] = useState(null);
  const [mostrarResumo, setMostrarResumo] = useState(false);

  // Obra selecionada (fixado com o código do projeto do usuário)
  const [obraSelecionada, setObraSelecionada] = useState(user?.codigo_projeto || "");
  
  // Valor fixo para Classif. 1 (não exibido)
  const classificacaoFixa = "CUSTOS DIRETOS DA OBRA";

  // Seção Classificação
  const [classificacoes2, setClassificacoes2] = useState([]); // "Selecione o grupo de serviço"
  const [classificacao2Selecionada, setClassificacao2Selecionada] = useState("");
  
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");
  
  const [locais, setLocais] = useState([]);
  const [localSelecionado, setLocalSelecionado] = useState("");
  
  // Campo Observação (antigo Justificativa)
  const [justificativa, setJustificativa] = useState("");

  const [unidades, setUnidades] = useState([]);

  // Flag para confirmar (travar) a seção de Classificação
  const [classificacaoConfirmada, setClassificacaoConfirmada] = useState(false);

  // Seção Itens
  // "Materiais" serão buscados com base no grupo de serviço (Classif.2)
  // Cada material é representado como objeto: { descricao, subgrupo3, servico }
  const [materiais, setMateriais] = useState([]);
  // O valor selecionado será armazenado como string JSON (para transportar o objeto)
  const [materialSelecionado, setMaterialSelecionado] = useState("");
  const [unidadeSelecionada, setUnidadeSelecionada] = useState("");
  const [quantidade, setQuantidade] = useState("");
  
  // Lista de itens adicionados
  const [itens, setItens] = useState([]);

  // Constantes fixas para requisição
  const usuarioId = user?.id || null;
  const statusId = 1; // 1 = pendente
  const codigoProjetoPadrao = user?.codigo_projeto || "";

  // ------------------------------
  // Estilos em linha (mesmo padrão)
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
  // Efeitos para buscar dados
  // ========================================================

  // Buscar dados da obra
  useEffect(() => {
    if (!obraSelecionada) return;
    fetch(`${API_URL}/obras/${obraSelecionada}`)
      .then((res) => {
        if (!res.ok) {
          console.warn("Não encontrou a obra. Status:", res.status);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setNomeObra(data.nome);
      })
      .catch((err) => {
        console.error("Erro ao buscar a obra:", err);
        setNomeObra("Erro ao carregar");
      });
  }, [obraSelecionada]);

  // Buscar "Selecione o grupo de serviço" (antigo subgrupos2) – usando Classif.1 fixa
  useEffect(() => {
    if (!obraSelecionada) return;
    fetch(`${API_URL}/gerencial/subgrupos2/${obraSelecionada}/${classificacaoFixa}`)
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
  }, [obraSelecionada, classificacaoFixa]);

  // Buscar empresas
  useEffect(() => {
    fetch(`${API_URL}/empresas/`)
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

  // Buscar locais de aplicação
  useEffect(() => {
    fetch(`${API_URL}/locais-aplicacao/`)
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

  // Quando a seção de Classificação for confirmada e houver um grupo de serviço selecionado,
  // buscar a lista de materiais utilizando Promise.all para executar as requisições em paralelo.
  useEffect(() => {
    if (classificacaoConfirmada && classificacao2Selecionada) {
      async function fetchMateriais() {
        try {
          // Buscar subgrupos3 para a obra com Classif.1 fixa e o grupo selecionado
          const resSubgrupo3 = await fetch(
            `${API_URL}/gerencial/subgrupos3/${obraSelecionada}/${classificacaoFixa}/${classificacao2Selecionada}`
          );
          if (!resSubgrupo3.ok) {
            setMateriais([]);
            return;
          }
          const subgrupos3 = await resSubgrupo3.json();
          // Para cada subgrupo3, buscar os serviços em paralelo
          const subgrupoPromises = subgrupos3.map(async (subgrupo3) => {
            const resServicos = await fetch(
              `${API_URL}/gerencial/servicos/${obraSelecionada}/${classificacaoFixa}/${classificacao2Selecionada}/${subgrupo3}`
            );
            if (!resServicos.ok) return [];
            const servicos = await resServicos.json();
            // Para cada serviço, buscar as descrições em paralelo
            const servicePromises = servicos.map(async (servico) => {
              const resDescricoes = await fetch(
                `${API_URL}/gerencial/descricoes/${obraSelecionada}/${classificacaoFixa}/${classificacao2Selecionada}/${subgrupo3}/${servico}`
              );
              if (!resDescricoes.ok) return [];
              const descricoes = await resDescricoes.json();
              // Retorna um array de objetos para cada descrição
              return descricoes.map((descricao) => ({ descricao, subgrupo3, servico }));
            });
            const resultados = await Promise.all(servicePromises);
            return resultados.flat();
          });
          const materialsArrays = await Promise.all(subgrupoPromises);
          const materialList = materialsArrays.flat();
          // Remover duplicatas
          const uniqueMaterials = Array.from(
            new Set(materialList.map((m) => JSON.stringify(m)))
          ).map((str) => JSON.parse(str));
          setMateriais(uniqueMaterials);
        } catch (error) {
          console.error("Erro ao buscar materiais:", error);
          setMateriais([]);
        }
      }
      fetchMateriais();
    }
  }, [classificacaoConfirmada, classificacao2Selecionada, obraSelecionada, classificacaoFixa]);


  useEffect(() => {
    fetch(`${API_URL}/unidades/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Dados recebidos:", data);
        if (Array.isArray(data)) {
          setUnidades(data);
        } else {
          console.warn("Dados não são um array:", data);
          setUnidades([]);
        }
      })
      .catch((err) => console.error("Erro ao buscar unidades:", err));
  }, []);
  

  // ========================================================
  // Funções de Manipulação
  // ========================================================

  // Confirma a seção de Classificação (trava os campos e libera a próxima seção)
  const handleConfirmClassificacao = (e) => {
    e.preventDefault();
    if (!classificacao2Selecionada || classificacao2Selecionada.length < 3) {
      return alert("Selecione o grupo de serviço com pelo menos 3 caracteres.");
    }
    if (!empresaSelecionada) {
      return alert("Selecione a empresa.");
    }
    if (!localSelecionado || localSelecionado.length < 3) {
      return alert("Local de aplicação deve ter pelo menos 3 caracteres.");
    }
    setClassificacaoConfirmada(true);
  };

  // Volta para a seção de Classificação (limpa os itens adicionados)
  const handleVoltarClassificacao = () => {
    if (window.confirm("Ao voltar, os itens adicionados serão perdidos. Deseja continuar?")) {
      setClassificacaoConfirmada(false);
      setClassificacao2Selecionada("");
      setEmpresaSelecionada("");
      setLocalSelecionado("");
      setJustificativa("");
      setItens([]);
      setMaterialSelecionado("");
      setUnidadeSelecionada("");
      setQuantidade("");
    }
  };

  // Adiciona um item na seção Itens
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!materialSelecionado) {
      return alert("Selecione um material.");
    }
    let materialObj;
    try {
      materialObj = JSON.parse(materialSelecionado);
    } catch (e) {
      return alert("Erro ao processar o material selecionado.");
    }
    const novoItem = {
      subgrupo_1: classificacaoFixa,
      subgrupo_2: classificacao2Selecionada, // Grupo de Serviço
      subgrupo_3: materialObj.subgrupo3,
      servico: materialObj.servico,
      descricao: materialObj.descricao, // Material
      unidade_medida: unidadeSelecionada,
      quantidade_requisitada: parseFloat(quantidade),
      local_aplicacao: localSelecionado, // vem da seção de Classificação
    };

    if (!novoItem.descricao || novoItem.descricao.length < 3) {
      return alert("Selecione o material (descrição com pelo menos 3 caracteres).");
    }
    if (!novoItem.unidade_medida) {
      return alert("Selecione a unidade.");
    }
    if (!novoItem.quantidade_requisitada || novoItem.quantidade_requisitada <= 0) {
      return alert("Quantidade deve ser maior que 0.");
    }

    setItens([...itens, novoItem]);
    // Limpa os campos da seção Itens para nova adição
    setMaterialSelecionado("");
    setUnidadeSelecionada("");
    setQuantidade("");
  };

  // Remove item adicionado
  const handleRemoveItem = (index) => {
    const listaAtualizada = [...itens];
    listaAtualizada.splice(index, 1);
    setItens(listaAtualizada);
  };

  // Cria a requisição e insere os itens
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
      data_programacao_subida: dataProgramacaoSubida,
    };

    try {
      const response = await fetch(`${API_URL}/requisicoes/`, {
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

      await fetch(`${API_URL}/requisicoes/${novaRequisicao.id}/itens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itensPayload),
      });

      // Incluindo data_criacao na requisição criada
      setNovaRequisicaoCriada({
        id: novaRequisicao.id,
        data_criacao: novaRequisicao.data_criacao,
        empresa:
          empresas.find((emp) => emp.id === parseInt(empresaSelecionada))?.nome ||
          "Não informado",
        justificativa,
        itens,
      });

      const desejaImprimir = window.confirm("Requisição criada com sucesso! Deseja imprimir?");
      setMostrarResumo(desejaImprimir);

      if (!desejaImprimir) {
        // Reset geral: todos os campos voltam ao valor inicial (dropdowns mostram "Selecione...")
        setClassificacaoConfirmada(false);
        setClassificacao2Selecionada("");
        setEmpresaSelecionada("");
        setLocalSelecionado("");
        setJustificativa("");
        setMateriais([]);
        setMaterialSelecionado("");
        setUnidadeSelecionada("");
        setQuantidade("");
        setItens([]);
      }
    } catch (error) {
      console.error("❌ Erro ao criar requisição:", error);
      alert(error.message || "Erro ao criar a requisição");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Ao selecionar "Nova Requisição" no resumo, todos os campos serão resetados para o estado inicial.
  const handleNovaRequisicao = () => {
    setClassificacaoConfirmada(false);
    setClassificacao2Selecionada("");
    setEmpresaSelecionada("");
    setLocalSelecionado("");
    setJustificativa("");
    setMateriais([]);
    setMaterialSelecionado("");
    setUnidadeSelecionada("");
    setQuantidade("");
    setItens([]);
    setNovaRequisicaoCriada(null);
    setMostrarResumo(false);
  };

  // ========================================================
  // Renderização
  // ========================================================

  // Página de resumo para impressão
  if (mostrarResumo) {
    return (
      <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "Arial, sans-serif", padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "10px" }}>Resumo da Requisição</h1>
        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <p><strong>ID:</strong> {novaRequisicaoCriada?.id}</p>
          <p>
            <strong>Data da Requisição:</strong>{" "}
            {novaRequisicaoCriada?.data_criacao
              ? new Date(novaRequisicaoCriada.data_criacao).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
              : ""}
          </p>
          <p><strong>Usuário Criador:</strong> {user?.nome}</p>
          <p><strong>Obra:</strong> {nomeObra}</p>
          <p><strong>Empresa:</strong> {novaRequisicaoCriada?.empresa}</p>
          <p><strong>Observação:</strong> {novaRequisicaoCriada?.justificativa}</p>
          <h3 style={{ marginTop: "20px", borderBottom: "2px solid #ccc", paddingBottom: "5px" }}>
            Itens Requisitados
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", backgroundColor: "#fff" }}>
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "#fff", textAlign: "left" }}>
                <th style={thtdStyle}>Grupo de Serviço</th>
                <th style={thtdStyle}>Material</th>
                <th style={thtdStyle}>Unidade</th>
                <th style={{ ...thtdStyle, textAlign: "center" }}>Quantidade</th>
                <th style={thtdStyle}>Local de Aplicação</th>
              </tr>
            </thead>
            <tbody>
              {novaRequisicaoCriada?.itens.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ddd", backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white" }}>
                  <td style={thtdStyle}>{item.subgrupo_2}</td>
                  <td style={thtdStyle}>{item.descricao}</td>
                  <td style={thtdStyle}>{item.unidade_medida}</td>
                  <td style={{ ...thtdStyle, textAlign: "center" }}>{item.quantidade_requisitada}</td>
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

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Nova Requisição {nomeObra ? `- ${nomeObra}` : ""}
      </h1>

      {/* Seção Classificação */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Classificação</h2>
        <form onSubmit={handleConfirmClassificacao}>
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Selecione o grupo de serviço:</label>
              <select
                value={classificacao2Selecionada}
                onChange={(e) => setClassificacao2Selecionada(e.target.value)}
                style={inputStyle}
                disabled={classificacaoConfirmada}
              >
                <option value="">Selecione...</option>
                {classificacoes2.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Empresa:</label>
              <select
                value={empresaSelecionada}
                onChange={(e) => setEmpresaSelecionada(e.target.value)}
                style={inputStyle}
                disabled={classificacaoConfirmada}
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
              <label>Local Aplicação:</label>
              <select
                value={localSelecionado}
                onChange={(e) => setLocalSelecionado(e.target.value)}
                style={inputStyle}
                disabled={classificacaoConfirmada}
              >
                <option value="">Selecione...</option>
                {locais.map((loc) => (
                  <option key={loc.id} value={loc.nome}>
                    {loc.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={formRowStyle}>
            <div style={labelContainerStyle}>
              <label>Observação:</label>
              <textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                rows={3}
                style={inputStyle}
                disabled={classificacaoConfirmada}
              />
            </div>
          </div>
          <div style={{ ...labelContainerStyle, marginBottom: "16px" }}>
            <label>Data programação pré-carga:</label>
            <input
              type="date"
              value={dataProgramacaoSubida}
              onChange={(e) => setDataProgramacaoSubida(e.target.value)}
              style={inputStyle}
              required
              min={new Date().toISOString().split("T")[0]} // Apenas datas de hoje pra frente
              disabled={classificacaoConfirmada} // <-- Adicionado para travar o campo
            />
          </div>
          {/* Apenas o botão Confirmar nesta seção */}
          {!classificacaoConfirmada && (
            <div style={{ textAlign: "right" }}>
              <button type="submit" style={buttonStyle}>
                Confirmar
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Seção Itens – só é exibida se a classificação estiver confirmada */}
      {classificacaoConfirmada && (
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Itens</h2>
          {/* Botão Voltar para retornar à seção de Classificação */}
          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <button type="button" style={buttonStyle} onClick={handleVoltarClassificacao}>
              Voltar
            </button>
          </div>
          <form onSubmit={handleAddItem}>
            <div style={formRowStyle}>
              <div style={labelContainerStyle}>
                <label>Selecione o Material:</label>
                <select
                  value={materialSelecionado}
                  onChange={(e) => setMaterialSelecionado(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Selecione...</option>
                  {materiais.map((mat, index) => (
                    <option key={index} value={JSON.stringify(mat)}>
                      {mat.descricao}
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
                  {unidades.map((uni) => (
                    <option key={uni.id} value={uni.sigla}>
                      {uni.nome} ({uni.sigla})
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
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button type="submit" style={buttonStyle}>
                  Adicionar Item
                </button>
              </div>
            </div>
          </form>
          {/* Tabela de Itens Adicionados */}
          <div>
            <h3 style={{ marginTop: 0 }}>Itens Adicionados</h3>
            {itens.length === 0 ? (
              <p style={{ fontStyle: "italic" }}>Nenhum item adicionado ainda.</p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thtdStyle}>Grupo de Serviço</th>
                    <th style={thtdStyle}>Material</th>
                    <th style={thtdStyle}>Unidade</th>
                    <th style={thtdStyle}>Quantidade</th>
                    <th style={thtdStyle}>Local de Aplicação</th>
                    <th style={thtdStyle}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, index) => (
                    <tr key={index}>
                      <td style={thtdStyle}>{item.subgrupo_2}</td>
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
        </div>
      )}

      {/* Botão final para criar a requisição */}
      <div style={cardStyle}>
        <form onSubmit={handleCreateRequisicao}>
          <button type="submit" style={buttonStyle}>
            Criar Requisição
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRequisicao;
