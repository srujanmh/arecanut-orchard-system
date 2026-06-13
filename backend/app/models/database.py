from app.config import settings
import sys

# 1. Fallback Mock Classes for Python 3.14 / SQLAlchemy compatibility
class MockBase:
    __allow_unmapped__ = True
    def __init__(self, *args, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

class MockColumn:
    def __init__(self, *args, **kwargs):
        pass

class MockSession:
    def query(self, *args, **kwargs): return self
    def filter(self, *args, **kwargs): return self
    def order_by(self, *args, **kwargs): return self
    def desc(self, *args, **kwargs): return self
    def first(self): return None
    def count(self): return 0
    def add(self, *args): pass
    def add_all(self, *args): pass
    def commit(self): pass
    def refresh(self, *args): pass
    def close(self): pass

# Exportable definitions
engine = None
SessionLocal = None
Session = object
Base = MockBase
Column = MockColumn
String = Integer = Float = Boolean = DateTime = ForeignKey = Text = JSON = MockColumn
relationship = lambda *args, **kwargs: None

try:
    from sqlalchemy import create_engine, Column as SqlColumn, String as SqlString, Integer as SqlInteger, Float as SqlFloat, Boolean as SqlBoolean, DateTime as SqlDateTime, ForeignKey as SqlForeignKey, Text as SqlText, JSON as SqlJSON
    from sqlalchemy.orm import declarative_base, sessionmaker, relationship as SqlRelationship, Session as SqlSession
    
    # Try initializing engine
    engine = create_engine(settings.DATABASE_URL, connect_args={"connect_timeout": 5} if "postgresql" in settings.DATABASE_URL else {})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Session = SqlSession
    Base = declarative_base()
    Column = SqlColumn
    String = SqlString
    Integer = SqlInteger
    Float = SqlFloat
    Boolean = SqlBoolean
    DateTime = SqlDateTime
    ForeignKey = SqlForeignKey
    Text = SqlText
    JSON = SqlJSON
    relationship = SqlRelationship
    
    HAS_SQLALCHEMY = True
except Exception as e:
    print(f"[Warning] SQLAlchemy initialization failed ({e}). Running database in Mock Mode.")
    HAS_SQLALCHEMY = False

def get_db():
    if HAS_SQLALCHEMY and SessionLocal:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    else:
        yield MockSession()

# 2. MongoDB Client
mongo_db = None
try:
    from pymongo import MongoClient
    mongo_client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
    mongo_db = mongo_client[settings.MONGODB_DB_NAME]
    # Ping to check if online
    mongo_client.admin.command('ping')
except Exception:
    print("[Warning] MongoDB connection failed. Running MongoDB in Mock Mode.")
    class MockMongoCollection:
        def insert_one(self, *args, **kwargs): pass
        def find_one(self, *args, **kwargs): return None
        def find(self, *args, **kwargs): return []
    class MockMongoDB:
        def __getattr__(self, name): return MockMongoCollection()
    mongo_db = MockMongoDB()

def get_mongo_db():
    return mongo_db
