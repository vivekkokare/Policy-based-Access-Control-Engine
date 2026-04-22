import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";

export default function PolicyExplorer() {
  const [policies, setPolicies] = useState([]);
  const [search, setSearch] = useState("");
  const [effectFilter, setEffectFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPolicies()
      .then((res) => setPolicies(res.data.engine_policies || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const matchesSearch =
        p.uid?.toLowerCase().includes(search.toLowerCase()) ||
        p.role?.toLowerCase().includes(search.toLowerCase()) ||
        p.action?.toLowerCase().includes(search.toLowerCase()) ||
        p.target?.toLowerCase().includes(search.toLowerCase()) ||
        p.scenario?.toLowerCase().includes(search.toLowerCase());

      const matchesEffect = effectFilter === "all" || p.effect === effectFilter;

      return matchesSearch && matchesEffect;
    });
  }, [policies, search, effectFilter]);

  return (
    <Container maxW="1200px" py={10}>
      <Stack spacing={6}>
        <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
          <Box>
            <Heading size="lg">Policy Explorer</Heading>
            <Text color="gray.600" mt={1}>
              Review engine-ready policies, constraints, duties, and expected access outcomes.
            </Text>
          </Box>

          <HStack spacing={3} w={{ base: "100%", md: "auto" }}>
            <Input
              placeholder="Search policies"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              bg="white"
            />
            <Select
              value={effectFilter}
              onChange={(e) => setEffectFilter(e.target.value)}
              bg="white"
              maxW="180px"
            >
              <option value="all">All effects</option>
              <option value="permit">Permit</option>
              <option value="deny">Deny</option>
            </Select>
          </HStack>
        </Flex>

        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner size="xl" color="teal.500" />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
            {filteredPolicies.map((p) => (
              <Box
                key={p.uid}
                bg="white"
                p={6}
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
              >
                <Stack spacing={4}>
                  <Flex justify="space-between" align="start" gap={4}>
                    <Box>
                      <Heading size="md">{p.uid}</Heading>
                      <Text color="gray.600" mt={1}>{p.scenario}</Text>
                    </Box>

                    <Badge
                      colorScheme={p.effect === "permit" ? "green" : "red"}
                      px={3}
                      py={1}
                      borderRadius="full"
                      whiteSpace="nowrap"
                    >
                      {p.effect?.toUpperCase()}
                    </Badge>
                  </Flex>

                  <HStack spacing={2} flexWrap="wrap">
                    <Badge colorScheme="teal" px={3} py={1} borderRadius="full">
                      role: {p.role}
                    </Badge>
                    <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                      action: {p.action}
                    </Badge>
                    <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                      target: {p.target}
                    </Badge>
                  </HStack>

                  <Box>
                    <Text fontWeight="700" mb={2}>Constraints</Text>
                    {p.constraints?.length ? (
                      <Stack spacing={2}>
                        {p.constraints.map((c, idx) => (
                          <Box key={idx} bg="gray.50" p={3} borderRadius="xl">
                            <Text fontSize="sm" color="gray.700">
                              <strong>{c.leftOperand}</strong> {c.operator} <strong>{String(c.rightOperand)}</strong>
                            </Text>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Text color="gray.500" fontSize="sm">No constraints</Text>
                    )}
                  </Box>

                  <Box>
                    <Text fontWeight="700" mb={2}>Duties</Text>
                    {p.duties?.length ? (
                      <HStack spacing={2} flexWrap="wrap">
                        {p.duties.map((d, idx) => (
                          <Badge key={idx} colorScheme="orange" px={3} py={1} borderRadius="full">
                            {d.action}
                          </Badge>
                        ))}
                      </HStack>
                    ) : (
                      <Text color="gray.500" fontSize="sm">No duties</Text>
                    )}
                  </Box>

                  <Box bg="gray.900" color="gray.100" p={4} borderRadius="xl" overflowX="auto">
                    <Text fontSize="xs" color="gray.400" mb={2}>
                      Raw Policy JSON
                    </Text>
                    <Box as="pre" fontSize="xs" whiteSpace="pre-wrap">
                      {JSON.stringify(p, null, 2)}
                    </Box>
                  </Box>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
}