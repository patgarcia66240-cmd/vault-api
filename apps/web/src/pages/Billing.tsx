import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'

export const Billing: React.FC = () => {
  const [searchParams] = useSearchParams()
  const success = searchParams.get('success') === 'true'
  const canceled = searchParams.get('canceled') === 'true'

  return (
    <div className="min-h-screen bg-gradient-radial">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
          <p className="text-white/60">Manage your subscription</p>
        </div>

        {success && (
          <GlassCard className="p-6 mb-8 border-green-500/30 bg-green-500/10">
            <div className="text-center">
              <div className="text-3xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-green-300 mb-2">Payment Successful!</h3>
              <p className="text-green-200 mb-4">
                Your PRO subscription has been activated. You now have unlimited API keys.
              </p>
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </GlassCard>
        )}

        {canceled && (
          <GlassCard className="p-6 mb-8 border-yellow-500/30 bg-yellow-500/10">
            <div className="text-center">
              <div className="text-3xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-yellow-300 mb-2">Payment Canceled</h3>
              <p className="text-yellow-200 mb-4">
                Your payment was canceled. You can try again anytime.
              </p>
              <Link to="/pricing">
                <Button variant="secondary">Back to Pricing</Button>
              </Link>
            </div>
          </GlassCard>
        )}

        {!success && !canceled && (
          <GlassCard className="p-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">Manage Your Subscription</h3>
              <p className="text-white/60 mb-6">
                View your current plan and manage your billing settings.
              </p>

              <div className="space-y-4">
                <Link to="/dashboard">
                  <Button variant="secondary" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>

                <Link to="/pricing">
                  <Button variant="secondary" className="w-full">
                    View Pricing Plans
                  </Button>
                </Link>
              </div>
            </div>
          </GlassCard>
        )}

        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm">
            Need help? Contact our support team at support@base44.com
          </p>
        </div>
      </div>
    </div>
  )
}