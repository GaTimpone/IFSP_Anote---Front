/* eslint-disable no-undef */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CadernoForm from "../CadernoForm";
import { ChakraProvider } from "@chakra-ui/react";

describe("CadernoForm", () => {
  let mockOnAdd;

  beforeEach(() => {
    mockOnAdd = jest.fn();
    mockToast = jest.fn();
    global.fetch = jest.fn();
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify({ id: 1, nome: "Teste" })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function renderWithChakra() {
    return render(
      <ChakraProvider>
        <CadernoForm onAdd={mockOnAdd} />
      </ChakraProvider>
    );
  }

  test("deve renderizar input e botão OK", () => {
    renderWithChakra();
    expect(
      screen.getByPlaceholderText("Título do caderno")
    ).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  test("não faz nada se o título estiver vazio", async () => {
    renderWithChakra();
    fireEvent.click(screen.getByText("OK"));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("cria caderno com sucesso", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 10, titulo: "Novo Caderno" }),
    });

    renderWithChakra();
    fireEvent.change(screen.getByPlaceholderText("Título do caderno"), {
      target: { value: "Novo Caderno" },
    });
    fireEvent.click(screen.getByText("OK"));

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith({
        id: 10,
        titulo: "Novo Caderno",
      });
    });
  });

  test("mostra erro se API retornar falha", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });
    renderWithChakra();

    fireEvent.change(screen.getByPlaceholderText("Título do caderno"), {
      target: { value: "Caderno com erro" },
    });
    fireEvent.click(screen.getByText("OK"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
