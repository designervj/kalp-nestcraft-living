async function register() {
  const url = 'https://biz.kalptree.xyz/api/auth/register';
  const userData = {
    email: 'admin@maven.com',
    password: 'password123',
    role: 'tenant_admin'
  };
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-db': 'kp_maven_architecture'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch(e) {
    console.error(e);
  }
}
register();
