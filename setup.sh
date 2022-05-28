docker network ls|grep my_local_network > /dev/null || docker network create --subnet=172.19.0.0/16 bdnr-project_default

docker-compose up --build
