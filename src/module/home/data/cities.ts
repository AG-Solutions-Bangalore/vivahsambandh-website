/** Shared city data (slider + SEO ItemList) — single source, no duplication. */
export interface CityItem {
  id: string
  nameKey: string
  defaultName: string
  count: string
  image: string
}

export const CITIES: readonly CityItem[] = [
  {
    id: 'delhi',
    nameKey: 'cities.list.0.name',
    defaultName: 'Delhi',
    count: '8,500+',
    image: '/images/home/cities/delhi.webp',
  },
  {
    id: 'mumbai',
    nameKey: 'cities.list.1.name',
    defaultName: 'Mumbai',
    count: '6,200+',
    image: '/images/home/cities/mumbai.webp',
  },
  {
    id: 'kolkata',
    nameKey: 'cities.list.2.name',
    defaultName: 'Kolkata',
    count: '4,800+',
    image: '/images/home/cities/kolkata.webp',
  },
  {
    id: 'bengaluru',
    nameKey: 'cities.list.3.name',
    defaultName: 'Bengaluru',
    count: '3,500+',
    image: '/images/home/cities/bengaluru.webp',
  },
  {
    id: 'hyderabad',
    nameKey: 'cities.list.4.name',
    defaultName: 'Hyderabad',
    count: '3,500+',
    image: '/images/home/cities/hyderabad.webp',
  },
  {
    id: 'pune',
    nameKey: 'cities.list.5.name',
    defaultName: 'Pune',
    count: '2,900+',
    image: '/images/home/cities/pune.webp',
  },
  {
    id: 'ahmedabad',
    nameKey: 'cities.list.6.name',
    defaultName: 'Ahmedabad',
    count: '2,200+',
    image: '/images/home/cities/ahmedabad.webp',
  },
  {
    id: 'others',
    nameKey: 'cities.list.7.name',
    defaultName: 'Others',
    count: '10,000+',
    image: '/images/home/cities/others.webp',
  },
]
