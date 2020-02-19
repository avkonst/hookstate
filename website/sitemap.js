const { createSitemap } = require('sitemap');
const ExampleIds = require('./src/examples/ids');
const fs = require('fs')

const baseUrl = 'https://hookstate.js.org'

const exampleUrls = Object.values(ExampleIds).map(id => `${baseUrl}/${id}`);

const sitemap = createSitemap({
    hostname: baseUrl,
    cacheTime: 3600000,        // 1 hour
    urls: exampleUrls.map(u => ({ url: u }))
});

const xml = sitemap.toXML(true)

fs.writeFileSync('build/sitemap.xml', sitemap);
