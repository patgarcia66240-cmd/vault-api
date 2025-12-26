"""
Vercel serverless handler for FastAPI application
"""
import sys
from pathlib import Path

# Add apps/server-python to Python path
sys.path.insert(0, str(Path(__file__).parent / "apps" / "server-python"))

from app.main import app
from mangum import Mangum

# Mangum adapts ASGI apps (FastAPI) to AWS Lambda/Vercel
lambda_handler = Mangum(app, lifespan="off")

def handler(event: dict, context):
    """
    Wrapper handler pour gérer CORS correctement avec Vercel
    """
    # Gérer les requêtes OPTIONS (preflight)
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Credentials': 'true',
            },
            'body': ''
        }

    # Appeler le handler Mangum pour les autres requêtes
    response = lambda_handler(event, context)

    # S'assurer que les headers CORS sont présents sur toutes les réponses
    if 'headers' not in response:
        response['headers'] = {}

    response['headers'].update({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
    })

    return response
