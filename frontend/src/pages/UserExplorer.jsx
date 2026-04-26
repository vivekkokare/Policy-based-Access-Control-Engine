import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";

export default function UserExplorer() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers()
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const roles = useMemo(() => {
    const unique = [...new Set(users.map((u) => u.role).filter(Boolean))];
    return unique.sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.user_id?.toLowerCase().includes(search.toLowerCase()) ||
        u.organisation?.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  return (
    <Container maxW="1200px" py={10}>
      <Stack spacing={6}>
        <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
          <Box>
            <Heading size="lg">User Explorer</Heading>
            <Text color="gray.600" mt={1}>
              Browse all medical users and attributes used by the policy engine.
            </Text>
          </Box>

          <HStack spacing={3} w={{ base: "100%", md: "auto" }}>
            <Input
              placeholder="Search by name, ID, or organisation"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              bg="white"
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              bg="white"
              maxW="200px"
            >
              <option value="all">All roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box bg="white" p={5} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Text color="gray.500" fontSize="sm">Total Users</Text>
            <Heading size="lg" mt={1}>{users.length}</Heading>
          </Box>
          <Box bg="white" p={5} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Text color="gray.500" fontSize="sm">Visible Results</Text>
            <Heading size="lg" mt={1}>{filteredUsers.length}</Heading>
          </Box>
          <Box bg="white" p={5} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Text color="gray.500" fontSize="sm">Distinct Roles</Text>
            <Heading size="lg" mt={1}>{roles.length}</Heading>
          </Box>
        </SimpleGrid>

        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner size="xl" color="teal.500" />
          </Flex>
        ) : (
          <Stack spacing={4}>
            {filteredUsers.map((u) => (
              <Box
                key={u.user_id}
                bg="white"
                p={6}
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
              >
                <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3} mb={4}>
                  <Box>
                    <Heading size="md">{u.name}</Heading>
                    <Text color="gray.500" fontSize="sm">{u.user_id}</Text>
                  </Box>

                  <HStack spacing={2}>
                    <Badge colorScheme="teal" px={3} py={1} borderRadius="full">
                      {u.role}
                    </Badge>
                    {u.organisation && (
                      <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                        {u.organisation}
                      </Badge>
                    )}
                  </HStack>
                </Flex>

                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                  {Object.entries(u).map(([key, value]) => (
                    <GridItem key={key}>
                      <Box bg="gray.50" p={3} borderRadius="xl">
                        <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
                          {key.replaceAll("_", " ")}
                        </Text>
                        <Text fontSize="sm" color="gray.800" wordBreak="break-word">
                          {Array.isArray(value)
                            ? value.join(", ")
                            : typeof value === "boolean"
                            ? value.toString()
                            : String(value)}
                        </Text>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}