from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from speedtest_service import run_speedtest
from database import save_result

scheduler = BackgroundScheduler()

def job():
    result = run_speedtest()
    save_result(result)

scheduler.add_job(job, 'cron', hour=11, minute=0)
scheduler.add_job(job, 'cron', hour=23, minute=0)

scheduler.start()
