import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";

const sampleContexts = {
  permitRead: {
    purpose: "treatment",
    consent_status: "active",
  },
  denyRead: {
    purpose: "treatment",
    consent_status: "revoked",
  },
};

export default function PdpTest() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [target, setTarget] = useState("");
  const [context, setContext] = useState(JSON.stringify(sampleContexts.permitRead, null, 2));
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getUsers().then((res) => setUsers(res.data));
  }, []);

  const selectedUser = useMemo(() => {
    return users.find((u) => u.user_id === userId);
  }, [users, userId]);

  const evaluate = async () => {
    setError("");
    setLoading(true);

    try {
      const ctxObj = JSON.parse(context);

      const res = await api.evaluate({
        user_id: userId,
        action,
        target,
        context: ctxObj,
      });

      setResult(res.data);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Context JSON is invalid. Please fix the formatting and try again.");
      } else {
        setError("Evaluation failed. Check the backend and request values.");
        setResult({
          error: "Evaluation failed",
          details: err?.response?.data || err.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="1200px" py={10}>
      <Stack spacing={6}>
        <Box>
          <Heading size="lg">PDP Test Console</Heading>
          <Text color="gray.600" mt={1}>
            Test policy decisions using user identity, action, target, and runtime context.
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", xl: "1.1fr 0.9fr" }} gap={6}>
          <GridItem>
            <Card borderRadius="2xl" boxShadow="sm" bg="white" border="1px solid" borderColor="gray.100">
              <CardHeader pb={2}>
                <Heading size="md">Evaluation Input</Heading>
              </CardHeader>

              <CardBody>
                <Stack spacing={5}>
                  <FormControl>
                    <FormLabel>Select User</FormLabel>
                    <Select value={userId} onChange={(e) => setUserId(e.target.value)} bg="white">
                      <option value="">Select user</option>
                      {users.map((u) => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.name} ({u.user_id})
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <FormControl>
                      <FormLabel>Action</FormLabel>
                      <Input
                        placeholder="e.g. read"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        bg="white"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Target</FormLabel>
                      <Input
                        placeholder="e.g. patient_records"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        bg="white"
                      />
                    </FormControl>
                  </Grid>

                  <FormControl>
                    <FormLabel>Context (JSON)</FormLabel>
                    <Textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={10}
                      fontFamily="mono"
                      bg="gray.50"
                    />
                  </FormControl>

                  <HStack spacing={3} flexWrap="wrap">
                    <Button
                      onClick={() => setContext(JSON.stringify(sampleContexts.permitRead, null, 2))}
                      variant="outline"
                    >
                      Load Permit Sample
                    </Button>
                    <Button
                      onClick={() => setContext(JSON.stringify(sampleContexts.denyRead, null, 2))}
                      variant="outline"
                    >
                      Load Deny Sample
                    </Button>
                    <Button
                      colorScheme="teal"
                      onClick={evaluate}
                      isLoading={loading}
                    >
                      Evaluate Request
                    </Button>
                  </HStack>

                  {error && (
                    <Alert status="error" borderRadius="xl">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}
                </Stack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Stack spacing={6}>
              <Card borderRadius="2xl" boxShadow="sm" bg="white" border="1px solid" borderColor="gray.100">
                <CardHeader pb={2}>
                  <Heading size="md">Selected User</Heading>
                </CardHeader>
                <CardBody>
                  {selectedUser ? (
                    <Stack spacing={3}>
                      <Text fontWeight="700">{selectedUser.name}</Text>
                      <HStack spacing={2} flexWrap="wrap">
                        <Badge colorScheme="teal" px={3} py={1} borderRadius="full">
                          {selectedUser.role}
                        </Badge>
                        <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                          {selectedUser.organisation || "No organisation"}
                        </Badge>
                      </HStack>

                      <Box bg="gray.50" p={4} borderRadius="xl">
                        <Box as="pre" fontSize="xs" whiteSpace="pre-wrap">
                          {JSON.stringify(selectedUser, null, 2)}
                        </Box>
                      </Box>
                    </Stack>
                  ) : (
                    <Text color="gray.500">Choose a user to preview their attributes.</Text>
                  )}
                </CardBody>
              </Card>

              <Card borderRadius="2xl" boxShadow="sm" bg="white" border="1px solid" borderColor="gray.100">
                <CardHeader pb={2}>
                  <Heading size="md">Evaluation Result</Heading>
                </CardHeader>
                <CardBody>
                  {result ? (
                    <Stack spacing={4}>
                      <HStack spacing={3}>
                        <Badge
                          colorScheme={result.decision === "PERMIT" ? "green" : "red"}
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="0.9rem"
                        >
                          {result.decision}
                        </Badge>

                        {"cache_hit" in result && (
                          <Badge
                            colorScheme={result.cache_hit ? "purple" : "gray"}
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            cache_hit: {String(result.cache_hit)}
                          </Badge>
                        )}
                      </HStack>

                      <Box bg="gray.900" color="gray.100" p={4} borderRadius="xl">
                        <Box as="pre" fontSize="sm" whiteSpace="pre-wrap">
                          {JSON.stringify(result, null, 2)}
                        </Box>
                      </Box>
                    </Stack>
                  ) : (
                    <Text color="gray.500">Run an evaluation to see the response here.</Text>
                  )}
                </CardBody>
              </Card>
            </Stack>
          </GridItem>
        </Grid>
      </Stack>
    </Container>
  );
}