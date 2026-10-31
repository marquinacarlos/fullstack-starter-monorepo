import os

# Tests must not depend on any .env file or on real databases. This runs before conftest.py,
# so the app can be imported safely. Real environment variables, if set, still win.
os.environ.setdefault("SQLITE_URL", "sqlite://")  # in memory  # scaffold:line sqlite
os.environ.setdefault("POSTGRES_URL", "")  # disabled  # scaffold:line postgres
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")
