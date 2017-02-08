redis-server &
quit
turnadmin -a -N "ip=127.0.0.1 dbname=dbuser password=dbpassword" -u turnuser -r easyrtc.com  -p  turnpassword
turnserver -L 182.71.28.83 -a -b turnuserdb.conf -f -r easyrtc.com -p 3478 -N "ip=127.0.0.1 dbname=dbuser password=dbpassword connect_timeout=60"