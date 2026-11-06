export type Video = {
  id: string;
  title: string;
  creator: string;
  price: string;
  priceMinor: number;
  image: string;
};

export const FEATURED: Video[] = [
  { id: 'f1', title: 'Late night talk', creator: '@amara', price: 'KSh 200', priceMinor: 20000, image: 'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=1200' },
  { id: 'f2', title: 'Coffee & questions', creator: '@juma', price: 'KSh 150', priceMinor: 15000, image: 'https://images.pexels.com/photos/29382377/pexels-photo-29382377.jpeg?w=1200' },
  { id: 'f3', title: 'Sunday thoughts', creator: '@nia', price: 'KSh 300', priceMinor: 30000, image: 'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=1200' },
];

export const FEMALE: Video[] = [
  { id: 'f_f1', title: 'Glow', creator: '@zawadi', price: 'KSh 220', priceMinor: 22000, image: 'https://images.pexels.com/photos/10563851/pexels-photo-10563851.jpeg?w=900' },
  { id: 'f_f2', title: 'Bloom', creator: '@nia', price: 'KSh 180', priceMinor: 18000, image: 'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=900' },
];

export const MALE: Video[] = [
  { id: 'm_m1', title: 'Night drive', creator: '@kev', price: 'KSh 100', priceMinor: 10000, image: 'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=900' },
  { id: 'm_m2', title: 'City lights', creator: '@tai', price: 'KSh 120', priceMinor: 12000, image: 'https://images.pexels.com/photos/29382377/pexels-photo-29382377.jpeg?w=900' },
];

export const TRANS: Video[] = [
  { id: 't_t1', title: 'Becoming', creator: '@sara', price: 'KSh 250', priceMinor: 25000, image: 'https://images.pexels.com/photos/10563851/pexels-photo-10563851.jpeg?w=900' },
];

export const OTHER: Video[] = [
  { id: 'o_o1', title: 'Quiet hours', creator: '@zawadi', price: 'KSh 180', priceMinor: 18000, image: 'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=900' },
  { id: 'o_o2', title: 'Street sounds', creator: '@juma', price: 'KSh 150', priceMinor: 15000, image: 'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=900' },
];

// The array used for the "Videos" grid on the Home screen
export const HOME_GRID_VIDEOS = [...FEMALE, ...MALE, ...OTHER].slice(0, 4);
