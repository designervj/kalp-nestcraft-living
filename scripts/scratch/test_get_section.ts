import { getPageData } from "./lib/getPageData";
import { getSection } from "./lib/cmsUtils";

async function run() {
  const data = await getPageData("home");
  const content = Array.isArray(data?.content) ? data.content : [];
  console.log("Total sections:", content.length);
  const hero = getSection(content, "Premium Hero Slider");
  console.log("Hero section found:", !!hero);
  if (hero) {
    console.log("Hero id:", hero.id);
  }
}
run();
