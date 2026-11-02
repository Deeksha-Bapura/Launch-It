export const permitData: Record<string, any> = {
  houston: {
    cottageFoodLaw: {
      applies: ['baked goods', 'candy', 'jams', 'jellies', 'pickles', 'roasted nuts', 'honey', 'dried herbs', 'dried pasta'],
      annualRevenueLimit: 50000,
      requirements: [
        'You can sell directly to consumers without a food handler permit — this is the Texas Cottage Food Law.',
        'Your home kitchen does not need a health inspection.',
        'Products must be labeled with your name, address, the product name, all ingredients in descending order by weight, any allergens, and the statement: "This food was not inspected by the Department of State Health Services."',
        'You can sell at farmers markets, roadside stands, from your home, and online with in-person delivery.',
        'You cannot sell wholesale to stores or restaurants under the cottage food exemption.',
        'You cannot ship products out of state under this exemption.',
      ],
      cost: 0,
      link: 'https://www.dshs.texas.gov/establishments/cottage-food',
    },
    salesTax: {
      rate: 0.0825,
      threshold: 'You must collect and remit sales tax if you sell taxable items. Food for home consumption is generally not taxable, but prepared food and some services are.',
      filingFrequency: 'Quarterly for most small businesses. Monthly if you collect more than $500/month in sales tax.',
      dueDates: ['April 20', 'July 20', 'October 20', 'January 20'],
      registrationLink: 'https://mycpa.cpa.state.tx.us/coa/',
    },
    generalBusinessLicense: {
      required: false,
      notes: 'Houston and Harris County do not require a general business license. However, you may need specific permits depending on your business type.',
    },
    dba: {
      required: 'Required if you are operating under any name other than your legal name.',
      cost: 25,
      filedWith: 'Harris County Clerk',
      link: 'https://www.harriscountyclerk.org/assumed-name-dba/',
    },
    beautyServices: {
      license: 'Texas Cosmetology License is required for hair styling, nail services, esthetics, and most beauty services.',
      cost: 50,
      licensingBoard: 'Texas Department of Licensing and Regulation (TDLR)',
      link: 'https://www.tdlr.texas.gov/cosmet/cosmet.htm',
      notes: 'You must graduate from an accredited cosmetology school and pass a state exam. Natural hair braiding has separate (lighter) requirements.',
    },
    cleaningServices: {
      license: 'No state license required for residential cleaning services.',
      salesTaxNote: 'Commercial janitorial services are subject to Texas sales tax at 8.25%. Residential cleaning is not taxable.',
      notes: 'You may need a general liability insurance policy — many clients require it. If you use employees, you need to register for employer taxes.',
      link: 'https://comptroller.texas.gov/taxes/sales/',
    },
    landscaping: {
      license: 'No state license required for basic lawn mowing and maintenance.',
      pesticideNote: 'Applying pesticides, herbicides, or fertilizers for hire requires a Texas Department of Agriculture license.',
      notes: 'Tree trimming near power lines requires additional certification. Basic mowing, edging, and cleanup do not require a license.',
      link: 'https://www.tda.texas.gov/pesticides-fertilizers',
    },
  },
  austin: {
    cottageFoodLaw: {
      applies: ['baked goods', 'candy', 'jams', 'jellies', 'pickles', 'roasted nuts', 'honey', 'dried herbs', 'dried pasta'],
      annualRevenueLimit: 50000,
      requirements: [
        'Same Texas Cottage Food Law applies in Austin/Travis County as in Houston.',
        'Your home kitchen does not need a health inspection.',
        'Products must be labeled with your name, address, the product name, all ingredients in descending order by weight, any allergens, and the statement: "This food was not inspected by the Department of State Health Services."',
        'You can sell at farmers markets, roadside stands, from your home, and online with in-person delivery.',
        'Austin has a robust farmers market scene — Barton Creek Farmers Market and SFC Farmers Market are good venues.',
      ],
      cost: 0,
      link: 'https://www.dshs.texas.gov/establishments/cottage-food',
    },
    salesTax: {
      rate: 0.0825,
      threshold: 'You must collect and remit sales tax if you sell taxable items. Food for home consumption is generally not taxable, but prepared food and some services are.',
      filingFrequency: 'Quarterly for most small businesses. Monthly if you collect more than $500/month in sales tax.',
      dueDates: ['April 20', 'July 20', 'October 20', 'January 20'],
      registrationLink: 'https://mycpa.cpa.state.tx.us/coa/',
    },
    generalBusinessLicense: {
      required: false,
      notes: 'Austin and Travis County do not require a general business license. However, you may need specific permits depending on your business type and zoning.',
    },
    dba: {
      required: 'Required if you are operating under any name other than your legal name.',
      cost: 24,
      filedWith: 'Travis County Clerk',
      link: 'https://www.traviscountytx.gov/county-clerk/recording/assumed-name',
    },
    beautyServices: {
      license: 'Texas Cosmetology License is required for hair styling, nail services, esthetics, and most beauty services.',
      cost: 50,
      licensingBoard: 'Texas Department of Licensing and Regulation (TDLR)',
      link: 'https://www.tdlr.texas.gov/cosmet/cosmet.htm',
      notes: 'Austin has a large cosmetology school network. Some practitioners rent booth space in licensed salons rather than setting up their own space.',
    },
    cleaningServices: {
      license: 'No state license required for residential cleaning services.',
      salesTaxNote: 'Commercial janitorial services are subject to Texas sales tax at 8.25%. Residential cleaning is not taxable.',
      notes: 'Austin has a strong market for eco-friendly cleaning services. General liability insurance is often required by clients.',
      link: 'https://comptroller.texas.gov/taxes/sales/',
    },
    landscaping: {
      license: 'No state license required for basic lawn mowing and maintenance.',
      pesticideNote: 'Applying pesticides, herbicides, or fertilizers for hire requires a Texas Department of Agriculture license.',
      notes: 'Austin has strict water conservation rules that can affect landscaping practices. Tree removal may require a permit in some Austin neighborhoods.',
      link: 'https://www.tda.texas.gov/pesticides-fertilizers',
    },
  },
};

// Each keyword must appear at the start of a word, so "tree" matches
// "trees" but not "street", and "dress" matches "dresses" but not "address".
const BUSINESS_CATEGORIES: [string, string[]][] = [
  ["food", ["cake", "cupcake", "bak", "cookie", "tamale", "taco", "food", "seafood", "cook", "meal", "jam", "candy", "snack", "catering"]],
  ["beauty", ["hair", "nail", "lash", "eyelash", "braid", "beauty", "makeup", "esthetic", "salon", "barber", "wax", "facial"]],
  ["cleaning", ["clean", "maid", "housekeep", "janitor", "laundry"]],
  ["landscaping", ["lawn", "yard", "landscap", "mow", "tree", "garden"]],
  ["apparel", ["cloth", "apparel", "fashion", "shirt", "dress", "sew"]],
  ["education", ["tutor", "teach", "lesson", "coach", "educat", "class"]],
  ["repair", ["repair", "fix", "mechanic", "handyman", "plumb", "electric"]],
  ["retail", ["sell", "resell", "retail", "resale", "shop", "store", "product"]],
];

export function classifyBusiness(description: string): string {
  const lower = description.toLowerCase();
  for (const [category, keywords] of BUSINESS_CATEGORIES) {
    if (keywords.some((k) => new RegExp(`\\b${k}`).test(lower))) {
      return category;
    }
  }
  return "general";
}