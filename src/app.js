const http = require('http');
const fs = require('fs');
const cheerio = require('cheerio');
const algoliaData = require('../data/algolia.json');

const hostname = '127.0.0.1';
const port = 3000;

const injectAlgoliaData = (html) => {
  const $ = cheerio.load(html);
  algoliaData.hits.forEach((hit, index) => {
    $('[data-container="products_container"]')
      .children()
      .eq(index)
      .replaceWith(algoliaHitToHtml(hit));
  });
  return $.html();
};

const algoliaHitToHtml = (data) => {
  return `
  <a href="${data.product_path}">
    <div class="group relative">
      <div
        class="min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:aspect-none lg:h-80"
      >
        <img
          src="${data.thumbnail_url}"
          alt="${data.product_title}"
          class="h-full w-full object-cover object-center lg:h-full lg:w-full"
        />
      </div>
      <div class="mt-4 flex justify-between">
        <div>
          <h3 class="text-sm text-gray-700">
            <span aria-hidden="true" class="absolute inset-0"></span>
          </h3>
          <p class="mt-1 text-sm text-gray-500">${data.title}</p>
        </div>
        <p class="text-sm font-medium text-gray-900">Price: ${data.current_price}</p>
      </div>
    </div>
  </a>
  `;
};

const server = http.createServer((req, res) => {
  const buffer = fs.readFileSync('./data/page.html');
  const result = injectAlgoliaData(buffer.toString());

  algoliaHitToHtml(algoliaData.hits[0]);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write(result);
  res.end();
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
