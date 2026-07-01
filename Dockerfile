FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all static website assets to the default Nginx html directory
COPY index.html styles.css app.js app.yaml /usr/share/nginx/html/

# Expose port 8080 as required by Cloud Run
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
