import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'
import { getUserInvoices } from '../lib/services/billingService'
import { useCurrentUser } from '../lib/services/authService'
import { useQueryClient } from '@tanstack/react-query'
import {
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  DocumentTextIcon,
  InboxIcon,
  ArrowPathIcon,
  HomeIcon,
  StarIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid'

interface Invoice {
  id: string
  stripeInvoiceId: string
  amount: number
  currency: string
  status: string
  description?: string
  periodStart?: string
  periodEnd?: string
  invoicePdf?: string
  hostedInvoiceUrl?: string
  createdAt: string
}

export const Billing: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)

  const success = searchParams.get('success') === 'true'
  const canceled = searchParams.get('canceled') === 'true'

  useEffect(() => {
    if (success) {
      // Invalider et refetcher l'utilisateur après paiement réussi
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  }, [success, queryClient])

  useEffect(() => {
    const fetchInvoices = async () => {
      // Toujours fetcher les invoices si c'est success ou si on a user et pas canceled
      const shouldFetch = (user && !canceled) || success

      if (shouldFetch) {
        setLoading(true)
        try {
          const response = await getUserInvoices()
          setInvoices(response.invoices || [])
        } catch (error) {
          console.error('Erreur lors de la récupération des factures:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchInvoices()
  }, [user, success, canceled])

  
  return (
    <div className="min-h-screen bg-gradient-radial">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-full mb-6 border border-purple-500/30">
            <CreditCardIcon className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Facturation
          </h1>
          <p className="text-white/60 text-lg">Gérer votre abonnement et consulter vos factures</p>
        </div>

        {/* Messages de succès/annulation */}
        {success && (
          <GlassCard className="p-8 mb-8 border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6 border border-green-500/30">
                <CheckCircleIconSolid className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-green-300 mb-4">Paiement Réussi !</h3>
              <p className="text-green-200 mb-8 text-lg">
                Votre abonnement PRO a été activé avec succès.<br />
                <span className="text-base-yellow font-semibold">Vous avez maintenant un nombre illimité de clés API.</span>
              </p>
              <Link to="/dashboard">
                <Button className="bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-300">
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Aller au Tableau de Bord
                </Button>
              </Link>
            </div>
          </GlassCard>
        )}

        {canceled && (
          <GlassCard className="p-8 mb-8 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"></div>
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full mb-6 border border-orange-500/30">
                <ExclamationTriangleIconSolid className="w-12 h-12 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-orange-300 mb-4">Paiement Annulé</h3>
              <p className="text-orange-200 mb-6 text-lg">
                Votre paiement a été annulé. Aucun montant n'a été débité.
              </p>
              <Link to="/pricing">
                <Button variant="secondary" className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10">
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Réessayer le Paiement
                </Button>
              </Link>
            </div>
          </GlassCard>
        )}

        {/* Contenu principal toujours affiché */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan actuel */}
            <GlassCard className="p-8 bg-gradient-to-br from-white/5 to-white/2 border border-white/10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded-full mb-4 border border-yellow-500/30">
                  <SparklesIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">Votre Plan Actuel</h3>

                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 mb-8 border border-white/20">
                  <div className="text-3xl font-bold text-base-yellow mb-3">
                    {user?.plan === 'PRO' ? 'PRO' : 'FREE'}
                  </div>
                  <p className="text-white/70 mb-4">
                    {user?.plan === 'PRO'
                      ? 'Abonnement professionnel actif'
                      : 'Plan gratuit - 3 clés API maximum'
                    }
                  </p>

                  {user?.plan === 'PRO' && (
                    <div className="flex items-center justify-center text-green-400 text-sm">
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Abonnement actif
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-left w-full ">
                  <Link to="/dashboard" className="flex items-center">
                    <Button variant="secondary" className="w-full border-white/20 hover:bg-white/5 flex items-center justify-start">
                      <HomeIcon className="w-5 h-5 mr-2" />
                      Retour au Tableau de Bord
                    </Button>
                  </Link>

                  <Link to="/pricing" className="flex items-center w-">
                    <Button variant="secondary" className="w-full border-base-yellow/30 text-base-yellow hover:bg-base-yellow/5 flex items-center justify-start">
                      <StarIcon className="w-5 h-5 mr-2" />
                      Voir les Plans Tarifaires
                    </Button>
                  </Link>
                </div>
              </div>
            </GlassCard>

            {/* Historique des factures */}
            <GlassCard className="p-8 bg-gradient-to-br from-white/5 to-white/2 border border-white/10">
              <div className="flex items-center mb-6">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-full mr-3 border border-blue-500/30">
                  <DocumentTextIcon className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Historique des Factures</h3>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-full mb-4">
                    <ArrowPathIcon className="w-6 h-6 text-base-yellow animate-spin" />
                  </div>
                  <p className="text-white/60">Chargement des factures...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-full mb-4 border border-white/10">
                    <InboxIcon className="w-6 h-6 text-white/40" />
                  </div>
                  <p className="text-white/60 mb-2">Aucune facture trouvée</p>
                  <p className="text-white/40 text-sm">Vos factures apparaîtront ici après vos paiements</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="bg-gradient-to-r from-white/5 to-white/2 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <div className="mr-3">
                            {invoice.status === 'paid' && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
                            {invoice.status === 'open' && <ArrowPathIcon className="w-5 h-5 text-yellow-400" />}
                            {invoice.status === 'failed' && <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />}
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              {(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                            </p>
                            <p className="text-white/60 text-sm">
                              {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            invoice.status === 'paid'
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : invoice.status === 'open'
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              : 'bg-red-500/20 text-red-300 border-red-500/30'
                          }`}>
                            {invoice.status === 'paid' ? 'Payée' :
                             invoice.status === 'open' ? 'En attente' : 'Échouée'}
                          </span>
                        </div>
                      </div>

                      {invoice.description && (
                        <p className="text-white/70 text-sm mb-3 pl-8">{invoice.description}</p>
                      )}

                      <div className="flex gap-3 pl-8">
                        {invoice.hostedInvoiceUrl && (
                          <a
                            href={invoice.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base-yellow hover:text-base-yellow/80 text-sm underline transition-colors"
                          >
                            <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                            Voir la facture
                          </a>
                        )}
                        {invoice.invoicePdf && (
                          <a
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base-yellow hover:text-base-yellow/80 text-sm underline transition-colors"
                          >
                            <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                            Télécharger PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center px-6 py-3 bg-white/5 rounded-full border border-white/10">
            <ChatBubbleLeftIcon className="w-4 h-4 text-white/60 mr-2" />
            <span className="text-white/60 text-sm">
              Besoin d'aide ? <a href="mailto:support@api-vault.com" className="text-base-yellow hover:underline">Contactez notre support</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
