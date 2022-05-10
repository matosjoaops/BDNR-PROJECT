
#!/bin/bash


echo
echo "Creating cluster for Couchbase..."
echo

couchbase-cli cluster-init -c http://0.0.0.0:8091 --cluster-name bdnr-project --cluster-username Administrator \
--cluster-password bdnr-12345 --services "data, query, index, fts, eventing" --cluster-ramsize 2048

sleep 5

echo
echo "Importing data to Couchbase..."
echo

echo
echo "Creating bucket for posts..."
echo

# Posts: Create bucket and import documents.
couchbase-cli bucket-create -c http://0.0.0.0:8091 --username Administrator \
--password bdnr-12345 --bucket posts --bucket-type couchbase \
--bucket-ramsize 1024


sleep 1


echo
echo "Importing posts..."
echo

cbimport json -d file:///posts.json -c http://0.0.0.0:8091 -u Administrator -p bdnr-12345 -b posts  -f list -g post::#MONO_INCR#



sleep 1
echo
echo "Creating bucket for users..."
echo

# Users: Create bucket and import documents.
couchbase-cli bucket-create -c http://0.0.0.0:8091 --username Administrator \
--password bdnr-12345 --bucket users --bucket-type couchbase \
--bucket-ramsize 1024


sleep 1

echo
echo "Importing users..."
echo

cbimport json -d file:///users.json -c http://0.0.0.0:8091 -u Administrator -p bdnr-12345 -b users  -f list -g %id%

