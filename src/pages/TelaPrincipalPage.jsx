import {
  Box,
  Flex,
  VStack,
  HStack,
  IconButton,
  Text,
  Divider,
  useColorModeValue,
  Button,
  useToast,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { FiPlus, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CadernoList from "../components/CadernoList";
import CadernoForm from "../components/CadernoForm";
import AnotacaoList from "../components/AnotacaoList";

export default function TelaPrincipalPage() {
  const bgSidebar = useColorModeValue("gray.50", "gray.900");
  const bgTelaPrincipal = useColorModeValue("white", "gray.800");
  const navigate = useNavigate();
  const toast = useToast();

  const [cadernos, setCadernos] = useState([]);
  const [cadernoSelecionado, setCadernoSelecionado] = useState(null);
  const [anotacaoSelecionada, setAnotacaoSelecionada] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  // contador para forçar refresh das anotações (passado para AnotacaoList)
  const [anotacoesRefreshKey, setAnotacoesRefreshKey] = useState(0);

  const usuario = JSON.parse(localStorage.getItem("usuario")) || null;

  // Buscar cadernos
  useEffect(() => {
    const fetchCadernos = async () => {
      try {
        const res = await fetch("http://localhost:8080/cadernos");
        if (!res.ok) throw new Error("Erro ao buscar cadernos");
        const data = await res.json();
        setCadernos(data);
      } catch (err) {
        console.error(err);
        toast({
          title: "Erro ao carregar cadernos",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchCadernos();
  }, [toast]);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const handleNovoCaderno = (novo) => {
    setCadernos((prev) => [...prev, novo]);
    setMostrarForm(false);
  };

  const handleSelectCaderno = (caderno) => {
    setCadernoSelecionado((prev) => (prev?.id === caderno.id ? prev : caderno));
    setAnotacaoSelecionada(null);
  };

  const handleSelectAnotacao = (anotacao) => {
    setAnotacaoSelecionada(anotacao);
  };

  const handleAnotacaoCreated = (nova) => {
    // seleciona a nova anotação e força refresh nas listas
    setAnotacaoSelecionada(nova);
    setAnotacoesRefreshKey((k) => k + 1);
  };
  // salvar edição da anotação (PUT)
  const handleSaveAnotacao = async (updated) => {
    try {
      const payload = {
        titulo: updated.titulo,
        corpo: updated.corpo,
        usuarioId: updated.usuarioId || (usuario && usuario.id),
        cadernoId:
          updated.cadernoId || (cadernoSelecionado && cadernoSelecionado.id),
      };
      const res = await fetch(`http://localhost:8080/anotacoes/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao salvar anotação");
      const salva = await res.json();
      setAnotacaoSelecionada(salva);
      // forçar refresh da lista de anotações do caderno
      setAnotacoesRefreshKey((k) => k + 1);

      toast({
        title: "Anotação salva",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao salvar anotação",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // salvar novo título/corpo quando o usuário clicar em salvar (controlado na UI abaixo)
  const [editTitulo, setEditTitulo] = useState("");
  const [editCorpo, setEditCorpo] = useState("");

  // quando uma anotação é selecionada, preencher campos de edição
  useEffect(() => {
    if (anotacaoSelecionada) {
      setEditTitulo(anotacaoSelecionada.titulo || "");
      setEditCorpo(anotacaoSelecionada.corpo || "");
    } else {
      setEditTitulo("");
      setEditCorpo("");
    }
  }, [anotacaoSelecionada]);

  return (
    <Flex minH="100vh" bg={useColorModeValue("gray.100", "gray.700")}>
      {/* SIDEBAR */}
      <VStack
        w="320px"
        align="stretch"
        bg={bgSidebar}
        p={4}
        borderRight="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.600")}
      >
        {/* Usuário */}
        <Box mb={2}>
          <Text fontSize="sm" opacity={0.6}>
            Olá,
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            {usuario?.nome ?? "Usuário"}
          </Text>
        </Box>

        <HStack justify="space-between" mb={2}>
          <Text fontSize="lg" fontWeight="bold">
            Cadernos
          </Text>
          <IconButton
            aria-label="Adicionar caderno"
            icon={<FiPlus />}
            size="sm"
            variant="ghost"
            onClick={() => setMostrarForm(!mostrarForm)}
          />
        </HStack>

        {mostrarForm && <CadernoForm onAdd={handleNovoCaderno} />}

        <CadernoList
          cadernos={cadernos}
          selecionado={cadernoSelecionado}
          onSelect={handleSelectCaderno}
          onSelectAnotacao={handleSelectAnotacao}
          anotacaoSelecionada={anotacaoSelecionada}
          refreshKey={anotacoesRefreshKey}
          onAnotacaoCreated={handleAnotacaoCreated}
        />

        <Divider my={4} />

        <Button
          leftIcon={<FiLogOut />}
          variant="ghost"
          justifyContent="flex-start"
          colorScheme="red"
          onClick={handleLogout}
        >
          Sair
        </Button>
      </VStack>

      {/* ÁREA PRINCIPAL */}
      <Flex flex="1" direction="column">
        <Box
          flex="1"
          p={8}
          bg={bgTelaPrincipal}
          overflowY="auto"
          color={useColorModeValue("gray.800", "gray.100")}
        >
          {anotacaoSelecionada ? (
            <>
              <HStack justify="space-between" mb={4}>
                <Input
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  placeholder="Título"
                />
                <Button
                  colorScheme="purple"
                  onClick={() =>
                    handleSaveAnotacao({
                      ...anotacaoSelecionada,
                      titulo: editTitulo,
                      corpo: editCorpo,
                    })
                  }
                >
                  Salvar
                </Button>
              </HStack>

              <Textarea
                value={editCorpo}
                onChange={(e) => setEditCorpo(e.target.value)}
                minH="60vh"
                resize="vertical"
              />
            </>
          ) : cadernoSelecionado ? (
            <>
              <Text fontSize="4xl" fontWeight="bold" mb={4}>
                {cadernoSelecionado.titulo}
              </Text>
              <Text fontSize="md" opacity={0.7}>
                Selecione uma anotação no caderno à esquerda para abrir aqui.
              </Text>
            </>
          ) : (
            <Text fontSize="md" opacity={0.7}>
              Selecione um caderno à esquerda ou adicione um novo.
            </Text>
          )}
        </Box>

        {/* footer: passa refreshKey para a lista de anotações dentro do Collapse */}
        {/* Para garantir que AnotacaoList re-fetch quando salvar, passamos anotacoesRefreshKey como prop */}
      </Flex>

      {/* Floating invisible AnotacaoList refresh prop usage:
          Instead of re-rendering AnotacaoList here, we rely on the prop in the CadernoList -> AnotacaoList path.
          To make that work, you must pass `refreshKey={anotacoesRefreshKey}` from TelaPrincipal into CadernoList,
          then CadernoList forwards to AnotacaoList. Adjust below:
      */}
    </Flex>
  );
}
