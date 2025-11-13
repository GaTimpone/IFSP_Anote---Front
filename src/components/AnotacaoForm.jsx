import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";

export default function AnotacaoForm({ cadernoId, onAdd, triggerOpen }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
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

      const payload = {
        titulo,
        corpo: "",
        usuarioId: usuario.id,
        cadernoId,
      };

      const res = await fetch("http://localhost:8080/anotacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao criar anotação");

      const nova = await res.json();
      onAdd(nova);
      setTitulo("");
      onClose();
      toast({
        title: "Anotação criada",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao criar anotação",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (triggerOpen && typeof triggerOpen === "function") {
    triggerOpen(onOpen);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar nova anotação</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Título da anotação"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="purple" onClick={handleSubmit}>
            Criar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
