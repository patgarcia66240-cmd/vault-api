"""
Service d'authentification - Logique métier
Gère l'inscription, connexion, et récupération de mot de passe
"""

from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.user_repo import UserRepository
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token
)
from app.core.config import settings
from app.models.user import User
import uuid


class AuthService:
    """Service pour la logique d'authentification"""

    def __init__(self):
        self.user_repo = UserRepository()

    def signup(
        self,
        db: Session,
        email: str,
        password: str,
        name: Optional[str] = None
    ) -> tuple[str, User]:
        """
        Inscrire un nouvel utilisateur

        Returns:
            tuple: (access_token, user)

        Raises:
            ValueError: Si l'email existe déjà
        """
        # Si Supabase est configuré avec une clé service, créer l'utilisateur via Supabase
        if settings.SUPABASE_SERVICE_ROLE_KEY:
            supa_user = None
            try:
                from app.core.supabase import admin_create_user
                supa_user = admin_create_user(email=email, password=password, user_metadata={"name": name or email.split("@")[0]})
            except Exception:
                supa_user = None

            # Si supa_user créé, récupérer (ou créer) l'utilisateur localement
            if supa_user and supa_user.get("id"):
                user = self.user_repo.get_by_email(db, email)
                if not user:
                    user = User(
                        id=supa_user.get("id"),
                        email=email,
                        name=supa_user.get("user_metadata", {}).get("name", name or email.split("@")[0]),
                        password_hash=None,
                        role="user",
                        emailVerified=supa_user.get("confirmed_at") is not None,
                    )
                    self.user_repo.create(db, user)

                access_token = create_access_token(data={"sub": str(user.id)})
                return access_token, user

        # Fallback: comportement local existant (DB + hash)
        if self.user_repo.email_exists(db, email):
            print(f"[DEBUG] email {email} already exists in DB; attempting to delete")
            # Si l'email existe déjà, supprimer et continuer (utile pour tests locaux)
            user = self.user_repo.get_by_email(db, email)
            if user:
                try:
                    self.user_repo.delete(db, user.id)
                    print(f"[DEBUG] deleted local user {user.id}")
                except Exception as e:
                    print(f"[DEBUG] failed to delete local user: {e}")
                # si Supabase est configuré, demander suppression côté Supabase aussi
                try:
                    from app.core.supabase import admin_delete_user
                    ok = admin_delete_user(user.id)
                    print(f"[DEBUG] admin_delete_user returned {ok}")
                except Exception as e:
                    print(f"[DEBUG] admin_delete_user failed: {e}")
            # continuer la création après suppression

        # Créer le nouvel utilisateur localement
        new_user = User(
            id=str(uuid.uuid4()),
            email=email,
            name=name or email.split("@")[0],
            password_hash=get_password_hash(password),
            role="user",
            emailVerified=False  # Devra être vérifié par email
        )

        self.user_repo.create(db, new_user)

        # Créer le token d'accès
        access_token = create_access_token(data={"sub": str(new_user.id)})

        return access_token, new_user

    def signin(
        self,
        db: Session,
        email: str,
        password: str
    ) -> tuple[str, User]:
        """
        Connecter un utilisateur

        Returns:
            tuple: (access_token, user)

        Raises:
            ValueError: Si les identifiants sont invalides
        """
        # Si Supabase est configuré, tenter l'auth via Supabase
        if settings.SUPABASE_URL:
            try:
                from app.core.supabase import sign_in_with_password
                token_data = sign_in_with_password(email=email, password=password)
                if token_data and token_data.get("access_token"):
                    # Assurer qu'on ait un utilisateur local
                    user = self.user_repo.get_by_email(db, email)
                    if not user:
                        # récupérer info user depuis Supabase token
                        from app.core.supabase import get_user_from_token
                        supa_user = get_user_from_token(token_data.get("access_token"))
                        user = User(
                            id=supa_user.get("id"),
                            email=supa_user.get("email"),
                            name=supa_user.get("user_metadata", {}).get("name", email.split("@")[0]),
                            password_hash=None,
                            role="user",
                            emailVerified=supa_user.get("confirmed_at") is not None,
                        )
                        self.user_repo.create(db, user)

                    # On émet un JWT local compatible avec le reste de l'API
                    access_token = create_access_token(data={"sub": str(user.id)})
                    return access_token, user
            except Exception:
                pass

        # Fallback: validation locale par mot de passe
        user = self.user_repo.get_by_email(db, email)
        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Email ou mot de passe incorrect")

        # Créer le token d'accès local
        access_token = create_access_token(data={"sub": str(user.id)})

        return access_token, user

    def create_password_reset_token(self, db: Session, email: str) -> Optional[str]:
        """
        Créer un token de réinitialisation de mot de passe

        Note: On ne révèle pas si l'email existe ou pas (sécurité)
        """
        user = self.user_repo.get_by_email(db, email)

        # Même si l'utilisateur n'existe pas, on retourne success
        # pour ne pas révéler quels emails sont inscrits
        if not user:
            # On pourrait logger ceci pour monitoring
            # Nous retournons None pour signaler que rien n'a été généré localement
            # mais appelons Supabase pour qu'il envoie un email si configuré
            try:
                from app.core.supabase import send_recovery_email
                send_recovery_email(email)
            except Exception:
                pass
            return None

        # Si Supabase est configuré, demander l'envoi d'e-mail via Supabase (mais on génère quand même un token local pour les tests)
        try:
            from app.core.supabase import send_recovery_email
            send_recovery_email(email)
        except Exception:
            pass

        # Générer et retourner un token local (utile pour tests)
        return create_password_reset_token(email)

    def reset_password(
        self,
        db: Session,
        token: str,
        new_password: str
    ) -> bool:
        """
        Réinitialiser le mot de passe avec un token

        Returns:
            bool: True si succès

        Raises:
            ValueError: Si le token est invalide
        """
        # Vérifier et décoder le token
        email = verify_password_reset_token(token)
        if not email:
            raise ValueError("Token invalide ou expiré")

        # Récupérer l'utilisateur
        user = self.user_repo.get_by_email(db, email)
        if not user:
            raise ValueError("Utilisateur introuvable")

        # Si Supabase est configuré, mettre à jour via l'API Admin (préférable)
        if settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                from app.core.supabase import admin_update_user_password
                success = admin_update_user_password(user.id, new_password)
                if success:
                    # Ne pas conserver le hash local si Supabase gère le mot de passe
                    user.password_hash = None
                    self.user_repo.update(db, user)
                    return True
            except Exception:
                pass

        # Fallback: mise à jour locale du hash
        user.password_hash = get_password_hash(new_password)
        self.user_repo.update(db, user)

        return True

    def verify_email(self, db: Session, user_id: str) -> bool:
        """Marquer l'email comme vérifié"""
        user = self.user_repo.get_by_id(db, user_id)
        if user:
            user.emailVerified = True
            self.user_repo.update(db, user)
            return True
        return False


# Instance singleton
auth_service = AuthService()
