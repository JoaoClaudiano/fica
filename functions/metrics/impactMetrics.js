module.exports = function impactMetrics(cases) {
  const total = cases.length;
  const resolved = cases.filter(c => c.resolved).length;

  return {
    totalCases: total,
    resolvedCases: resolved,
    resolutionRate: total ? resolved / total : 0
  };
};