# SSH / Server deployment

These steps assume you have SSH access to a Linux server and a prepared web root like `/var/www/travel-site-next`.

## 1. Upload files

From your local machine:

```bash
scp -r /opt/data/travel-site-next/* user@host:/var/www/travel-site-next/
```

## 2. Install a web server

### Using nginx

```bash
# on the server
sudo apt update && sudo apt install -y nginx

# site config: /etc/nginx/sites-available/travel-site-next
server {
  listen 80;
  server_name your-domain.com;

  root /var/www/travel-site-next;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/travel-site-next /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Using a static server for rootless setups

```bash
# quick single-user serve
npx serve /var/www/travel-site-next -l 3000
```

## 3. SSL (optional)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 4. Systemd service (optional)

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
