/* eslint-disable no-undef */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "../LoginPage";
import { ChakraProvider, useToast } from "@chakra-ui/react";

jest.mock("@chakra-ui/react", () => {
  const original = jest.requireActual("@chakra-ui/react");
  return {
    ...original,
    useToast: jest.fn(),
  };
});

describe("LoginPage", () => {
  const toastMock = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    useToast.mockReturnValue(toastMock);
    global.fetch = jest.fn();
    global.alert = jest.fn();
    window.localStorage.clear();
  });

  test("login bem-sucedido", async () => {
    const fakeUser = { id: 1, nome: "Gabriel", email: "teste@ifsp.com" };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeUser,
    });

    render(
      <ChakraProvider>
        <LoginPage />
      </ChakraProvider>
    );

    const emailInput = await screen.findByLabelText(/Email/i);
    const senhaInput = await screen.findByLabelText(/Senha/i);

    fireEvent.change(emailInput, { target: { value: "teste@ifsp.com" } });
    fireEvent.change(senhaInput, { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await new Promise((r) => setTimeout(r, 0));

    expect(global.fetch).toHaveBeenCalled();
    const stored = JSON.parse(localStorage.getItem("usuario"));
    expect(stored.email).toBe("teste@ifsp.com");
    expect(global.alert).toHaveBeenCalledWith(
      "Login bem-sucedido! Bem-vindo, " + fakeUser.nome
    );
  });

  test("erro 401 -> toast chamado", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 401 });

    render(
      <ChakraProvider>
        <LoginPage />
      </ChakraProvider>
    );

    const emailInput = await screen.findByLabelText(/Email/i);
    const senhaInput = await screen.findByLabelText(/Senha/i);

    fireEvent.change(emailInput, { target: { value: "x@ifsp.com" } });
    fireEvent.change(senhaInput, { target: { value: "err" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await new Promise((r) => setTimeout(r, 0));

    expect(toastMock).toHaveBeenCalled();
  });
});
