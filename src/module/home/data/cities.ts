import { img } from "../../../lib/image";

/** Shared city data (slider + SEO ItemList) — single source, no duplication. */
export interface CityItem {
  id: string;
  nameKey: string;
  defaultName: string;
  image: string;
  imageSm: string;
}

export const CITIES: readonly CityItem[] = [
  {
    id: "delhi",
    nameKey: "cities.list.0.name",
    defaultName: "Delhi",
    image: img("/images/home/cities/delhi.webp"),
    imageSm: img("/images/home/cities/delhi-640.webp"),
  },
  {
    id: "mumbai",
    nameKey: "cities.list.1.name",
    defaultName: "Mumbai",

    image: img("/images/home/cities/mumbai.webp"),
    imageSm: img("/images/home/cities/mumbai-640.webp"),
  },
  {
    id: "kolkata",
    nameKey: "cities.list.2.name",
    defaultName: "Kolkata",

    image: img("/images/home/cities/kolkata.webp"),
    imageSm: img("/images/home/cities/kolkata-640.webp"),
  },
  {
    id: "bengaluru",
    nameKey: "cities.list.3.name",
    defaultName: "Bengaluru",

    image: img("/images/home/cities/bengaluru.webp"),
    imageSm: img("/images/home/cities/bengaluru-640.webp"),
  },
  {
    id: "hyderabad",
    nameKey: "cities.list.4.name",
    defaultName: "Hyderabad",

    image: img("/images/home/cities/hyderabad.webp"),
    imageSm: img("/images/home/cities/hyderabad-640.webp"),
  },
  {
    id: "pune",
    nameKey: "cities.list.5.name",
    defaultName: "Pune",

    image: img("/images/home/cities/pune.webp"),
    imageSm: img("/images/home/cities/pune-640.webp"),
  },
  {
    id: "ahmedabad",
    nameKey: "cities.list.6.name",
    defaultName: "Ahmedabad",
    image: img("/images/home/cities/ahmedabad.webp"),
    imageSm: img("/images/home/cities/ahmedabad-640.webp"),
  },
  {
    id: "others",
    nameKey: "cities.list.7.name",
    defaultName: "Others",

    image: img("/images/home/cities/others.webp"),
    imageSm: img("/images/home/cities/others-640.webp"),
  },
];
