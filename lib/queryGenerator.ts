/**
 * Builds a fixed set of buyer-intent prompts for a given category/use case.
 * Deliberately template-based (not LLM-generated) so runs are reproducible
 * and cheap - the point is measuring how AI engines answer these queries,
 * not spending tokens generating the queries themselves.
 */
export function generateQueries(category: string, useCase: string): string[] {
  const c = category.trim();
  const u = useCase.trim();

  const templates = [
    `What is the best ${c} for ${u}?`,
    `Top ${c} tools in 2026`,
    `What ${c} do you recommend for ${u}?`,
    `Compare the leading ${c} options`,
    `What should I look for when choosing a ${c} for ${u}?`,
  ];

  return templates;
}
