FROM nginx:alpine

LABEL maintainer="travel-site-next" description="Static travel site with SPA fallback support"

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy current directory contents including hidden files into image
# This preserves leading-dot files during the copy phase.
COPY . /usr/share/nginx/html/

# Create nginx config so SPA hash-routes fall back to index.html
RUN printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '' \
  '  # Serve real files first, then directories, then fallback to index.html' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '  }' \
  '' \
  '  # Cache static assets for a long time; SPA shell stays uncached.' \
  '  location ~* \.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ {' \
  '    expires 1y;' \
  '    add_header Cache-Control "public, max-age=31536000, immutable";' \
  '    try_files $uri $uri/ =404;' \
  '  }' \
  '' \
  '  gzip_static on;' \
  '  gzip on;' \
  '  gzip_types text/plain text/css application/javascript application/json image/svg+xml;' \
  '}' \
  >/etc/nginx/conf.d/default.conf

# Remove default site to avoid conflicts
RUN rm -rf /etc/nginx/conf.d/default.conf.bak 2>/dev/null || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
