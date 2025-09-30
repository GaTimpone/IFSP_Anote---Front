import { Center } from "@chakra-ui/react";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  const handleLogin = async ({ email, senha }) => {
    console.log("Enviando:", { email, senha });

    const response = await fetch("http://localhost:8080/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Email ou senha inválidos.");
      }
      throw new Error("Erro do servidor: " + response.status);
    }

    const usuario = await response.json();
    localStorage.setItem("usuario", JSON.stringify(usuario));
    alert("Login bem-sucedido! Bem-vindo, " + usuario.nome);
  };

  return (
    <Center bg="gray.100" minH="100vh" w="100vw" p={4}>
      <AuthForm
        title="Login"
        fields={[
          { label: "Email", name: "email", type: "email", required: true },
          { label: "Senha", name: "senha", type: "password", required: true },
        ]}
        onSubmit={handleLogin}
        footerText="Não tem conta?"
        footerLink="/cadastro"
        footerLinkText="Cadastre-se"
      />
    </Center>
  );
}
