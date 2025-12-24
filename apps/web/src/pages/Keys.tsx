import React, { useState } from 'react'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { useApiKeys, useCreateApiKey, useRevokeApiKey, useGetDecryptedApiKey } from '../lib/services/apiKeyService'
import { ApiKey, Provider, SupabaseConfig } from '../lib/api'
import { TrashIcon, ClipboardDocumentIcon, CheckIcon, PlusIcon, CloudIcon, ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const SupabaseCard: React.FC<{
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
}> = ({ apiKey, onRevoke }) => {
  const config = apiKey.providerConfig as SupabaseConfig

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <GlassCard hover className="p-6 border border-green-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <CloudIcon className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{apiKey.name}</h3>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
              Supabase
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-white/60 text-xs mb-1">URL du projet</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white/5 rounded-lg text-white/80 text-sm truncate">
              {config?.url || 'N/A'}
            </code>
            <button
              onClick={() => config?.url && copyToClipboard(config.url)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Copier l'URL"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-white/60 text-xs mb-1">Anon Key</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white/5 rounded-lg text-white/80 text-sm truncate">
              {config?.anonKey ? `${config.anonKey.slice(0, 8)}...${config.anonKey.slice(-4)}` : 'N/A'}
            </code>
            <button
              onClick={() => config?.anonKey && copyToClipboard(config.anonKey)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Copier l'anon key"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-white/60 text-xs mb-1">Service Role Key</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white/5 rounded-lg text-white/80 text-sm truncate">
              {config?.serviceRoleKey ? `${config.serviceRoleKey.slice(0, 8)}...${config.serviceRoleKey.slice(-4)}` : 'N/A'}
            </code>
            <button
              onClick={() => config?.serviceRoleKey && copyToClipboard(config.serviceRoleKey)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Copier la service role key"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-white/40 text-xs">
          Créée le {new Date(apiKey.createdAt).toLocaleDateString()}
        </span>
        {!apiKey.revoked && (
          <button
            onClick={() => onRevoke(apiKey.id)}
            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Révoquer"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </GlassCard>
  )
}


const ApiKeyCard: React.FC<{
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
}> = ({ apiKey, onRevoke }) => {
  const [copied, setCopied] = useState(false)
  const decryptMutation = useGetDecryptedApiKey()

  const handleCopy = async () => {
    try {
      const result = await decryptMutation.mutateAsync(apiKey.id)
      await navigator.clipboard.writeText(result.apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors du déchiffrement de la clé API:', error)
      // Fallback: copy the masked version if decryption fails
      await navigator.clipboard.writeText(`${apiKey.prefix}...${apiKey.last4}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <GlassCard hover className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{apiKey.name}</h3>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span>{apiKey.prefix}...{apiKey.last4}</span>
            {apiKey.revoked && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                Révoquée
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!apiKey.revoked && (
            <>
              <button
                onClick={handleCopy}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Copier la clé"
              >
                {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => onRevoke(apiKey.id)}
                className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Révoquer la clé"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-white/40 text-xs">
        <span>Créée le {new Date(apiKey.createdAt).toLocaleDateString()}</span>
        {apiKey.revoked && (
          <span>Révoquée le {new Date(apiKey.updatedAt).toLocaleDateString()}</span>
        )}
      </div>
    </GlassCard>
  )
}

const AddApiKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; value?: string; provider?: Provider; providerConfig?: SupabaseConfig }) => void;
  error?: string;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onSave, error, isLoading }) => {
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [provider, setProvider] = useState<Provider>('CUSTOM')
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('')
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    if (provider === 'SUPABASE') {
      if (!supabaseUrl.trim() || !supabaseAnonKey.trim() || !supabaseServiceRoleKey.trim()) return

      onSave({
        name: name.trim(),
        provider: 'SUPABASE',
        providerConfig: {
          url: supabaseUrl.trim(),
          anonKey: supabaseAnonKey.trim(),
          serviceRoleKey: supabaseServiceRoleKey.trim()
        }
      })
    } else {
      if (!value.trim()) return
      onSave({
        name: name.trim(),
        value: value.trim(),
        provider: 'CUSTOM'
      })
    }
  }

  const handleClose = () => {
    setName('')
    setValue('')
    setProvider('CUSTOM')
    setSupabaseUrl('')
    setSupabaseAnonKey('')
    setSupabaseServiceRoleKey('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <GlassCard className="w-full max-w-lg animate-slide-up">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Créer une nouvelle clé API
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Nom de la clé</label>
              <Input
                placeholder="Entrez un nom pour la clé..."
                value={name}
                onChange={setName}
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Type de fournisseur</label>
              <Select
                value={provider}
                onChange={(value) => setProvider(value as Provider)}
                options={[
                  { value: 'CUSTOM', label: 'Clé personnalisée' },
                  { value: 'SUPABASE', label: 'Supabase' }
                ]}
              />
            </div>

            {provider === 'CUSTOM' && (
              <div>
                <label className="block text-white/80 text-sm mb-2">Valeur de la clé API</label>
                <Input
                  placeholder="Entrez votre clé API..."
                  value={value}
                  onChange={setValue}
                  required
                />
              </div>
            )}

            {provider === 'SUPABASE' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">URL du projet Supabase</label>
                  <Input
                    placeholder="https://xxxxxxxx.supabase.co"
                    value={supabaseUrl}
                    onChange={setSupabaseUrl}
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Anon Key (publique)</label>
                  <Input
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseAnonKey}
                    onChange={setSupabaseAnonKey}
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Service Role Key (privée)</label>
                  <Input
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseServiceRoleKey}
                    onChange={setSupabaseServiceRoleKey}
                    required
                  />
                  <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-3 h-3" />
                    Ne partagez jamais cette clé. Elle donne un accès administrateur complet.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm">
                {error}
              </div>
            )}

            {provider === 'CUSTOM' && (
              <p className="text-white/60 text-sm flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                La clé complète sera affichée une seule fois après création. Copiez-la et stockez-la en lieu sûr.
              </p>
            )}

            {provider === 'SUPABASE' && (
              <p className="text-green-400 text-sm flex items-center gap-2">
                <LockClosedIcon className="w-4 h-4" />
                Les clés Supabase seront chiffrées et stockées en toute sécurité.
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Création...' : 'Créer la clé'}
              </Button>
            </div>
          </form>
        </div>
      </GlassCard>
    </div>
  )
}

const RevealApiKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  apiKeyData: {
    apiKey: string;
    prefix: string;
    last4: string;
    name: string;
    createdAt: string;
  } | null;
}> = ({ isOpen, onClose, apiKeyData }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !apiKeyData) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKeyData.apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <GlassCard className="w-full max-w-md animate-slide-up">
        <div className="p-6">
          <h3 className="text-xl font-bold text-green-400 mb-4">
            <CheckIcon className="w-6 h-6 inline mr-2" />
            Clé API créée avec succès
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Nom</label>
              <p className="text-white font-medium">{apiKeyData.name}</p>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Clé API</label>
              <div className="relative">
                <input
                  type="text"
                  value={apiKeyData.apiKey}
                  readOnly
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-base-yellow/50 focus:border-base-yellow/50 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  title="Copier"
                >
                  {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <p className="text-red-400 text-sm flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4" />
              Cette clé ne sera plus affichée. Copiez-la maintenant !
            </p>

            <div className="pt-4">
              <Button
                onClick={onClose}
                className="w-full"
              >
                J'ai copié la clé
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export const Keys: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [newApiKey, setNewApiKey] = useState<{
    apiKey: string;
    prefix: string;
    last4: string;
    name: string;
    createdAt: string;
  } | null>(null)
  const [creationError, setCreationError] = useState<string>('')

  const { data: apiKeysResponse, isLoading, error } = useApiKeys()
  const createApiKeyMutation = useCreateApiKey()
  const revokeApiKeyMutation = useRevokeApiKey()

  const handleCreateApiKey = (data: { name: string; value?: string; provider?: Provider; providerConfig?: SupabaseConfig }) => {
    setCreationError('')
    createApiKeyMutation.mutate(data, {
      onSuccess: (response) => {
        // Only show reveal modal for custom keys
        if (data.provider === 'SUPABASE') {
          setShowModal(false)
          setCreationError('')
        } else {
          setNewApiKey(response)
          setShowModal(false)
          setCreationError('')
        }
      },
      onError: (error: any) => {
        console.error('Error creating API key:', error)
        if (error?.response?.data?.error === 'Validation error') {
          const details = error.response.data.details
          if (details?.fieldErrors) {
            const messages = Object.values(details.fieldErrors as Record<string, string[]>).flat()
            setCreationError(messages.join(', '))
          } else {
            setCreationError('Erreur de validation des données')
          }
        } else {
          setCreationError(error?.response?.data?.error || 'Erreur lors de la création de la clé API')
        }
      },
    })
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCreationError('')
  }

  const handleRevokeApiKey = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir révoquer cette clé API ? Elle ne pourra plus être utilisée.')) {
      revokeApiKeyMutation.mutate(id)
    }
  }

  const closeRevealModal = () => {
    setNewApiKey(null)
  }

  const apiKeys = apiKeysResponse?.apiKeys || []

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <p className="text-red-400 mb-4">Erreur lors du chargement des clés API</p>
          <p className="text-white/60 text-sm">{error.message}</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-radial">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Clés API</h1>
            <p className="text-white/60">
              Gérez vos clés API pour accéder aux services
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            disabled={createApiKeyMutation.isPending}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Créer une clé
          </Button>
        </header>

        {/* Search and Filter */}
        <GlassCard className="p-4 mb-8">
          <div className="flex gap-4">
            <Input
              placeholder="Rechercher une clé..."
              className="flex-1"
            />
            <select className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-base-yellow/50">
              <option value="">Toutes les clés</option>
              <option value="active">Actives</option>
              <option value="revoked">Révoquées</option>
            </select>
          </div>
        </GlassCard>

        {/* API Keys Grid */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">
            Toutes les clés ({apiKeys.length})
          </h2>

          {isLoading ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/60">Chargement des clés API...</p>
            </GlassCard>
          ) : apiKeys.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/60 mb-4">Aucune clé API trouvée</p>
              <p className="text-white/40 text-sm mb-4">
                Créez votre première clé pour commencer
              </p>
              <Button onClick={() => setShowModal(true)}>
                Créer une clé
              </Button>
            </GlassCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apiKeys.map((apiKey) => (
                apiKey.provider === 'SUPABASE' ? (
                  <SupabaseCard
                    key={apiKey.id}
                    apiKey={apiKey}
                    onRevoke={handleRevokeApiKey}
                  />
                ) : (
                  <ApiKeyCard
                    key={apiKey.id}
                    apiKey={apiKey}
                    onRevoke={handleRevokeApiKey}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </div>

      <AddApiKeyModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleCreateApiKey}
        error={creationError}
        isLoading={createApiKeyMutation.isPending}
      />

      <RevealApiKeyModal
        isOpen={!!newApiKey}
        onClose={closeRevealModal}
        apiKeyData={newApiKey}
      />
    </div>
  )
}
