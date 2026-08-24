"""
api/__init__.py — Flask application factory for SecurityNewsScraper.
"""

from flask import Flask
from flask_cors import CORS
from .routes import register_routes


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    CORS(app)  # Allow Next.js frontend to call this API

    register_routes(app)
    return app
