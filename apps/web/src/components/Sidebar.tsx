import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { useLogout, useCurrentUser } from '../lib/services/authService'
import { HomeIcon, KeyIcon, CogIcon, CreditCardIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

type SidebarItemProps =
  | {
      icon: React.ReactNode
      label: string
      href: string
      isActive?: boolean
      onClick?: never
    }
  | {
      icon: React.ReactNode
      label: string
      onClick: () => void
      isActive?: boolean
      href?: never
    }

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href, isActive, onClick }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
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
          : 'text-white/70 hover:text-white',
        label === 'Tarifs' && 'bg-base-yellow/20 backdrop-blur-sm shadow-lg shadow-base-yellow/10'
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
  const { data: user } = useCurrentUser()

  const handleLogout = () => {
    logout.mutate()
    navigate('/login')
  }

  const sidebarItems = [
    {
      icon: <HomeIcon className="w-6 h-6" />,
      label: 'Accueil',
      href: '/dashboard'
    },
    {
      icon: <KeyIcon className="w-6 h-6" />,
      label: 'Clés API',
      href: '/clés'
    },
    {
      icon: <CreditCardIcon className="w-6 h-6" />,
      label: 'Tarifs',
      href: '/tarifs'
    },
    {
      icon: <CreditCardIcon className="w-6 h-6" />,
      label: 'Facturation',
      href: '/facturation'
    },
    {
      icon: <CogIcon className="w-6 h-6" />,
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
      <div className="mb-4 px-4">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-white/60 text-xs mb-1">Connecté en tant que</p>
          <p className="text-white text-sm font-medium truncate">
            {user?.email || 'Utilisateur'}
          </p>
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
        

        <SidebarItem
          icon={<ArrowLeftOnRectangleIcon className="w-6 h-6" />}
          label="Déconnexion"
          onClick={handleLogout}
          isActive={false}
        />
      </div>
    </div>
  )
}
