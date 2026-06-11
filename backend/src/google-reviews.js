const PLACES_API_BASE = 'https://places.googleapis.com/v1/places';

let cache = {
  fetchedAt: 0,
  data: null,
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function buildWriteReviewUrl(placeId) {
  if (!placeId) return null;
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

function normalizeGoogleReview(review) {
  const author = review.authorAttribution || {};
  return {
    authorName: author.displayName || 'Google user',
    authorPhotoUrl: author.photoUri || null,
    authorProfileUrl: author.uri || null,
    rating: review.rating || 0,
    text: review.text?.text || review.originalText?.text || '',
    relativeTime: review.relativePublishTimeDescription || '',
    source: 'google',
  };
}

function normalizeManualReview(item) {
  return {
    authorName: item.authorName || 'Guest',
    authorPhotoUrl: item.authorPhotoUrl || null,
    authorProfileUrl: null,
    rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
    text: item.text || '',
    relativeTime: item.relativeTime || '',
    source: 'manual',
  };
}

async function fetchGooglePlaceReviews(placeId, apiKey) {
  if (!placeId || !apiKey) {
    return null;
  }

  const now = Date.now();
  if (cache.data && now - cache.fetchedAt < CACHE_TTL_MS && cache.placeId === placeId) {
    return cache.data;
  }

  const url = `${PLACES_API_BASE}/${encodeURIComponent(placeId)}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'reviews,rating,userRatingCount,googleMapsUri,displayName',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Google Places API ${response.status}: ${body.slice(0, 200)}`);
  }

  const place = await response.json();
  const data = {
    rating: place.rating ?? null,
    userRatingCount: place.userRatingCount ?? null,
    googleMapsUrl: place.googleMapsUri || null,
    displayName: place.displayName?.text || null,
    items: (place.reviews || []).map(normalizeGoogleReview).filter((r) => r.text),
  };

  cache = { fetchedAt: now, placeId, data };
  return data;
}

function buildReviewsPayload(cmsSection, googleData) {
  const placeId =
    (cmsSection.placeId || '').trim() || (process.env.GOOGLE_PLACE_ID || '').trim();
  const writeReviewUrl =
    (cmsSection.writeReviewUrl || '').trim() || buildWriteReviewUrl(placeId);
  const viewAllUrl =
    googleData?.googleMapsUrl ||
    (cmsSection.viewAllUrl || '').trim() ||
    null;

  const manualItems = (cmsSection.manualItems || [])
    .map(normalizeManualReview)
    .filter((r) => r.text);

  const googleItems = googleData?.items || [];
  const items = googleItems.length ? googleItems : manualItems;

  return {
    eyebrow: cmsSection.eyebrow || 'Guest Voices',
    title: cmsSection.title || 'What Families Say',
    lead: cmsSection.lead || '',
    rating: googleData?.rating ?? cmsSection.rating ?? null,
    userRatingCount: googleData?.userRatingCount ?? cmsSection.userRatingCount ?? null,
    writeReviewUrl,
    viewAllUrl,
    writeReviewLabel: cmsSection.writeReviewLabel || 'Rate us on Google',
    viewAllLabel: cmsSection.viewAllLabel || 'See all reviews on Google',
    source: googleItems.length ? 'google' : manualItems.length ? 'manual' : 'none',
    items,
  };
}

async function getPublicReviews(cmsSection) {
  const apiKey = (process.env.GOOGLE_PLACES_API_KEY || '').trim();
  const placeId =
    (cmsSection?.placeId || '').trim() || (process.env.GOOGLE_PLACE_ID || '').trim();

  let googleData = null;
  if (apiKey && placeId) {
    try {
      googleData = await fetchGooglePlaceReviews(placeId, apiKey);
    } catch (error) {
      console.error('Google reviews fetch failed:', error.message);
    }
  }

  return buildReviewsPayload(cmsSection || {}, googleData);
}

function clearGoogleReviewsCache() {
  cache = { fetchedAt: 0, data: null };
}

module.exports = {
  getPublicReviews,
  buildWriteReviewUrl,
  clearGoogleReviewsCache,
};
