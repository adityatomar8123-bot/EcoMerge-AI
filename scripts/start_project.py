#!/usr/bin/env python3
"""Start EcoSphere backend and frontend for local demos."""

import subprocess
import sys
import time
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent


def start_backend() -> subprocess.Popen:
    backend_script = repo_root / "backend" / "scripts" / "start_backend.py"
    return subprocess.Popen([sys.executable, str(backend_script)], cwd=repo_root / "backend")


def start_frontend() -> subprocess.Popen:
    frontend_dir = repo_root / "frontend"
    return subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir, shell=True)


def main() -> None:
    print("Starting EcoSphere local stack")
    backend_process = start_backend()
    time.sleep(5)
    frontend_process = start_frontend()

    print("Frontend: http://localhost:3001")
    print("Backend:  http://localhost:8000")
    print("API docs: http://localhost:8000/docs")
    print("Press Ctrl+C to stop both services")

    try:
        while backend_process.poll() is None and frontend_process.poll() is None:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping EcoSphere local stack")
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait(timeout=10)
        frontend_process.wait(timeout=10)


if __name__ == "__main__":
    main()
