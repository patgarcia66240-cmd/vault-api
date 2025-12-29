#!/usr/bin/env python3
"""Vérifier les valeurs par défaut des timestamps"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={'sslmode': 'require'})
conn = engine.connect()

result = conn.execute(text("""
    SELECT column_name, column_default
    FROM information_schema.columns
    WHERE table_schema='auth' AND table_name='users'
    AND column_name IN ('created_at', 'updated_at')
"""))

for row in result:
    print(f'{row[0]}: {row[1]}')

conn.close()
