import { BridalItem, Product } from '../types';

export interface BridalLookSuite {
  themeName: string;
  paletteDescription: string;
  makeup: BridalItem;
  jewelry: BridalItem;
  hair: BridalItem;
  dupatta: BridalItem;
  shoes: BridalItem;
  accessories: BridalItem;
}

export const BRIDAL_THEME_SETS: Record<string, BridalLookSuite> = {
  'maroon-red': {
    themeName: 'Royal Barat Crimson & Zardozi',
    paletteDescription: 'Imperial ruby crimson, deep maroon velvet, antique 24k gold bullion dabka, and fragrant white mogra.',
    makeup: {
      category: 'Makeup',
      name: 'Royal Heritage HD Velvet Radiance',
      description: 'Luminous velvet skin finish, sculpted cheekbones, subtle smoked bronze kohl eyes, and classic deep ruby red matte lips.',
      image: '/images/bridal/makeup-royal.jpg',
      price: 45000,
    },
    jewelry: {
      category: 'Jewelry',
      name: '22K Polki & Ruby Matha Patti Choker Suite',
      description: 'Handcrafted 22k gold plated polki choker encrusted with deep pigeon-blood ruby drops, matching jhumkas, and royal matha patti.',
      image: '/images/bridal/jewelry-ruby.jpg',
      price: 195000,
    },
    hair: {
      category: 'Hair',
      name: 'Regal Mogra Bun with Gilded Pins',
      description: 'Sculpted royal bridal low chignon crowned with fresh Arabian jasmine (motia/gajra) garlands and heirloom 24k gold pins.',
      image: '/images/bridal/hair-traditional.jpg',
      price: 22000,
    },
    dupatta: {
      category: 'Dupatta',
      name: 'Gilded Crimson Mukesh Organza Veil',
      description: 'Featherlight sheer crimson veil finished with dense stardust mukesh spray, scalloped zardozi matha-patti border, and gold kiran.',
      image: '/images/bridal/dupatta-crimson.jpg',
      price: 65000,
    },
    shoes: {
      category: 'Shoes',
      name: 'Crimson Velvet Dabka & Pearl Khussa',
      description: 'Pure leather bridal khussa encrusted with hand-stitched real pearls, dabka bullion flowers, and cushion memory padding.',
      image: '/images/bridal/shoes-crimson.jpg',
      price: 18500,
    },
    accessories: {
      category: 'Accessories',
      name: 'Imperial Maroon Velvet Zardozi Batua',
      description: 'Matching crimson velvet bridal wristlet potli embellished with antique dabka medallions and strung seed-pearl tassels.',
      image: '/images/bridal/accessories-batua-crimson.jpg',
      price: 15000,
    },
  },

  'gold-champagne': {
    themeName: 'Imperial Gold & Basra Pearl Suite',
    paletteDescription: 'Champagne gold silk, molten metallic zari, antique ivory basra pearls, and warm candlelight glow.',
    makeup: {
      category: 'Makeup',
      name: 'Dewy Champagne Gilded Radiance',
      description: 'Airbrushed golden glow with fine liquid highlight, champagne shimmer lids, flutter lashes, and nude peach petal velvet lips.',
      image: '/images/bridal/makeup-ivory.jpg',
      price: 42000,
    },
    jewelry: {
      category: 'Jewelry',
      name: 'Basra Pearl & Uncut Diamond Polki Haar',
      description: 'Royal multi-strand basra pearl satlada with uncut diamond polki pendant, matching champagne pearl chandbalis, and delicate nath.',
      image: '/images/bridal/jewelry-pearl.jpg',
      price: 185000,
    },
    hair: {
      category: 'Hair',
      name: 'Textured Romantic Chignon with Gilded Vines',
      description: 'Intricately textured bridal chignon woven with fine baby’s breath sprigs and hand-twisted metallic gold hair vines.',
      image: '/images/bridal/hair-textured.jpg',
      price: 24000,
    },
    dupatta: {
      category: 'Dupatta',
      name: 'Champagne Gold Tissue Zari Veil',
      description: 'Luminous golden crinkle tissue veil trimmed with antique tilla borders, micro sequins, and heavy gold scalloped kiran.',
      image: '/images/bridal/dupatta-gold.jpg',
      price: 58000,
    },
    shoes: {
      category: 'Shoes',
      name: 'Champagne Raw Silk Dabka Khussa',
      description: 'Hand-loomed champagne raw silk khussa encrusted with micro sequins, cut-dana zardozi embroidery, and soft leather lining.',
      image: '/images/bridal/shoes-gold.jpg',
      price: 17500,
    },
    accessories: {
      category: 'Accessories',
      name: 'Heirloom Champagne Brocade Potli',
      description: 'Authentic Banarsi gold brocade potli featuring pearl-beaded wrist handle and metallic gold zari drawstrings.',
      image: '/images/bridal/accessories-potli-gold.jpg',
      price: 14000,
    },
  },

  'ivory-white': {
    themeName: 'Nikah Serenity Pearl & Silver Suite',
    paletteDescription: 'Pure ivory silk, translucent organza, frosted silver tilla, and lustrous baroque basra pearls.',
    makeup: {
      category: 'Makeup',
      name: 'Ethereal Pearl Glow & Velveteen Nude',
      description: 'Ultra-refined glass skin finish, subtle taupe contour, delicate silver stardust inner corners, and soft rose-nude velvet lips.',
      image: '/images/bridal/makeup-ivory.jpg',
      price: 40000,
    },
    jewelry: {
      category: 'Jewelry',
      name: 'Silver Tilla & Pearl Polki Choker Set',
      description: 'Sterling silver dipped polki choker featuring freshwater baroque pearls, matching chandelier earrings, and delicate silver maang tikka.',
      image: '/images/bridal/jewelry-pearl.jpg',
      price: 175000,
    },
    hair: {
      category: 'Hair',
      name: 'Soft Twisted Crown with Ivory Florals',
      description: 'Classic romantic crown braid transitioning into a soft textured bun, adorned with delicate white baby’s breath and pearl pins.',
      image: '/images/bridal/hair-braid.jpg',
      price: 20000,
    },
    dupatta: {
      category: 'Dupatta',
      name: 'Pure Ivory Organza Silver Mukesh Veil',
      description: 'Translucent pure organza veil with silver mukesh stardust spray, scalloped resham borders, and silver gota kiran.',
      image: '/images/bridal/dupatta-gold.jpg',
      price: 52000,
    },
    shoes: {
      category: 'Shoes',
      name: 'Ivory Raw Silk Pearl Encrusted Khussa',
      description: 'Pure ivory raw silk bridal khussa hand-stitched with tiny freshwater pearls and frosted silver sequins.',
      image: '/images/bridal/shoes-gold.jpg',
      price: 16500,
    },
    accessories: {
      category: 'Accessories',
      name: 'Handcrafted Ivory Silk Potli with Pearl Handle',
      description: 'Ivory pure silk clutch potli adorned with intricate silver dabka vines and mother-of-pearl hanging droplets.',
      image: '/images/bridal/accessories-potli-gold.jpg',
      price: 13500,
    },
  },

  'pink-pastel': {
    themeName: 'Valima Rose Gold & Pastel Bloom',
    paletteDescription: 'Dusty rose net, blush peach organza, tourmaline crystals, and romantic floral pastels.',
    makeup: {
      category: 'Makeup',
      name: 'Soft Rose Ethereal Glow & Mauve Velvet Lips',
      description: 'Dewy soft-focus skin, rose gold shimmer lids with winged liner, diffused rose blush, and mauve-rose velvety sculpted lips.',
      image: '/images/bridal/makeup-pink.jpg',
      price: 42000,
    },
    jewelry: {
      category: 'Jewelry',
      name: 'Rose Gold Polki & Tourmaline Choker',
      description: 'Rose gold dipped polki choker set with blush pink tourmaline drop stones, matching danglers, and intricate floral passa.',
      image: '/images/bridal/jewelry-rosegold.jpg',
      price: 180000,
    },
    hair: {
      category: 'Hair',
      name: 'Crown Braid with Voluminous Hollywood Curls',
      description: 'Regal crown braid swept into voluminous soft cascading curls, accented with blush miniature rosebuds and crystal sprigs.',
      image: '/images/bridal/hair-curls.jpg',
      price: 25000,
    },
    dupatta: {
      category: 'Dupatta',
      name: 'Powder Pink French Net Scalloped Veil',
      description: 'Gossamer powder pink French net veil with hand-embroidered floral cut-dana borders and delicate pearl drops.',
      image: '/images/bridal/dupatta-pink.jpg',
      price: 55000,
    },
    shoes: {
      category: 'Shoes',
      name: 'Blush Rose Hand-Embroidered Khussa',
      description: 'Supple blush pink leather khussa encrusted with delicate pearls, rose-gold cutdana, and comfortable cushioned soles.',
      image: '/images/bridal/shoes-pink.jpg',
      price: 17000,
    },
    accessories: {
      category: 'Accessories',
      name: 'Rose Silk Potli with Strung Pearl Fringe',
      description: 'Hand-dyed blush pink silk potli bag featuring delicate zardozi embroidery and a cascading pearl fringe tassel.',
      image: '/images/bridal/accessories-potli-pink.jpg',
      price: 14000,
    },
  },

  'emerald-green': {
    themeName: 'Shehnai Emerald & Polki Suite',
    paletteDescription: 'Deep forest green velvet, pure mint organza, Zambian emerald beads, and antique gold tilla.',
    makeup: {
      category: 'Makeup',
      name: 'Luminous Golden Radiance & Terracotta Lips',
      description: 'Warm golden illuminated skin, kohl-rimmed defined eyes with antique gold foil, and warm terracotta-rose velvet lips.',
      image: '/images/bridal/makeup-emerald.jpg',
      price: 42000,
    },
    jewelry: {
      category: 'Jewelry',
      name: 'Zambian Emerald & Polki Choker Set',
      description: 'Heirloom polki choker cascading with deep green Zambian emerald teardrops, matching chandbalis, and emerald passa.',
      image: '/images/bridal/jewelry-emerald.jpg',
      price: 190000,
    },
    hair: {
      category: 'Hair',
      name: 'Sleek Royal Low Bun with Emerald Comb',
      description: 'Impeccably sleek low bridal bun finished with an antique emerald-encrusted hair comb and fragrant fresh jasmine.',
      image: '/images/bridal/hair-traditional.jpg',
      price: 22000,
    },
    dupatta: {
      category: 'Dupatta',
      name: 'Mint Sheer Organza Emerald Resham Veil',
      description: 'Crisp mint sheer organza veil with deep emerald green resham border, antique gold tilla, and fine kiran fringe.',
      image: '/images/bridal/dupatta-mint.jpg',
      price: 60000,
    },
    shoes: {
      category: 'Shoes',
      name: 'Forest Green Raw Silk Emerald Khussa',
      description: 'Lustrous forest green raw silk bridal khussa embroidered with antique gold tilla and micro emerald crystals.',
      image: '/images/bridal/shoes-emerald.jpg',
      price: 18000,
    },
    accessories: {
      category: 'Accessories',
      name: 'Emerald Velvet Clutch Potli with Gold Dabka',
      description: 'Plush emerald green velvet potli wristlet bag with handcrafted gold bullion embroidery and metallic bullion tassels.',
      image: '/images/bridal/accessories-clutch-emerald.jpg',
      price: 15000,
    },
  },

  'plum-wine': {
    themeName: 'Imperial Royale Wine & Navratan',
    paletteDescription: 'Deep imperial plum, rich wine velvet, Nizam navratan gems, and antique tarnished zari.',
    makeup: {
      category: 'Makeup',
      name: 'Imperial Velvet Radiance & Wine Ombre Lips',
      description: 'Velveteen high-coverage imperial skin, antique gold halo smoked lids, deep wine-plum ombre lips, and sculpted cheekbones.',
      image: '/images/bridal/makeup-plum.jpg',
      price: 45000,
    },
    jewelry: {
      category: 'Jewelry',
      name: 'Nizam Navratan & Ruby Polki Choker Suite',
      description: 'Heritage Nizam-era polki choker set with ruby drops, amethyst highlights, royal matha patti, and multi-stone jhumkas.',
      image: '/images/bridal/jewelry-plum.jpg',
      price: 198000,
    },
    hair: {
      category: 'Hair',
      name: 'Sculpted Royal Chignon with Antique Pins',
      description: 'Sculpted couture low chignon adorned with antique kundan hairpins and deep red rose petals.',
      image: '/images/bridal/hair-traditional.jpg',
      price: 24000,
    },
    dupatta: {
      category: 'Dupatta',
      name: 'Deep Wine Crinkle Tissue Zari Veil',
      description: 'Featherlight deep wine crinkle tissue veil bordered with antique gold zardozi motifs and scalloped tilla kiran.',
      image: '/images/bridal/dupatta-crimson.jpg',
      price: 64000,
    },
    shoes: {
      category: 'Shoes',
      name: 'Royal Plum Velvet Zardozi Khussa',
      description: 'Imperial deep plum velvet khussa hand-stitched with antique gold dabka, sequins, and memory foam padding.',
      image: '/images/bridal/shoes-crimson.jpg',
      price: 18500,
    },
    accessories: {
      category: 'Accessories',
      name: 'Imperial Wine Velvet Batua with Gold Zari',
      description: 'Regal wine velvet bridal batua with heavy hand zardozi medallion embroidery and hand-strung bead tassels.',
      image: '/images/bridal/accessories-batua-crimson.jpg',
      price: 15000,
    },
  },
};

export function getBridalThemeKey(color = '', occasion = ''): string {
  const c = color.toLowerCase();
  const o = occasion.toLowerCase();

  if (c.includes('maroon') || c.includes('crimson') || c.includes('red') || c.includes('ruby') || c.includes('burgundy')) {
    return 'maroon-red';
  }
  if (c.includes('gold') || c.includes('champagne') || c.includes('beige') || c.includes('yellow') || c.includes('mustard')) {
    return 'gold-champagne';
  }
  if (c.includes('ivory') || c.includes('white') || c.includes('cream') || c.includes('silver') || o.includes('nikah')) {
    return 'ivory-white';
  }
  if (c.includes('pink') || c.includes('blush') || c.includes('peach') || c.includes('rose') || c.includes('coral') || c.includes('lilac')) {
    return 'pink-pastel';
  }
  if (c.includes('green') || c.includes('emerald') || c.includes('mint') || c.includes('olive') || c.includes('teal')) {
    return 'emerald-green';
  }
  if (c.includes('plum') || c.includes('wine') || c.includes('purple') || c.includes('navy') || c.includes('blue')) {
    return 'plum-wine';
  }

  // Default to classic Barat maroon-red
  return 'maroon-red';
}

/**
 * Returns a complete 7-piece Bridal Suite harmonized with the chosen dress
 */
export function getMatchingBridalSuite(dress: Product): BridalItem[] {
  const themeKey = getBridalThemeKey(dress.color, dress.occasion || dress.event);
  const suite = BRIDAL_THEME_SETS[themeKey] || BRIDAL_THEME_SETS['maroon-red'];

  const dressItem: BridalItem = {
    category: 'Bridal Dress',
    name: dress.name,
    description: dress.description || `${dress.fabric} bridal ensemble tailored for ${dress.occasion || 'Barat'} couture.`,
    image: dress.images.front,
    price: dress.price,
  };

  return [
    dressItem,
    suite.makeup,
    suite.jewelry,
    suite.hair,
    suite.dupatta,
    suite.shoes,
    suite.accessories,
  ];
}

// Initial default bridal suite
export const BRIDAL_ITEMS_DATA: BridalItem[] = [
  {
    category: 'Bridal Dress',
    name: 'Shahzadi Zardozi Velvet Lehenga',
    description: 'Bespoke crimson micro-velvet choli & 18-kali zardozi embroidered flared lehenga with French tilla borders.',
    image: '/images/categories/Barat/dress_02.jpeg',
    price: 294400,
  },
  BRIDAL_THEME_SETS['maroon-red'].makeup,
  BRIDAL_THEME_SETS['maroon-red'].jewelry,
  BRIDAL_THEME_SETS['maroon-red'].hair,
  BRIDAL_THEME_SETS['maroon-red'].dupatta,
  BRIDAL_THEME_SETS['maroon-red'].shoes,
  BRIDAL_THEME_SETS['maroon-red'].accessories,
];
