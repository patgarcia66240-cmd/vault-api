import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'
import { useCurrentUser } from '../lib/services/authService'
import { createCheckoutSession } from '../lib/services/billingService'

export const Pricing: React.FC = () => {
  const { data: user } = useCurrentUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!user) {
      // Rediriger vers signup si pas connecté
      window.location.href = '/signup'
      return
    }

    if (user.plan === 'PRO') {
      // Déjà sur Pro, rien à faire
      return
    }

    // Créer une session Stripe pour les utilisateurs FREE voulant passer Pro
    setIsLoading(true)
    try {
      const response = await createCheckoutSession()
      window.location.href = response.url
    } catch (error) {
      console.error('Erreur lors de la création de la session de paiement:', error)
      // Gérer l'erreur (afficher un message d'erreur à l'utilisateur)
      alert('Une erreur s\'est produite lors de l\'initialisation du paiement. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-radial">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Tarifs Simples et Transparents</h1>
          <p className="text-white/60 text-lg">Choisissez l'offre qui correspond à vos besoins</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 min-h-[600px]">
          {/* Free Plan */}
          <GlassCard className="p-8 relative flex flex-col h-full hover:scale-105 hover:shadow-2xl hover:shadow-base-yellow/20 transition-all duration-300">
            {user?.plan === 'FREE' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Votre abonnement actuel
                </div>
              </div>
            )}
            <div className="text-center mt-2">
              <h2 className="text-2xl font-bold text-white mb-2">Gratuit</h2>
              <div className="text-4xl font-bold text-base-yellow mb-4">0 $</div>
              <p className="text-white/60 mb-6">Parfait pour commencer</p>
            </div>

            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Jusqu'à 3 clés API
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Gestion basique des clés
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Support par email
              </li>
              <li className="flex items-center text-white/40">
                <span className="text-white/20 mr-3">—</span>
                Clés API illimitées
              </li>
              <li className="flex items-center text-white/40">
                <span className="text-white/20 mr-3">—</span>
                Support prioritaire
              </li>
            </ul>

            <div className="mt-auto">
              <Link to="/signup">
                <Button variant="secondary" className="w-full">
                  Commencer
                </Button>
              </Link>
            </div>
          </GlassCard>

          {/* Pro Plan */}
          <GlassCard className="p-8 relative border-2 border-base-yellow/50 flex flex-col h-full hover:scale-105 hover:shadow-2xl hover:shadow-base-yellow/30 transition-all duration-300">
            {user?.plan === 'PRO' && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Votre abonnement actuel
                </div>
              </div>
            )}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-base-yellow text-base-black px-4 py-1 rounded-full text-sm font-semibold">
                LE PLUS POPULAIRE
              </div>
            </div>

            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
              <div className="text-4xl font-bold text-base-yellow mb-4">29 $<span className="text-lg text-white/60">/mois</span></div>
              <p className="text-white/60 mb-6">Pour professionnels et équipes</p>
            </div>

            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Clés API illimitées
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Gestion avancée des clés
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Support prioritaire
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Analyses d'utilisation
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Collaboration en équipe
              </li>
            </ul>

            <div className="mt-auto">
              {user?.plan === 'PRO' ? (
                <Button variant="secondary" className="w-full" disabled>
                  Abonnement actuel
                </Button>
              ) : (
                <Button
                  className="w-full relative group hover:scale-105 transition-transform duration-200"
                  onClick={handleUpgrade}
                  disabled={isLoading}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading ? 'Chargement...' : user ? 'Passer au Pro' : 'Démarrer l\'essai gratuit'}
                    {!isLoading && <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">✓</span>}
                  </span>
                </Button>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="mt-16 text-center">
          <GlassCard className="p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Questions Fréquemment Posées</h3>

            <div className="space-y-6 text-left">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Puis-je changer d'offre à tout moment ?</h4>
                <p className="text-white/60">Oui, vous pouvez passer à une offre supérieure ou inférieure à tout moment. Les changements prennent effet immédiatement.</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Que se passe-t-il si je dépasse les limites de mon offre ?</h4>
                <p className="text-white/60">Nous vous notifierons lorsque vous approcherez de vos limites. Vous pouvez passer à une offre supérieure pour continuer à utiliser le service.</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Mes données sont-elles sécurisées ?</h4>
                <p className="text-white/60">Oui, toutes les clés API sont cryptées avec AES-256-GCM, et nous utilisons des pratiques de sécurité standardisées.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
