import natural from "natural";

const tokenizer = new natural.WordTokenizer();

function normalize(text = "") {
  return tokenizer
    .tokenize(text.toLowerCase())
    .filter((word) => word.length > 2)
    .join(" ");
}

export function textSimilarity(a, b) {
  const first = normalize(a);
  const second = normalize(b);
  if (!first || !second) return 0;
  return natural.JaroWinklerDistance(first, second);
}

export function locationScore(a, b) {
  if (!a || !b) return 0;
  return normalize(a) === normalize(b) ? 1 : textSimilarity(a, b);
}

export function imageSimilarity(sigA = [], sigB = []) {
  if (!sigA.length || !sigB.length || sigA.length !== sigB.length) return 0;
  const maxDistance = Math.sqrt(sigA.length * 255 * 255);
  const distance = Math.sqrt(sigA.reduce((sum, value, index) => {
    return sum + Math.pow(value - sigB[index], 2);
  }, 0));
  return Math.max(0, 1 - distance / maxDistance);
}

export function overallMatchScore(source, candidate) {
  const description = textSimilarity(
    `${source.title} ${source.description} ${source.category}`,
    `${candidate.title} ${candidate.description} ${candidate.category}`
  );
  const location = locationScore(source.location, candidate.location);
  const image = imageSimilarity(source.image?.colorSignature, candidate.image?.colorSignature);
  const category = source.category.toLowerCase() === candidate.category.toLowerCase() ? 1 : 0;

  return Math.round((description * 0.45 + image * 0.25 + location * 0.2 + category * 0.1) * 100);
}
