import { Center } from "@chakra-ui/react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";

export default function CadastroPage() {
  const navigate = useNavigate();
  const handleCadastro = async ({ nome, email, senha }) => {
    const res = await fetch("http://localhost:8080/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    if (!res.ok) {
      throw new Error("Erro ao criar usuário");
    }

    const usuario = await res.json();

    localStorage.setItem("usuario", JSON.stringify(usuario));

    navigate("/");
  };

  return (
    <Center bg="gray.100" minH="100vh" w="100vw" p={4}>
      <AuthForm
        title="Cadastro"
        fields={[
          { label: "Nome", name: "nome", type: "text", required: true },
          { label: "Email", name: "email", type: "email", required: true },
          { label: "Senha", name: "senha", type: "password", required: true },
        ]}
        onSubmit={handleCadastro}
        footerText="Já tem conta?"
        footerLink="/login"
        footerLinkText="Entre aqui"
      />
    </Center>
  );
}
