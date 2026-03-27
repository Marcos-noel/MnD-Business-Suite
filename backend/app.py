# Entry point for Render deployment
# This file simply imports the FastAPI app from app.main

from app.main import app

# For gunicorn/uvicorn to find the app
app = app