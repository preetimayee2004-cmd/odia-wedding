/**
 * Directions link for a place. An explicit maps URL wins; otherwise the link
 * is built from the very same name/address the page displays, so the
 * written address and the map destination can't disagree.
 */
export function directionsUrl(place: {
  mapsUrl?: string | null;
  name?: string | null;
  address?: string | null;
}): string | null {
  if (place.mapsUrl) return place.mapsUrl;
  if (!place.address) return null;
  const query = [place.name, place.address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
