import {
  VStack,
  Button,
  Text,
  HStack,
  IconButton,
  useToast,
  Box,
} from "@chakra-ui/react";
import { FiFileText, FiPlus } from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import AnotacaoForm from "../components/AnotacaoForm";

export default function AnotacaoPage({
  cadernoId,
  usuarioId,
  onSelectAnotacao,
  anotacaoSelecionada,
  refreshKey,
  onAnotacaoCreated,
  onAnotacaoMoved,
}) {
  const [anotacoes, setAnotacoes] = useState([]);
  const [isOver, setIsOver] = useState(false);
  const toast = useToast();
  const openModalRef = useRef(null);

  const fetchAnotacoes = async () => {
    if (cadernoId === null) {
      if (!usuarioId) {
        setAnotacoes([]);
        return;
      }
      try {
        const res = await fetch(`http://localhost:8080/usuarios/${usuarioId}`);
        if (!res.ok) throw new Error("Erro ao buscar usuário");
        const data = await res.json();
        const userAnotacoes = data.anotacoes || [];
        const cadernos = data.cadernos || [];
        const idsEmCadernos = new Set();
        cadernos.forEach((c) =>
          (c.anotacoes || []).forEach((a) => idsEmCadernos.add(a.id))
        );
        const semCaderno = userAnotacoes.filter(
          (a) => !idsEmCadernos.has(a.id)
        );
        //console.log(
        //  `📘 Anotações sem caderno do usuário ${usuarioId}:`,
        //  semCaderno
        //);
        setAnotacoes(semCaderno);
      } catch (err) {
        console.error("Erro ao carregar anotações sem caderno:", err);
        toast({
          title: "Erro ao carregar anotações",
          status: "error",
          duration: 3000,
        });
      }
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/cadernos/${cadernoId}`);
      if (!res.ok) throw new Error("Erro ao buscar caderno");
      const data = await res.json();
      const lista = data.anotacoes || [];
      //console.log(`📘 Anotações do caderno ${cadernoId}:`, lista);
      setAnotacoes(lista);
    } catch (err) {
      console.error("Erro ao carregar anotações do caderno:", err);
      toast({
        title: "Erro ao carregar anotações",
        status: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchAnotacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cadernoId, usuarioId, refreshKey]);

  const handleTriggerOpen = (openFn) => {
    openModalRef.current = openFn;
  };

  const handleOpenCreateModal = () => {
    if (cadernoId === null && !usuarioId) {
      toast({ title: "Usuário inválido", status: "warning", duration: 2000 });
      return;
    }
    if (openModalRef.current) openModalRef.current();
  };

  const handleAddAnotacao = (nova) => {
    setAnotacoes((prev) => [...prev, nova]);
    onSelectAnotacao(nova);
    if (typeof onAnotacaoCreated === "function") onAnotacaoCreated(nova);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };
  const handleDragLeave = () => setIsOver(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsOver(false);
    try {
      const payload =
        e.dataTransfer.getData("application/json") ||
        e.dataTransfer.getData("text");
      if (!payload) return;
      const { id: anotacaoId, fromCadernoId } = JSON.parse(payload);

      const targetCadernoId = cadernoId;
      if (String(fromCadernoId) === String(targetCadernoId)) return;

      const getRes = await fetch(
        `http://localhost:8080/anotacoes/${anotacaoId}`
      );
      if (!getRes.ok) throw new Error("Erro ao buscar anotação para mover");
      const an = await getRes.json();

      const usuarioDoAn =
        an.usuarioId || usuarioId || (an.usuario && an.usuario.id) || null;
      const putPayload = {
        titulo: an.titulo,
        corpo: an.corpo,
        usuarioId: usuarioDoAn,
        cadernoId: targetCadernoId,
      };

      const putRes = await fetch(
        `http://localhost:8080/anotacoes/${anotacaoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(putPayload),
        }
      );
      if (!putRes.ok) throw new Error("Erro ao mover anotação");
      const updated = await putRes.json();

      if (typeof onAnotacaoMoved === "function") onAnotacaoMoved(updated);
      else if (typeof onAnotacaoCreated === "function")
        onAnotacaoCreated(updated);
    } catch (err) {
      console.error("Erro ao mover anotação:", err);
      toast({
        title: "Erro ao mover anotação",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      bg={isOver ? "gray.100" : "transparent"}
      borderRadius="md"
      p={isOver ? 2 : 0}
    >
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

        <AnotacaoForm
          cadernoId={cadernoId}
          usuarioId={usuarioId}
          onAdd={handleAddAnotacao}
          triggerOpen={handleTriggerOpen}
        />

        {anotacoes.length === 0 ? (
          <Text fontSize="sm" opacity={0.6}>
            Nenhuma anotação
          </Text>
        ) : (
          anotacoes.map((a) => {
            const isSelected = anotacaoSelecionada?.id === a.id;
            return (
              <Button
                key={a.id}
                draggable
                onDragStart={(e) => {
                  const payload = JSON.stringify({
                    id: a.id,
                    fromCadernoId: cadernoId,
                  });
                  e.dataTransfer.setData("application/json", payload);
                }}
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
                    });
                  }
                }}
                leftIcon={<FiFileText />}
              >
                {a.titulo || "(sem título)"}
              </Button>
            );
          })
        )}
      </VStack>
    </Box>
  );
}
