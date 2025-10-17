// Script de débogage pour le backend Vault API
// Usage: node debug-server.js

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage du serveur de débogage Vault API...');
console.log('📍 Dossier du serveur: apps/server');
console.log('🔧 Commande: tsx watch src/index.ts\n');

// Configuration
const serverDir = path.join(__dirname, 'apps', 'server');
const envPath = path.join(serverDir, '.env');

// Variables d'environnement pour le débogage
const debugEnv = {
  ...process.env,
  NODE_ENV: 'development',
  DEBUG: 'app:*',
  LOG_LEVEL: 'debug'
};

// Options de spawn
const spawnOptions = {
  cwd: serverDir,
  stdio: 'inherit',
  env: debugEnv,
  shell: true
};

// Vérifier si le dossier du serveur existe
try {
  const fs = require('fs');
  if (!fs.existsSync(serverDir)) {
    console.error('❌ Erreur: Le dossier apps/server n\'existe pas.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification du dossier:', error.message);
  process.exit(1);
}

// Lancer le serveur avec tsx
const serverProcess = spawn('pnpm', ['dev'], spawnOptions);

// Gestion des événements
serverProcess.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage du serveur:', error.message);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`\n📝 Processus terminé avec le code: ${code}`);
  if (code !== 0) {
    console.log('💡 Suggestions:');
    console.log('  - Vérifiez que toutes les dépendances sont installées: pnpm install');
    console.log('  - Vérifiez que le fichier .env existe dans apps/server/');
    console.log('  - Assurez-vous que la base de données est initialisée: pnpm prisma:migrate');
  }
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Arrêt du serveur de débogage...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Arrêt du serveur de débogage...');
  serverProcess.kill('SIGTERM');
});

console.log('📝 Informations utiles:');
console.log('   - Serveur: http://localhost:8080');
console.log('   - Health check: http://localhost:8080/health');
console.log('   - Base de données: SQLite (apps/server/prisma/dev.db)');
console.log('   - Arrêt: Ctrl+C\n');

console.log('⚡ Serveur en cours de démarrage...\n');