import {
  VStack,
  Button,
  Text,
  Collapse,
  Box,
  HStack,
  IconButton,
  useToast,
  Input,
} from "@chakra-ui/react";
import { FiFolder, FiTrash2, FiEdit2, FiFileText } from "react-icons/fi";
import { useState } from "react";
import AnotacaoList from "./AnotacaoList";

export default function CadernoList({
  cadernos,
  selecionado,
  onSelect,
  onSelectAnotacao,
  anotacaoSelecionada,
  refreshKey,
  onAnotacaoCreated,
  onAnotacaoMoved,
  usuario,
}) {
  const toast = useToast();
  const [editandoId, setEditandoId] = useState(null);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [hoverId, setHoverId] = useState(undefined);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/cadernos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir caderno");
      toast({ title: "Caderno excluído", status: "success", duration: 2000 });
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao excluir caderno",
        status: "error",
        duration: 2000,
      });
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/cadernos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: novoTitulo }),
      });
      if (!res.ok) throw new Error("Erro ao editar caderno");
      toast({ title: "Caderno atualizado", status: "success", duration: 2000 });
      setEditandoId(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao editar caderno",
        status: "error",
        duration: 2000,
      });
    }
  };

  const moveAnotacaoToCaderno = async (anotacaoId, targetCadernoId) => {
    try {
      const getRes = await fetch(
        `http://localhost:8080/anotacoes/${anotacaoId}`
      );
      if (!getRes.ok) throw new Error("Erro ao buscar anotação para mover");
      const an = await getRes.json();

      const usuarioDoAn = an.usuarioId || an.usuario?.id || usuario?.id;

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

      toast({ title: "Anotação movida", status: "success", duration: 2000 });
    } catch (err) {
      console.error("Erro ao mover anotação:", err);
      toast({
        title: "Erro ao mover anotação",
        status: "error",
        duration: 3000,
      });
    }
  };

  const onDragOverTarget = (e) => {
    e.preventDefault();
  };

  const onDropOnTarget = (e, targetCadernoId) => {
    e.preventDefault();
    setHoverId(undefined);
    try {
      const payload =
        e.dataTransfer.getData("application/json") ||
        e.dataTransfer.getData("text");
      if (!payload) return;
      const { id: anotacaoId, fromCadernoId } = JSON.parse(payload);

      if (String(fromCadernoId) === String(targetCadernoId)) return;

      moveAnotacaoToCaderno(anotacaoId, targetCadernoId);
    } catch (err) {
      console.error("Payload inválido no drop:", err);
    }
  };

  return (
    <VStack align="stretch" spacing={1} mt={2}>
      <Box
        width="100%"
        onDragOver={onDragOverTarget}
        onDrop={(e) => onDropOnTarget(e, null)}
        onDragEnter={() => setHoverId("uncat")}
        onDragLeave={() => setHoverId(undefined)}
        bg={hoverId === "uncat" ? "gray.50" : "transparent"}
        borderRadius="md"
      >
        <Button
          w="100%"
          variant={selecionado?.isUncategorized ? "solid" : "ghost"}
          colorScheme={selecionado?.isUncategorized ? "purple" : "gray"}
          justifyContent="flex-start"
          onClick={() =>
            onSelect({
              id: null,
              titulo: "Sem caderno",
              isUncategorized: true,
            })
          }
        >
          <FiFileText /> &nbsp; Sem caderno
        </Button>

        <Collapse in={selecionado?.isUncategorized} animateOpacity>
          <Box pl={4} mt={2} mb={2}>
            <AnotacaoList
              cadernoId={null}
              usuarioId={usuario?.id}
              onSelectAnotacao={onSelectAnotacao}
              anotacaoSelecionada={anotacaoSelecionada}
              refreshKey={refreshKey}
              onAnotacaoCreated={onAnotacaoCreated}
              onAnotacaoMoved={onAnotacaoMoved}
            />
          </Box>
        </Collapse>
      </Box>

      {/* --- Lista de cadernos --- */}
      {cadernos.map((caderno) => {
        const isSelected =
          selecionado?.id === caderno.id && !selecionado?.isUncategorized;
        const isEditing = editandoId === caderno.id;
        const isHover = hoverId === caderno.id;

        return (
          <Box
            key={caderno.id}
            width="100%"
            onDragOver={onDragOverTarget}
            onDrop={(e) => onDropOnTarget(e, caderno.id)}
            onDragEnter={() => {
              setHoverId(caderno.id);
              //onSelect(caderno);
            }}
            onDragLeave={() => setHoverId(undefined)}
            bg={isHover ? "gray.50" : "transparent"}
            borderRadius="md"
          >
            <HStack justify="space-between">
              {!isEditing ? (
                <>
                  <Button
                    w="100%"
                    variant={isSelected ? "solid" : "ghost"}
                    colorScheme={isSelected ? "purple" : "gray"}
                    justifyContent="flex-start"
                    onClick={() => onSelect(caderno)}
                  >
                    <FiFolder /> &nbsp; {caderno.titulo}
                  </Button>

                  <HStack spacing={0}>
                    <IconButton
                      aria-label="Editar"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditandoId(caderno.id);
                        setNovoTitulo(caderno.titulo);
                      }}
                    />
                    <IconButton
                      aria-label="Excluir"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(caderno.id)}
                    />
                  </HStack>
                </>
              ) : (
                <>
                  <input
                    style={{ flex: 1, marginRight: 8 }}
                    value={novoTitulo}
                    onChange={(e) => setNovoTitulo(e.target.value)}
                  />
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => handleSaveEdit(caderno.id)}
                  >
                    Salvar
                  </Button>
                </>
              )}
            </HStack>

            <Collapse in={isSelected} animateOpacity>
              <Box pl={4} mt={2} mb={2}>
                <AnotacaoList
                  cadernoId={caderno.id}
                  usuarioId={usuario?.id}
                  onSelectAnotacao={onSelectAnotacao}
                  anotacaoSelecionada={anotacaoSelecionada}
                  refreshKey={refreshKey}
                  onAnotacaoCreated={onAnotacaoCreated}
                  onAnotacaoMoved={onAnotacaoMoved}
                />
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </VStack>
  );
}
