import { SITE_CONTACT } from './site-contact';
import { GALLERY_ITEMS, HERO_SLIDES } from './venue-images';

/** Full static defaults when the CMS API is unreachable (e.g. Render cold start). */
export function buildSiteContentFallback() {
  return {
    contact: { ...SITE_CONTACT },
    hero: {
      eyebrow: 'Nelamangala · Near Budhihal',
      welcome: 'Welcome to',
      tagline:
        'A sacred, elegant destination where weddings, engagements, upanayanam, naming ceremonies, and treasured celebrations come alive in timeless beauty.',
      slides: HERO_SLIDES.map((slide) => ({
        file: decodeURIComponent(slide.src.replace('assets/images/', '')),
        alt: slide.alt,
      })),
    },
    stats: {
      items: [
        { value: '300-500', label: 'Floating Crowd' },
        { value: '200+', label: 'Seated Capacity' },
        { value: '60+', label: 'Dining Seats' },
        { value: '2', label: 'Mantapa Spaces' },
      ],
    },
    teaser: {
      eyebrow: 'Experience the Venue',
      title: 'A Glimpse of Siri Vruddhi',
      lead: 'Watch our venue come alive — timeless spaces designed for your most cherished celebrations.',
    },
    intro: {
      eyebrow: 'The Experience',
      title: 'Why Siri Vruddhi',
      lead: 'Beautiful indoor halls and serene outdoor gardens — tradition and modern comfort woven together for gatherings that feel truly extraordinary.',
      features: [
        {
          icon: '🏛️',
          title: 'Grand Foyer',
          desc: '200+ guests welcomed through an unforgettable entrance with fountain & mural.',
          imageFile: 'Foyer & Seating Area.JPG',
        },
        {
          icon: '🎋',
          title: 'Elegant Spaces',
          desc: 'Multiple mantapas and outdoor areas for every ceremony and celebration.',
          imageFile: 'Mantapa 2 with Lawn and 2 Kattes.JPG',
        },
        {
          icon: '🍃',
          title: 'Natural Serenity',
          desc: 'Gardens, birdsong, and open skies that make every moment feel sacred.',
          imageFile: 'Lawn Area for Outdoor Canopy Set up.JPG',
        },
      ],
    },
    about: {
      eyebrow: 'Our Story',
      title: 'About Siri Vruddhi',
      paragraphs: [
        'Step into a sacred destination where cherished celebrations come to life — intimate weddings, engagements, upanayanam, naming ceremonies, baby showers, birthdays, and more.',
        'Blending timeless tradition with modern comfort, our indoor and outdoor spaces are thoughtfully designed for every occasion. Located in the heart of Nelamangala near Budhihal, we are your graceful home for every joyous gathering.',
      ],
      badge: 'Est. for cherished celebrations',
      imageFile: 'Siri Vruddhi Exterior View.JPG',
    },
    spaces: {
      eyebrow: 'Venue Highlights',
      title: 'Spaces & Celebrations',
      lead: 'Every corner crafted for rituals, receptions, and unforgettable memories.',
      items: [
        {
          icon: '🪷',
          title: 'Mantapa Spaces',
          imageFile: 'Mantapa 2 with Lawn and 2 Kattes.JPG',
          desc: 'Two beautifully designed mantapas blending elegance and versatility for every ritual.',
          detail: 'Mehendi, Haldi, Homas, Gowri Puja — or styled as beverage counters.',
        },
        {
          icon: '✨',
          title: 'Grand Foyer',
          imageFile: 'Foyer & Seating Area.JPG',
          desc: 'An impressive entrance that welcomes 200+ guests with timeless grandeur.',
          detail: 'Water fountain, Radha Krishna mural, and stunning hall views.',
        },
        {
          icon: '🌿',
          title: 'Lawn & Outdoor Dining',
          imageFile: 'Lawn Area for Outdoor Canopy Set up.JPG',
          desc: 'An expansive, lush green lawn area that can be converted into an enchanting open-air dining space.',
          detail: 'Perfect for a 300-500 floating crowd, hosting banquet setups, canopies, and grand feasts.',
        },
        {
          icon: '🌳',
          title: 'Shaded Tree Kattes',
          imageFile: 'Terminalia Katte.JPG',
          desc: 'Traditional stone-carved platforms (Kattes) built around towering trees like the Terminalia.',
          detail: 'Breezy green shade, ideal for peaceful outdoor seating and serene photo moments.',
        },
        {
          icon: '🏡',
          title: 'Eco-Friendly Lodging',
          imageFile: 'Room.JPG',
          desc: 'Premium guest rooms providing complete comfort and luxury accommodation for your family.',
          detail: 'Equipped with comfortable double cots, cupboards, modern restrooms, and powered by solar energy.',
        },
        {
          icon: '📸',
          title: 'Photo Backdrop',
          imageFile: 'Photo Wall Radha Krishna.JPG',
          desc: 'A gorgeous Radha Krishna mural that acts as an exquisite, custom photo wall for your celebrations.',
          detail: 'Stunning artistic focal point in the foyer, ideal for capturing beautiful family memories.',
        },
      ],
    },
    facilities: {
      eyebrow: 'Venue Comforts',
      title: 'Premium Facilities & Comfort',
      lead: 'Thoughtfully designed amenities to make your celebrations seamless, comfortable, and sustainable.',
      items: [
        { icon: '🏡', title: 'Premium Rooms', desc: 'Luxurious on-site guest rooms providing complete comfort and a peaceful private space for the family.' },
        { icon: '🛏️', title: 'Double Cots', desc: 'Spacious, comfortable double cots provided in every room to guarantee a restful, refreshing sleep.' },
        { icon: '👗', title: 'Spacious Cupboards', desc: 'Ample wardrobe and cupboard storage to keep your grand attire, jewelry, and wedding packages perfectly organized.' },
        { icon: '☀️', title: 'Solar Powered', desc: 'Proudly powered by clean solar energy, ensuring robust eco-friendly backup and an environmentally conscious event.' },
      ],
    },
    reviews: {
      eyebrow: 'Guest Voices',
      title: 'What Families Say',
      lead: 'Heartfelt words from families who celebrated their cherished moments at Siri Vruddhi.',
      writeReviewUrl: null,
    },
    dining: {
      eyebrow: 'Dining & Comfort',
      title: 'Where Every Meal Becomes a Memory',
      description:
        'Our elegant first-floor dining hall accommodates 60+ seated guests with scenic views of the lush estate. For grander celebrations, our expansive lawn area can be seamlessly transformed into an enchanting open-air outdoor dining space. Ideal for hosting a floating crowd of 300 to 500 guests, it offers a magical banqueting experience under the open sky.',
      tags: ['60+ Indoor Seats', 'Lawn Outdoor Dining', '300-500 Floating Capacity'],
      imageFile: 'Indoor Dining Hall.JPG',
    },
    contactPanel: {
      eyebrow: 'Enquire',
      title: 'Plan Your Celebration',
      lead: "Send your event details — we'll reply with availability and next steps.",
    },
    gallery: {
      pageHeroFile: 'Siri Vruddhi Exterior View.JPG',
      pageHeroAlt: 'Siri Vruddhi exterior view',
      pageTitle: 'Gallery',
      pageLead: 'Step inside Siri Vruddhi — ceremonies, gardens, dining, and celebrations captured in every frame.',
      ctaTitle: 'Ready to see it in person?',
      ctaLead: 'Book a private tour and envision your celebration at our venue.',
      categories: ['Celebrations', 'Exterior', 'Foyer', 'Mantapa & Lawn', 'Indoor Halls', 'Dining', 'Amenities'],
      items: GALLERY_ITEMS.map((item) => ({
        file: decodeURIComponent(item.src.replace('assets/images/', '')),
        category: item.category,
        title: item.title,
        alt: item.alt,
      })),
    },
  };
}
