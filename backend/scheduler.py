import random
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from speedtest_service import run_speedtest
from database import save_result
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def job():
    logger.info("Running speedtest job...")
    try:
        result = run_speedtest()
        save_result(result)
        logger.info("Speedtest job completed successfully.")
    except Exception as e:
        logger.error(f"Error running speedtest job: {e}")

def schedule_random_jobs():
    # Remove existing daily random jobs to prevent duplicates
    for scheduled_job in scheduler.get_jobs():
        if scheduled_job.id.startswith('random_speedtest'):
            scheduler.remove_job(scheduled_job.id)
            
    # Pick 2 random times (one in AM, one in PM)
    h1 = random.randint(0, 11)
    m1 = random.randint(0, 59)
    
    h2 = random.randint(12, 23)
    m2 = random.randint(0, 59)
    
    scheduler.add_job(job, 'cron', hour=h1, minute=m1, id='random_speedtest_1')
    scheduler.add_job(job, 'cron', hour=h2, minute=m2, id='random_speedtest_2')
    logger.info(f"Scheduled today's speedtests at {h1:02d}:{m1:02d} and {h2:02d}:{m2:02d}")

# The randomizer runs every midnight to pick times for the new day
scheduler.add_job(schedule_random_jobs, 'cron', hour=0, minute=0, id='daily_randomizer')

# Call once at startup so we have jobs scheduled for today
schedule_random_jobs()

def start_scheduler():
    logger.info("Starting scheduler...")
    scheduler.start()

def stop_scheduler():
    logger.info("Stopping scheduler...")
    scheduler.shutdown()
