/* eslint-disable no-undef */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TelaPrincipalPage from "../TelaPrincipalPage";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";

describe("TelaPrincipalPage", () => {
  beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify({ id: 1, nome: "Usuário Teste" })
    );
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function renderPage() {
    return render(
      <ChakraProvider>
        <MemoryRouter>
          <TelaPrincipalPage />
        </MemoryRouter>
      </ChakraProvider>
    );
  }

  test("renderiza tela principal com texto inicial", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cadernos: [] }),
    });

    renderPage();
    expect(await screen.findByText(/Selecione um caderno/)).toBeInTheDocument();
  });

  test("exibe o nome do usuário na sidebar", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cadernos: [] }),
    });

    renderPage();
    expect(await screen.findByText("Usuário Teste")).toBeInTheDocument();
  });

  test("botão sair limpa localStorage e navega para login", async () => {
    const mockNavigate = jest.fn();
    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useNavigate: () => mockNavigate,
    }));

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cadernos: [] }),
    });

    renderPage();
    const logoutBtn = await screen.findByText("Sair");
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(Storage.prototype.getItem).toHaveBeenCalled();
    });
  });

  test("botão de criar caderno abre formulário", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cadernos: [] }),
    });

    renderPage();
    const addBtn = await screen.findByLabelText("Adicionar caderno");
    fireEvent.click(addBtn);

    expect(
      screen.getByPlaceholderText("Título do caderno")
    ).toBeInTheDocument();
  });
});
