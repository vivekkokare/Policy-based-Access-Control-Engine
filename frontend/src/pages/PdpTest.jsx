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
  Divider,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
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

const presets = [
  {
    label: "Doctor treatment access",
    user_id: "u001",
    action: "read",
    target: "patient_records",
    context: {
      purpose: "treatment",
      consent_status: "active",
    },
  },
  {
    label: "Doctor research export",
    user_id: "u001",
    action: "export",
    target: "research_dataset",
    context: {
      purpose: "medical_research",
      anonymised: true,
    },
  },
  {
    label: "Nurse update vitals",
    user_id: "u004",
    action: "update",
    target: "vital_signs",
    context: {
      patient_status: "admitted",
    },
  },
  {
    label: "Lab manager quality review",
    user_id: "u043",
    action: "read",
    target: "lab_results",
    context: {
      employment_status: "active",
      purpose: "quality_review",
    },
  },
  {
    label: "Paramedic emergency access",
    user_id: "u056",
    action: "read",
    target: "emergency_patient_summary",
    context: {
      emergency_access: true,
      purpose: "emergency_care",
    },
  },
  {
    label: "Receptionist denied diagnosis reports",
    user_id: "u045",
    action: "read",
    target: "diagnosis_reports",
    context: {},
  },
];

function buildFallbackReason(result, selectedUser, action, target) {
  if (!result) return "";

  if (result.reason) return result.reason;
  if (result.explanation) return result.explanation;

  const decision = String(result.decision || "").toLowerCase();

  const policyUid =
    result.matched_policy_uid ||
    result.matched_policy ||
    result.policy_uid ||
    result.policy ||
    "matching policy";

  const role = selectedUser?.role || "selected user";

  if (decision === "permit") {
    return `Permitted because the ${role} request matched ${policyUid} for action "${action}" on "${target}".`;
  }

  if (decision === "deny") {
    if (policyUid === "default_deny") {
      return `Denied because no permit policy allowed the ${role} to perform action "${action}" on "${target}".`;
    }

    return `Denied because the ${role} request matched ${policyUid} for action "${action}" on "${target}".`;
  }

  return "Decision returned by the policy engine.";
}

function getAppliedPolicy(result) {
  return (
    result?.matched_policy_uid ||
    result?.matched_policy ||
    result?.policy_uid ||
    result?.policy ||
    "Not returned by backend"
  );
}

function getDuties(result) {
  if (!result) return [];

  if (Array.isArray(result.duties)) {
    return result.duties.map((duty) =>
      typeof duty === "string" ? duty : duty.action || JSON.stringify(duty)
    );
  }

  if (Array.isArray(result.duty)) {
    return result.duty.map((duty) =>
      typeof duty === "string" ? duty : duty.action || JSON.stringify(duty)
    );
  }

  return [];
}

export default function PdpTest() {
  const [users, setUsers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [target, setTarget] = useState("");
  const [context, setContext] = useState(
    JSON.stringify(sampleContexts.permitRead, null, 2)
  );
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getUsers(), api.getPolicies()]).then(([usersRes, policiesRes]) => {
      setUsers(usersRes.data);
      setPolicies(policiesRes.data.engine_policies || []);
    });
  }, []);

  const selectedUser = useMemo(() => {
    return users.find((u) => u.user_id === userId);
  }, [users, userId]);

  const actionOptions = useMemo(() => {
    const values = [
      ...policies.map((policy) => policy.action),
      ...presets.map((preset) => preset.action),
    ].filter(Boolean);

    return [...new Set(values)].sort();
  }, [policies]);

  const targetOptions = useMemo(() => {
    const values = [
      ...policies.map((policy) => policy.target),
      ...presets.map((preset) => preset.target),
    ].filter(Boolean);

    return [...new Set(values)].sort();
  }, [policies]);

  const applyPreset = (preset) => {
    setUserId(preset.user_id);
    setAction(preset.action);
    setTarget(preset.target);
    setContext(JSON.stringify(preset.context, null, 2));
    setResult(null);
    setError("");
  };

  const evaluate = async () => {
    setError("");
    setResult(null);

    if (!userId) {
      setError("Please select a user before evaluating the request.");
      return;
    }

    if (!action) {
      setError("Please select an action before evaluating the request.");
      return;
    }

    if (!target) {
      setError("Please select a target before evaluating the request.");
      return;
    }

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
          decision: "ERROR",
          reason: err?.response?.data?.detail || err.message || "Backend evaluation failed.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const decision = String(result?.decision || "").toUpperCase();
  const isPermit = decision === "PERMIT";
  const isDeny = decision === "DENY";
  const appliedPolicy = getAppliedPolicy(result);
  const duties = getDuties(result);
  const reason = buildFallbackReason(result, selectedUser, action, target);

  return (
    <Container maxW="1200px" py={10}>
      <Stack spacing={6}>
        <Box>
          <Heading size="lg">PDP Test Console</Heading>
          <Text color="gray.600" mt={1}>
            Test policy decisions using user identity, action, target, and runtime context.
          </Text>
        </Box>

        <Card
          borderRadius="2xl"
          boxShadow="sm"
          bg="white"
          border="1px solid"
          borderColor="gray.100"
        >
          <CardHeader pb={2}>
            <Heading size="md">Showcase Presets</Heading>
            <Text color="gray.600" fontSize="sm" mt={1}>
              Click a preset to auto-fill the user, action, target, and context for demo testing.
            </Text>
          </CardHeader>

          <CardBody pt={2}>
            <HStack spacing={3} flexWrap="wrap">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  size="sm"
                  variant="outline"
                  colorScheme="teal"
                  borderRadius="full"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </HStack>
          </CardBody>
        </Card>

        <Grid templateColumns={{ base: "1fr", xl: "1.1fr 0.9fr" }} gap={6}>
          <GridItem>
            <Card
              borderRadius="2xl"
              boxShadow="sm"
              bg="white"
              border="1px solid"
              borderColor="gray.100"
            >
              <CardHeader pb={2}>
                <Heading size="md">Evaluation Input</Heading>
              </CardHeader>

              <CardBody>
                <Stack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel>Select User</FormLabel>
                    <Select
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      bg="white"
                    >
                      <option value="">Select user</option>
                      {users.map((u) => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.name} ({u.user_id}) - {u.role}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel>Action</FormLabel>
                      <Select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        bg="white"
                      >
                        <option value="">Select action</option>
                        {actionOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Target</FormLabel>
                      <Select
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        bg="white"
                      >
                        <option value="">Select target</option>
                        {targetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
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
                      onClick={() => {
                        setContext(JSON.stringify(sampleContexts.permitRead, null, 2));
                        setResult(null);
                        setError("");
                      }}
                      variant="outline"
                    >
                      Load Permit Sample
                    </Button>

                    <Button
                      onClick={() => {
                        setContext(JSON.stringify(sampleContexts.denyRead, null, 2));
                        setResult(null);
                        setError("");
                      }}
                      variant="outline"
                    >
                      Load Deny Sample
                    </Button>

                    <Button colorScheme="teal" onClick={evaluate} isLoading={loading}>
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
              <Card
                borderRadius="2xl"
                boxShadow="sm"
                bg="white"
                border="1px solid"
                borderColor="gray.100"
              >
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

                        {selectedUser.department && (
                          <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                            {selectedUser.department}
                          </Badge>
                        )}
                      </HStack>

                      <Box bg="gray.50" p={4} borderRadius="xl">
                        <Stack spacing={2}>
                          <Text fontSize="sm">
                            <strong>User ID:</strong> {selectedUser.user_id}
                          </Text>
                          <Text fontSize="sm">
                            <strong>Role:</strong> {selectedUser.role}
                          </Text>
                          <Text fontSize="sm">
                            <strong>Department:</strong>{" "}
                            {selectedUser.department || "Not specified"}
                          </Text>
                          <Text fontSize="sm">
                            <strong>Organisation:</strong>{" "}
                            {selectedUser.organisation || "Not specified"}
                          </Text>
                          <Text fontSize="sm">
                            <strong>Region:</strong> {selectedUser.region || "Not specified"}
                          </Text>
                        </Stack>
                      </Box>
                    </Stack>
                  ) : (
                    <Text color="gray.500">Choose a user to preview their attributes.</Text>
                  )}
                </CardBody>
              </Card>

              <Card
                borderRadius="2xl"
                boxShadow="sm"
                bg="white"
                border="1px solid"
                borderColor="gray.100"
              >
                <CardHeader pb={2}>
                  <Heading size="md">Evaluation Result</Heading>
                </CardHeader>

                <CardBody>
                  {result ? (
                    <Stack spacing={4}>
                      {result.error && (
                        <Alert status="error" borderRadius="xl">
                          <AlertIcon />
                          Evaluation failed. Please check request values and backend.
                        </Alert>
                      )}

                      <Box
                        border="1px solid"
                        borderColor={
                          isPermit ? "green.200" : isDeny ? "red.200" : "gray.200"
                        }
                        bg={isPermit ? "green.50" : isDeny ? "red.50" : "gray.50"}
                        p={4}
                        borderRadius="xl"
                      >
                        <Stack spacing={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.500" fontWeight="700">
                              Decision
                            </Text>
                            <Text
                              fontWeight="800"
                              fontSize="md"
                              color={isPermit ? "green.700" : isDeny ? "red.700" : "gray.700"}
                            >
                              {decision || "UNKNOWN"}
                            </Text>
                          </Box>

                          <Divider />

                          <Box>
                            <Text fontSize="sm" color="gray.500" fontWeight="700">
                              Applied Policy / Rule
                            </Text>
                            <Text fontWeight="700">{appliedPolicy}</Text>
                          </Box>

                          <Box>
                            <Text fontSize="sm" color="gray.500" fontWeight="700">
                              Why?
                            </Text>
                            <Text color="gray.700">{reason}</Text>
                          </Box>

                          <Box>
                            <Text fontSize="sm" color="gray.500" fontWeight="700">
                              Duties Identified
                            </Text>
                            {duties.length > 0 ? (
                              <HStack spacing={2} flexWrap="wrap" mt={1}>
                                {duties.map((duty) => (
                                  <Badge
                                    key={duty}
                                    colorScheme="blue"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                  >
                                    {String(duty).toUpperCase()}
                                  </Badge>
                                ))}
                              </HStack>
                            ) : (
                              <Text color="gray.600">None</Text>
                            )}
                          </Box>

                          <Box>
                            <Text fontSize="sm" color="gray.500" fontWeight="700">
                              Cache Status
                            </Text>

                            {"cache_hit" in result ? (
                              <Text
                                fontWeight="700"
                                color={result.cache_hit ? "purple.700" : "gray.700"}
                              >
                                {result.cache_hit
                                  ? "Served from cache"
                                  : "Fresh PDP evaluation"}
                              </Text>
                            ) : (
                              <Text color="gray.600">Not returned by backend</Text>
                            )}
                          </Box>
                        </Stack>
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
