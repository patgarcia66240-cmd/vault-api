import React, { useState } from 'react'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { useApiKeys, useCreateApiKey, useRevokeApiKey, useGetDecryptedApiKey, useUpdateApiKey } from '../lib/services/apiKeyService'
import { ApiKey, Provider, SupabaseConfig } from '../lib/api'
import { TrashIcon, ClipboardDocumentIcon, CheckIcon, CloudIcon, ExclamationTriangleIcon, LockClosedIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'

const SupabaseCard: React.FC<{
  apiKey: ApiKey;
  onRevoke: (apiKey: ApiKey) => void;
  onEdit: (apiKey: ApiKey) => void;
}> = ({ apiKey, onRevoke, onEdit }) => {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedAnon, setCopiedAnon] = useState(false)
  const [copiedService, setCopiedService] = useState(false)

  const config = apiKey.provider_config ? JSON.parse(apiKey.provider_config) as SupabaseConfig : null

  const handleCopy = async (text: string, setter: (val: boolean) => void) => {
    await navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
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
            <input
              type="text"
              readOnly
              value={config?.url || 'N/A'}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm focus:outline-none truncate"
            />
            <button
              onClick={() => handleCopy(config?.url || '', setCopiedUrl)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Copier l'URL"
            >
              {copiedUrl ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-white/60 text-xs mb-1">Anon Key (publique)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={config?.anonKey ? `${config.anonKey.slice(0, 8)}...${config.anonKey.slice(-4)}` : 'N/A'}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm focus:outline-none truncate"
            />
            <button
              onClick={() => handleCopy(config?.anonKey || '', setCopiedAnon)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Copier l'anon key"
            >
              {copiedAnon ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-white/60 text-xs mb-1">Service Role Key (privée)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={config?.serviceRoleKey ? `${config.serviceRoleKey.slice(0, 8)}...${config.serviceRoleKey.slice(-4)}` : 'N/A'}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm focus:outline-none truncate"
            />
            <button
              onClick={() => handleCopy(config?.serviceRoleKey || '', setCopiedService)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Copier la service role key"
            >
              {copiedService ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-white/40 text-xs">
          Créée le {new Date(apiKey.created_at).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          {!apiKey.revoked && (
            <>
              <button
                onClick={() => onEdit(apiKey)}
                className="p-2 text-white/60 hover:text-base-yellow hover:bg-white/10 rounded-lg transition-all"
                title="Modifier"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onRevoke(apiKey)}
                className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Révoquer"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </GlassCard>
  )
}


const ApiKeyCard: React.FC<{
  apiKey: ApiKey;
  onRevoke: (apiKey: ApiKey) => void;
  onEdit: (apiKey: ApiKey) => void;
}> = ({ apiKey, onRevoke, onEdit }) => {
  const [copied, setCopied] = useState(false)
  const decryptMutation = useGetDecryptedApiKey()

  const handleCopy = async () => {
    try {
      const result = await decryptMutation.mutateAsync(apiKey.id)
      await navigator.clipboard.writeText(result.api_key)
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
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-base-yellow/20 rounded-lg">
          <LockClosedIcon className="w-6 h-6 text-base-yellow" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{apiKey.name}</h3>
            {apiKey.revoked && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                Révoquée
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-white/60 text-xs mb-1">Clé API</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={`${apiKey.prefix}...${apiKey.last4}`}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Copier la clé"
          >
            {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-white/40 text-xs">
          Créée le {new Date(apiKey.created_at).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          {!apiKey.revoked && (
            <>
              <button
                onClick={() => onEdit(apiKey)}
                className="p-2 text-white/60 hover:text-base-yellow hover:bg-white/10 rounded-lg transition-all"
                title="Modifier"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onRevoke(apiKey)}
                className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Révoquer"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
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
  editingApiKey?: ApiKey | null;
}> = ({ isOpen, onClose, onSave, error, isLoading, editingApiKey }) => {
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [provider, setProvider] = useState<Provider>('CUSTOM')
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('')
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState('')

  // Pré-remplir les champs si on est en mode édition
  React.useEffect(() => {
    if (editingApiKey) {
      setName(editingApiKey.name)
      setProvider(editingApiKey.provider)
      if (editingApiKey.provider === 'SUPABASE' && editingApiKey.provider_config) {
        try {
          const config = JSON.parse(editingApiKey.provider_config)
          setSupabaseUrl(config.url || '')
          setSupabaseAnonKey(config.anonKey || '')
          setSupabaseServiceRoleKey(config.serviceRoleKey || '')
        } catch (e) {
          console.error('Erreur parsing provider_config:', e)
        }
      }
    } else {
      // Reset si pas en mode édition
      setName('')
      setValue('')
      setProvider('CUSTOM')
      setSupabaseUrl('')
      setSupabaseAnonKey('')
      setSupabaseServiceRoleKey('')
    }
  }, [editingApiKey, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    if (provider === 'SUPABASE') {
      // Permettre de sauvegarder même si certains champs sont vides
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
            {editingApiKey ? 'Modifier la clé API' : 'Créer une nouvelle clé API'}
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
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Anon Key (publique)</label>
                  <Input
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseAnonKey}
                    onChange={setSupabaseAnonKey}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Service Role Key (privée)</label>
                  <Input
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseServiceRoleKey}
                    onChange={setSupabaseServiceRoleKey}
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
                {isLoading ? (editingApiKey ? 'Modification...' : 'Création...') : (editingApiKey ? 'Sauvegarder' : 'Créer la clé')}
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
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null)
  const [newApiKey, setNewApiKey] = useState<{
    apiKey: string;
    prefix: string;
    last4: string;
    name: string;
    createdAt: string;
  } | null>(null)
  const [creationError, setCreationError] = useState<string>('')
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null)

  const { data: apiKeysResponse, isLoading, error } = useApiKeys()
  const createApiKeyMutation = useCreateApiKey()
  const updateApiKeyMutation = useUpdateApiKey()
  const revokeApiKeyMutation = useRevokeApiKey()

  const handleCreateApiKey = async (data: { name: string; value?: string; provider?: Provider; providerConfig?: SupabaseConfig }) => {
    setCreationError('')

    // Si on est en mode édition, utiliser updateApiKeyMutation
    if (editingApiKey) {
      try {
        await updateApiKeyMutation.mutateAsync({ id: editingApiKey.id, data })
        setShowModal(false)
        setEditingApiKey(null)
        setCreationError('')
      } catch (error: any) {
        console.error('Error updating API key:', error)
        setCreationError(error?.response?.data?.error || 'Erreur lors de la modification de la clé API')
      }
    } else {
      // Sinon, créer une nouvelle clé
      try {
        const response = await createApiKeyMutation.mutateAsync(data)
        // Only show reveal modal for custom keys
        if (data.provider === 'SUPABASE') {
          setShowModal(false)
          setCreationError('')
        } else {
          setNewApiKey({
            apiKey: response.api_key,
            prefix: response.prefix,
            last4: response.last4,
            name: response.name,
            createdAt: response.created_at
          })
          setShowModal(false)
          setCreationError('')
        }
      } catch (error: any) {
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
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingApiKey(null)
    setCreationError('')
  }

  const handleEditApiKey = (apiKey: ApiKey) => {
    setEditingApiKey(apiKey)
    setShowModal(true)
    setCreationError('')
  }

  const handleRevokeApiKey = (apiKey: ApiKey) => {
    setDeleteConfirmation({ id: apiKey.id, name: apiKey.name })
  }

  const confirmDelete = () => {
    if (deleteConfirmation) {
      revokeApiKeyMutation.mutate(deleteConfirmation.id)
      setDeleteConfirmation(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmation(null)
  }

  const closeRevealModal = () => {
    setNewApiKey(null)
  }

  const apiKeys = apiKeysResponse || []

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
            onClick={() => {
              setEditingApiKey(null)
              setShowModal(true)
            }}
            disabled={createApiKeyMutation.isPending || updateApiKeyMutation.isPending}
          >
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
              
            </GlassCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apiKeys.map((apiKey: ApiKey) => (
                apiKey.provider === 'SUPABASE' ? (
                  <SupabaseCard
                    key={apiKey.id}
                    apiKey={apiKey}
                    onRevoke={handleRevokeApiKey}
                    onEdit={handleEditApiKey}
                  />
                ) : (
                  <ApiKeyCard
                    key={apiKey.id}
                    apiKey={apiKey}
                    onRevoke={handleRevokeApiKey}
                    onEdit={handleEditApiKey}
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
        isLoading={createApiKeyMutation.isPending || updateApiKeyMutation.isPending}
        editingApiKey={editingApiKey}
      />

      <RevealApiKeyModal
        isOpen={!!newApiKey}
        onClose={closeRevealModal}
        apiKeyData={newApiKey}
      />

      {/* Modal de confirmation de suppression */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-md animate-slide-up">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Confirmer la suppression
                </h3>
              </div>

              <p className="text-white/80 mb-2">
                Êtes-vous sûr de vouloir révoquer cette clé API ?
              </p>

              <p className="text-white/60 mb-6">
                <span className="font-semibold text-white">{deleteConfirmation.name}</span> ne pourra plus être utilisée. Cette action est irréversible.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={cancelDelete}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  disabled={revokeApiKeyMutation.isPending}
                >
                  {revokeApiKeyMutation.isPending ? 'Suppression...' : 'Révoquer la clé'}
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
