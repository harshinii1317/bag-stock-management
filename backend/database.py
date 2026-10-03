import pymysql
from pymysql.cursors import DictCursor
from config import Config
from contextlib import contextmanager

def get_db_connection():
    """Establish and return a PyMySQL connection with dictionary cursor."""
    return pymysql.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        port=Config.DB_PORT,
        cursorclass=DictCursor,
        autocommit=False
    )

@contextmanager
def get_db():
    """
    Context manager for database connections ensuring transactions are safely
    handled with automatic commit or rollback upon exceptions.
    """
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
