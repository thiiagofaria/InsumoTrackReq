// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import CreateRequisicao from "./pages/CreateRequisicao";

function App() {
  return (
    // Envolva suas rotas no AuthProvider,
    // mas NÃO coloque outro BrowserRouter aqui
    <AuthProvider>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={<Login />} />

        {/* Rota privada */}
        <Route 
          path="/criar-requisicao" 
          element={
            <PrivateRoute>
              <CreateRequisicao />
            </PrivateRoute>
          }
        />

        {/* Se quiser uma rota para a Home (exemplo) */}
        {/* <Route path="/" element={<Home />} /> */}
      </Routes>
    </AuthProvider>
  );
}

export default App;
