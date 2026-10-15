/** Shared city data (slider + SEO ItemList) — single source, no duplication. */
export interface CityItem {
  id: string
  nameKey: string
  defaultName: string
  count: string
  image: string
  imageSm: string
}

export const CITIES: readonly CityItem[] = [
  {
    id: 'delhi',
    nameKey: 'cities.list.0.name',
    defaultName: 'Delhi',
    count: '8,500+',
    image: '/images/home/cities/delhi.webp',
    imageSm: '/images/home/cities/delhi-640.webp',
  },
  {
    id: 'mumbai',
    nameKey: 'cities.list.1.name',
    defaultName: 'Mumbai',
    count: '6,200+',
    image: '/images/home/cities/mumbai.webp',
    imageSm: '/images/home/cities/mumbai-640.webp',
  },
  {
    id: 'kolkata',
    nameKey: 'cities.list.2.name',
    defaultName: 'Kolkata',
    count: '4,800+',
    image: '/images/home/cities/kolkata.webp',
    imageSm: '/images/home/cities/kolkata-640.webp',
  },
  {
    id: 'bengaluru',
    nameKey: 'cities.list.3.name',
    defaultName: 'Bengaluru',
    count: '3,500+',
    image: '/images/home/cities/bengaluru.webp',
    imageSm: '/images/home/cities/bengaluru-640.webp',
  },
  {
    id: 'hyderabad',
    nameKey: 'cities.list.4.name',
    defaultName: 'Hyderabad',
    count: '3,500+',
    image: '/images/home/cities/hyderabad.webp',
    imageSm: '/images/home/cities/hyderabad-640.webp',
  },
  {
    id: 'pune',
    nameKey: 'cities.list.5.name',
    defaultName: 'Pune',
    count: '2,900+',
    image: '/images/home/cities/pune.webp',
    imageSm: '/images/home/cities/pune-640.webp',
  },
  {
    id: 'ahmedabad',
    nameKey: 'cities.list.6.name',
    defaultName: 'Ahmedabad',
    count: '2,200+',
    image: '/images/home/cities/ahmedabad.webp',
    imageSm: '/images/home/cities/ahmedabad-640.webp',
  },
  {
    id: 'others',
    nameKey: 'cities.list.7.name',
    defaultName: 'Others',
    count: '10,000+',
    image: '/images/home/cities/others.webp',
    imageSm: '/images/home/cities/others-640.webp',
  },
]
