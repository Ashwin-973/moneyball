import subprocess
import os

try:
    res = subprocess.run(["uv", "run", "alembic", "upgrade", "head"], capture_output=True, text=True, encoding='utf-8')
    print("STDOUT:", res.stdout)
    print("STDERR:", res.stderr)
except Exception as e:
    print("EXC", str(e))
