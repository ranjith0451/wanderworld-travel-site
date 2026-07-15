# Travel Site Next

Deploy-ready static site with PWA support and SPA client-side routing fallbacks.

## Local serve

```bash
npm install
npm run serve
# open http://localhost:3000
```

Or use any static file server from the project root.

## Live deploy

### Vercel CLI

```bash
npm install -g vercel
vercel
# follow prompts
```

### Netlify CLI

```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

### Docker

```bash
docker build -t travel-site-next .
docker run --rm -p 8080:80 travel-site-next
# open http://localhost:8080
```

### GitHub Pages

Push this directory to a `gh-pages` branch or configure GitHub Actions to publish `/` to Pages. Ensure `/index.html` exists at repo root.
