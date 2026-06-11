const { GALLERY_SEED_ITEMS } = require('./gallery-seed');
const { resolveImageRef } = require('./media');

const DEFAULT_SECTIONS = {
  contact: {
    phoneDisplay: '+91 95389 09998',
    phoneTel: '+919538909998',
    email: 'sirivruddhi@gmail.com',
    instagramUrl: 'https://www.instagram.com/sirivruddhi/',
    mapsUrl: 'https://maps.app.goo.gl/v7SxsyCN2xEzYUH59',
    location: 'Nelamangala · Near Budhihal, Karnataka',
    whatsappMessage: 'Hello Siri Vruddhi, I would like to enquire about your venue.',
  },
  hero: {
    eyebrow: 'Nelamangala · Near Budhihal',
    welcome: 'Welcome to',
    tagline:
      'A sacred, elegant destination where weddings, engagements, upanayanam, naming ceremonies, and treasured celebrations come alive in timeless beauty.',
    slides: [
      { file: 'hero-1.jpg', alt: 'Indoor ceremony with guests at Siri Vruddhi' },
      { file: 'Siri Vruddhi Entrance.JPG', alt: 'Main entrance to Siri Vruddhi venue' },
      { file: 'Mantapa 2 with Lawn and 2 Kattes.JPG', alt: 'Mantapa 2 with lawn and traditional kattes' },
      {
        file: 'Indoor Function Hall with a view from Mantapa & Foyer area.JPG',
        alt: 'Indoor function hall viewed from mantapa and foyer',
      },
      { file: 'hero-2.jpg', alt: 'Outdoor wedding setup with dining and mandap' },
      { file: 'hero-3.jpg', alt: 'Courtyard wedding lunch celebration' },
    ],
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
    items: GALLERY_SEED_ITEMS,
  },
};

const SECTION_KEYS = Object.keys(DEFAULT_SECTIONS);

function getDefaultSection(key) {
  return DEFAULT_SECTIONS[key] ? JSON.parse(JSON.stringify(DEFAULT_SECTIONS[key])) : null;
}

function getAllDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
}

function buildPublicContact(contact) {
  const digits = (contact.phoneTel || '').replace(/\D/g, '');
  const message = encodeURIComponent(contact.whatsappMessage || '');
  return {
    ...contact,
    whatsappUrl: `https://wa.me/${digits}?text=${message}`,
  };
}

function buildPublicPayload(sections, req) {
  const galleryItems = (sections.gallery?.items || [])
    .filter((item) => item.visible !== false)
    .map((item) => ({
      file: item.file,
      url: item.url,
      mediaId: item.mediaId,
      category: item.category,
      title: item.title,
      alt: `${item.title} at Siri Vruddhi event venue`,
      src: resolveImageRef(item, req),
    }));

  return {
    contact: buildPublicContact(sections.contact),
    hero: {
      ...sections.hero,
      slides: (sections.hero?.slides || []).map((slide) => ({
        ...slide,
        src: resolveImageRef({ file: slide.file, url: slide.url, mediaId: slide.mediaId }, req),
      })),
    },
    stats: sections.stats,
    teaser: sections.teaser,
    intro: {
      ...sections.intro,
      features: (sections.intro?.features || []).map((feature) => ({
        ...feature,
        src: resolveImageRef({ file: feature.imageFile, url: feature.imageUrl, mediaId: feature.mediaId }, req),
      })),
    },
    about: {
      ...sections.about,
      src: resolveImageRef(
        { file: sections.about?.imageFile, url: sections.about?.imageUrl, mediaId: sections.about?.mediaId },
        req
      ),
    },
    spaces: {
      ...sections.spaces,
      items: (sections.spaces?.items || []).map((space) => ({
        ...space,
        src: resolveImageRef({ file: space.imageFile, url: space.imageUrl, mediaId: space.mediaId }, req),
      })),
    },
    facilities: sections.facilities,
    dining: {
      ...sections.dining,
      src: resolveImageRef({ file: sections.dining?.imageFile, url: sections.dining?.imageUrl, mediaId: sections.dining?.mediaId }, req),
    },
    contactPanel: sections.contactPanel,
    gallery: {
      ...sections.gallery,
      pageHeroSrc: resolveImageRef(
        { file: sections.gallery?.pageHeroFile, url: sections.gallery?.pageHeroUrl, mediaId: sections.gallery?.pageHeroMediaId },
        req
      ),
      items: galleryItems,
    },
    updatedAt: sections._meta?.updatedAt || null,
  };
}

module.exports = {
  SECTION_KEYS,
  DEFAULT_SECTIONS,
  getDefaultSection,
  getAllDefaults,
  buildPublicPayload,
  buildPublicContact,
};
