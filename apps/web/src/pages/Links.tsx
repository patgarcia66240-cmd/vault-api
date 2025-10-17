import React, { useState } from 'react'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

interface Link {
  id: string
  title: string
  url: string
  description?: string
  tags: string[]
  createdAt: string
  apiKeyId?: string
}

const LinkCard: React.FC<{
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
}> = ({ link, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain
    } catch {
      return url
    }
  }

  return (
    <GlassCard hover className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{link.title}</h3>
          {link.description && (
            <p className="text-white/60 text-sm mb-2">{link.description}</p>
          )}
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span>{getDomain(link.url)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Copier le lien"
          >
            {copied ? '✓' : '📋'}
          </button>
          <button
            onClick={() => onEdit(link)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Modifier"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(link.id)}
            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {link.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-white/40 text-xs">
        <span>Créé le {new Date(link.createdAt).toLocaleDateString()}</span>
        {link.apiKeyId && (
          <span>API Key: {link.apiKeyId.slice(0, 8)}...</span>
        )}
      </div>
    </GlassCard>
  )
}

const AddLinkModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: Omit<Link, 'id' | 'createdAt'>) => void;
  editingLink?: Link;
}> = ({ isOpen, onClose, onSave, editingLink }) => {
  const [title, setTitle] = useState(editingLink?.title || '')
  const [url, setUrl] = useState(editingLink?.url || '')
  const [description, setDescription] = useState(editingLink?.description || '')
  const [tags, setTags] = useState(editingLink?.tags.join(', ') || '')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return

    const linkData = {
      title: title.trim(),
      url: url.trim(),
      description: description.trim() || undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      apiKeyId: editingLink?.apiKeyId
    }

    onSave(linkData)
    onClose()

    // Reset form
    setTitle('')
    setUrl('')
    setDescription('')
    setTags('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <GlassCard className="w-full max-w-md animate-slide-up">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingLink ? 'Modifier le lien' : 'Ajouter un lien'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Titre</label>
              <Input
                placeholder="Entrez le titre..."
                value={title}
                onChange={setTitle}
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">URL</label>
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={setUrl}
                type="url"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Description (optionnel)</label>
              <textarea
                placeholder="Description du lien..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-base-yellow/50 focus:border-base-yellow/50 transition-all duration-200 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Tags (séparés par des virgules)</label>
              <Input
                placeholder="tag1, tag2, tag3"
                value={tags}
                onChange={setTags}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                {editingLink ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </div>
      </GlassCard>
    </div>
  )
}

export const Links: React.FC = () => {
  const [links, setLinks] = useState<Link[]>([
    {
      id: '1',
      title: 'Documentation Vault',
      url: 'https://docs.vault-api.com',
      description: 'Documentation complète de l\'API Vault',
      tags: ['docs', 'api', 'documentation'],
      createdAt: new Date('2024-01-15').toISOString(),
      apiKeyId: 'key-123'
    },
    {
      id: '2',
      title: 'GitHub Repository',
      url: 'https://github.com/vault/api',
      description: 'Code source de Vault API',
      tags: ['github', 'source', 'code'],
      createdAt: new Date('2024-01-10').toISOString()
    },
    {
      id: '3',
      title: 'Dashboard Analytics',
      url: 'https://analytics.vault.com',
      tags: ['analytics', 'dashboard', 'stats'],
      createdAt: new Date('2024-01-05').toISOString(),
      apiKeyId: 'key-456'
    }
  ])
  const [showModal, setShowModal] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | undefined>()

  const handleSaveLink = (linkData: Omit<Link, 'id' | 'createdAt'>) => {
    if (editingLink) {
      // Update existing link
      setLinks(links.map(link =>
        link.id === editingLink.id
          ? { ...link, ...linkData }
          : link
      ))
    } else {
      // Add new link
      const newLink: Link = {
        ...linkData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      setLinks([newLink, ...links])
    }
  }

  const handleEdit = (link: Link) => {
    setEditingLink(link)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
      setLinks(links.filter(link => link.id !== id))
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingLink(undefined)
  }

  return (
    <div className="min-h-screen bg-gradient-radial">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Liens</h1>
            <p className="text-white/60">
              Gérez vos liens importants
            </p>
          </div>

          <Button onClick={() => setShowModal(true)}>
            ➕ Ajouter un lien
          </Button>
        </header>

        {/* Search and Filter */}
        <GlassCard className="p-4 mb-8">
          <div className="flex gap-4">
            <Input
              placeholder="Rechercher un lien..."
              className="flex-1"
            />
            <select className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-base-yellow/50">
              <option value="">Tous les tags</option>
              <option value="docs">Documentation</option>
              <option value="github">GitHub</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>
        </GlassCard>

        {/* Links Grid */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">
            Tous les liens ({links.length})
          </h2>

          {links.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/60 mb-4">Aucun lien enregistré</p>
              <p className="text-white/40 text-sm mb-4">
                Ajoutez votre premier lien pour commencer
              </p>
              <Button onClick={() => setShowModal(true)}>
                Ajouter un lien
              </Button>
            </GlassCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddLinkModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleSaveLink}
        editingLink={editingLink}
      />
    </div>
  )
}