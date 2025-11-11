import { HStack, Input, Button, useToast } from "@chakra-ui/react";
import { useState } from "react";

export default function CadernoForm({ onAdd }) {
  const [titulo, setTitulo] = useState("");
  const toast = useToast();

  const handleSubmit = async () => {
    if (!titulo.trim()) return;

    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (!usuario || !usuario.id) {
        toast({
          title: "Usuário não encontrado",
          description: "Faça login novamente.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const novoCaderno = {
        titulo,
        usuarioId: usuario.id,
      };

      const res = await fetch("http://localhost:8080/cadernos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoCaderno),
      });

      if (!res.ok) throw new Error("Erro ao criar caderno");

      const novo = await res.json();
      onAdd(novo);
      setTitulo("");

      toast({
        title: "Caderno criado com sucesso!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao criar caderno",
        description: err.message,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <HStack mb={2}>
      <Input
        size="sm"
        placeholder="Título do caderno"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <Button colorScheme="purple" size="sm" onClick={handleSubmit}>
        OK
      </Button>
    </HStack>
  );
}
