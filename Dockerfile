FROM rtsp/lighttpd
ADD .docker/rewrite.conf /etc/lighttpd/conf.d/14-rewrite.conf
ADD dist/web-frontend-angular/cs /var/www/html
RUN chown -R lighttpd /var/www/html
