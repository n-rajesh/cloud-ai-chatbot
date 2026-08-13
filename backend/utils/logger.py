"""
utils/logger.py
Configures a consistent application-wide logger.
"""

import logging
import sys


def configure_logger(app):
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
    )
    handler.setFormatter(formatter)

    app.logger.handlers = [handler]
    app.logger.setLevel(logging.INFO)

    # Quiet down noisy third-party loggers in production
    logging.getLogger("werkzeug").setLevel(logging.WARNING)

    return app.logger
