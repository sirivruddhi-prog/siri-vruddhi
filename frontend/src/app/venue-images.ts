/** Build a safe asset URL for images with spaces and special characters in filenames. */
export function venueImg(filename: string): string {
  return `/assets/images/${encodeURIComponent(filename)}`;
}

export interface GalleryItem {
  src: string;
  alt: string;
  title: string;
  category: string;
}

export const GALLERY_CATEGORIES = [
  'All',
  'Celebrations',
  'Exterior',
  'Foyer',
  'Mantapa & Lawn',
  'Indoor Halls',
  'Dining',
  'Amenities'
] as const;

function galleryEntry(file: string, category: string, title?: string): GalleryItem {
  const label = title ?? file.replace(/\.(jpe?g|png|webp)$/i, '').trim();
  return {
    src: venueImg(file),
    alt: `${label} at Siri Vruddhi event venue`,
    title: label,
    category
  };
}

/** Home page hero carousel */
export const HERO_SLIDES = [
  {
    src: venueImg('hero-1.jpg'),
    alt: 'Indoor ceremony with guests at Siri Vruddhi'
  },
  {
    src: venueImg('Siri Vruddhi Entrance.JPG'),
    alt: 'Main entrance to Siri Vruddhi venue'
  },
  {
    src: venueImg('Mantapa 2 with Lawn and 2 Kattes.JPG'),
    alt: 'Mantapa 2 with lawn and traditional kattes'
  },
  {
    src: venueImg('Indoor Function Hall with a view from Mantapa & Foyer area.JPG'),
    alt: 'Indoor function hall viewed from mantapa and foyer'
  },
  {
    src: venueImg('hero-2.jpg'),
    alt: 'Outdoor wedding setup with dining and mandap'
  },
  {
    src: venueImg('hero-3.jpg'),
    alt: 'Courtyard wedding lunch celebration'
  }
];

export const ABOUT_IMAGE = venueImg('Siri Vruddhi Exterior View.JPG');
export const DINING_BANNER_IMAGE = venueImg('Indoor Dining Hall.JPG');
export const GALLERY_PAGE_HERO_IMAGE = venueImg('Siri Vruddhi Exterior View.JPG');

/** Full gallery — all venue photos */
export const GALLERY_ITEMS: GalleryItem[] = [
  // Celebrations (event photos)
  galleryEntry('hero-1.jpg', 'Celebrations', 'Ceremony in Progress'),
  galleryEntry('hero-2.jpg', 'Celebrations', 'Outdoor Wedding Setup'),
  galleryEntry('hero-3.jpg', 'Celebrations', 'Wedding Lunch Celebration'),

  // Exterior & entrance
  galleryEntry('Siri Vruddhi Entrance.JPG', 'Exterior'),
  galleryEntry('Siri Vruddhi Exterior View.JPG', 'Exterior'),
  galleryEntry('Siri Vruddhi Exterior.JPG', 'Exterior'),
  galleryEntry('Siri Vruddhi exteriors.JPG', 'Exterior'),
  galleryEntry('Siri Vruddhi Name Plate.JPG', 'Exterior'),
  galleryEntry('Parking.JPG', 'Exterior'),
  galleryEntry('Parking area.JPG', 'Exterior'),
  galleryEntry('Parking 2.JPG', 'Exterior'),

  // Foyer
  galleryEntry('Foyer Entrance.JPG', 'Foyer'),
  galleryEntry('Foyer entrance1.JPG', 'Foyer'),
  galleryEntry('Foyer & Seating Area.JPG', 'Foyer'),
  galleryEntry('Foyer & Seating area(1).JPG', 'Foyer'),
  galleryEntry('Foyer & Seating area(2).JPG', 'Foyer'),
  galleryEntry('Areal view of the Foyer area.JPG', 'Foyer', 'Aerial View of Foyer'),
  galleryEntry('Photo Wall Radha Krishna.JPG', 'Foyer'),

  // Mantapa & lawn
  galleryEntry('Mantapa 1.JPG', 'Mantapa & Lawn'),
  galleryEntry('Mantapa 2.JPG', 'Mantapa & Lawn'),
  galleryEntry('Mantapa 1 adjoining the Indoor Hall.JPG', 'Mantapa & Lawn'),
  galleryEntry('Mantapa 2 with Lawn and 2 Kattes.JPG', 'Mantapa & Lawn'),
  galleryEntry('Areal View of the 2nd Mantapa.JPG', 'Mantapa & Lawn', 'Aerial View of 2nd Mantapa'),
  galleryEntry('Lawn and Mantapa area.JPG', 'Mantapa & Lawn'),
  galleryEntry('Lawn area for Canopy and Katte.JPG', 'Mantapa & Lawn'),
  galleryEntry('Lawn Area for Outdoor Canopy Set up.JPG', 'Mantapa & Lawn'),
  galleryEntry('Terminalia Katte.JPG', 'Mantapa & Lawn'),
  galleryEntry('Swing & Lawn area .JPG', 'Mantapa & Lawn', 'Swing & Lawn Area'),

  // Indoor halls
  galleryEntry('Indoor Hall.JPG', 'Indoor Halls'),
  galleryEntry('Indoor hall 1.JPG', 'Indoor Halls'),
  galleryEntry('Indoor Hall 2.JPG', 'Indoor Halls'),
  galleryEntry('Event Halls.JPG', 'Indoor Halls'),
  galleryEntry('Indoor Function Hall with an open view.JPG', 'Indoor Halls'),
  galleryEntry('Indoor Function Hall with a view from Mantapa & Foyer area.JPG', 'Indoor Halls'),
  galleryEntry('DSC04678.JPG', 'Indoor Halls'),

  // Dining
  galleryEntry('Indoor Dining Hall.JPG', 'Dining'),
  galleryEntry('Dining Hall 2.JPG', 'Dining'),
  galleryEntry('Dining Hall Entrance.JPG', 'Dining'),
  galleryEntry('Dining Room entrance 1.JPG', 'Dining'),
  galleryEntry('Dining Area 2.JPG', 'Dining'),
  galleryEntry('Dining Area 3.JPG', 'Dining'),
  galleryEntry('Dining Area 4.JPG', 'Dining'),

  // Amenities
  galleryEntry('Hand Wash Area.JPG', 'Amenities'),
  galleryEntry('Rest Room.JPG', 'Amenities'),
  galleryEntry('Room.JPG', 'Amenities'),
  galleryEntry('Room1.JPG', 'Amenities'),
  galleryEntry('Room 3.JPG', 'Amenities')
];
