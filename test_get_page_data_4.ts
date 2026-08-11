const SITE_URL = "http://127.0.0.1:3000";
fetch(`${SITE_URL}/api/pages?slug=home`).then(res => res.json()).then(data => {
  console.log("Local API data:", data.content[0].type);
}).catch(console.error);
