import os

# Tests must not depend on any .env file or on a real database. This runs before conftest.py,
# so the app can be imported safely. Real environment variables, if set, still win.
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")
