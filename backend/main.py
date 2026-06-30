from fastapi import FastAPI, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import get_all_results
import os
from scheduler import start_scheduler, stop_scheduler, job

app = FastAPI()

@app.on_event("startup")
def startup_event():
    start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    stop_scheduler()

@app.get("/results")
def results():
    return get_all_results()

from speedtest_service import run_speedtest
from database import save_result
from fastapi import HTTPException

@app.post("/speedtest/run")
def trigger_speedtest():
    try:
        result = run_speedtest()
        save_result(result)
        return {"status": "success", "result": result}
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="The 'speedtest' CLI is missing. Please install the official Ookla Speedtest CLI and ensure it is in your PATH.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speedtest failed: {str(e)}")

frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
app.mount("/static", StaticFiles(directory=frontend_path), name="static")

@app.get("/")
def index():
    return FileResponse(os.path.join(frontend_path, "index.html"))
