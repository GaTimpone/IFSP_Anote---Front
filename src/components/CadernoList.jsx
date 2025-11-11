import { VStack, Button, Text, Collapse, Box } from "@chakra-ui/react";
import { FiFolder } from "react-icons/fi";
import AnotacaoList from "./AnotacaoList";

export default function CadernoList({
  cadernos,
  selecionado,
  onSelect,
  onSelectAnotacao,
  anotacaoSelecionada,
  refreshKey,
  onAnotacaoCreated, // novo
}) {
  return (
    <VStack align="stretch" spacing={1} mt={2}>
      {cadernos.map((caderno) => {
        const isSelected = selecionado?.id === caderno.id;
        return (
          <Box key={caderno.id} width="100%">
            <Button
              w="100%"
              variant={isSelected ? "solid" : "ghost"}
              colorScheme={isSelected ? "purple" : "gray"}
              justifyContent="flex-start"
              onClick={() => onSelect(caderno)}
            >
              <FiFolder /> &nbsp; {caderno.titulo}
            </Button>

            <Collapse in={isSelected} animateOpacity>
              <Box pl={4} mt={2} mb={2}>
                <AnotacaoList
                  cadernoId={caderno.id}
                  onSelectAnotacao={onSelectAnotacao}
                  anotacaoSelecionada={anotacaoSelecionada}
                  refreshKey={refreshKey} // repassa aqui
                  onAnotacaoCreated={onAnotacaoCreated} // repassa aqui
                />
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </VStack>
  );
}
