docker network ls|grep my_local_network > /dev/null || docker network create bdnr-project_default

docker-compose up --build
