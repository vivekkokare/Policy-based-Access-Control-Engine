import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UserExplorer from "./pages/UserExplorer";
import PolicyExplorer from "./pages/PolicyExplorer";
import PdpTest from "./pages/PdpTest";

import { Flex, Box, Button, Heading } from "@chakra-ui/react";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        {/* Navigation */}
        <nav style={{ marginBottom: "20px" }}>                
          <Box bg="teal.500" p={4} mb={6}>
            <Flex justify="space-between" align="center" maxW="1200px" mx="auto">
              <Heading size="md" color="white">
                MEDiGuard PBAC
              </Heading>

              <Flex gap={4}>
                
                <Button
                  as={Link} to="/users" colorScheme="whiteAlpha" variant="outline" color="white"
                  _hover={{
                    bg: "whiteAlpha.300",
                    borderColor: "white",
                    transform: "scale(1.05)",
                    transition: "all 0.15s ease-in-out",
                  }}
                >
                  Users
                </Button>
                <Button
                  as={Link} to="/policies" colorScheme="whiteAlpha" variant="outline" color="white"
                  _hover={{
                    bg: "whiteAlpha.300",
                    borderColor: "white",
                    transform: "scale(1.05)",
                    transition: "all 0.15s ease-in-out",
                  }}
                >
                  Policies
                </Button>
                <Button
                  as={Link} to="/pdp" colorScheme="whiteAlpha" variant="outline" color="white"
                  _hover={{
                    bg: "whiteAlpha.300",
                    borderColor: "white",
                    transform: "scale(1.05)",
                    transition: "all 0.15s ease-in-out",
                  }}
                >
                  PDP Test
                </Button>
              </Flex>
            </Flex>
          </Box>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/users" element={<UserExplorer />} />
          <Route path="/" element={<h2>Welcome to PBAC Frontend</h2>} />
          <Route path="/policies" element={<PolicyExplorer />} />
          <Route path="/pdp" element={<PdpTest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;