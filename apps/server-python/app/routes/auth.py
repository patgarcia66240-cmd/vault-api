from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.security import create_access_token, decode_access_token, get_password_hash, verify_password
from app.models.user import UserProfile
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, TokenWithUser
from app.core.config import settings
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserProfile:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    # Récupérer le profil utilisateur depuis user_profiles
    user_profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if user_profile is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user_profile


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user
    Crée directement dans auth.users et user_profiles
    """
    try:
        # Vérifier si l'utilisateur existe déjà
        result = db.execute(
            text("SELECT id, email FROM auth.users WHERE email = :email"),
            {"email": user_data.email}
        )
        existing_user = result.fetchone()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Générer un UUID pour le nouvel utilisateur
        user_id = str(uuid.uuid4())

        # Hasher le mot de passe
        password_hash = get_password_hash(user_data.password)

        # Insérer dans auth.users (table système Supabase)
        db.execute(
            text("""
                INSERT INTO auth.users (
                    instance_id, id, aud, role, email,
                    encrypted_password, email_confirmed_at,
                    created_at, updated_at, last_sign_in_at
                ) VALUES (
                    '00000000-0000-0000-0000-000000000000',
                    :id,
                    'authenticated',
                    'authenticated',
                    :email,
                    :password_hash,
                    NOW(),
                    NOW(),
                    NOW(),
                    NOW()
                )
            """),
            {
                "id": user_id,
                "email": user_data.email,
                "password_hash": password_hash
            }
        )

        # Créer le profil dans user_profiles
        user_profile = UserProfile(id=user_id, plan="FREE")
        db.add(user_profile)
        db.commit()
        db.refresh(user_profile)

        # Créer la réponse avec l'email (pas de stockage dans l'objet)
        from app.schemas.user import UserResponse
        response_data = {
            "id": user_profile.id,
            "email": user_data.email,  # Email depuis auth.users
            "plan": user_profile.plan,
            "stripe_id": user_profile.stripe_id,
            "created_at": user_profile.created_at,
            "updated_at": user_profile.updated_at
        }

        return UserResponse(**response_data)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenWithUser)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login user
    Vérifie les identifiants directement dans auth.users
    """
    try:
        print(f"🔐 Login attempt for: {user_data.email}")

        # Chercher l'utilisateur dans auth.users
        result = db.execute(
            text("SELECT id, email, encrypted_password FROM auth.users WHERE email = :email"),
            {"email": user_data.email}
        )
        user = result.fetchone()

        # Vérifier si l'utilisateur existe
        if not user:
            print(f"❌ User not found: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        user_id, email, encrypted_password = user
        print(f"✅ User found: {email}, ID: {user_id}")

        # Vérifier le mot de passe
        try:
            is_valid = verify_password(user_data.password, encrypted_password)
            print(f"🔑 Password verification: {is_valid}")

            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password"
                )
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Password verification error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        # Vérifier que le profil existe dans user_profiles
        user_profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
        if not user_profile:
            print(f"⚠️ Profile not found, creating new profile for user {user_id}")
            # Créer le profil s'il n'existe pas
            user_profile = UserProfile(id=user_id, plan="FREE")
            db.add(user_profile)
            db.commit()
            db.refresh(user_profile)

        # Générer notre propre JWT token
        access_token = create_access_token(data={"sub": str(user_id)})
        print(f"🎉 Login successful for: {email}")

        # Créer la réponse avec l'email
        from app.schemas.user import UserResponse
        user_response = UserResponse(
            id=user_profile.id,
            email=email,  # Email depuis auth.users
            plan=user_profile.plan,
            stripe_id=user_profile.stripe_id,
            created_at=user_profile.created_at,
            updated_at=user_profile.updated_at
        )

        # Retourner le token ET les infos utilisateur
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Unexpected error during login: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )


@router.post("/logout")
async def logout():
    """
    Logout user
    Avec des JWT stateless, on retourne simplement un succès
    Le frontend va nettoyer le localStorage
    """
    return {"message": "Successfully logged out"}


@router.get("/me")
def get_me(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user info
    Récupère l'email depuis auth.users
    """
    # Récupérer l'email depuis auth.users
    result = db.execute(
        text("SELECT email FROM auth.users WHERE id = :user_id"),
        {"user_id": str(current_user.id)}
    )
    email_row = result.fetchone()

    email = email_row[0] if email_row else ""

    # Créer la réponse avec l'email
    from app.schemas.user import UserResponse
    user_response = UserResponse(
        id=current_user.id,
        email=email,
        plan=current_user.plan,
        stripe_id=current_user.stripe_id,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

    # Retourner les user data dans un objet "user" comme attendu par le frontend
    return {"user": user_response}
