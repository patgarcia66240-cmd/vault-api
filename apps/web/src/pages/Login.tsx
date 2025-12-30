import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '../lib/services/authService'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const navigate = useNavigate()
  const login = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!email) newErrors.email = "L'email est requis"
    if (!password) newErrors.password = 'Le mot de passe est requis'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await login.mutateAsync({ email, password })
      navigate('/dashboard')
    } catch (error) {
      setErrors({ general: 'Email ou mot de passe invalide' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bienvenue</h1>
            <p className="text-white/60">Connectez-vous à votre compte Vault</p>
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

            <Button
              type="submit"
              className="w-full"
              loading={login.isPending}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/60">
              Vous n'avez pas de compte ?{' '}
              <Link to="/signup" className="text-base-yellow hover:text-base-yellow-dark transition-colors">
                S'inscrire
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
