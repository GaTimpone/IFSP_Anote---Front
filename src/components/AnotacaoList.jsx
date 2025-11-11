import {
  VStack,
  Button,
  Text,
  HStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { FiFileText, FiPlus } from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import AnotacaoForm from "./AnotacaoForm";

export default function AnotacaoList({
  cadernoId,
  onSelectAnotacao,
  anotacaoSelecionada,
  refreshKey,
  onAnotacaoCreated,
}) {
  const [anotacoes, setAnotacoes] = useState([]);
  const toast = useToast();
  const openModalRef = useRef(null);

  const fetchAnotacoes = async () => {
    if (!cadernoId) {
      setAnotacoes([]);
      return;
    }

    try {
      // ✅ Agora busca o caderno completo com suas anotações
      const res = await fetch(`http://localhost:8080/cadernos/${cadernoId}`);
      if (!res.ok) throw new Error("Erro ao buscar caderno");

      const data = await res.json();
      const lista = data.anotacoes || [];

      console.log(`📘 Anotações do caderno ${cadernoId}:`, lista);
      setAnotacoes(lista);
    } catch (err) {
      console.error("Erro ao carregar anotações:", err);
      toast({
        title: "Erro ao carregar anotações",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchAnotacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cadernoId, refreshKey]);

  const handleTriggerOpen = (openFn) => {
    openModalRef.current = openFn;
  };

  const handleOpenCreateModal = () => {
    if (!cadernoId) {
      toast({
        title: "Selecione um caderno",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    if (openModalRef.current) openModalRef.current();
  };

  const handleAddAnotacao = (nova) => {
    setAnotacoes((prev) => [...prev, nova]);
    onSelectAnotacao(nova);
    if (typeof onAnotacaoCreated === "function") onAnotacaoCreated(nova);
  };

  return (
    <VStack align="stretch" spacing={1}>
      <HStack justify="space-between" mb={1}>
        <Text fontSize="sm" opacity={0.8}>
          Anotações
        </Text>
        <IconButton
          size="xs"
          aria-label="Nova anotação"
          icon={<FiPlus />}
          variant="ghost"
          onClick={handleOpenCreateModal}
        />
      </HStack>

      {/* Modal de criação */}
      <AnotacaoForm
        cadernoId={cadernoId}
        onAdd={handleAddAnotacao}
        triggerOpen={handleTriggerOpen}
      />

      {anotacoes.length === 0 && (
        <Text fontSize="sm" opacity={0.6}>
          Nenhuma anotação
        </Text>
      )}

      {anotacoes.map((a) => {
        const isSelected = anotacaoSelecionada?.id === a.id;
        return (
          <Button
            key={a.id}
            variant={isSelected ? "solid" : "ghost"}
            colorScheme={isSelected ? "purple" : "gray"}
            justifyContent="flex-start"
            onClick={async () => {
              try {
                const res = await fetch(
                  `http://localhost:8080/anotacoes/${a.id}`
                );
                if (!res.ok) throw new Error("Erro ao buscar anotação");
                const full = await res.json();
                onSelectAnotacao(full);
              } catch (err) {
                console.error(err);
                toast({
                  title: "Erro ao abrir anotação",
                  status: "error",
                  duration: 2000,
                  isClosable: true,
                });
              }
            }}
            leftIcon={<FiFileText />}
          >
            {a.titulo || "(sem título)"}
          </Button>
        );
      })}
    </VStack>
  );
}
