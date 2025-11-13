/* eslint-disable no-undef */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../LoginPage";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";

describe("LoginPage", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function renderPage() {
    return render(
      <ChakraProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </ChakraProvider>
    );
  }

  test("login bem-sucedido", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, nome: "Usuário Teste" }),
    });

    renderPage();

    const email = screen.getByLabelText(/email/i);
    const senha = screen.getByLabelText(/senha/i);
    const botao = screen.getByRole("button", { name: /login/i });

    fireEvent.change(email, { target: { value: "teste@teste.com" } });
    fireEvent.change(senha, { target: { value: "123456" } });
    fireEvent.click(botao);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
