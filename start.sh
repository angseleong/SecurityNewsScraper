#!/usr/bin/env bash

# Run the background scheduler worker in the background
python -m backend.worker &

# Start the gunicorn web server in the foreground
exec gunicorn -w 2 -b 0.0.0.0:${PORT:-5000} backend.main:app
