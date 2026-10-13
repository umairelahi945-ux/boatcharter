export type NavigationCategory = {
  label: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  inventoryLocations?: string[];
  inventoryLocationIncludes?: string[];
};

export type NavigationSection = {
  label: string;
  title: string;
  description: string;
  seoTitle?: string;
  categories: NavigationCategory[];
};

const destinations: NavigationCategory[] = [
  {
    label: "Phuket, Thailand",
    slug: "phuket-thailand",
    seoTitle: "Boat Charters in Phuket, Thailand | Horizon Boat Charters",
    description: "Set out from Phuket to explore Thailand's Andaman coast by private boat charter.",
    inventoryLocations: ["Phuket"],
  },
  {
    label: "Mahé, Seychelles",
    slug: "mahe-seychelles",
    seoTitle: "Boat Charters in Mahé, Seychelles | Horizon Boat Charters",
    description: "Plan an island-hopping charter from Mahé through the Seychelles archipelago.",
    inventoryLocations: ["Mahé", "Mahe"],
  },
  {
    label: "Bahamas (Exumas)",
    slug: "bahamas-exumas",
    seoTitle: "Boat Charters in the Bahamas Exumas | Horizon Boat Charters",
    description: "Plan an Exumas charter in the Bahamas around your group, dates, and vessel needs.",
    inventoryLocations: ["Bahamas", "Exumas"],
  },
  {
    label: "Curaçao",
    slug: "curacao",
    seoTitle: "Boat Charters in Curaçao | Horizon Boat Charters",
    description: "Discover Curaçao from the water with a charter planned around your preferred vessel and schedule.",
    inventoryLocations: ["Curaçao", "Curacao"],
  },
  {
    label: "Cozumel",
    slug: "cozumel-mexico",
    seoTitle: "Boat Charters in Cozumel, Mexico | Horizon Boat Charters",
    description: "Use Cozumel as your starting point for a boat charter on Mexico's Caribbean coast.",
    inventoryLocations: ["Cozumel"],
  },
  {
    label: "Grand Cayman",
    slug: "grand-cayman",
    seoTitle: "Boat Charters in Grand Cayman | Horizon Boat Charters",
    description: "Plan a Grand Cayman outing by boat, from a short cruise to a full-day charter.",
    inventoryLocations: ["Grand Cayman"],
  },
  {
    label: "Aruba",
    slug: "aruba",
    seoTitle: "Boat Charters in Aruba | Horizon Boat Charters",
    description: "Explore Aruba's coast by charter, with vessel choices matched to your group and timing.",
    inventoryLocations: ["Aruba"],
  },
  {
    label: "St. Martin",
    slug: "st-martin",
    seoTitle: "Boat Charters in St. Martin | Horizon Boat Charters",
    description: "Plan a St. Martin charter and choose a vessel for the time you want to spend on the water.",
    inventoryLocations: ["Martin"],
  },
  {
    label: "Cabo San Lucas (Mexico)",
    slug: "cabo-san-lucas-mexico",
    seoTitle: "Boat Charters in Cabo San Lucas, Mexico | Horizon Boat Charters",
    description: "Start a Baja California charter from Cabo San Lucas with a vessel suited to your group.",
    inventoryLocations: ["Cabo San Lucas"],
  },
  {
    label: "La Paz (Mexico)",
    slug: "la-paz-mexico",
    seoTitle: "Boat Charters in La Paz, Mexico | Horizon Boat Charters",
    description: "Find a boat charter listed for La Paz, Mexico and compare options for your itinerary.",
    inventoryLocationIncludes: ["La Paz", "Mexico"],
  },
  {
    label: "Maldives (Indian Ocean)",
    slug: "maldives-indian-ocean",
    seoTitle: "Boat Charters in the Maldives | Horizon Boat Charters",
    description: "Organize a Maldives charter around your travel dates, party size, and preferred vessel.",
    inventoryLocations: ["Maldives"],
  },
  {
    label: "Cancun, Mexico",
    slug: "cancun-mexico",
    seoTitle: "Boat Charters in Cancun, Mexico | Horizon Boat Charters",
    description: "Browse boat charter options listed for Cancun and plan time on Mexico's Caribbean coast.",
    inventoryLocations: ["Cancun", "Cancún"],
  },
  {
    label: "Punta Cana, Dominican Republic",
    slug: "punta-cana-dominican-republic",
    seoTitle: "Boat Charters in Punta Cana, Dominican Republic | Horizon Boat Charters",
    description: "Compare charter vessels listed for Punta Cana and find an option for your group.",
    inventoryLocations: ["Punta Cana"],
  },
  {
    label: "Caribbean (Barbados, Jamaica)",
    slug: "caribbean-barbados-jamaica",
    seoTitle: "Boat Charters in Barbados and Jamaica | Horizon Boat Charters",
    description: "Search charter listings in Barbados and Jamaica, with results drawn from each vessel's recorded location.",
    inventoryLocations: ["Barbados", "Jamaica"],
  },
  {
    label: "Turks and Caicos Islands - Grace Bay",
    slug: "turks-and-caicos-grace-bay",
    seoTitle: "Boat Charters in Grace Bay, Turks and Caicos | Horizon Boat Charters",
    description: "Browse charters listed for Grace Bay and the Turks and Caicos Islands.",
    inventoryLocations: ["Grace Bay", "Turks and Caicos"],
  },
];

const categoryNames: Record<string, string[]> = {
  experiences: ["Luxury & Leisure", "Fishing", "Water Sports", "Sunset Cruises", "Private Events"],
};

const sectionDescriptions: Record<string, string> = {
  destinations: "Explore destinations and browse vessels listed for each location.",
  experiences: "Make your time on the water your own, from quiet leisure to private events.",
  about:
    "Discover Horizon Boat Charters and explore boat rentals, yacht charter options, and destinations across the Caribbean, Mexico, the Indian Ocean, and beyond.",
};

function toSlug(label: string) {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const NAVIGATION_SECTIONS: Record<string, NavigationSection> = Object.fromEntries([
  [
    "destinations",
    {
      label: "Destinations",
      title: "Boat Charter Destinations",
      description: sectionDescriptions.destinations,
      categories: destinations,
    },
  ],
  ...Object.entries(categoryNames).map(([slug, names]) => [
    slug,
    {
      label: slug.charAt(0).toUpperCase() + slug.slice(1),
      title: `${slug.charAt(0).toUpperCase()}${slug.slice(1)} for Charter`,
      description: sectionDescriptions[slug]!,
      categories: names.map((label) => ({ label, slug: toSlug(label) })),
    },
  ]),
  [
    "about",
    {
      label: "About Us",
      title: "About Horizon Boat Charters",
      description: sectionDescriptions.about,
      seoTitle: "About Horizon Boat Charters | Boats, Yachts & Destinations",
      categories: [],
    },
  ],
]) as Record<string, NavigationSection>;

export function getCategory(sectionSlug: string, categorySlug: string) {
  const section = NAVIGATION_SECTIONS[sectionSlug];
  return section?.categories.find((category) => category.slug === categorySlug);
}

export function categoryDescription(label: string, description?: string) {
  return (
    description ??
    `Explore options for ${label.toLowerCase()} and plan time on the water around your group and dates.`
  );
}

export function navigationMetadata(
  section: NavigationSection,
  category?: NavigationCategory,
  canonicalPath?: string,
) {
  const title =
    category?.seoTitle ??
    section.seoTitle ??
    (category ? `${category.label} | Boat Charter` : `${section.title} | Boat Charter`);
  const description = category
    ? categoryDescription(category.label, category.description)
    : section.description;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    ...(canonicalPath
      ? { links: [{ rel: "canonical", href: `https://horizonboatcharters.com${canonicalPath}` }] }
      : {}),
  };
}
