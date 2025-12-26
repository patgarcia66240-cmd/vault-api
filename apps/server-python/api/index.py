from app.main import app
from mangum import Mangum

# ASGI handler for Vercel
handler = Mangum(app, lifespan="off")
