import { getPageData } from "./lib/getPageData";
async function test() {
  const data = await getPageData("home");
  if (data && data.content && data.content.length > 0) {
    console.log("Success! Content length:", data.content.length);
    console.log("First section:", JSON.stringify(data.content[0]).substring(0, 200));
  } else {
    console.log("Failed or empty:", data);
  }
}
test();
