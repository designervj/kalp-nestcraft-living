import { fetchPublicSitePage, normalizePublicPage } from "./lib/public-site.ts";
async function test() {
  const data = await fetchPublicSitePage("home");
  const normalized = normalizePublicPage(data);
  console.log(JSON.stringify(normalized?.content.find(c => c.adminTitle === "Premium Hero Slider"), null, 2));
}
test();
