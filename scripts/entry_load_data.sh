#!/bin/bash

echo
echo "Copying posts.json to container..."
echo

docker cp ./results/final/posts.json couchbase:/posts.json

echo
echo "Copying users.json to container..."
echo

docker cp ./results/final/users.json couchbase:/users.json

echo
echo "Copying import_data.sh to container..."
echo

docker cp ./import_data.sh couchbase:/import_data.sh

echo
echo "Opening container bash..."
echo

docker exec couchbase /bin/sh -c ./import_data.sh
