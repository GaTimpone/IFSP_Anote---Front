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
  // triggerOpen: boolean to open modal from parent
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [titulo, setTitulo] = useState("");
  const toast = useToast();

  // se o parent mandar abrir, abre o modal
  // triggerOpen pode ser um contador; para simplicidade, parent chama onOpenRef (ou passa função)
  // aqui, se triggerOpen é verdade, abriremos via efeito:
  // (parent will pass a function to call onOpen instead - see usage in AnotacaoList)

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
      onAdd(nova); // parent will handle selecting + refresh
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

  // Expose the open function to parent via triggerOpen (parent will pass a ref callback).
  // But simpler: parent will import this component and call openRef.current() - to keep API simple,
  // we'll instead export a component that parent renders and passes an `open` function via props.
  // To keep this file minimal, we expose the onOpen function through triggerOpen callback if provided.
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
