import sqlite3
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "results.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS speedtest_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            download REAL NOT NULL,
            upload REAL NOT NULL,
            ping REAL NOT NULL,
            jitter REAL NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def save_result(result):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    cursor.execute('''
        INSERT INTO speedtest_results (timestamp, download, upload, ping, jitter)
        VALUES (?, ?, ?, ?, ?)
    ''', (timestamp, result['download'], result['upload'], result['ping'], result['jitter']))
    conn.commit()
    conn.close()

def get_all_results():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT timestamp, download, upload, ping, jitter FROM speedtest_results ORDER BY timestamp ASC')
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        results.append({
            "timestamp": row[0],
            "download": row[1],
            "upload": row[2],
            "ping": row[3],
            "jitter": row[4]
        })
    return results

init_db()
