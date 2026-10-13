import arubaPhoto from "@/assets/destinations/aruba.webp";
import bahamasPhoto from "@/assets/destinations/exumas-bahamas.webp";
import barbadosPhoto from "@/assets/destinations/barbados.webp";
import caboPhoto from "@/assets/destinations/cabo-san-lucas.webp";
import cancunPhoto from "@/assets/destinations/cancun-mexico.webp";
import cozumelPhoto from "@/assets/destinations/cozumel-mexico.webp";
import curacaoPhoto from "@/assets/destinations/curacao.webp";
import grandCaymanPhoto from "@/assets/destinations/grand-cayman.webp";
import graceBayPhoto from "@/assets/destinations/grace-bay-turks-caicos.webp";
import jamaicaPhoto from "@/assets/destinations/jamaica.webp";
import laPazPhoto from "@/assets/destinations/la-paz-mexico.webp";
import mahePhoto from "@/assets/destinations/mahe-seychelles.webp";
import maldivesPhoto from "@/assets/destinations/maldives.webp";
import phuketPhoto from "@/assets/destinations/phuket-thailand.jpg";
import puntaCanaPhoto from "@/assets/destinations/punta-cana.webp";
import stMartinPhoto from "@/assets/destinations/st-martin.webp";

type DestinationImage = { src: string; alt: string };

export type DestinationStory = {
  intro: string;
  images: DestinationImage[];
  sections: { heading: string; paragraphs: string[]; highlights?: string[] }[];
  related: string[];
};

/** Editorial copy adapted from the supplied destination content document. */
export const DESTINATION_STORIES: Record<string, DestinationStory> = {
  "phuket-thailand": {
    images: [{ src: phuketPhoto, alt: "Sandy beach and waves at Mai Khao Beach in Phuket" }],
    intro:
      "Phuket is a gateway to the Andaman Sea, where a private boat trip can take you beyond the mainland beaches to limestone scenery, islands, and reefs.",
    sections: [
      {
        heading: "Explore the Andaman coast",
        paragraphs: [
          "Take in the limestone cliffs of Phang Nga Bay or the coral reefs around the Phi Phi Islands. A boat gives you room to shape the day around the coast and the places your group most wants to see.",
          "Consider a day trip, a sunset cruise, or a longer yacht charter. The right option depends on your dates, group, and the vessels available for your itinerary.",
        ],
        highlights: ["Phang Nga Bay", "Phi Phi Islands", "Coastal and sunset cruises"],
      },
    ],
    related: ["mahe-seychelles", "maldives-indian-ocean", "bahamas-exumas"],
  },
  "mahe-seychelles": {
    images: [{ src: mahePhoto, alt: "Coastal scenery beside the water on Mahé in the Seychelles" }],
    intro:
      "Mahé is the gateway to the Seychelles, with granite peaks, bright beaches, and an island network to explore from the water.",
    sections: [
      {
        heading: "Plan an island-hopping day",
        paragraphs: [
          "Praslin, La Digue, and St. Anne Marine Park are possible points of interest. Choose a route around your available time and confirm with the charter provider which stops are practical.",
          "A short island visit, snorkeling stop, or relaxed cruise can each shape the day. Check what is included with a particular vessel before booking.",
        ],
        highlights: ["Praslin", "La Digue", "St. Anne Marine Park"],
      },
    ],
    related: ["maldives-indian-ocean", "phuket-thailand", "curacao"],
  },
  "bahamas-exumas": {
    images: [{ src: bahamasPhoto, alt: "Aerial view of islands and blue water in the Exumas" }],
    intro:
      "The Exumas are a chain of cays and islands known for clear blue water, sandbars, and secluded coastal scenery best reached by boat.",
    sections: [
      {
        heading: "Build a route through the cays",
        paragraphs: [
          "The swimming pigs and Elizabeth Harbour near Great Exuma are popular ideas for an outing. Routes and stops depend on the boat, departure point, sea conditions, and your charter provider.",
          "When planning from George Town, ask about conditions in Elizabeth Harbour and whether your preferred stops fit the charter duration.",
        ],
        highlights: ["Swimming pigs", "Elizabeth Harbour", "George Town"],
      },
    ],
    related: ["turks-and-caicos-grace-bay", "aruba", "phuket-thailand"],
  },
  curacao: {
    images: [{ src: curacaoPhoto, alt: "Sandy beach and blue water at Cas Abao in Curaçao" }],
    intro:
      "Curaçao pairs colorful island culture with sheltered bays, clear Caribbean water, and coastlines to explore by boat.",
    sections: [
      {
        heading: "Choose your Curaçao experience",
        paragraphs: [
          "Explore Spanish Water, Klein Curaçao, or one of the island's bays. Depending on your route, time on the water can include swimming, snorkeling, or a quiet coastal cruise.",
          "Compare the available boats and trip details before booking. Confirm the departure point, duration, and whether your preferred destination is included.",
        ],
        highlights: ["Spanish Water", "Klein Curaçao", "Swimming and snorkeling"],
      },
    ],
    related: ["aruba", "st-martin", "caribbean-barbados-jamaica"],
  },
  "cozumel-mexico": {
    images: [{ src: cozumelPhoto, alt: "Palm-lined beach and turquoise water in Cozumel, Mexico" }],
    intro:
      "Cozumel offers clear Caribbean water, coral reefs, and coastal scenery for a day of boating, snorkeling, or simply enjoying the island from the sea.",
    sections: [
      {
        heading: "Spend a day on the water",
        paragraphs: [
          "A boat trip can make it easier to reach snorkeling areas and quieter stretches of coast. Plan around the experience you want, whether that means time in the water or a more relaxed cruise.",
          "Yachts, motorboats, and catamarans may suit different kinds of trips. Check the live listings for current vessel types, capacity, and trip details; availability and inclusions vary by listing.",
        ],
        highlights: ["Snorkeling", "Coral reefs", "Coastal cruising"],
      },
    ],
    related: ["cancun-mexico", "grand-cayman", "cabo-san-lucas-mexico"],
  },
  "grand-cayman": {
    images: [{ src: grandCaymanPhoto, alt: "Manta ray swimming in the water near Grand Cayman" }],
    intro:
      "Grand Cayman's clear waters and well-known coastal sights make a boat trip a memorable way to explore beyond the beach.",
    sections: [
      {
        heading: "Explore Cayman's coastal highlights",
        paragraphs: [
          "Visit Stingray City, Starfish Point, or the waters near Seven Mile Beach. Ask your provider which stops are included and how conditions affect the route on your chosen date.",
          "Choose between swimming, snorkeling, or a leisurely cruise. Compare the current listings for suitable vessels and confirm their capacity and inclusions.",
        ],
        highlights: ["Stingray City", "Starfish Point", "Seven Mile Beach"],
      },
    ],
    related: ["cozumel-mexico", "cancun-mexico", "bahamas-exumas"],
  },
  aruba: {
    images: [{ src: arubaPhoto, alt: "White and yellow boat on a beach in Aruba" }],
    intro:
      "Aruba's turquoise coastline, coves, and snorkeling spots offer plenty to see on a private boat outing or sunset cruise.",
    sections: [
      {
        heading: "See the coast from the water",
        paragraphs: [
          "Boca Catalina, the Antilla Shipwreck, and Malmok Beach are route ideas to discuss with your charter provider; access and conditions vary by trip.",
          "If a particular vessel or activity matters to your group, check the live listing and confirm details before booking. Advance planning can help you compare options for your dates.",
        ],
        highlights: ["Boca Catalina", "Antilla Shipwreck", "Malmok Beach"],
      },
    ],
    related: ["curacao", "bahamas-exumas", "turks-and-caicos-grace-bay"],
  },
  "st-martin": {
    images: [
      { src: stMartinPhoto, alt: "Boats along the shoreline at Anse Marcel Beach in St. Martin" },
    ],
    intro:
      "St. Martin is a starting point for time on the Caribbean, from a relaxed coastal cruise to an island-hopping day.",
    sections: [
      {
        heading: "Shape your day around the island",
        paragraphs: [
          "Explore beaches and secluded bays, swim, snorkel, or visit nearby islands. Your route will depend on the vessel, trip length, and provider.",
          "Compare the available charter details to see whether a captain, self-operated option, or sunset trip suits your group. Confirm any stops and inclusions directly before booking.",
        ],
        highlights: ["Island hopping", "Secluded bays", "Sunset cruises"],
      },
    ],
    related: ["curacao", "barbados-jamaica", "aruba"],
  },
  "cabo-san-lucas-mexico": {
    images: [{ src: caboPhoto, alt: "El Arco rock formation at sunset in Cabo San Lucas, Mexico" }],
    intro:
      "Cabo San Lucas sits where the Pacific meets the Sea of Cortez, with dramatic Baja scenery and a coastline made for boat trips.",
    sections: [
      {
        heading: "Cruise Cabo's landmark coastline",
        paragraphs: [
          "See El Arco at Land's End, Lover's Beach, and Cabo San Lucas Bay. Depending on the trip, time on the water can also include snorkeling or a sunset cruise.",
          "Yachts, fishing boats, catamarans, and party boats suit different outings. Check current listings for vessel details, duration, capacity, and what is included; these vary by provider.",
        ],
        highlights: ["El Arco at Land's End", "Lover's Beach", "Cabo San Lucas Bay"],
      },
    ],
    related: ["la-paz-mexico", "cozumel-mexico", "cancun-mexico"],
  },
  "la-paz-mexico": {
    images: [{ src: laPazPhoto, alt: "Sandy shoreline and ocean waves in La Paz, Mexico" }],
    intro:
      "La Paz opens onto the Sea of Cortez, with turquoise bays, sandy beaches, and marine life to discover by boat.",
    sections: [
      {
        heading: "Discover the Sea of Cortez",
        paragraphs: [
          "Balandra Beach and Espíritu Santo Island are highlights for swimming, snorkeling, kayaking, and wildlife watching. Confirm access, stops, and activities with your provider when planning a trip.",
          "Before booking, consider your group size, trip duration, and whether you want a captain. Check each listing for fuel, equipment, safety gear, and refreshments rather than assuming they are included.",
        ],
        highlights: ["Balandra Beach", "Espíritu Santo Island", "Wildlife watching"],
      },
    ],
    related: ["cabo-san-lucas-mexico", "phuket-thailand", "maldives-indian-ocean"],
  },
  "maldives-indian-ocean": {
    images: [{ src: maldivesPhoto, alt: "Aerial view of a tropical island in the Maldives" }],
    intro:
      "The Maldives is an Indian Ocean archipelago of islands, lagoons, beaches, and coral reefs, with many ways to explore by boat.",
    sections: [
      {
        heading: "Pick a trip that fits your plans",
        paragraphs: [
          "Plan around island hopping, snorkeling, dolphin watching, fishing, or a sunset cruise. Yachts, speedboats, and traditional dhonis offer different experiences; check which options are currently listed for your dates.",
          "Compare the route, group size, and trip duration, then confirm whether crew, fuel, and equipment are part of the specific charter you choose.",
        ],
        highlights: ["Island hopping", "Snorkeling and marine life", "Sunset cruises"],
      },
    ],
    related: ["mahe-seychelles", "phuket-thailand", "la-paz-mexico"],
  },
  "cancun-mexico": {
    images: [{ src: cancunPhoto, alt: "Beach and ocean at sunset in Cancún, Mexico" }],
    intro:
      "Cancún's Caribbean coast is a natural base for a day on the water, with clear seas, coastal views, and nearby Isla Mujeres.",
    sections: [
      {
        heading: "Plan a Caribbean outing",
        paragraphs: [
          "Snorkeling, swimming, sightseeing, island hopping, and sunset cruises are all ways to enjoy the coast. Choose a trip around the time you have and check whether Isla Mujeres is on the proposed route.",
          "Yachts, motorboats, and catamarans suit different plans. Review each live listing for capacity, duration, services, and safety details.",
        ],
        highlights: ["Isla Mujeres", "Snorkeling and swimming", "Coastal cruises"],
      },
    ],
    related: ["cozumel-mexico", "grand-cayman", "punta-cana-dominican-republic"],
  },
  "punta-cana-dominican-republic": {
    images: [{ src: puntaCanaPhoto, alt: "Palm-lined beach and turquoise ocean in Punta Cana" }],
    intro:
      "Punta Cana's tropical coastline is a setting for boat outings that range from an easy cruise to a day of swimming and snorkeling.",
    sections: [
      {
        heading: "Compare trips and inclusions",
        paragraphs: [
          "Saona Island and nearby natural swimming pools may be possible stops. Confirm destination access and route details with the provider before booking.",
          "Compare trip length, passenger capacity, and included services. Ask whether fuel, captain fees, drinks, and activities are covered, and check the provider's weather and cancellation policies.",
        ],
        highlights: ["Saona Island", "Natural swimming pools", "Swimming and snorkeling"],
      },
    ],
    related: ["cancun-mexico", "barbados-jamaica", "turks-and-caicos-grace-bay"],
  },
  "caribbean-barbados-jamaica": {
    images: [
      { src: barbadosPhoto, alt: "White-sand beach and Caribbean water in Barbados" },
      { src: jamaicaPhoto, alt: "Aerial view of the beach and clear water at Ocho Rios, Jamaica" },
    ],
    intro:
      "Barbados and Jamaica each offer a distinct Caribbean coastline to explore, whether you want a quiet cruise, a swim, or a private outing.",
    sections: [
      {
        heading: "Two islands, different coastlines",
        paragraphs: [
          "In Barbados, go snorkeling, explore coves and beaches, or enjoy sunset views. In Jamaica, consider coastal cruising, swimming, or a private boat trip with family and friends.",
          "Use the destination filter to check which boats are actually listed in each location. Vessel types and trip details vary, so confirm the departure point and inclusions for the specific charter.",
        ],
        highlights: [
          "Barbados beaches and coves",
          "Jamaica's coastline",
          "Snorkeling and sunset trips",
        ],
      },
    ],
    related: ["st-martin", "curacao", "punta-cana-dominican-republic"],
  },
  "turks-and-caicos-grace-bay": {
    images: [
      { src: graceBayPhoto, alt: "Aerial view of the beach at Grace Bay, Turks and Caicos" },
    ],
    intro:
      "Grace Bay, on Providenciales in the Turks and Caicos Islands, is known for clear turquoise water and a coastline to explore by boat.",
    sections: [
      {
        heading: "Explore the cays and coast",
        paragraphs: [
          "Island hop, snorkel, swim, or discover quieter beaches. Ask the charter provider which nearby cays and stops fit your route and schedule.",
          "Private charters and yacht trips suit different plans. Review current listings to compare vessels, capacity, and trip details for your date.",
        ],
        highlights: ["Nearby cays", "Snorkeling and swimming", "Coastal scenery"],
      },
    ],
    related: ["bahamas-exumas", "aruba", "punta-cana-dominican-republic"],
  },
};
