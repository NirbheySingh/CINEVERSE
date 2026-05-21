import https from 'https';

https.get('https://yts.mx/api/v2/list_movies.json?limit=50&sort_by=download_count', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Success!', parsed.data.movies.length);
      console.log('First movie:', parsed.data.movies[0].title, parsed.data.movies[0].large_cover_image);
    } catch (e) {
      console.log('Error parsing JSON');
    }
  });
}).on('error', (e) => console.log('Error:', e.message));
