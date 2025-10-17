import React from 'react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'

export const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-radial">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-white/60 text-lg">Choose the plan that fits your needs</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <GlassCard className="p-8 relative">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Free</h2>
              <div className="text-4xl font-bold text-base-yellow mb-4">$0</div>
              <p className="text-white/60 mb-6">Perfect for getting started</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Up to 3 API keys
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Basic key management
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Email support
              </li>
              <li className="flex items-center text-white/40">
                <span className="text-white/20 mr-3">—</span>
                Unlimited API keys
              </li>
              <li className="flex items-center text-white/40">
                <span className="text-white/20 mr-3">—</span>
                Priority support
              </li>
            </ul>

            <Link to="/signup">
              <Button variant="secondary" className="w-full">
                Get Started
              </Button>
            </Link>
          </GlassCard>

          {/* Pro Plan */}
          <GlassCard className="p-8 relative border-2 border-base-yellow/50">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-base-yellow text-base-black px-4 py-1 rounded-full text-sm font-semibold">
                MOST POPULAR
              </div>
            </div>

            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
              <div className="text-4xl font-bold text-base-yellow mb-4">$29<span className="text-lg text-white/60">/month</span></div>
              <p className="text-white/60 mb-6">For professionals and teams</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Unlimited API keys
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Advanced key management
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Priority support
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Usage analytics
              </li>
              <li className="flex items-center text-white/80">
                <span className="text-green-400 mr-3">✓</span>
                Team collaboration
              </li>
            </ul>

            <Link to="/signup">
              <Button className="w-full">
                Start Free Trial
              </Button>
            </Link>
          </GlassCard>
        </div>

        <div className="mt-16 text-center">
          <GlassCard className="p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h3>

            <div className="space-y-6 text-left">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Can I change plans anytime?</h4>
                <p className="text-white/60">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">What happens if I exceed my plan limits?</h4>
                <p className="text-white/60">We'll notify you when you're approaching your limits. You can upgrade to continue using the service.</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Is my data secure?</h4>
                <p className="text-white/60">Yes, all API keys are encrypted using AES-256-GCM encryption, and we use industry-standard security practices.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}