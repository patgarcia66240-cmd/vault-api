import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '../lib/services/apiKeyService'
import { useCurrentUser, useLogout } from '../lib/services/authService'
import { ApiKey, CreateApiKeyResponse } from '../lib/api'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

const ApiKeyCard: React.FC<{ apiKey: ApiKey; onRevoke: (id: string) => void }> = ({ apiKey, onRevoke }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <GlassCard hover className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{apiKey.name}</h3>
          <p className="text-sm text-white/60">
            Created: {new Date(apiKey.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          apiKey.revoked
            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
            : 'bg-green-500/20 text-green-300 border border-green-500/30'
        }`}>
          {apiKey.revoked ? 'Revoked' : 'Active'}
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <code className="text-base-yellow font-mono text-sm">
            {apiKey.prefix}••••{apiKey.last4}
          </code>
          <button
            onClick={handleCopy}
            className="text-white/60 hover:text-white transition-colors"
            title="Copy prefix"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>

      {!apiKey.revoked && (
        <Button
          variant="danger"
          onClick={() => onRevoke(apiKey.id)}
          className="w-full"
        >
          Revoke Key
        </Button>
      )}
    </GlassCard>
  )
}

const NewApiKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  apiKeyData: CreateApiKeyResponse | null
}> = ({ isOpen, onClose, apiKeyData }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !apiKeyData) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKeyData.api_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <GlassCard className="w-full max-w-md animate-slide-up">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">API Key Created!</h3>

          <div className="mb-4">
            <p className="text-white/60 text-sm mb-2">
              Copy this key now. You won't be able to see it again.
            </p>
          </div>

          <div className="bg-black/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <code className="text-base-yellow font-mono text-sm break-all mr-2">
                {apiKeyData.api_key}
              </code>
              <Button
                variant="secondary"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? '✓' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdApiKey, setCreatedApiKey] = useState<CreateApiKeyResponse | null>(null)

  const { data: user } = useCurrentUser()
  const { data: apiKeysData, isLoading } = useApiKeys()
  const createApiKey = useCreateApiKey()
  const revokeApiKey = useRevokeApiKey()
  const logout = useLogout()

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return

    try {
      const result = await createApiKey.mutateAsync({ name: newKeyName })
      setCreatedApiKey(result)
      setShowCreateModal(true)
      setNewKeyName('')
    } catch (error) {
      console.error('Failed to create API key:', error)
    }
  }

  const handleRevokeApiKey = async (id: string) => {
    try {
      await revokeApiKey.mutateAsync(id)
    } catch (error) {
      console.error('Failed to revoke API key:', error)
    }
  }

  const handleLogout = () => {
    logout.mutate()
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-radial">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Base44 Dashboard</h1>
            <p className="text-white/60">
              {user.email} • {user.plan} Plan
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/pricing')}
              disabled={user.plan === 'PRO'}
            >
              {user.plan === 'PRO' ? 'PRO Plan' : 'Upgrade to PRO'}
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        {/* Create API Key Section */}
        <GlassCard className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Create New API Key</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Enter key name..."
              value={newKeyName}
              onChange={setNewKeyName}
              className="flex-1"
            />
            <Button
              onClick={handleCreateApiKey}
              loading={createApiKey.isPending}
              disabled={!newKeyName.trim() || user.plan === 'FREE' && (apiKeysData?.apiKeys?.filter(k => !k.revoked) || []).length >= 3}
            >
              Create Key
            </Button>
          </div>
          {user.plan === 'FREE' && (
            <p className="text-white/60 text-sm mt-2">
              Free plan: {(apiKeysData?.apiKeys?.filter(k => !k.revoked) || []).length}/3 keys used
            </p>
          )}
        </GlassCard>

        {/* API Keys List */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Your API Keys</h2>

          {isLoading ? (
            <div className="text-center text-white/60">Loading...</div>
          ) : apiKeysData?.apiKeys.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/60 mb-4">No API keys yet</p>
              <p className="text-white/40 text-sm">Create your first API key to get started</p>
            </GlassCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {apiKeysData?.apiKeys.map((apiKey) => (
                <ApiKeyCard
                  key={apiKey.id}
                  apiKey={apiKey}
                  onRevoke={handleRevokeApiKey}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <NewApiKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        apiKeyData={createdApiKey}
      />
    </div>
  )
}
