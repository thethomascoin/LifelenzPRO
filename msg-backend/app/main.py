# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from celery.result import AsyncResult
from app.worker import create_schedule_task

app = FastAPI()

# Allow CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set this to your specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input Schema
class ScheduleRequest(BaseModel):
    store_id: str
    week_start_date: str
    constraints: dict

@app.post("/generate-schedule", status_code=202)
def generate_schedule(payload: ScheduleRequest):
    """
    Triggers the AI Engine. Returns a Task ID immediately.
    Does NOT wait for the calculation to finish.
    """
    task = create_schedule_task.delay(payload.week_start_date, payload.constraints)
    return {"task_id": task.id, "message": "Schedule generation started."}

@app.get("/tasks/{task_id}")
def get_status(task_id: str):
    """
    Check the status of the AI Engine.
    Frontend polls this endpoint.
    """
    task_result = AsyncResult(task_id)
    result = {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result
    }
    return result
