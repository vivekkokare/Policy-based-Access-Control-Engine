import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import UserExplorer from "./pages/UserExplorer";
import PolicyExplorer from "./pages/PolicyExplorer";
import PdpTest from "./pages/PdpTest";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  Badge,
} from "@chakra-ui/react";
import { FiUsers, FiShield, FiDatabase, FiCheckCircle } from "react-icons/fi";

function NavButton({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Button
      as={Link}
      to={to}
      variant={active ? "solid" : "ghost"}
      colorScheme={active ? "teal" : "gray"}
      color={active ? "white" : "whiteAlpha.900"}
      bg={active ? "whiteAlpha.300" : "transparent"}
      _hover={{
        bg: "whiteAlpha.250",
      }}
      borderRadius="full"
      px={5}
    >
      {children}
    </Button>
  );
}

function HomePage() {
  return (
    <Container maxW="1200px" py={10}>
      <Stack spacing={8}>
        <Box
          bgGradient="linear(to-r, teal.600, cyan.500)"
          color="white"
          borderRadius="2xl"
          px={{ base: 6, md: 10 }}
          py={{ base: 8, md: 12 }}
          boxShadow="xl"
        >
          <Stack spacing={5} maxW="720px">
            <Badge
              w="fit-content"
              px={3}
              py={1}
              borderRadius="full"
              bg="whiteAlpha.250"
              color="white"
              fontSize="0.8rem"
            >
              Policy-Based Access Control Engine
            </Badge>

            <Heading size="2xl" lineHeight="1.1">
              MEDiGuard PBAC
            </Heading>

            <Text fontSize="lg" color="whiteAlpha.900">
              A medical data access-control prototype for evaluating policy decisions
              using users, roles, context, and ODRL-inspired rules.
            </Text>

            <HStack spacing={4} pt={2} flexWrap="wrap">
              <Button
                as={Link}
                to="/pdp"
                colorScheme="blackAlpha"
                bg="white"
                color="teal.700"
                _hover={{ bg: "gray.100" }}
                size="lg"
                borderRadius="full"
              >
                Open PDP Test
              </Button>

              <Button
                as={Link}
                to="/policies"
                variant="outline"
                borderColor="whiteAlpha.700"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                size="lg"
                borderRadius="full"
              >
                Explore Policies
              </Button>
            </HStack>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6}>
          <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" border="1px solid" borderColor="gray.100">
            <HStack mb={3}>
              <Icon as={FiUsers} boxSize={5} color="teal.500" />
              <Text fontWeight="700">Users</Text>
            </HStack>
            <Text color="gray.600" fontSize="sm">
              Browse available medical roles and user attributes used in access evaluation.
            </Text>
          </Box>

          <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" border="1px solid" borderColor="gray.100">
            <HStack mb={3}>
              <Icon as={FiShield} boxSize={5} color="teal.500" />
              <Text fontWeight="700">Policies</Text>
            </HStack>
            <Text color="gray.600" fontSize="sm">
              Inspect engine-ready policies, constraints, duties, and scenario descriptions.
            </Text>
          </Box>

          <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" border="1px solid" borderColor="gray.100">
            <HStack mb={3}>
              <Icon as={FiDatabase} boxSize={5} color="teal.500" />
              <Text fontWeight="700">Context Aware</Text>
            </HStack>
            <Text color="gray.600" fontSize="sm">
              Decisions can depend on purpose, consent status, time, role, and other runtime context.
            </Text>
          </Box>

          <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" border="1px solid" borderColor="gray.100">
            <HStack mb={3}>
              <Icon as={FiCheckCircle} boxSize={5} color="teal.500" />
              <Text fontWeight="700">PDP Testing</Text>
            </HStack>
            <Text color="gray.600" fontSize="sm">
              Evaluate real requests and inspect permit or deny responses directly from the UI.
            </Text>
          </Box>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

function AppShell() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Box
        bgGradient="linear(to-r, teal.700, teal.500)"
        color="white"
        boxShadow="sm"
        position="sticky"
        top="0"
        zIndex="10"
      >
        <Container maxW="1200px" py={4}>
          <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
            <Stack spacing={0}>
              <Heading as={Link} to="/" size="md" letterSpacing="tight">
                MEDiGuard PBAC
              </Heading>
              <Text fontSize="sm" color="whiteAlpha.800">
                Medical Policy Decision Console
              </Text>
            </Stack>

            <HStack spacing={2}>
              <NavButton to="/users">Users</NavButton>
              <NavButton to="/policies">Policies</NavButton>
              <NavButton to="/pdp">PDP Test</NavButton>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/users" element={<UserExplorer />} />
        <Route path="/policies" element={<PolicyExplorer />} />
        <Route path="/pdp" element={<PdpTest />} />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;