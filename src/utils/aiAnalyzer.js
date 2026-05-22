const positiveKeywords = ['growth', 'success', 'innovation', 'launch', 'profit', 'breakthrough', 'advance', 'recovery', 'gain', 'surpass', 'win', 'improve', 'boost', 'up', 'soar', 'record', 'funding', 'discover'];
const riskKeywords = ['decline', 'loss', 'fail', 'crash', 'risk', 'threat', 'warning', 'delay', 'issue', 'problem', 'crisis', 'down', 'drop', 'plunge', 'shortage', 'tension', 'war', 'conflict', 'ban', 'lawsuit'];

export function analyzeNewsSentiment(articles) {
  if (!articles || articles.length === 0) return { positive: 0, neutral: 100, risk: 0 };

  let posCount = 0;
  let riskCount = 0;
  let totalWords = 0;

  articles.forEach(article => {
    const text = ((article.title || '') + ' ' + (article.summary || '')).toLowerCase();
    const words = text.split(/\W+/).filter(Boolean);
    totalWords += words.length;

    words.forEach(word => {
      if (positiveKeywords.includes(word)) posCount++;
      if (riskKeywords.includes(word)) riskCount++;
    });
  });

  // Scale heuristics to make percentages more realistic
  const basePos = Math.min((posCount / Math.max(totalWords, 1)) * 1000, 85);
  const baseRisk = Math.min((riskCount / Math.max(totalWords, 1)) * 1000, 85);

  const positive = Math.round(Math.max(10, basePos));
  const risk = Math.round(Math.max(5, baseRisk));
  const neutral = Math.max(0, 100 - positive - risk);

  return { positive, neutral, risk };
}

export function generateSummary(sentiment) {
  if (sentiment.risk > sentiment.positive && sentiment.risk > 30) {
    return 'AI analyzer detects elevated risk and market tensions. Proceed with caution as recent stories highlight critical delays, conflicts, or declining metrics across major sectors.';
  } else if (sentiment.positive > sentiment.risk && sentiment.positive > 40) {
    return 'AI analyzer detects strong positive momentum. The latest cycle is driven by breakthroughs, innovations, and growth indicators across primary tracked sectors.';
  } else {
    return 'AI analyzer indicates a neutral stabilization. Stories are balanced with standard operational updates and moderate developments without severe volatility.';
  }
}
