import React, { useState } from 'react'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { useCurrentUser, useLogout } from '../lib/services/authService'

const SettingsSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </GlassCard>
  )
}

const ToggleSwitch: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-white font-medium">{label}</p>
        {description && (
          <p className="text-white/60 text-sm">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-base-yellow' : 'bg-white/20'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export const Settings: React.FC = () => {
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  // Form states
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [securityAlerts, setSecurityAlerts] = useState(true)

  // API settings
  const [defaultEnvironment, setDefaultEnvironment] = useState('development')
  const [autoRotate, setAutoRotate] = useState(false)

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement profile update
    console.log('Update profile:', { email })
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }

    if (newPassword.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    // TODO: Implement password change
    console.log('Change password:', { currentPassword, newPassword })

    // Reset form
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleDeleteAccount = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      // TODO: Implement account deletion
      console.log('Delete account')
    }
  }

  const handleLogout = () => {
    logout.mutate()
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-radial">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
          <p className="text-white/60">
            Gérez votre compte et vos préférences
          </p>
        </header>

        <div className="space-y-6">
          {/* Profile Settings */}
          <SettingsSection title="Profil">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Adresse email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Plan actuel</label>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.plan === 'PRO'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-base-yellow/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {user.plan}
                  </span>
                  {user.plan === 'FREE' && (
                    <Button variant="secondary" size="sm">
                      Mettre à niveau vers PRO
                    </Button>
                  )}
                </div>
              </div>
              <Button type="submit">
                Mettre à jour le profil
              </Button>
            </form>
          </SettingsSection>

          {/* Security Settings */}
          <SettingsSection title="Sécurité">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Mot de passe actuel</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Nouveau mot de passe</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Entrez le nouveau mot de passe"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Confirmer le mot de passe</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirmez le nouveau mot de passe"
                />
              </div>
              <Button type="submit">
                Changer le mot de passe
              </Button>
            </form>

            <div className="pt-4 border-t border-white/10">
              <Button variant="danger" onClick={handleLogout} className="w-full mb-3">
                Se déconnecter
              </Button>
              <Button variant="danger" onClick={handleDeleteAccount} className="w-full">
                Supprimer mon compte
              </Button>
            </div>
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection title="Notifications">
            <ToggleSwitch
              label="Notifications par email"
              description="Recevoir des notifications importantes par email"
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            <ToggleSwitch
              label="Notifications push"
              description="Recevoir des notifications dans votre navigateur"
              checked={pushNotifications}
              onChange={setPushNotifications}
            />
            <ToggleSwitch
              label="Alertes de sécurité"
              description="Soyez notifié des activités suspectes"
              checked={securityAlerts}
              onChange={setSecurityAlerts}
            />
          </SettingsSection>

          {/* API Settings */}
          <SettingsSection title="Paramètres API">
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Environnement par défaut</label>
                <select
                  value={defaultEnvironment}
                  onChange={(e) => setDefaultEnvironment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-base-yellow/50"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <ToggleSwitch
                label="Rotation automatique des clés"
                description="Rotation automatique des clés API tous les 90 jours"
                checked={autoRotate}
                onChange={setAutoRotate}
              />
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection title="Zone de danger">
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm mb-2">
                  ⚠️ Attention : Les actions ci-dessous sont irréversibles
                </p>
                <p className="text-white/60 text-sm">
                  Assurez-vous de sauvegarder vos données avant de continuer.
                </p>
              </div>
              <Button variant="danger" onClick={() => console.log('Reset all settings')}>
                Réinitialiser tous les paramètres
              </Button>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  )
}