# Deployment Docs

Choose one target below and follow the matching steps for your rebuilt static site.

## 1. Upload files
From your local machine:
```bash
scp -r /opt/data/travel-site-next/* user@host:/var/www/travel-site-next/
```

## 2. Serve anywhere

### Local / DEV
```bash
npm install
npm start
# open http://localhost:3000
```

### Docker (recommended for server/vps)
```bash
docker build -t travel-site-next .
docker run --rm -p 8080:80 travel-site-next
# open http://<server-ip>:8080
```

## 3. Server config (nginx)
If you bring your own nginx rather than Docker, use:

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/travel-site-next;
  index index.html;

  include /etc/nginx/snippets/spa-fallback.conf;
}
```

`spa-fallback.conf`:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}

location ~* \.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ {
  expires 1y;
  add_header Cache-Control "public, max-age=31536000, immutable";
  try_files $uri $uri/ =404;
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/travel-site-next /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Systemd service (optional)
```ini
# /etc/systemd/system/travel-site.service
[Unit]
Description=Travel site static server

[Service]
Type=simple
WorkingDirectory=/var/www/travel-site-next
ExecStart=npx serve . -l 3000
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now travel-site.service
```

## 4. SSL (optional)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 5. Vercel
```bash
vercel
# follow prompts
```

## 6. Netlify
```bash
netlify deploy --prod --dir .
```
