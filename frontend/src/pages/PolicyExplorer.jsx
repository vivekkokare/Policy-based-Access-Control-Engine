import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function PolicyExplorer() {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    api.getPolicies().then((res) => {
      setPolicies(res.data.engine_policies);
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Policy Explorer</h2>

      {policies.map((p) => (
        <div key={p.uid} style={{ marginBottom: "20px" }}>
          <strong>{p.uid}</strong>
          <p>{p.scenario}</p>

          <pre style={{ background: "#f0f0f0", padding: "10px" }}>
            {JSON.stringify(p, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}