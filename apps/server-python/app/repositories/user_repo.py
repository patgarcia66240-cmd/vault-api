"""
Repository User - Couche d'accès aux données
Sépare la logique de la base de données de la logique métier
"""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User


class UserRepository:
    """Repository pour les opérations CRUD sur User"""

    def get_by_id(self, db: Session, user_id: str) -> Optional[User]:
        """Récupérer un utilisateur par ID"""
        return db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """Récupérer un utilisateur par email"""
        try:
            return db.query(User).filter(User.email == email).first()
        except Exception:
            db.rollback()
            raise

    def email_exists(self, db: Session, email: str) -> bool:
        """Vérifier si un email existe déjà"""
        try:
            return db.query(User).filter(User.email == email).first() is not None
        except Exception:
            db.rollback()
            raise

    def create(self, db: Session, user: User) -> User:
        """Créer un nouvel utilisateur"""
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        except Exception:
            db.rollback()
            raise

    def update(self, db: Session, user: User) -> User:
        """Mettre à jour un utilisateur"""
        try:
            db.commit()
            db.refresh(user)
            return user
        except Exception:
            db.rollback()
            raise

    def delete(self, db: Session, user_id: str) -> bool:
        """Supprimer un utilisateur"""
        try:
            user = self.get_by_id(db, user_id)
            if user:
                db.delete(user)
                db.commit()
                return True
            return False
        except Exception:
            db.rollback()
            raise

    def list_all(self, db: Session, skip: int = 0, limit: int = 100) -> list[User]:
        """Lister tous les utilisateurs avec pagination"""
        return db.query(User).offset(skip).limit(limit).all()

    def count(self, db: Session) -> int:
        """Compter le nombre total d'utilisateurs"""
        return db.query(User).count()


# Instance singleton pour faciliter l'utilisation
user_repo = UserRepository()
