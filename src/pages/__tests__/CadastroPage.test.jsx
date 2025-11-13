/* eslint-disable no-undef */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CadastroPage from "../CadastroPage";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";

describe("CadastroPage", () => {
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
          <CadastroPage />
        </MemoryRouter>
      </ChakraProvider>
    );
  }

  test("cadastro bem-sucedido", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    renderPage();

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Teste" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "teste@teste.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastro/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
