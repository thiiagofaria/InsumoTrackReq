// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import CreateRequisicao from "./pages/CreateRequisicao";
import ApprovalRequisicao from "./pages/ApprovalRequisicao";
import BaixaItensRequisicao from "./pages/BaixaItensRequisicao"; // Importa a nova página
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/criar-requisicao" 
          element={
            <PrivateRoute>
              <CreateRequisicao />
            </PrivateRoute>
          }
        />
        <Route 
          path="/aprovar-requisicao" 
          element={
            <PrivateRoute>
              <ApprovalRequisicao />
            </PrivateRoute>
          }
        />
        {/* Nova rota para o almoxarifado */}
        <Route 
          path="/baixa-itens" 
          element={
            <PrivateRoute>
              <BaixaItensRequisicao />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
