import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignup } from '../lib/services/authService'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const navigate = useNavigate()
  const signup = useSignup()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!email) newErrors.email = "L'email est requis"
    if (!password) newErrors.password = 'Le mot de passe est requis'
    if (password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await signup.mutateAsync({ email, password })
      navigate('/dashboard')
    } catch (error) {
      setErrors({ general: 'Cet email existe déjà' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
            <p className="text-white/60">Commencez à gérer vos clés API avec Vault</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {errors.general}
              </div>
            )}

            <Input
              type="email"
              label="Email"
              placeholder="votre@email.com"
              value={email}
              onChange={setEmail}
              error={errors.email}
              required
            />

            <Input
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              error={errors.password}
              required
              showPasswordToggle
            />

            <Input
              type="password"
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              required
              showPasswordToggle
            />

            <Button
              type="submit"
              className="w-full"
              loading={signup.isPending}
            >
              Créer le compte
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/60">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-base-yellow hover:text-base-yellow-dark transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
