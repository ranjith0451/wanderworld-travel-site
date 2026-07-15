# Travel Site Next

Deploy-ready static travel site. Serves correctly from `/` for local dev, Vercel, Netlify, Docker/nginx, and GitHub Pages.

## Structure
- `index.html` — SPA shell with client-side hash routing.
- `app.js` — scripts, 3D globe, itinerary, budget, search.
- `data/countries.js` — static JSON-like travel data.
- `manifest.json`, `service-worker.js` — optional PWA assets.

## Local serve

```bash
npm install
npm start
# open http://localhost:3000
```

Or use any static file server from the project root.

## Live deploy

### Vercel CLI
```bash
npm install -g vercel
vercel
```

Ensure `vercel.json` is present at repo root. Vercel rewrites `/*` to `index.html`.

### Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

Ensure `netlify.toml` is present at repo root. Netlify redirects `/*` to `/index.html`.

### Docker / nginx
```bash
docker build -t travel-site-next .
docker run --rm -p 8080:80 travel-site-next
# open http://<host>:8080
```

This image includes nginx with spa-fallback and caching headers.

### Direct nginx
```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/travel-site-next;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri $uri/ =404;
  }
}
```

### GitHub Pages
Push this directory to a `gh-pages` branch or point GitHub Actions at `/`.
Root path should be `/`. Hash routes like `/` and `/#/monthwise` work from root; deep paths require rewriting to `index.html` only on platforms that support it.

## Notes
- SPA fallback is required because client-side navigation uses hash changes.
- `data/countries.js` is included before `app.js` in `index.html`.