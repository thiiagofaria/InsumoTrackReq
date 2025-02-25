// pages/UploadExcel.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL; // Pega do .env


const UploadExcel = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const containerStyle = {
    maxWidth: "600px",
    margin: "30px auto",
    fontFamily: "sans-serif",
    padding: "16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "#f9f9f9",
  };

  const inputStyle = {
    padding: "6px",
    marginBottom: "12px",
  };

  const buttonStyle = {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setStatusMessage("Por favor, selecione um arquivo!");
      return;
    }

    setLoading(true);
    setStatusMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_URL}/gerencial/upload-excel/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao enviar arquivo.");
      }

      setStatusMessage(data.message || "Arquivo enviado com sucesso!");
    } catch (error) {
      setStatusMessage("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Upload de Arquivo Excel</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          style={inputStyle}
        />
        <br />
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};

export default UploadExcel;
