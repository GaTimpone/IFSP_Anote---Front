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
import { FiPlus, FiLogOut, FiMenu, FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CadernoList from "../components/CadernoList";
import CadernoForm from "../components/CadernoForm";

export default function TelaPrincipalPage() {
  const bgSidebar = useColorModeValue("purple.50", "purple.900"); // roxo fraquinho no light
  const bgTelaPrincipal = useColorModeValue("white", "gray.800");
  const navigate = useNavigate();
  const toast = useToast();

  const [cadernos, setCadernos] = useState([]);
  const [cadernoSelecionado, setCadernoSelecionado] = useState(null);
  const [anotacaoSelecionada, setAnotacaoSelecionada] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [anotacoesRefreshKey, setAnotacoesRefreshKey] = useState(0);
  const [sidebarAberta, setSidebarAberta] = useState(true);

  const usuario = JSON.parse(localStorage.getItem("usuario")) || null;

  useEffect(() => {
    if (!usuario || !usuario.id) {
      navigate("/login");
      return;
    }

    const fetchUserAndCadernos = async () => {
      try {
        const res = await fetch(`http://localhost:8080/usuarios/${usuario.id}`);
        if (!res.ok) throw new Error("Erro ao buscar dados do usuário");
        const data = await res.json();
        setCadernos(data.cadernos || []);
      } catch (err) {
        console.error("Erro carregar cadernos do usuário:", err);
        toast({
          title: "Erro ao carregar seus cadernos",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchUserAndCadernos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const handleNovoCaderno = (novo) => {
    setCadernos((prev) => [...prev, novo]);
    setMostrarForm(false);
  };

  const handleSelectCaderno = (caderno) => {
    setCadernoSelecionado((prev) => {
      if (
        prev?.id === caderno?.id &&
        !!prev?.isUncategorized === !!caderno?.isUncategorized
      )
        return null;
      return caderno;
    });
    setAnotacaoSelecionada(null);
  };

  const handleSelectAnotacao = (anotacao) => {
    setAnotacaoSelecionada(anotacao);
  };

  const handleAnotacaoMoved = (moved) => {
    setAnotacaoSelecionada(moved);
    setAnotacoesRefreshKey((k) => k + 1);
  };

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

  const [editTitulo, setEditTitulo] = useState("");
  const [editCorpo, setEditCorpo] = useState("");

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
    <Flex
      h="100vh"
      w="100vw"
      overflow="hidden"
      bg={useColorModeValue("gray.100", "gray.700")}
    >
      {/* SIDEBAR */}
      <VStack
        w={sidebarAberta ? "320px" : "70px"}
        align="stretch"
        bg={bgSidebar}
        p={4}
        borderRight="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.600")}
        flexShrink={0}
        minH="0"
        transition="width 0.3s ease"
      >
        <HStack justify="space-between" mb={4}>
          {sidebarAberta ? (
            <HStack spacing={2}>
              <Text fontSize="md" opacity={0.8}>
                Olá,
              </Text>
              <Text fontSize="lg" fontWeight="bold">
                {usuario?.nome ?? "Usuário"}
              </Text>
            </HStack>
          ) : null}

          <IconButton
            aria-label="Alternar menu"
            icon={sidebarAberta ? <FiChevronLeft /> : <FiMenu />}
            size="sm"
            variant="ghost"
            onClick={() => setSidebarAberta(!sidebarAberta)}
          />
        </HStack>

        {sidebarAberta && (
          <>
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

            <Box overflowY="auto" minH="0">
              <CadernoList
                cadernos={cadernos}
                selecionado={cadernoSelecionado}
                onSelect={handleSelectCaderno}
                onSelectAnotacao={handleSelectAnotacao}
                anotacaoSelecionada={anotacaoSelecionada}
                refreshKey={anotacoesRefreshKey}
                onAnotacaoCreated={handleAnotacaoMoved}
                onAnotacaoMoved={handleAnotacaoMoved}
                usuario={usuario}
              />
            </Box>

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
          </>
        )}
      </VStack>

      {/* ÁREA PRINCIPAL */}
      <Flex
        direction="column"
        flex="1"
        minH="0"
        overflow="hidden"
        p={8}
        bg={bgTelaPrincipal}
      >
        {anotacaoSelecionada ? (
          <Flex direction="column" flex="1" minH="0" overflow="hidden">
            <Input
              value={editTitulo}
              onChange={(e) => setEditTitulo(e.target.value)}
              placeholder="Título"
              fontSize="3xl"
              fontWeight="bold"
              textAlign="center"
              mb={4}
            />

            <HStack justify="flex-end" mb={4} flexShrink={0}>
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
              <Button
                colorScheme="red"
                variant="outline"
                onClick={async () => {
                  /* seu delete */
                }}
              >
                Excluir
              </Button>
            </HStack>

            {/* Envolver o textarea em um box flexível é essencial */}
            <Box flex="1" minH="0" overflow="auto">
              <Textarea
                value={editCorpo}
                onChange={(e) => setEditCorpo(e.target.value)}
                h="100%"
                resize="none"
                minH="0"
                overflowY="auto"
              />
            </Box>
          </Flex>
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
      </Flex>
    </Flex>
  );
}
