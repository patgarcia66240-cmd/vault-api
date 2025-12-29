"""
Script pour créer les tables Supabase dans le schéma public
Exécute le fichier SQL supabase_tables.sql sur la base de données
"""

import sys
import os

from pathlib import Path

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from app.core.config import settings

def setup_supabase_tables():
    """Créer les tables Supabase en exécutant le fichier SQL"""

    # Lire le fichier SQL
    sql_file = Path(__file__).parent / "supabase_tables.sql"

    if not sql_file.exists():
        print(f"Erreur: Le fichier {sql_file} n'existe pas")
        return False

    print(f"Lecture du fichier SQL: {sql_file}")
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    # Créer la connexion à la base de données
    print(f"Connexion a la base de donnees...")

    engine = create_engine(settings.DATABASE_URL)

    try:
        with engine.begin() as conn:
            # Exécuter le SQL
            print("Execution du script SQL...")
            conn.execute(text(sql_content))

        print("\nSucces! Les tables ont ete creees dans le schema public")

        # Vérifier les tables créées
        with engine.begin() as conn:
            result = conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name IN ('api_keys', 'invoices', 'usage_logs')
                ORDER BY table_name
            """))

            tables = [row[0] for row in result]

            print(f"\nTables trouvees ({len(tables)}):")
            for table in tables:
                print(f"   - {table}")

        return True

    except Exception as e:
        print(f"\nErreur lors de la creation des tables: {e}")
        import traceback
        traceback.print_exc()
        return False


def check_existing_tables():
    """Vérifier quelles tables existent déjà"""

    engine = create_engine(settings.DATABASE_URL)

    try:
        with engine.begin() as conn:
            # Récupérer seulement les noms des tables
            result = conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name IN ('api_keys', 'invoices', 'usage_logs')
                ORDER BY table_name
            """))

            tables = [row[0] for row in result.fetchall()]

            if tables:
                print(f"\nTables existantes dans le schema public:")
                for table_name in tables:
                    # Compter les rows pour chaque table trouvée
                    count_result = conn.execute(text(f"""
                        SELECT COUNT(*) FROM public.{table_name}
                    """))
                    row_count = count_result.scalar()
                    print(f"   - {table_name} ({row_count} rows)")
            else:
                print("\nAucune table trouvee dans le schema public")

            return len(tables) > 0

    except Exception as e:
        print(f"Erreur lors de la verification: {e}")
        return False


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Setup Supabase tables")
    parser.add_argument("--check", action="store_true", help="Vérifier les tables existantes")
    parser.add_argument("--force", action="store_true", help="Forcer la recréation des tables")

    args = parser.parse_args()

    if args.check:
        check_existing_tables()
    else:
        # Vérifier d'abord si des tables existent
        if check_existing_tables() and not args.force:
            print("\nDes tables existent deja. Utilisez --force pour les recréer.")
            print("   Attention: --force va DROP et recréer toutes les tables!")
            response = input("\nContinuer quand meme? (yes/no): ")
            if response.lower() != 'yes':
                print("Annulé")
                sys.exit(0)

        # Créer les tables
        success = setup_supabase_tables()

        if success:
            print("\nSetup termine avec succes!")
            print("\nProchaines etapes:")
            print("   1. Verifiez que les RLS policies sont correctes dans Supabase")
            print("   2. Lancez le serveur: ./venv/Scripts/python -m uvicorn app.main:app --reload")
            print("   3. Testez les routes: python test_all_routes.py")
        else:
            print("\nSetup échoué. Verifiez les erreurs ci-dessus.")
            sys.exit(1)
