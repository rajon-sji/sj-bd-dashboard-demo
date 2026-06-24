/**
 * Smoke-test portfolio retrieval from the command line.
 * Usage: npm run db:test-search -- "CRM integration for insurance"
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.error('Usage: npm run db:test-search -- "your search query"');
    process.exit(1);
  }

  const { searchPastProjects } = await import(
    "../src/lib/retrieval/search-past-projects"
  );

  console.log(`Searching: "${query}"\n`);
  const matches = await searchPastProjects(query, { limit: 5 });

  if (matches.length === 0) {
    console.log("No matches. Did you run npm run db:embed?");
    return;
  }

  for (const m of matches) {
    console.log(`${m.matchPercent}% — ${m.title} (${m.domain})`);
    console.log(`   ${m.tech_stack.join(", ")}`);
    console.log();
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
