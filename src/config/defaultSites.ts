export interface FavoriteSite {
  id: number
  name: string
  url: string
  favicon: string
}

export const defaultFavoriteSites: FavoriteSite[] = [
  {
    id: 1,
    name: 'GitHub',
    url: 'https://github.com',
    favicon: 'mdi:github',
  },
  {
    id: 2,
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org',
    favicon: 'simple-icons:typescript',
  },
]
