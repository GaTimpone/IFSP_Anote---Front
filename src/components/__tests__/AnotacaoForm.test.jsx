/* eslint-disable no-undef */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AnotacaoForm from "../AnotacaoForm";
import { ChakraProvider } from "@chakra-ui/react";

// Mocka o useDisclosure para forçar o modal aberto
jest.mock("@chakra-ui/react", () => {
  const original = jest.requireActual("@chakra-ui/react");
  return {
    ...original,
    useDisclosure: () => ({
      isOpen: true,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    }),
  };
});

describe("AnotacaoForm", () => {
  let mockOnAdd;

  beforeEach(() => {
    mockOnAdd = jest.fn();
    global.fetch = jest.fn();
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify({ id: 1, nome: "Teste" })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function renderForm() {
    return render(
      <ChakraProvider>
        <AnotacaoForm cadernoId={1} onAdd={mockOnAdd} />
      </ChakraProvider>
    );
  }

  test("cria anotação com sucesso", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, titulo: "Nova Anotação" }),
    });

    renderForm();

    fireEvent.change(screen.getByPlaceholderText("Título da anotação"), {
      target: { value: "Nova Anotação" },
    });
    fireEvent.click(screen.getByText("Criar"));

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalled();
    });
  });

  test("não envia se título estiver vazio", async () => {
    renderForm();
    fireEvent.click(screen.getByText("Criar"));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
