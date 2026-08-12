fetch("http://127.0.0.1:3000/api/pages?slug=home").then(res => res.json()).then(data => {
  const section = data.content.find(s => s.adminTitle === "Newsletter Section");
  console.log(JSON.stringify(section.props.form, null, 2));
}).catch(console.error);
