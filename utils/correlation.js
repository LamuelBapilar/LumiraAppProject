// Correlation utilities

// Compute Pearson correlation for two numeric arrays; ignores null/undefined pairs
export function pearsonCorrelation(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  const pairs = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const x = Number(a[i]);
    const y = Number(b[i]);
    if (Number.isFinite(x) && Number.isFinite(y)) pairs.push([x, y]);
  }
  const n = pairs.length;
  if (n < 2) return 0;

  let sumX = 0, sumY = 0, sumXX = 0, sumYY = 0, sumXY = 0;
  for (const [x, y] of pairs) {
    sumX += x; sumY += y; sumXX += x * x; sumYY += y * y; sumXY += x * y;
  }
  const cov = sumXY - (sumX * sumY) / n;
  const varX = sumXX - (sumX * sumX) / n;
  const varY = sumYY - (sumY * sumY) / n;
  if (varX <= 0 || varY <= 0) return 0;
  return cov / Math.sqrt(varX * varY);
}

// Given arrays of series, return a full correlation matrix
export function buildCorrelationMatrix(series) {
  // series: Array of arrays, each same length; matrix[i][j] = corr(series[i], series[j])
  const m = series.length;
  const matrix = Array.from({ length: m }, () => Array.from({ length: m }, () => 0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      matrix[i][j] = i === j ? 1 : pearsonCorrelation(series[i], series[j]);
    }
  }
  return matrix;
}

// Rank arrays and compute Spearman's rho
export function spearmanCorrelation(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  const pairs = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const x = Number(a[i]);
    const y = Number(b[i]);
    if (Number.isFinite(x) && Number.isFinite(y)) pairs.push([x, y]);
  }
  const n = pairs.length;
  if (n < 2) return 0;

  const rank = (arr) => {
    const indexed = arr.map((v, i) => ({ v, i })).sort((x, y) => x.v - y.v);
    const ranks = Array(arr.length).fill(0);
    for (let k = 0; k < indexed.length; ) {
      let j = k;
      while (j + 1 < indexed.length && indexed[j + 1].v === indexed[k].v) j++;
      const avg = (k + j + 2) / 2; // 1-based average rank for ties
      for (let t = k; t <= j; t++) ranks[indexed[t].i] = avg;
      k = j + 1;
    }
    return ranks;
  };

  const xs = pairs.map((p) => p[0]);
  const ys = pairs.map((p) => p[1]);
  const rx = rank(xs);
  const ry = rank(ys);
  return pearsonCorrelation(rx, ry);
}

// Z-score transform (in place false)
export function zScore(values) {
  const nums = values.map((v) => (Number.isFinite(v) ? Number(v) : null));
  const finite = nums.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return nums.map(() => null);
  const mean = finite.reduce((a, b) => a + b, 0) / finite.length;
  const sd = Math.sqrt(
    finite.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / finite.length
  ) || 1;
  return nums.map((v) => (Number.isFinite(v) ? (v - mean) / sd : null));
}

// Build matrix picking stronger of Pearson/Spearman by absolute value
export function buildCorrelationMatrixHybrid(series) {
  const m = series.length;
  const matrix = Array.from({ length: m }, () => Array.from({ length: m }, () => 0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      if (i === j) { matrix[i][j] = 1; continue; }
      const a = series[i];
      const b = series[j];
      const r1 = pearsonCorrelation(a, b);
      const r2 = spearmanCorrelation(a, b);
      matrix[i][j] = Math.abs(r2) > Math.abs(r1) ? r2 : r1;
    }
  }
  return matrix;
}



