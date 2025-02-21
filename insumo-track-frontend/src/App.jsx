import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Menu from "./pages/Menu"; // Página de menu com os botões
import CreateRequisicao from "./pages/CreateRequisicao";
import ApprovalRequisicao from "./pages/ApprovalRequisicao";
import BaixaItensRequisicao from "./pages/BaixaItensRequisicao";
import FilterRequisicoes from "./pages/FilterRequisicoes";
import UploadGerencial from "./pages/UploadGerencial";
import VisualizarRequisicao from "./pages/VisualizarRequisicao";
import FiltrarBaixas from "./pages/FiltrarBaixas";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/menu"
          element={
            <PrivateRoute>
              <Menu />
            </PrivateRoute>
          }
        />
        <Route
          path="/criar-requisicao"
          element={
            <PrivateRoute>
              <CreateRequisicao />
            </PrivateRoute>
          }
        />
        <Route
          path="/approval-requisicao"
          element={
            <PrivateRoute>
              <ApprovalRequisicao />
            </PrivateRoute>
          }
        />
        <Route
          path="/filtrar-requisicoes"
          element={
            <PrivateRoute>
              <FilterRequisicoes />
            </PrivateRoute>
          }
        />
        <Route
          path="/baixa-itens"
          element={
            <PrivateRoute>
              <BaixaItensRequisicao />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload-gerencial"
          element={
            <PrivateRoute>
              <UploadGerencial />
            </PrivateRoute>
          }
        />
        <Route
          path="/filtrar-baixas"
          element={
            <PrivateRoute>
              <FiltrarBaixas />
            </PrivateRoute>
          }
        />
        <Route
          path="/visualizar-requisicao"
          element={
            <PrivateRoute>
              <VisualizarRequisicao />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
