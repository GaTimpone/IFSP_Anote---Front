/* eslint-disable no-undef */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CadastroPage from "../CadastroPage";
import { ChakraProvider } from "@chakra-ui/react";

describe("CadastroPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    global.alert = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("cadastro bem-sucedido: chama fetch e mostra alert", async () => {
    const fakeUser = { id: 1, nome: "Gabriel" };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeUser,
    });

    render(
      <ChakraProvider>
        <CadastroPage />
      </ChakraProvider>
    );

    const nomeInput = await screen.findByLabelText(/Nome/i);
    const emailInput = await screen.findByLabelText(/Email/i);
    const senhaInput = await screen.findByLabelText(/Senha/i);

    fireEvent.change(nomeInput, { target: { value: "Gabriel" } });
    fireEvent.change(emailInput, { target: { value: "teste@ifsp.com" } });
    fireEvent.change(senhaInput, { target: { value: "123" } });

    fireEvent.click(screen.getByRole("button", { name: /Cadastro/i }));

    // espera o fluxo async terminar
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/usuarios",
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Object),
        body: JSON.stringify({
          nome: "Gabriel",
          email: "teste@ifsp.com",
          senha: "123",
        }),
      })
    );

    expect(global.alert).toHaveBeenCalledWith(
      "Cadastro bem-sucedido! Bem-vindo, Gabriel"
    );
  });

  test("erro de servidor: fetch retorna ok:false -> alerta não chamado", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    render(
      <ChakraProvider>
        <CadastroPage />
      </ChakraProvider>
    );

    const nomeInput = await screen.findByLabelText(/Nome/i);
    const emailInput = await screen.findByLabelText(/Email/i);
    const senhaInput = await screen.findByLabelText(/Senha/i);

    fireEvent.change(nomeInput, { target: { value: "Gabriel" } });
    fireEvent.change(emailInput, { target: { value: "teste@ifsp.com" } });
    fireEvent.change(senhaInput, { target: { value: "123" } });

    fireEvent.click(screen.getByRole("button", { name: /Cadastro/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    expect(global.alert).not.toHaveBeenCalled();
  });
});
