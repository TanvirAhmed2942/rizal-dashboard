const http = require('http');

http.get('http://localhost:3002/auth/login', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const regex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
    let match;
    const urls = [];
    while ((match = regex.exec(data)) !== null) {
      urls.push(match[1]);
    }
    console.log('Found stylesheets:', urls);
    
    urls.forEach(url => {
      const fullUrl = url.startsWith('http') ? url : 'http://localhost:3002' + (url.startsWith('/') ? '' : '/') + url;
      http.get(fullUrl, (cssRes) => {
        let cssData = '';
        cssRes.on('data', chunk => cssData += chunk);
        cssRes.on('end', () => {
          console.log(url, 'CSS length:', cssData.length, 'Contains flex:', cssData.includes('flex'));
        });
      });
    });
  });
});
