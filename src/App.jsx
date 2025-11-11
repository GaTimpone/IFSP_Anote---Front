import { ChakraProvider } from "@chakra-ui/react";
import LoginPage from "./pages/LoginPage";
import CadastroPage from "./pages/CadastroPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TelaPrincipalPage from "./pages/TelaPrincipalPage";

function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/" element={<TelaPrincipalPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
