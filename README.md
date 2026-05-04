# Policy-Based Access Control Engine

A full-stack prototype for testing Policy-Based Access Control (PBAC) decisions in a medical data environment.

The project contains a FastAPI backend that evaluates access requests against ODRL-inspired policy data, plus a React frontend for browsing users, browsing policies, and testing PDP decisions from a UI.

## What This Project Does

This application lets you:

- Browse medical users and their attributes.
- Browse engine-ready policies, constraints, duties, and raw policy JSON.
- Submit access requests with a selected user, action, target, and JSON context.
- Evaluate whether the request should be `PERMIT` or `DENY`.
- See which policy/rule was applied.
- See duties such as logging, watermarking, or anonymisation.
- Reuse cached decisions for repeated requests.

The current domain is medical data access control. Example scenarios include doctors reading patient records, researchers exporting anonymised datasets, nurses updating vital signs, and emergency staff accessing emergency summaries.

## Tech Stack

Backend:

- Python
- FastAPI
- Pydantic
- Uvicorn

Frontend:

- React
- Chakra UI
- Axios
- React Router

Data:

- JSON policy and user datasets stored in the `data/` folder.

## Project Structure

```text
Policy-based-Access-Control-Engine/
|-- backend/
|   |-- main.py                 # FastAPI app and API routes
|   |-- odrl_parser.py          # Loads policy and user JSON
|   |-- context_provider.py     # Resolves users and request context
|   |-- logic_evaluator.py      # Evaluates policies and constraints
|   |-- conflict_resolver.py    # Resolves permit/deny conflicts
|   |-- policy_enforcer.py      # Enforces decisions and duties
|   `-- decision_cache.py       # Caches repeated decisions
|-- data/
|   |-- policies.json           # ODRL-inspired policies
|   `-- users.json              # Sample medical users
|-- frontend/
|   |-- src/
|   |   |-- api/api.js          # Axios API client
|   |   |-- App.js              # App shell and routes
|   |   `-- pages/
|   |       |-- UserExplorer.jsx
|   |       |-- PolicyExplorer.jsx
|   |       `-- PdpTest.jsx
|   |-- package.json
|   `-- package-lock.json
|-- .gitignore
`-- README.md
```

## Prerequisites

Install these before running the project:

- Python 3.8 or newer
- Node.js and npm
- Git

Recommended versions used during development:

- Python `3.8.0`
- Node `24.14.0`
- npm `11.9.0`

Older maintained Node versions may also work, but if you run into frontend tooling issues, use a current LTS or the version above.

## Quick Start

You need two terminals:

- Terminal 1 runs the backend API on `http://127.0.0.1:8000`
- Terminal 2 runs the frontend app on `http://localhost:3000`

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Policy-based-Access-Control-Engine
```

If you already have the project locally, just open a terminal in the repository root.

## Backend Setup

Run these commands from the repository root.

### Windows PowerShell

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn pydantic
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn pydantic
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Important: start Uvicorn from inside the `backend/` folder. The backend currently loads data using relative paths:

```python
../data/policies.json
../data/users.json
```

If you run the backend from the wrong folder, it may fail to find the JSON data files.

When the backend starts successfully, you should see Uvicorn running on:

```text
http://127.0.0.1:8000
```

FastAPI docs will be available at:

```text
http://127.0.0.1:8000/docs
```

## Frontend Setup

Open a second terminal and run these commands from the repository root.

```bash
cd frontend
npm install
npm start
```

The React app should open at:

```text
http://localhost:3000
```

The frontend expects the backend to be running at:

```text
http://127.0.0.1:8000
```

That URL is configured in:

```text
frontend/src/api/api.js
```

## How to Use the App

### Home Page

The home page gives quick navigation to the main parts of the prototype:

- Users
- Policies
- PDP Test

### Users Page

Use the Users page to:

- View all sample users.
- Search users by name, ID, or organisation.
- Filter users by role.
- Inspect user attributes used by the policy engine.

### Policies Page

Use the Policies page to:

- View total policy count.
- Search policies by UID, role, action, target, or scenario.
- Filter by effect: `permit` or `deny`.
- Inspect constraints, duties, and raw policy JSON.

### PDP Test Page

Use the PDP Test page to evaluate access requests.

Inputs:

- User: selected from available users.
- Action: selected from known policy/preset actions.
- Target: selected from known policy/preset targets.
- Context: JSON runtime context.

Example context:

```json
{
  "purpose": "treatment",
  "consent_status": "active"
}
```

Click `Evaluate Request` to send the request to the backend PDP engine.

The result panel shows:

- Decision: `PERMIT`, `DENY`, or `ERROR`
- Applied policy/rule
- Explanation
- Duties identified
- Cache status

## API Endpoints

The backend exposes these endpoints.

### Get Users

```http
GET /users
```

Returns all users from `data/users.json`.

### Get Policies

```http
GET /policies
```

Returns:

- `engine_policies`: simplified policies used by the evaluator
- `full_odrl_policies`: full ODRL-inspired policy objects

### Evaluate Access Request

```http
POST /evaluate
```

Example request body:

```json
{
  "user_id": "u001",
  "action": "read",
  "target": "patient_records",
  "context": {
    "purpose": "treatment",
    "consent_status": "active"
  }
}
```

Example response:

```json
{
  "decision": "PERMIT",
  "policy": "policy_uid",
  "duties": [],
  "context": {
    "purpose": "treatment",
    "consent_status": "active"
  },
  "cache_hit": false
}
```

You can test endpoints interactively at:

```text
http://127.0.0.1:8000/docs
```

## How Policy Evaluation Works

At a high level:

1. The frontend sends `user_id`, `action`, `target`, and `context`.
2. The backend resolves the user from `data/users.json`.
3. The evaluator checks policies from `data/policies.json`.
4. A policy can match when:
   - the user role matches the policy role,
   - the requested action matches,
   - the requested target matches,
   - all constraints pass.
5. If multiple policies match, the conflict resolver applies a deny-overrides strategy.
6. The policy enforcer returns the final decision.
7. Duties are executed or reported where applicable.
8. The result is cached for repeated identical requests.

## Editing Data

### Add or Change Users

Edit:

```text
data/users.json
```

Each user should include a unique `user_id` and relevant attributes such as role, department, organisation, region, or employment status.

### Add or Change Policies

Edit:

```text
data/policies.json
```

Policies in `engine_policies` are used directly by the evaluator. Common fields include:

```json
{
  "uid": "example_policy",
  "role": "doctor",
  "action": "read",
  "target": "patient_records",
  "effect": "permit",
  "constraints": [
    {
      "leftOperand": "purpose",
      "operator": "eq",
      "rightOperand": "treatment"
    }
  ],
  "duties": [
    {
      "action": "log_access"
    }
  ]
}
```

Supported constraint operators are defined in `backend/logic_evaluator.py`:

- `eq`
- `neq`
- `gte`
- `lte`
- `gt`
- `lt`

Restart the backend after changing JSON data so the app reloads the latest users and policies.

## Useful Commands

Backend:

```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Frontend development server:

```bash
cd frontend
npm start
```

Frontend production build:

```bash
cd frontend
npm run build
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
pip install fastapi uvicorn pydantic
```

## Troubleshooting

### Frontend Shows Network Errors

Make sure the backend is running at:

```text
http://127.0.0.1:8000
```

Also check `frontend/src/api/api.js` to confirm the frontend base URL points to the backend.

### Backend Cannot Find `policies.json` or `users.json`

Start the backend from inside the `backend/` directory:

```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend uses relative paths to load files from `../data/`.

### PowerShell Blocks Virtual Environment Activation

If Windows PowerShell blocks activation, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then activate again:

```powershell
.\.venv\Scripts\Activate.ps1
```

### Port Already in Use

If `8000` is already used, run the backend on a different port:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Then update `frontend/src/api/api.js`:

```js
baseURL: "http://127.0.0.1:8001"
```

If `3000` is already used, React may ask to run on another port. Accept the prompt or stop the process using port `3000`.

### Changes to Data Do Not Appear

Restart the backend. Policies and users are loaded when the FastAPI app starts.

## Notes for Contributors

- Keep backend logic in small focused modules under `backend/`.
- Keep reusable API calls in `frontend/src/api/api.js`.
- Keep page-level UI in `frontend/src/pages/`.
- Avoid committing generated folders such as `node_modules/`, `build/`, `__pycache__/`, and virtual environments.
- Use the FastAPI docs page to test backend behavior before debugging the frontend.

## Current Limitations

- Policy and user data are loaded from JSON files, not a database.
- The backend uses permissive CORS settings for local development.
- The decision cache is in memory and resets when the backend restarts.
- There is no authentication layer around the demo API.
