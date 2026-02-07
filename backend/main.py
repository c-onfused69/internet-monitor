from fastapi import FastAPI
from database import get_all_results

app = FastAPI()

@app.get("/results")
def results():
    return get_all_results()
