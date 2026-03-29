import subprocess
import traceback

with open("full_alembic_log.txt", "w") as f:
    try:
        res = subprocess.run(["uv", "run", "alembic", "upgrade", "head"], capture_output=True, text=True, encoding='utf-8')
        f.write("STDOUT:\n" + res.stdout + "\n")
        f.write("STDERR:\n" + res.stderr + "\n")
    except Exception as e:
        f.write("EXC:\n" + str(e) + "\n" + traceback.format_exc() + "\n")
