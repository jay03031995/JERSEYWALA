import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── DATA ───────────────────────────────────────────────────────────────────

const TEAMS_DATA = [
  // Club teams
  { name: 'Real Madrid', slug: 'real-madrid', short_name: 'RMA', primary_color: '#FFFFFF', secondary_color: '#001489', country: 'Spain', league: 'la-liga' },
  { name: 'FC Barcelona', slug: 'fc-barcelona', short_name: 'FCB', primary_color: '#004D98', secondary_color: '#A50044', country: 'Spain', league: 'la-liga' },
  { name: 'Manchester United', slug: 'manchester-united', short_name: 'MUN', primary_color: '#DA291C', secondary_color: '#FBE122', country: 'England', league: 'premier-league' },
  { name: 'Liverpool', slug: 'liverpool', short_name: 'LIV', primary_color: '#C8102E', secondary_color: '#00B2A9', country: 'England', league: 'premier-league' },
  { name: 'Arsenal', slug: 'arsenal', short_name: 'ARS', primary_color: '#EF0107', secondary_color: '#9C824A', country: 'England', league: 'premier-league' },
  { name: 'Chelsea', slug: 'chelsea', short_name: 'CHE', primary_color: '#034694', secondary_color: '#DBA111', country: 'England', league: 'premier-league' },
  { name: 'Bayern Munich', slug: 'bayern-munich', short_name: 'BAY', primary_color: '#DC052D', secondary_color: '#0066B2', country: 'Germany', league: 'bundesliga' },
  { name: 'PSG', slug: 'psg', short_name: 'PSG', primary_color: '#001F5A', secondary_color: '#EE1133', country: 'France', league: 'ligue-1' },
  { name: 'Al Nassr', slug: 'al-nassr', short_name: 'ANS', primary_color: '#F5C518', secondary_color: '#003D8F', country: 'Saudi Arabia', league: 'saudi-pro-league' },
  // National teams
  { name: 'Argentina', slug: 'argentina', short_name: 'ARG', primary_color: '#74ACDF', secondary_color: '#FFFFFF', country: 'Argentina', league: 'international-football' },
  { name: 'Germany', slug: 'germany', short_name: 'GER', primary_color: '#FFFFFF', secondary_color: '#000000', country: 'Germany', league: 'international-football' },
  { name: 'Portugal', slug: 'portugal', short_name: 'POR', primary_color: '#006600', secondary_color: '#FF0000', country: 'Portugal', league: 'international-football' },
  { name: 'Spain', slug: 'spain', short_name: 'ESP', primary_color: '#AA151B', secondary_color: '#F1BF00', country: 'Spain', league: 'international-football' },
  { name: 'France', slug: 'france', short_name: 'FRA', primary_color: '#002395', secondary_color: '#FFFFFF', country: 'France', league: 'international-football' },
  { name: 'Brazil', slug: 'brazil', short_name: 'BRA', primary_color: '#009C3B', secondary_color: '#FEDF00', country: 'Brazil', league: 'international-football' },
  { name: 'England', slug: 'england', short_name: 'ENG', primary_color: '#FFFFFF', secondary_color: '#CF081F', country: 'England', league: 'international-football' },
  { name: 'Japan', slug: 'japan', short_name: 'JPN', primary_color: '#000080', secondary_color: '#BC002D', country: 'Japan', league: 'international-football' },
]

const LEAGUES_DATA = [
  { name: 'Premier League', slug: 'premier-league', country: 'England' },
  { name: 'La Liga', slug: 'la-liga', country: 'Spain' },
  { name: 'Bundesliga', slug: 'bundesliga', country: 'Germany' },
  { name: 'Ligue 1', slug: 'ligue-1', country: 'France' },
  { name: 'Saudi Pro League', slug: 'saudi-pro-league', country: 'Saudi Arabia' },
  { name: 'International Football', slug: 'international-football', country: 'World' },
]

// Products: [slug, name, teamSlug, price, comparePrice, season, jerseyType, edition, isFeatured, isNewArrival, images]
const PRODUCTS_DATA: {
  slug: string
  name: string
  teamSlug: string
  price: number
  comparePrice: number
  season: string
  jerseyType: 'home' | 'away' | 'third' | 'training' | 'limited'
  edition: 'official' | 'fan_edition' | 'replica'
  isFeatured: boolean
  isNewArrival: boolean
  playerName?: string
  images: string[]
}[] = [
  // ── Real Madrid 25-26 ──
  {
    slug: 'real-madrid-home-mbappe-2025-26',
    name: 'Real Madrid Home Mbappe Jersey 2025-26',
    teamSlug: 'real-madrid', price: 1125, comparePrice: 4999,
    season: '2025-26', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true, playerName: 'MBAPPE',
    images: [
      'https://footballmonk.in/wp-content/uploads/2025/09/Real-Madrid-Home-Mbappe-2025-26-Jersey-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2025/09/Real-Madrid-Home-Mbappe-2025-26-Jersey-2.jpg',
    ],
  },
  {
    slug: 'real-madrid-third-vini-jr-2025-26',
    name: 'Real Madrid Third Vini Jr. Jersey 2025-26',
    teamSlug: 'real-madrid', price: 1125, comparePrice: 4999,
    season: '2025-26', jerseyType: 'third', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true, playerName: 'VINI JR',
    images: [
      'https://footballmonk.in/wp-content/uploads/2025/09/Real-Madrid-Third-Vini-Jr.-2025-26-Jersey-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2025/09/Real-Madrid-Third-Vini-Jr.-2025-26-Jersey-2.jpg',
    ],
  },
  {
    slug: 'real-madrid-home-2024-25',
    name: 'Real Madrid Home Jersey 2024-25',
    teamSlug: 'real-madrid', price: 899, comparePrice: 1999,
    season: '2024-25', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/07/Real-Madrid-Home-2024-25-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/07/Real-Madrid-Home-2024-25-2.jpg',
    ],
  },
  {
    slug: 'real-madrid-home-2023-24',
    name: 'Real Madrid Home Jersey 2023-24',
    teamSlug: 'real-madrid', price: 699, comparePrice: 1499,
    season: '2023-24', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2023/07/Real-Madrid-Home-2023-24-1.jpg',
    ],
  },
  {
    slug: 'real-madrid-home-2022-23',
    name: 'Real Madrid Home Jersey 2022-23',
    teamSlug: 'real-madrid', price: 649, comparePrice: 1299,
    season: '2022-23', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2022/07/Real-Madrid-Home-22-23-1.jpg',
    ],
  },
  {
    slug: 'real-madrid-retro-2017-18',
    name: 'Real Madrid Retro Jersey 2017-18',
    teamSlug: 'real-madrid', price: 799, comparePrice: 1499,
    season: '2017-18', jerseyType: 'home', edition: 'replica',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2023/09/Real-Madrid-Retro-17-18-Jersey-1.jpg',
    ],
  },

  // ── FC Barcelona 25-26 ──
  {
    slug: 'fc-barcelona-home-pedri-2025-26',
    name: 'FC Barcelona Home Pedri Jersey 2025-26',
    teamSlug: 'fc-barcelona', price: 1125, comparePrice: 4999,
    season: '2025-26', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true, playerName: 'PEDRI',
    images: [
      'https://footballmonk.in/wp-content/uploads/2025/09/FC-Barcelona-Home-Pedri-2025-26-Jersey-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2025/09/FC-Barcelona-Home-Pedri-2025-26-Jersey-2.jpg',
    ],
  },
  {
    slug: 'fc-barcelona-away-lamine-yamal-2025-26',
    name: 'FC Barcelona Away Lamine Yamal Jersey 2025-26',
    teamSlug: 'fc-barcelona', price: 1125, comparePrice: 4999,
    season: '2025-26', jerseyType: 'away', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true, playerName: 'LAMINE YAMAL',
    images: [
      'https://footballmonk.in/wp-content/uploads/2025/09/FC-Barcelona-Away-Lamine-Yamal-2025-26-Jersey-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2025/09/FC-Barcelona-Away-Lamine-Yamal-2025-26-Jersey-2.jpg',
    ],
  },
  {
    slug: 'fc-barcelona-away-2024-25',
    name: 'FC Barcelona Away Jersey 2024-25',
    teamSlug: 'fc-barcelona', price: 899, comparePrice: 1999,
    season: '2024-25', jerseyType: 'away', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/08/FC-Barcelona-Away-Kit-2024-25-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/08/FC-Barcelona-Away-Kit-2024-25-2.jpg',
    ],
  },
  {
    slug: 'fc-barcelona-home-2023-24',
    name: 'FC Barcelona Home Jersey 2023-24',
    teamSlug: 'fc-barcelona', price: 699, comparePrice: 1499,
    season: '2023-24', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2023/07/FC-Barcelona-Home-Kit-2023-24-1.jpg',
    ],
  },
  {
    slug: 'fc-barcelona-away-2022-23',
    name: 'FC Barcelona Away Jersey 2022-23',
    teamSlug: 'fc-barcelona', price: 649, comparePrice: 1299,
    season: '2022-23', jerseyType: 'away', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2022/09/Barcelona-Away-22-23-1.jpg',
    ],
  },

  // ── Manchester United ──
  {
    slug: 'manchester-united-home-2024-25',
    name: 'Manchester United Home Jersey 2024-25',
    teamSlug: 'manchester-united', price: 599, comparePrice: 1999,
    season: '2024-25', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/07/Manchester-United-Home-2024-25-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/07/Manchester-United-Home-2024-25-2.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/07/Manchester-United-Home-2024-25-3.jpg',
    ],
  },
  {
    slug: 'manchester-united-home-2023-24',
    name: 'Manchester United Home Jersey 2023-24',
    teamSlug: 'manchester-united', price: 599, comparePrice: 1499,
    season: '2023-24', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2023/07/Manchester-United-Home-2023-24-1.jpg',
    ],
  },
  {
    slug: 'manchester-united-retro-2008',
    name: 'Manchester United Retro Jersey 2008',
    teamSlug: 'manchester-united', price: 799, comparePrice: 1499,
    season: '2007-08', jerseyType: 'home', edition: 'replica',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2023/06/Manchester-United-2008-Retro-Jersey-1.jpg',
    ],
  },
  {
    slug: 'manchester-united-home-2022-23',
    name: 'Manchester United Home Jersey 2022-23',
    teamSlug: 'manchester-united', price: 599, comparePrice: 1299,
    season: '2022-23', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2022/07/Manchester-United-Home-22-23-1.jpg',
    ],
  },

  // ── Liverpool ──
  {
    slug: 'liverpool-home-2024-25',
    name: 'Liverpool Home Jersey 2024-25',
    teamSlug: 'liverpool', price: 699, comparePrice: 1999,
    season: '2024-25', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/07/Liverpool-Home-2024-25-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/07/Liverpool-Home-2024-25-2.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/07/Liverpool-Home-2024-25-3.jpg',
    ],
  },
  {
    slug: 'liverpool-away-2024-25',
    name: 'Liverpool Away Jersey 2024-25',
    teamSlug: 'liverpool', price: 649, comparePrice: 1999,
    season: '2024-25', jerseyType: 'away', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/08/Liverpool-Away-Kit-24-25-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/08/Liverpool-Away-Kit-24-25-2.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/08/Liverpool-Away-Kit-24-25-3.jpg',
    ],
  },
  {
    slug: 'liverpool-home-2023-24',
    name: 'Liverpool Home Jersey 2023-24',
    teamSlug: 'liverpool', price: 649, comparePrice: 1499,
    season: '2023-24', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2023/06/Liverpool-Home-Jersey-23-24-1.jpg',
    ],
  },

  // ── Arsenal ──
  {
    slug: 'arsenal-home-2023-24',
    name: 'Arsenal Home Jersey 2023-24',
    teamSlug: 'arsenal', price: 699, comparePrice: 1499,
    season: '2023-24', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2023/06/Arsenal-Home-23-24-1.jpg',
    ],
  },
  {
    slug: 'arsenal-away-2022-23',
    name: 'Arsenal Away Jersey 2022-23',
    teamSlug: 'arsenal', price: 649, comparePrice: 1299,
    season: '2022-23', jerseyType: 'away', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2022/08/Arsenal-Away-22-23-1.jpg',
    ],
  },
  {
    slug: 'arsenal-retro-1990-92',
    name: 'Arsenal Retro Jersey 1990-92',
    teamSlug: 'arsenal', price: 799, comparePrice: 1499,
    season: '1990-92', jerseyType: 'home', edition: 'replica',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2023/09/Arsenal-Home-1990-92-Retro-Jersey-1.jpg',
    ],
  },

  // ── PSG ──
  {
    slug: 'psg-jordan-edition-2024-25',
    name: 'PSG Jordan Edition Jersey 2024-25',
    teamSlug: 'psg', price: 649, comparePrice: 2999,
    season: '2024-25', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2025/10/PSG-Jordan-Edition-Jersey-2024-25-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2025/10/PSG-Jordan-Edition-Jersey-2024-25-2.jpg',
    ],
  },

  // ── Bayern Munich ──
  {
    slug: 'bayern-munich-home-2022-23',
    name: 'Bayern Munich Home Jersey 2022-23',
    teamSlug: 'bayern-munich', price: 649, comparePrice: 1299,
    season: '2022-23', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2022/07/Bayern-Munich-Home-22-23-1.jpg',
    ],
  },
  {
    slug: 'bayern-munich-retro-1998-99',
    name: 'Bayern Munich Retro Jersey 1998-99',
    teamSlug: 'bayern-munich', price: 799, comparePrice: 1499,
    season: '1998-99', jerseyType: 'home', edition: 'replica',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2023/09/Bayern-Munich-1998-99-Retro-Jersey-1.jpg',
    ],
  },

  // ── Chelsea ──
  {
    slug: 'chelsea-home-2022-23',
    name: 'Chelsea Home Jersey 2022-23',
    teamSlug: 'chelsea', price: 649, comparePrice: 1299,
    season: '2022-23', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2022/07/Chelsea-Home-22-23-1.jpg',
    ],
  },

  // ── Al Nassr ──
  {
    slug: 'al-nassr-ronaldo-home-2022-23',
    name: 'Al Nassr Home Ronaldo Jersey 2022-23',
    teamSlug: 'al-nassr', price: 699, comparePrice: 1499,
    season: '2022-23', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: false, playerName: 'RONALDO',
    images: [
      'https://footballmonk.in/wp-content/uploads/2023/01/Al-Nassr-Home-Ronaldo-Kit-22-23-1.jpg',
    ],
  },

  // ── Argentina ──
  {
    slug: 'argentina-world-cup-messi-home-2026',
    name: 'Argentina World Cup Messi Home Kit 2026',
    teamSlug: 'argentina', price: 1125, comparePrice: 5999,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true, playerName: 'MESSI',
    images: [
      'https://footballmonk.in/wp-content/uploads/2025/11/Argentina-World-Cup-Messi-Home-Kit-2026-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2025/11/Argentina-World-Cup-Messi-Home-Kit-2026-2.jpg',
      'https://footballmonk.in/wp-content/uploads/2025/11/Argentina-World-Cup-Messi-Home-Kit-2026-3.jpg',
    ],
  },
  {
    slug: 'argentina-copa-america-home-2024',
    name: 'Argentina Copa America Home Jersey 2024',
    teamSlug: 'argentina', price: 899, comparePrice: 2499,
    season: '2024', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/03/Argentina-Copa-America-24-Jersey-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/03/Argentina-Copa-America-24-Jersey-2.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/03/Argentina-Copa-America-24-Jersey-3.jpg',
    ],
  },

  // ── Germany ──
  {
    slug: 'germany-world-cup-home-2026',
    name: 'Germany World Cup Home Kit 2026',
    teamSlug: 'germany', price: 949, comparePrice: 4999,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [
      'https://footballmonk.in/wp-content/uploads/2025/11/Germany-World-Cup-Home-Kit-2026-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2025/11/Germany-World-Cup-Home-Kit-2026-2.jpg',
      'https://footballmonk.in/wp-content/uploads/2025/11/Germany-World-Cup-Home-Kit-2026-3.jpg',
    ],
  },

  // ── Portugal ──
  {
    slug: 'portugal-world-cup-home-2026',
    name: 'Portugal World Cup Home Kit 2026',
    teamSlug: 'portugal', price: 949, comparePrice: 4999,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [
      'https://footballmonk.in/wp-content/uploads/2026/01/Portugal-Home-WC-26-Jersey-1-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2026/01/Portugal-Home-WC-26-Jersey-2-1.jpg',
    ],
  },
  {
    slug: 'portugal-euro-2024-home',
    name: 'Portugal Euro 2024 Home Jersey',
    teamSlug: 'portugal', price: 799, comparePrice: 1999,
    season: '2024', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/05/Portugal-Euro-2024-Home-Jersey-1.jpg',
    ],
  },
  {
    slug: 'portugal-euro-2024-away',
    name: 'Portugal Euro 2024 Away Jersey',
    teamSlug: 'portugal', price: 799, comparePrice: 1999,
    season: '2024', jerseyType: 'away', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/05/Portugal-Euro-2024-Away-Jersey-1.jpg',
    ],
  },

  // ── Spain ──
  {
    slug: 'spain-world-cup-home-2026',
    name: 'Spain World Cup Home Kit 2026',
    teamSlug: 'spain', price: 949, comparePrice: 4999,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [
      'https://footballmonk.in/wp-content/uploads/2026/01/Spain-Home-WC-26-Jersey-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2026/01/Spain-Home-WC-26-Jersey-2.jpg',
      'https://footballmonk.in/wp-content/uploads/2026/01/Spain-Home-WC-26-Jersey-3.jpg',
    ],
  },

  // ── France ──
  {
    slug: 'france-euro-2024-home',
    name: 'France Euro 2024 Home Jersey',
    teamSlug: 'france', price: 799, comparePrice: 1999,
    season: '2024', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/05/France-Euro-2024-Home-Jersey-1.jpg',
    ],
  },
  {
    slug: 'france-euro-2024-away',
    name: 'France Euro 2024 Away Jersey',
    teamSlug: 'france', price: 799, comparePrice: 1999,
    season: '2024', jerseyType: 'away', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/05/France-Euro-2024-Away-Jersey-1.jpg',
    ],
  },

  // ── Brazil ──
  {
    slug: 'brazil-copa-america-home-2024',
    name: 'Brazil Copa America Home Jersey 2024',
    teamSlug: 'brazil', price: 899, comparePrice: 2499,
    season: '2024', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/03/Brazil-Copa-America-24-Home-Jeresy-1.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/03/Brazil-Copa-America-24-Home-Jeresy-3.jpg',
      'https://footballmonk.in/wp-content/uploads/2024/03/Brazil-Copa-America-24-Home-Jeresy-2.jpg',
    ],
  },

  // ── England ──
  {
    slug: 'england-euro-2024-home',
    name: 'England Euro 2024 Home Jersey',
    teamSlug: 'england', price: 799, comparePrice: 1999,
    season: '2024', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/05/England-Euro-2024-Home-Jersey-1.jpg',
    ],
  },
  {
    slug: 'england-euro-2024-away',
    name: 'England Euro 2024 Away Jersey',
    teamSlug: 'england', price: 799, comparePrice: 1999,
    season: '2024', jerseyType: 'away', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/05/England-Euro-2024-Away-Jersey-1.jpg',
    ],
  },

  // ── Japan Special Edition ──
  {
    slug: 'japan-uchiha-itachi-special-edition',
    name: 'Japan x Uchiha Itachi Special Edition Jersey',
    teamSlug: 'japan', price: 999, comparePrice: 2499,
    season: '2024', jerseyType: 'limited', edition: 'official',
    isFeatured: true, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/07/Japan-X-Uchiha-Itachi-Special-Edition-Jersey-1.jpg',
    ],
  },
  {
    slug: 'japan-goku-special-edition',
    name: 'Japan x Goku Special Edition Jersey',
    teamSlug: 'japan', price: 999, comparePrice: 2499,
    season: '2024', jerseyType: 'limited', edition: 'official',
    isFeatured: true, isNewArrival: false,
    images: [
      'https://footballmonk.in/wp-content/uploads/2024/07/Japan-Black-and-Red-Goku-Special-Edition-Jersey-1.jpg',
    ],
  },
]

// ─── HANDLER ────────────────────────────────────────────────────────────────

export async function POST() {
  const admin = createAdminClient()
  const results: string[] = []

  try {
    // 1. Ensure football sport exists
    let { data: sport } = await admin.from('sports').select('id').eq('slug', 'football').single()
    if (!sport) {
      const { data: newSport } = await admin.from('sports').insert({
        name: 'Football', slug: 'football', type: 'football', display_order: 1, is_active: true,
      }).select('id').single()
      sport = newSport
      results.push('Created sport: Football')
    }
    if (!sport) return NextResponse.json({ error: 'Failed to create sport' }, { status: 500 })

    // 2. Upsert leagues
    const leagueIdMap: Record<string, string> = {}
    for (const lg of LEAGUES_DATA) {
      let { data: existing } = await admin.from('leagues').select('id').eq('slug', lg.slug).single()
      if (!existing) {
        const { data: newLg } = await admin.from('leagues').insert({
          sport_id: sport.id, name: lg.name, slug: lg.slug,
          country: lg.country, display_order: 1, is_active: true,
        }).select('id').single()
        existing = newLg
        results.push(`Created league: ${lg.name}`)
      }
      if (existing) leagueIdMap[lg.slug] = existing.id
    }

    // 3. Upsert teams
    const teamIdMap: Record<string, string> = {}
    for (const tm of TEAMS_DATA) {
      const leagueId = leagueIdMap[tm.league]
      if (!leagueId) continue
      let { data: existing } = await admin.from('teams').select('id').eq('slug', tm.slug).single()
      if (!existing) {
        const { data: newTm } = await admin.from('teams').insert({
          league_id: leagueId, name: tm.name, slug: tm.slug,
          short_name: tm.short_name, primary_color: tm.primary_color,
          secondary_color: tm.secondary_color, country: tm.country, is_active: true,
        }).select('id').single()
        existing = newTm
        results.push(`Created team: ${tm.name}`)
      }
      if (existing) teamIdMap[tm.slug] = existing.id
    }

    // 4. Insert products
    let productCount = 0
    for (const p of PRODUCTS_DATA) {
      const teamId = teamIdMap[p.teamSlug]
      if (!teamId) continue

      // Skip if product already exists
      const { data: exists } = await admin.from('products').select('id').eq('slug', p.slug).single()
      if (exists) continue

      const { data: product } = await admin.from('products').insert({
        team_id: teamId,
        name: p.name,
        slug: p.slug,
        base_price: p.price,
        compare_price: p.comparePrice,
        season: p.season,
        jersey_type: p.jerseyType,
        edition: p.edition,
        player_name: p.playerName ?? null,
        is_active: true,
        is_featured: p.isFeatured,
        is_new_arrival: p.isNewArrival,
      }).select('id').single()

      if (!product) continue
      productCount++

      // Images
      for (let i = 0; i < p.images.length; i++) {
        await admin.from('product_images').insert({
          product_id: product.id,
          url: p.images[i],
          alt_text: p.name,
          position: i,
          is_primary: i === 0,
        })
      }

      // Variants (S, M, L, XL, XXL)
      const sizes = ['S', 'M', 'L', 'XL', 'XXL']
      for (const size of sizes) {
        await admin.from('product_variants').insert({
          product_id: product.id,
          size,
          stock_quantity: Math.floor(Math.random() * 30) + 10,
          sku: `${p.slug}-${size.toLowerCase()}`,
          additional_price: 0,
        })
      }
    }

    results.push(`Inserted ${productCount} new football products`)
    return NextResponse.json({ success: true, results })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
