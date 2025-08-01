import React from 'react';
import { CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useStripe } from '../../hooks/useStripe';
import { getProductByPriceId, formatPrice } from '../../stripe-config';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const SubscriptionStatus: React.FC = () => {
  const { subscription, loading, error, getCurrentPlan, isActiveSubscription } = useStripe();

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Error loading subscription data</span>
        </div>
      </Card>
    );
  }

  const currentPlan = getCurrentPlan();
  const isActive = isActiveSubscription();

  if (!subscription || !currentPlan) {
    return (
      <Card>
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">
            You're currently on the free plan. Upgrade to unlock more features.
          </p>
          <Button>
            View Plans
          </Button>
        </div>
      </Card>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'past_due':
        return 'warning';
      case 'canceled':
      case 'unpaid':
        return 'danger';
      default:
        return 'default';
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Subscription</h3>
            <p className="text-sm text-gray-600">{currentPlan.name}</p>
          </div>
        </div>
        <Badge variant={getStatusVariant(subscription.subscription_status)}>
          {subscription.subscription_status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan
            </label>
            <p className="text-sm text-gray-900">{currentPlan.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <p className="text-sm text-gray-900">
              {formatPrice(currentPlan.price, currentPlan.currency)} / {currentPlan.interval}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Period
            </label>
            <p className="text-sm text-gray-900">
              {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <p className="text-sm text-gray-900">
              {subscription.payment_method_brand && subscription.payment_method_last4
                ? `${subscription.payment_method_brand.toUpperCase()} •••• ${subscription.payment_method_last4}`
                : 'No payment method on file'
              }
            </p>
          </div>
        </div>

        {subscription.cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Subscription will cancel at period end
                </p>
                <p className="text-sm text-yellow-600">
                  Your subscription will end on {formatDate(subscription.current_period_end)}
                </p>
              </div>
            </div>
          </div>
        )}

        {isActive && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Subscription Active
                </p>
                <p className="text-sm text-green-600">
                  Your subscription is active and all features are available
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
        <Button variant="ghost" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Billing History
        </Button>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            Update Payment Method
          </Button>
          <Button variant="secondary" size="sm">
            Change Plan
          </Button>
        </div>
      </div>
    </Card>
  );
};