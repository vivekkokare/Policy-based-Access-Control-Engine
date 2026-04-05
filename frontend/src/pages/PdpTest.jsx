/*Policy Decision Point Test Console*/

import React, { useState, useEffect } from "react";
import api from "../api/api";

import { Box, Card, CardHeader, CardBody, Heading, FormControl, FormLabel, Select, Input, Textarea, Button } from "@chakra-ui/react";


export default function PdpTest() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [target, setTarget] = useState("");
  const [context, setContext] = useState("{}");
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.getUsers().then(res => setUsers(res.data));
  }, []);

  const evaluate = () => {
    const ctxObj = JSON.parse(context);

    api.evaluate({
      user_id: userId,
      action,
      target,
      context: ctxObj
    })
    .then(res => setResult(res.data))
    .catch(err => setResult({ error: "Evaluation failed", details: err }));
  };

  return (
    <Box maxW="800px" mx="auto" mt={12} px={6} py={4}>
      <Card boxShadow="md" borderRadius="md">
        <CardHeader>
          <Heading size="md">PDP Test Console</Heading>
        </CardHeader>

        <CardBody>        
          <FormControl mb={4}>
            <FormLabel>Select User</FormLabel>
            <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.name} ({u.user_id})
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Action</FormLabel>
            <Input
              placeholder="e.g., read"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Target</FormLabel>
            <Input
              placeholder="e.g., patient_records"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Context (JSON)</FormLabel>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={6}
              placeholder='{"purpose":"treatment","consent_status":"active"}'
            />
          </FormControl>

          <Button colorScheme="teal" width="100%" onClick={evaluate}>
            Evaluate
          </Button>
        </CardBody>
      </Card>
      
      {result && (
        <Card mt={6} boxShadow="sm" borderRadius="md" bg="gray.50">
          <CardHeader>
            <Heading size="md" color="teal.600">
              Evaluation Result
            </Heading>
          </CardHeader>

          <CardBody>
            <Box
              as="pre"
              whiteSpace="pre-wrap"
              p={4}
              bg="white"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
              fontSize="sm"
            >
              {JSON.stringify(result, null, 2)}
            </Box>
          </CardBody>
        </Card>
      )}

    </Box>
  );
}