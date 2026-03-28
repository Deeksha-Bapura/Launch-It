export function generateInvoice(businessName: string, ownerName: string, city: string) {
  return {
    type: 'invoice',
    title: `Invoice Template — ${businessName || 'Your Business'}`,
    headerFields: [
      { label: 'Business Name', value: businessName || '[Your Business Name]' },
      { label: 'Owner Name', value: ownerName || '[Your Name]' },
      { label: 'City', value: city || '[Your City, TX]' },
      { label: 'Invoice Number', value: 'INV-[001]' },
      { label: 'Date', value: '[Date]' },
      { label: 'Bill To', value: '[Client Name and Address]' },
    ],
    lineItems: [
      { description: '[Service or Product Description]', quantity: 1, unitPrice: 0, total: 0 },
      { description: '[Additional Item]', quantity: 1, unitPrice: 0, total: 0 },
    ],
    subtotal: '[Sum of items]',
    taxNote: 'Texas sales tax (8.25%) may apply depending on what you are selling.',
    total: '[Subtotal + Tax if applicable]',
    paymentTerms: 'Payment due within 14 days. Accepted: Cash, Venmo, Zelle, CashApp.',
    tip: 'Keep a copy of every invoice you send — they are your proof of income at tax time. A simple folder on your phone works fine.',
  };
}

export function generateProfitLossTracker(businessType: string) {
  return {
    type: 'profit_loss',
    title: `Profit & Loss Tracker — ${businessType ? businessType.charAt(0).toUpperCase() + businessType.slice(1) + ' Business' : 'Your Business'}`,
    period: '[Month/Quarter/Year]',
    income: [
      { category: 'Sales', amount: 0 },
      { category: 'Other Income', amount: 0 },
    ],
    totalIncome: 0,
    expenses: [
      { category: 'Supplies / Ingredients', amount: 0 },
      { category: 'Packaging', amount: 0 },
      { category: 'Gas / Transportation', amount: 0 },
      { category: 'Marketing (flyers, social ads)', amount: 0 },
      { category: 'Phone (business portion)', amount: 0 },
      { category: 'Other', amount: 0 },
    ],
    totalExpenses: 0,
    netProfit: 0,
    tip: 'Your net profit is what the IRS considers your taxable income from self-employment. If you make over $400 in profit in a year, you need to file a Schedule C with your taxes.',
  };
}

export function generatePricingWorksheet(productName: string) {
  return {
    type: 'pricing',
    title: `Pricing Worksheet — ${productName || 'Your Product'}`,
    steps: [
      {
        step: 1,
        label: 'Ingredient / Material Cost per Unit',
        description: 'Add up everything that goes into one unit of what you sell.',
        value: 0,
        unit: '$ per unit',
      },
      {
        step: 2,
        label: 'Packaging Cost',
        description: 'Box, bag, label, tissue paper — whatever you use to package it.',
        value: 0,
        unit: '$ per unit',
      },
      {
        step: 3,
        label: 'Your Time',
        description: 'How long does it take to make one unit? Multiply hours × your hourly rate. Minimum $15/hr — do not undervalue your time.',
        value: 0,
        unit: '$ per unit',
      },
      {
        step: 4,
        label: 'Overhead Share',
        description: 'Your portion of electricity, gas, equipment wear-and-tear per unit. A rough estimate is fine.',
        value: 0,
        unit: '$ per unit',
      },
      {
        step: 5,
        label: 'Total Cost',
        description: 'Sum of steps 1–4. This is your break-even price.',
        value: 0,
        unit: '$ per unit (calculated)',
      },
      {
        step: 6,
        label: 'Markup',
        description: 'Suggested 2–3× your total cost. This covers profit, reinvestment, and slow periods.',
        value: 0,
        unit: '$ markup',
      },
      {
        step: 7,
        label: 'Suggested Selling Price',
        description: 'Total Cost + Markup. Compare to what similar products sell for in your area.',
        value: 0,
        unit: '$ selling price',
      },
    ],
    warning: 'Most informal business owners undercharge because they forget to count their own time. Your time is a real cost — include it every time.',
  };
}

export function generateSocialPost(businessName: string, product: string, city: string) {
  const biz = businessName || 'my business';
  const prod = product || 'my products';
  const loc = city || 'Houston/Austin';

  return {
    type: 'social_post',
    title: `Social Media Templates — ${biz}`,
    platforms: {
      instagram: `✨ Fresh ${prod} available now! ✨\n\nHandmade with love right here in ${loc}. 🏠\n\nDM me to order or ask any questions — I respond fast!\n\n📦 Local delivery & pickup available\n\n#${loc.replace(/\s/g, '')}Business #SmallBusiness #SupportLocal #HandmadeInTexas #${prod.replace(/\s/g, '')}`,

      facebook: `Hey neighbors! 👋\n\nI'm excited to share that ${biz} is now officially open! I make ${prod} right here in ${loc}.\n\nEverything is made fresh to order with quality ingredients. If you've been looking for a local option, I'd love to be your go-to.\n\nMessage me here or comment below to place an order. Happy to answer any questions!\n\n— ${biz}`,

      nextdoor: `Hi ${loc} neighbors,\n\nI run a small home-based business making ${prod}. I've been doing this for a while and recently decided to make it official!\n\nIf you're looking for a local, reliable source for ${prod}, I'd love to help. I offer local pickup and can sometimes deliver nearby.\n\nFeel free to message me directly. Thanks for supporting local! 🙏`,
    },
    tip: 'Post consistently — even twice a week makes a big difference. Photos taken in natural light perform best. Always respond to comments and messages within 24 hours.',
  };
}
