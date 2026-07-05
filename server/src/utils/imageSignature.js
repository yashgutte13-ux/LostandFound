export function createColorSignature(file) {
  if (!file) return [];

  // Lightweight deterministic image hint. In production, swap this for
  // perceptual hashing or an embedding model.
  const seed = `${file.originalname}-${file.size}-${file.mimetype}`;
  const buckets = Array.from({ length: 8 }, () => 0);
  for (let index = 0; index < seed.length; index += 1) {
    buckets[index % buckets.length] = (buckets[index % buckets.length] + seed.charCodeAt(index)) % 256;
  }
  return buckets;
}
