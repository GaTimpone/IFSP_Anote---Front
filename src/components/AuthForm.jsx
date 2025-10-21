import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Heading,
  VStack,
  Link,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";

export default function AuthForm({
  title,
  fields,
  onSubmit,
  footerText,
  footerLink,
  footerLinkText,
}) {
  const [formData, setFormData] = useState({});
  const toast = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (err) {
      toast({
        title: "Erro",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bg="white"
      p={8}
      rounded="xl"
      shadow="xl"
      w="100%"
      maxW="400px"
      borderWidth="1px"
    >
      <Heading
        size="lg"
        textAlign="center"
        mb={2}
        color="blue.600"
        fontWeight="bold"
      >
        {title}
      </Heading>

      <Text fontSize="sm" textAlign="center" mb={6} color="gray.500">
        {title === "Login"
          ? "Bem-vindo de volta!"
          : "Crie sua conta para começar"}
      </Text>

      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          {fields.map((field) => (
            <FormControl key={field.name} isRequired={field.required}>
              <FormLabel htmlFor={field.name} fontWeight="semibold">
                {field.label}
              </FormLabel>
              <Input
                id={field.name}
                type={field.type}
                name={field.name}
                onChange={handleChange}
                focusBorderColor="blue.500"
                rounded="md"
                bg="gray.50"
                _hover={{ bg: "gray.100" }}
              />
            </FormControl>
          ))}

          <Button
            type="submit"
            colorScheme="blue"
            w="full"
            rounded="md"
            fontWeight="bold"
          >
            {title}
          </Button>
        </VStack>
      </form>

      {footerText && (
        <Text fontSize="sm" mt={6} textAlign="center" color="gray.600">
          {footerText}{" "}
          <Link color="blue.500" fontWeight="semibold" href={footerLink}>
            {footerLinkText}
          </Link>
        </Text>
      )}
    </Box>
  );
}
