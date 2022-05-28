#!/bin/bash

echo
echo "Copying posts.json to container..."
echo

docker cp ./results/final/posts.json bdnr-couchbase1:/posts.json

echo
echo "Copying users.json to container..."
echo

docker cp ./results/final/users.json bdnr-couchbase1:/users.json

echo
echo "Copying import_data.sh to container..."
echo

docker cp ./import_data.sh bdnr-couchbase1:/import_data.sh

echo
echo "Opening container bash..."
echo

docker exec bdnr-couchbase1 /bin/sh -c ./import_data.sh
