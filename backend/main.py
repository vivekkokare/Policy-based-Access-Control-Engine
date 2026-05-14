# FastAPI server for Policy-based Access Control Engine
# Implements a Policy Decision Point (PDP) and Policy Enforcement Point (PEP)

from fastapi import FastAPI
from pydantic import BaseModel
from odrl_parser import ODRLParser
from context_provider import ContextProvider
from logic_evaluator import LogicEvaluator
from policy_enforcer import PolicyEnforcer
from decision_cache import DecisionCache
from fastapi.middleware.cors import CORSMiddleware

# ===== INITIALIZATION =====
# Load ODRL policies and user database from JSON files
parser = ODRLParser("../data/policies.json", "../data/users.json")
engine_policies, full_odrl_policies = parser.load_and_validate()
users = parser.load_users()

# Initialize the access control engine components:
# - PIP (Policy Information Point): provides user context
# - PDP (Policy Decision Point): evaluates policies and makes decisions
# - Cache: stores recent decisions to improve performance (5 minute TTL)
# - PEP (Policy Enforcement Point): enforces policies and executes duties
pip = ContextProvider(users)
pdp = LogicEvaluator(engine_policies, full_odrl_policies)
cache = DecisionCache(ttl_seconds=300)  # 5 minutes
pep = PolicyEnforcer(pip, pdp, cache)

# Initialize FastAPI application
app = FastAPI()


# ===== DATA MODELS =====
class EvaluationRequest(BaseModel):
    """Request model for policy evaluation endpoint"""
    user_id: str      # Identifier of the user making the request
    action: str       # The action being requested (e.g., 'read', 'write')
    target: str       # The resource being accessed
    context: dict = {}  # Optional contextual information for constraint evaluation


# ===== MIDDLEWARE =====
# Enable CORS to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== API ENDPOINTS =====

@app.get("/users")
def get_users():
    """Retrieve all users from the database"""
    return users


@app.get("/policies")
def get_policies():
    """Retrieve all policies (both engine-optimized and full ODRL format)"""
    return {
        "engine_policies": engine_policies,
        "full_odrl_policies": full_odrl_policies
    }


@app.post("/evaluate")
def evaluate(req: EvaluationRequest):
    """Main endpoint: Evaluate access control decision for a user-action-target combination
    
    Args:
        req: EvaluationRequest containing user_id, action, target, and optional context
    
    Returns:
        Dict with decision (PERMIT/DENY), applicable policy, duties, and cache status
    """
    return pep.enforce(
        req.user_id,
        req.action,
        req.target,
        req.context
    )