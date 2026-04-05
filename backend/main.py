from fastapi import FastAPI
from pydantic import BaseModel
from odrl_parser import ODRLParser
from context_provider import ContextProvider
from logic_evaluator import LogicEvaluator
from policy_enforcer import PolicyEnforcer
from fastapi.middleware.cors import CORSMiddleware

# Load ODRL + Users
parser = ODRLParser("../data/policies.json", "../data/users.json")
engine_policies, full_odrl_policies = parser.load_and_validate()
users = parser.load_users()

# Init engine
pip = ContextProvider(users)
pdp = LogicEvaluator(engine_policies, full_odrl_policies)
pep = PolicyEnforcer(pip, pdp)


app = FastAPI()

class EvaluationRequest(BaseModel):
    user_id: str
    action: str
    target: str
    context: dict = {}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/users")
def get_users():
    return users

@app.get("/policies")
def get_policies():
    return {
        "engine_policies": engine_policies,
        "full_odrl_policies": full_odrl_policies
    }

@app.post("/evaluate")
def evaluate(req: EvaluationRequest):
    return pep.enforce(
        req.user_id,
        req.action,
        req.target,
        req.context
    )
