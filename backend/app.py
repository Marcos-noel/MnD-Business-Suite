# Entry point for Render deployment
# This file imports the FastAPI app from app.main

from app.main import app

# The app object is exported as 'app' for uvicorn
# Using 'uvicorn app:app' will find it here