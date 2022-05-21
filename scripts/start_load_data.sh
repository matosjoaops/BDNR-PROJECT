#!/bin/bash

echo
echo "Copying posts.json to container..."
echo

docker cp ./results/final/posts.json $1:/posts.json

echo
echo "Copying users.json to container..."
echo

docker cp ./results/final/users.json $1:/users.json

echo
echo "Copying import_data.sh to container..."
echo

docker cp ./import_data.sh $1:/import_data.sh

echo
echo "Opening container bash..."
echo

docker exec $1 /bin/sh -c ./import_data.sh