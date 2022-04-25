
#!/bin/bash


echo
echo "Creating cluster for Couchbase..."
echo

couchbase-cli cluster-init -c http://localhost:8091 --cluster-username Administrator \
 --cluster-password bdnr-1234 --services data --cluster-ramsize 2048 \
 --cluster-port 5000


echo
echo "Importing data to Couchbase..."
echo

echo
echo "Creating bucket for posts..."
echo

# Posts: Create bucket and import documents.
couchbase-cli bucket-create -c http://localhost:8091 --username Administrator \
 --password bdnr-12345 --bucket posts --bucket-type couchbase \
 --bucket-ramsize 1024


echo
echo "Importing posts..."
echo

cbimport json --d file:///posts.json --c http://localhost:8091 --u Administrator --p bdnr-12345 --b posts  --f list --g post::#MONO_INCR#


echo
echo "Creating bucket for users..."
echo

# Users: Create bucket and import documents.
couchbase-cli bucket-create -c http://localhost:8091 --username Administrator \
 --password bdnr-12345 --bucket users --bucket-type couchbase \
 --bucket-ramsize 1024


echo
echo "Importing users..."
echo

cbimport json --d file:///users.json --c http://localhost:8091 --u Administrator --p bdnr-12345 --b users  --f list --g %id%

