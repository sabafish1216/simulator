export const PIE_COLORS = [
  '#ffb547',
  '#7c9cff',
  '#3dd68c',
  '#c084fc',
  '#ff6b7a',
  '#5ec8ff',
  '#f5b942',
  '#94a3b8',
];

export function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export function describeArc(cx, cy, r, startAngle, endAngle) {
  if (endAngle - startAngle >= 360) {
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy}`;
  }
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function computePieSlices(distributions, colors = PIE_COLORS) {
  const totalWeight = distributions.reduce((sum, d) => sum + (Number(d.weight) || 0), 0);
  if (totalWeight === 0) return [];

  let currentAngle = -90;
  return distributions.map((dist, i) => {
    const weight = Number(dist.weight) || 0;
    const fraction = weight / totalWeight;
    const sweepAngle = fraction * 360;
    const slice = {
      ...dist,
      color: colors[i % colors.length],
      fraction,
      percent: Math.round(fraction * 1000) / 10,
      startAngle: currentAngle,
      endAngle: currentAngle + sweepAngle,
    };
    currentAngle += sweepAngle;
    return slice;
  });
}
