import subprocess
import json

def run_speedtest():
    result = subprocess.run(
        ["speedtest", "--format=json"],
        capture_output=True,
        text=True
    )

    data = json.loads(result.stdout)

    return {
        "download": data["download"]["bandwidth"] / 125000,  # Mbps
        "upload": data["upload"]["bandwidth"] / 125000,
        "ping": data["ping"]["latency"],
        "jitter": data["ping"]["jitter"]
    }
