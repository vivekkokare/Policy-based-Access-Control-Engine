import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function UserExplorer() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.getUsers().then((res) => setUsers(res.data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Explorer</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Organisation</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.user_id}>
              <td>{u.user_id}</td>
              <td>{u.name}</td>
              <td>{u.role}</td>
              <td>{u.organisation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}