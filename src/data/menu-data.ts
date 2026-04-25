export type MenuTag = "bestseller" | "chef-special" | "vegetarian" | "spicy" | "new" | "signature";

export interface MenuItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceInPaise: number;
  category: string;
  categorySlug: string;
  imagePath: string;
  fallbackImage: string;
  tags: MenuTag[];
  isFeatured: boolean;
}

export interface MenuCategory {
  slug: string;
  name: string;
  description: string;
  items: MenuItem[];
}

// ---------------------------------------------------------------------------
// SIGNATURE STARTERS
// ---------------------------------------------------------------------------
const starters: MenuItem[] = [
  {
    id: "truffle-dahi-puri",
    slug: "truffle-dahi-puri",
    name: "Truffle Dahi Puri",
    description: "Crisp semolina shells filled with whipped truffle yoghurt, tamarind gel, and pomegranate pearls. An elevated take on a beloved classic.",
    priceInPaise: 64900,
    category: "Signature Starters",
    categorySlug: "signature-starters",
    imagePath: "/images/menu/starters/truffle-dahi-puri.jpg",
    fallbackImage: "/images/placeholder-starter.jpg",
    tags: ["signature", "vegetarian", "bestseller"],
    isFeatured: true,
  },
  {
    id: "lotus-stem-chaat",
    slug: "lotus-stem-chaat",
    name: "Lotus Stem Chaat",
    description: "Crispy lotus stem discs tossed with tangy chaat masala, green chutney, and a saffron yoghurt drizzle. Texture-forward and addictive.",
    priceInPaise: 59900,
    category: "Signature Starters",
    categorySlug: "signature-starters",
    imagePath: "/images/menu/starters/lotus-stem-chaat.jpg",
    fallbackImage: "/images/placeholder-starter.jpg",
    tags: ["vegetarian", "spicy"],
    isFeatured: false,
  },
  {
    id: "gunpowder-prawns",
    slug: "gunpowder-prawns",
    name: "Gunpowder Prawns",
    description: "Tiger prawns flash-fried with house gunpowder spice, curry leaf butter, and pickled lime. Fiery, fragrant, and deeply satisfying.",
    priceInPaise: 89900,
    category: "Signature Starters",
    categorySlug: "signature-starters",
    imagePath: "/images/menu/starters/gunpowder-prawns.jpg",
    fallbackImage: "/images/placeholder-starter.jpg",
    tags: ["signature", "spicy", "chef-special", "bestseller"],
    isFeatured: true,
  },
  {
    id: "murgh-makhmali-kebab",
    slug: "murgh-makhmali-kebab",
    name: "Murgh Makhmali Kebab",
    description: "Silken chicken mince kebabs blended with cream cheese, green cardamom, and white pepper. Delicately spiced and meltingly tender.",
    priceInPaise: 79900,
    category: "Signature Starters",
    categorySlug: "signature-starters",
    imagePath: "/images/menu/starters/murgh-makhmali-kebab.jpg",
    fallbackImage: "/images/placeholder-starter.jpg",
    tags: ["signature", "chef-special", "bestseller"],
    isFeatured: true,
  },
  {
    id: "tandoori-broccoli-royale",
    slug: "tandoori-broccoli-royale",
    name: "Tandoori Broccoli Royale",
    description: "Whole broccoli florets marinated in kashmiri chilli, hung curd, and smoked mustard. Charred in the tandoor to caramelised perfection.",
    priceInPaise: 64900,
    category: "Signature Starters",
    categorySlug: "signature-starters",
    imagePath: "/images/menu/starters/tandoori-broccoli-royale.jpg",
    fallbackImage: "/images/placeholder-starter.jpg",
    tags: ["vegetarian", "new"],
    isFeatured: false,
  },
];

// ---------------------------------------------------------------------------
// TANDOOR & GRILL
// ---------------------------------------------------------------------------
const grill: MenuItem[] = [
  {
    id: "zafrani-paneer-tikka",
    slug: "zafrani-paneer-tikka",
    name: "Zafrani Paneer Tikka",
    description: "Thick-cut cottage cheese cubes marinated in saffron-yoghurt with ajwain and chargrilled on skewers. Aromatic, golden, and gloriously smoky.",
    priceInPaise: 74900,
    category: "Tandoor & Grill",
    categorySlug: "tandoor-grill",
    imagePath: "/images/menu/grill/zafrani-paneer-tikka.jpg",
    fallbackImage: "/images/placeholder-grill.jpg",
    tags: ["vegetarian", "bestseller"],
    isFeatured: false,
  },
  {
    id: "kasundi-fish-tikka",
    slug: "kasundi-fish-tikka",
    name: "Kasundi Fish Tikka",
    description: "Firm white fish fillets bathed in Bengali kasundi mustard, lime, and turmeric then roasted in the tandoor till flaky and caramelised.",
    priceInPaise: 89900,
    category: "Tandoor & Grill",
    categorySlug: "tandoor-grill",
    imagePath: "/images/menu/grill/kasundi-fish-tikka.jpg",
    fallbackImage: "/images/placeholder-grill.jpg",
    tags: ["spicy", "new"],
    isFeatured: false,
  },
  {
    id: "afghani-murgh-seekh",
    slug: "afghani-murgh-seekh",
    name: "Afghani Murgh Seekh",
    description: "Minced chicken seekh kebabs spiced with Afghan-style aromatics, fresh herbs, and clarified butter. Char-grilled and served with roomali roll.",
    priceInPaise: 84900,
    category: "Tandoor & Grill",
    categorySlug: "tandoor-grill",
    imagePath: "/images/menu/grill/afghani-murgh-seekh.jpg",
    fallbackImage: "/images/placeholder-grill.jpg",
    tags: ["chef-special"],
    isFeatured: false,
  },
  {
    id: "bhatti-ka-jheenga",
    slug: "bhatti-ka-jheenga",
    name: "Bhatti Ka Jheenga",
    description: "Whole jumbo prawns marinated in raw papaya, Bhatti-style spices, and coal-smoked over an open flame. Bold, rustic, and unforgettable.",
    priceInPaise: 109900,
    category: "Tandoor & Grill",
    categorySlug: "tandoor-grill",
    imagePath: "/images/menu/grill/bhatti-ka-jheenga.jpg",
    fallbackImage: "/images/placeholder-grill.jpg",
    tags: ["signature", "chef-special", "spicy"],
    isFeatured: false,
  },
  {
    id: "lamb-gilafi-kebab",
    slug: "lamb-gilafi-kebab",
    name: "Lamb Gilafi Kebab",
    description: "Hand-minced seekh kebabs wrapped in a crust of bell peppers, onion, and coriander. Slow-grilled for an intensely savoury, herb-forward char.",
    priceInPaise: 109900,
    category: "Tandoor & Grill",
    categorySlug: "tandoor-grill",
    imagePath: "/images/menu/grill/lamb-gilafi-kebab.jpg",
    fallbackImage: "/images/placeholder-grill.jpg",
    tags: ["signature", "bestseller"],
    isFeatured: false,
  },
];

// ---------------------------------------------------------------------------
// ROYAL CURRIES
// ---------------------------------------------------------------------------
const curries: MenuItem[] = [
  {
    id: "butter-chicken",
    slug: "butter-chicken",
    name: "Butter Chicken",
    description: "Tandoor-roasted chicken in a velvety tomato-fenugreek sauce enriched with cultured butter and single cream. The definitive classic, perfected.",
    priceInPaise: 79900,
    category: "Royal Curries",
    categorySlug: "royal-curries",
    imagePath: "/images/menu/curries/butter-chicken.jpg",
    fallbackImage: "/images/placeholder-curry.jpg",
    tags: ["bestseller", "signature"],
    isFeatured: true,
  },
  {
    id: "dal-bukhara",
    slug: "dal-bukhara",
    name: "Dal Bukhara",
    description: "Whole black lentils slow-simmered overnight with tomato, ginger, and Bukhara spices, finished with cream. Rich, earthy, and deeply nourishing.",
    priceInPaise: 69900,
    category: "Royal Curries",
    categorySlug: "royal-curries",
    imagePath: "/images/menu/curries/dal-bukhara.jpg",
    fallbackImage: "/images/placeholder-curry.jpg",
    tags: ["vegetarian", "bestseller", "signature"],
    isFeatured: false,
  },
  {
    id: "paneer-lababdar",
    slug: "paneer-lababdar",
    name: "Paneer Lababdar",
    description: "Cottage cheese cubes in a roasted onion and tomato gravy elevated with cashew paste, kashmiri chilli, and dried fenugreek leaves.",
    priceInPaise: 74900,
    category: "Royal Curries",
    categorySlug: "royal-curries",
    imagePath: "/images/menu/curries/paneer-lababdar.jpg",
    fallbackImage: "/images/placeholder-curry.jpg",
    tags: ["vegetarian", "chef-special"],
    isFeatured: false,
  },
  {
    id: "nalli-nihari",
    slug: "nalli-nihari",
    name: "Nalli Nihari",
    description: "Slow-braised lamb shanks in a royal Mughal spice broth enriched with bone marrow and finished with crispy fried onion and ginger julienne.",
    priceInPaise: 129900,
    category: "Royal Curries",
    categorySlug: "royal-curries",
    imagePath: "/images/menu/curries/nalli-nihari.jpg",
    fallbackImage: "/images/placeholder-curry.jpg",
    tags: ["signature", "chef-special"],
    isFeatured: false,
  },
  {
    id: "malai-kofta-royale",
    slug: "malai-kofta-royale",
    name: "Malai Kofta Royale",
    description: "Paneer and potato dumplings stuffed with dry fruits and nuts, served in a saffron-cream korma sauce with a rose water finish.",
    priceInPaise: 79900,
    category: "Royal Curries",
    categorySlug: "royal-curries",
    imagePath: "/images/menu/curries/malai-kofta-royale.jpg",
    fallbackImage: "/images/placeholder-curry.jpg",
    tags: ["vegetarian", "signature"],
    isFeatured: false,
  },
  {
    id: "subz-korma-e-khaas",
    slug: "subz-korma-e-khaas",
    name: "Subz Korma-e-Khaas",
    description: "A garden of seasonal vegetables in a velvety Mughal-style korma sauce made with cashews, poppy seeds, and whole aromatic spices.",
    priceInPaise: 69900,
    category: "Royal Curries",
    categorySlug: "royal-curries",
    imagePath: "/images/menu/curries/subz-korma-e-khaas.jpg",
    fallbackImage: "/images/placeholder-curry.jpg",
    tags: ["vegetarian", "new"],
    isFeatured: false,
  },
];

// ---------------------------------------------------------------------------
// BIRYANI ATELIER
// ---------------------------------------------------------------------------
const biryani: MenuItem[] = [
  {
    id: "saffron-murgh-dum-biryani",
    slug: "saffron-murgh-dum-biryani",
    name: "Saffron Murgh Dum Biryani",
    description: "Free-range chicken marinated in yoghurt and whole spices, slow-cooked dum style with saffron-steeped basmati and caramelised onions.",
    priceInPaise: 89900,
    category: "Biryani Atelier",
    categorySlug: "biryani-atelier",
    imagePath: "/images/menu/biryani/saffron-murgh-dum-biryani.jpg",
    fallbackImage: "/images/placeholder-biryani.jpg",
    tags: ["signature", "bestseller", "chef-special"],
    isFeatured: true,
  },
  {
    id: "lucknowi-gosht-biryani",
    slug: "lucknowi-gosht-biryani",
    name: "Lucknowi Gosht Biryani",
    description: "Tender lamb pieces slow-cooked in a royal Awadhi yakhni, layered with aged basmati and sealed with fragrant kewra water and saffron.",
    priceInPaise: 109900,
    category: "Biryani Atelier",
    categorySlug: "biryani-atelier",
    imagePath: "/images/menu/biryani/lucknowi-gosht-biryani.jpg",
    fallbackImage: "/images/placeholder-biryani.jpg",
    tags: ["signature", "chef-special"],
    isFeatured: false,
  },
  {
    id: "noorani-subz-biryani",
    slug: "noorani-subz-biryani",
    name: "Noorani Subz Biryani",
    description: "A celebration of seasonal vegetables and paneer layered with saffron-basmati and finished with caramelised onions and fresh mint.",
    priceInPaise: 79900,
    category: "Biryani Atelier",
    categorySlug: "biryani-atelier",
    imagePath: "/images/menu/biryani/noorani-subz-biryani.jpg",
    fallbackImage: "/images/placeholder-biryani.jpg",
    tags: ["vegetarian"],
    isFeatured: false,
  },
  {
    id: "zafrani-prawn-biryani",
    slug: "zafrani-prawn-biryani",
    name: "Zafrani Prawn Biryani",
    description: "Coastal tiger prawns cooked in a Kerala-style masala, layered with saffron-steeped basmati and slow-dum-cooked to aromatic perfection.",
    priceInPaise: 119900,
    category: "Biryani Atelier",
    categorySlug: "biryani-atelier",
    imagePath: "/images/menu/biryani/zafrani-prawn-biryani.jpg",
    fallbackImage: "/images/placeholder-biryani.jpg",
    tags: ["spicy", "new"],
    isFeatured: false,
  },
];

// ---------------------------------------------------------------------------
// BREADS & SIDES
// ---------------------------------------------------------------------------
const sides: MenuItem[] = [
  {
    id: "garlic-naan",
    slug: "garlic-naan",
    name: "Garlic Naan",
    description: "Hand-stretched leavened bread baked in the tandoor, brushed with clarified butter and house-pickled garlic.",
    priceInPaise: 19900,
    category: "Breads & Sides",
    categorySlug: "breads-sides",
    imagePath: "/images/menu/sides/garlic-naan.jpg",
    fallbackImage: "/images/placeholder-side.jpg",
    tags: ["vegetarian", "bestseller"],
    isFeatured: false,
  },
  {
    id: "truffle-kulcha",
    slug: "truffle-kulcha",
    name: "Truffle Kulcha",
    description: "Stuffed Amritsari kulcha enriched with truffle oil and aged cheddar, finished with smoked butter and chives.",
    priceInPaise: 34900,
    category: "Breads & Sides",
    categorySlug: "breads-sides",
    imagePath: "/images/menu/sides/truffle-kulcha.jpg",
    fallbackImage: "/images/placeholder-side.jpg",
    tags: ["vegetarian", "signature", "chef-special"],
    isFeatured: false,
  },
  {
    id: "warqi-paratha",
    slug: "warqi-paratha",
    name: "Warqi Paratha",
    description: "Flaky, layered Mughal-style paratha made with pure ghee, each layer paper-thin and blistered golden in the tandoor.",
    priceInPaise: 24900,
    category: "Breads & Sides",
    categorySlug: "breads-sides",
    imagePath: "/images/menu/sides/warqi-paratha.jpg",
    fallbackImage: "/images/placeholder-side.jpg",
    tags: ["vegetarian"],
    isFeatured: false,
  },
  {
    id: "burrata-raita",
    slug: "burrata-raita",
    name: "Burrata Raita",
    description: "Chilled hung curd blended with roasted cumin, rose water, and topped with a sphere of imported burrata and micro herbs.",
    priceInPaise: 39900,
    category: "Breads & Sides",
    categorySlug: "breads-sides",
    imagePath: "/images/menu/sides/burrata-raita.jpg",
    fallbackImage: "/images/placeholder-side.jpg",
    tags: ["vegetarian", "new", "signature"],
    isFeatured: false,
  },
  {
    id: "smoked-mirchi-salad",
    slug: "smoked-mirchi-salad",
    name: "Smoked Mirchi Salad",
    description: "Charred Bhavnagri chillies and heirloom tomatoes in a smoky tamarind vinaigrette, topped with jaggery shards and puffed rice.",
    priceInPaise: 34900,
    category: "Breads & Sides",
    categorySlug: "breads-sides",
    imagePath: "/images/menu/sides/smoked-mirchi-salad.jpg",
    fallbackImage: "/images/placeholder-side.jpg",
    tags: ["vegetarian", "spicy", "new"],
    isFeatured: false,
  },
];

// ---------------------------------------------------------------------------
// DESSERTS & POUR
// ---------------------------------------------------------------------------
const desserts: MenuItem[] = [
  {
    id: "saffron-tres-leches-rasmalai",
    slug: "saffron-tres-leches-rasmalai",
    name: "Saffron Tres Leches Rasmalai",
    description: "Soft chenna discs soaked in a three-milk saffron-cardamom syrup, topped with pistachio crumble and edible rose gold leaf.",
    priceInPaise: 54900,
    category: "Desserts & Pour",
    categorySlug: "desserts-pour",
    imagePath: "/images/menu/desserts/saffron-tres-leches-rasmalai.jpg",
    fallbackImage: "/images/placeholder-dessert.jpg",
    tags: ["vegetarian", "signature", "bestseller", "chef-special"],
    isFeatured: true,
  },
  {
    id: "gulkand-kulfi-falooda",
    slug: "gulkand-kulfi-falooda",
    name: "Gulkand Kulfi Falooda",
    description: "House-made rose petal kulfi served over chilled falooda noodles with basil seeds, kesar milk, and a jamun-rose coulis.",
    priceInPaise: 49900,
    category: "Desserts & Pour",
    categorySlug: "desserts-pour",
    imagePath: "/images/menu/desserts/gulkand-kulfi-falooda.jpg",
    fallbackImage: "/images/placeholder-dessert.jpg",
    tags: ["vegetarian", "bestseller"],
    isFeatured: false,
  },
  {
    id: "filter-coffee-tiramisu",
    slug: "filter-coffee-tiramisu",
    name: "Filter Coffee Tiramisu",
    description: "A south Indian love letter to tiramisu — savoiardi soaked in chicory-blend filter decoction, layered with mascarpone and cocoa dust.",
    priceInPaise: 54900,
    category: "Desserts & Pour",
    categorySlug: "desserts-pour",
    imagePath: "/images/menu/desserts/filter-coffee-tiramisu.jpg",
    fallbackImage: "/images/placeholder-dessert.jpg",
    tags: ["vegetarian", "signature", "new"],
    isFeatured: false,
  },
  {
    id: "jamun-cheesecake-jar",
    slug: "jamun-cheesecake-jar",
    name: "Jamun Cheesecake Jar",
    description: "No-bake cheesecake layered with jamun-cardamom compote and a spiced digestive crumble, served in a sealed jar to savour slowly.",
    priceInPaise: 49900,
    category: "Desserts & Pour",
    categorySlug: "desserts-pour",
    imagePath: "/images/menu/desserts/jamun-cheesecake-jar.jpg",
    fallbackImage: "/images/placeholder-dessert.jpg",
    tags: ["vegetarian", "chef-special"],
    isFeatured: false,
  },
  {
    id: "rose-pistachio-lassi",
    slug: "rose-pistachio-lassi",
    name: "Rose Pistachio Lassi",
    description: "Thick churned yoghurt blended with Rajasthani rose syrup, topped with crushed pistachios, saffron cream, and silver leaf.",
    priceInPaise: 39900,
    category: "Desserts & Pour",
    categorySlug: "desserts-pour",
    imagePath: "/images/menu/desserts/rose-pistachio-lassi.jpg",
    fallbackImage: "/images/placeholder-dessert.jpg",
    tags: ["vegetarian", "signature"],
    isFeatured: false,
  },
  {
    id: "smoked-masala-chai",
    slug: "smoked-masala-chai",
    name: "Smoked Masala Chai",
    description: "Premium Darjeeling second flush brewed with house chai masala and cold-smoked over applewood chips, served with jaggery on the side.",
    priceInPaise: 29900,
    category: "Desserts & Pour",
    categorySlug: "desserts-pour",
    imagePath: "/images/menu/desserts/smoked-masala-chai.jpg",
    fallbackImage: "/images/placeholder-dessert.jpg",
    tags: ["vegetarian", "bestseller", "signature"],
    isFeatured: false,
  },
];

// ---------------------------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------------------------
export const allMenuItems: MenuItem[] = [
  ...starters,
  ...grill,
  ...curries,
  ...biryani,
  ...sides,
  ...desserts,
];

export const featuredDishes: MenuItem[] = allMenuItems.filter((item) => item.isFeatured);

export const menuByCategory: MenuCategory[] = [
  {
    slug: "signature-starters",
    name: "Signature Starters",
    description: "Small plates with smoke, crunch, and house spice blends.",
    items: starters,
  },
  {
    slug: "tandoor-grill",
    name: "Tandoor & Grill",
    description: "Charred premium cuts and clay-oven classics.",
    items: grill,
  },
  {
    slug: "royal-curries",
    name: "Royal Curries",
    description: "Rich gravies, slow reductions, and signature sauces.",
    items: curries,
  },
  {
    slug: "biryani-atelier",
    name: "Biryani Atelier",
    description: "Dum-cooked aromatic rice, sealed and slow-finished.",
    items: biryani,
  },
  {
    slug: "breads-sides",
    name: "Breads & Sides",
    description: "Tandoor-kissed breads and composed accompaniments.",
    items: sides,
  },
  {
    slug: "desserts-pour",
    name: "Desserts & Pour",
    description: "Sweet finales and crafted beverages.",
    items: desserts,
  },
];
