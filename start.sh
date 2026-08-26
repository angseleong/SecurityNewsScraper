#!/usr/bin/env bash

# Run the background scheduler worker in the background
python -m backend.worker &

# Start the gunicorn web server in the foreground. Bind to [::] to support AlwaysData IPv6 proxy.
exec gunicorn -w 1 -b "[::]:${PORT:-5000}" backend.main:app
