/* eslint-disable no-undef */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthForm from "../AuthForm";
import { ChakraProvider, useToast } from "@chakra-ui/react";

jest.mock("@chakra-ui/react", () => {
  const original = jest.requireActual("@chakra-ui/react");
  return {
    ...original,
    useToast: jest.fn(),
  };
});

describe("AuthForm", () => {
  const fields = [
    { label: "Email", name: "email", type: "email", required: true },
    { label: "Senha", name: "senha", type: "password", required: true },
  ];

  const toastMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useToast.mockReturnValue(toastMock);
  });

  test("exibe toast quando onSubmit rejeita (erro)", async () => {
    const onSubmit = jest
      .fn()
      .mockRejectedValueOnce(new Error("Email inválido"));
    render(
      <ChakraProvider>
        <AuthForm title="Login" fields={fields} onSubmit={onSubmit} />
      </ChakraProvider>
    );

    const emailInput = await screen.findByLabelText(/Email/i);
    const senhaInput = await screen.findByLabelText(/Senha/i);

    fireEvent.change(emailInput, { target: { value: "u@u.com" } });
    fireEvent.change(senhaInput, { target: { value: "errada" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Espera o toast ser chamado
    await waitFor(() => expect(toastMock).toHaveBeenCalled());

    const toastArgs = toastMock.mock.calls[0][0];
    expect(toastArgs.description).toMatch(/Email inválido/);
  });
});
