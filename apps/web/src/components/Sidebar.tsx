import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { useLogout } from '../lib/services/authService'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  href: string
  isActive?: boolean
  onClick?: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href, isActive, onClick }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(href)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
        'text-left hover:bg-white/10',
        isActive
          ? 'bg-white/10 text-white border-l-4 border-base-yellow'
          : 'text-white/70 hover:text-white'
      )}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  )
}

export const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useLogout()

  const handleLogout = () => {
    logout.mutate()
    navigate('/login')
  }

  const sidebarItems = [
    {
      icon: '🏠',
      label: 'Accueil',
      href: '/dashboard'
    },
    {
      icon: '🔗',
      label: 'Liens',
      href: '/liens'
    },
    {
      icon: '⚙️',
      label: 'Paramètres',
      href: '/parametres'
    }
  ]

  return (
    <div className="w-64 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-base-yellow to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Vault</h1>
            <p className="text-white/60 text-xs">API Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={location.pathname === item.href}
            />
          ))}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/60 text-xs mb-1">Connecté en tant que</p>
            <p className="text-white text-sm font-medium truncate">
              user@example.com
            </p>
          </div>
        </div>

        <SidebarItem
          icon="🚪"
          label="Déconnexion"
          onClick={handleLogout}
          isActive={false}
        />
      </div>
    </div>
  )
}