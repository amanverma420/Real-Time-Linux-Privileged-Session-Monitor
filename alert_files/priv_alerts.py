import time
import subprocess

def tail_log(file_path):
    with open(file_path, "r") as f:
        f.seek(0, 2)  # go to end of file
        while True:
            line = f.readline()
            if not line:
                time.sleep(0.2)
                continue
            yield line

WATCH = ["rm -rf", "nc", "nmap", "wget", "curl", "scp", "bash -i", "mkfs", "dd if=", "chmod 777"]
seen = {}  # key: command, value: last alert time (epoch)
reset_interval = 300  # 5 minutes

for log in tail_log("/var/log/audit/audit.log"):
    if "execve" in log:
        for cmd in WATCH:
            now = time.time()
            if cmd in log:
                if cmd not in seen or (now - seen[cmd]) > reset_interval:
                    try:
                        subprocess.run(["notify-send", f"⚠ Suspicious Command Detected", cmd])
                    except Exception as e:
                        print(f"[ERROR] Notification failed: {e}")
                    print(f"[ALERT] {cmd} => {log.strip()}")
                    seen[cmd] = now

