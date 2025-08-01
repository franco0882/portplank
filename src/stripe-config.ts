export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SmyYbKMwD2n6U0',
    priceId: 'price_1RrObjJqCJQV0KJv2AVmT6Q7',
    name: 'Portplank - Agency Plan (Yearly)',
    description: 'Portplank software agency plan yearly fee. Visit Portplank at https://portplank.com',
    mode: 'subscription',
    price: 286800, // $2,868.00 in cents
    currency: 'cad',
    interval: 'year',
  },
  {
    id: 'prod_SmyY5ixbKPiadi',
    priceId: 'price_1RrOb0JqCJQV0KJvvLVh5ZDo',
    name: 'Portplank - Startup Plan (Yearly)',
    description: 'Portplank software startup plan yearly fee. Visit Portplank at https://portplank.com',
    mode: 'subscription',
    price: 94800, // $948.00 in cents
    currency: 'cad',
    interval: 'year',
  },
  {
    id: 'prod_SmyXiVU9k3fonx',
    priceId: 'price_1RrOaKJqCJQV0KJvKrfVmjkZ',
    name: 'Portplank - Agency Plan (Monthly)',
    description: 'Portplank software agency plan monthly fee. Visit Portplank at https://portplank.com',
    mode: 'subscription',
    price: 29900, // $299.00 in cents
    currency: 'cad',
    interval: 'month',
  },
  {
    id: 'prod_SmyWSYT0pfVkJL',
    priceId: 'price_1RrOZeJqCJQV0KJvZpYUsHvf',
    name: 'Portplank - Startup Plan (Monthly)',
    description: 'Portplank software startup plan monthly fee. Visit Portplank at https://portplank.com',
    mode: 'subscription',
    price: 9900, // $99.00 in cents
    currency: 'cad',
    interval: 'month',
  },
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const formatPrice = (price: number, currency: string = 'cad'): string => {
  const formatted = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price / 100);
  
  // Remove .00 to make prices look cleaner and less intimidating
  return formatted.replace('.00', '');
};