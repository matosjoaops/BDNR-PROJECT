
#!/bin/bash

echo
echo "Importing data to Couchbase..."
echo


echo "Creating bucket for posts..."

# Posts: Create bucket and import documents.
couchbase-cli bucket-create -c http://localhost:8091 --username Administrator \
 --password bdnr-12345 --bucket posts --bucket-type couchbase \
 --bucket-ramsize 1024


echo "Importing posts..."

cbimport json --d file:///posts.json --c http://localhost:8091 --u Administrator --p bdnr-12345 --b posts  --f list --g posts::#MONO_INCR#



echo "Creating bucket for users..."

# Users: Create bucket and import documents.
couchbase-cli bucket-create -c http://localhost:8091 --username Administrator \
 --password bdnr-12345 --bucket users --bucket-type couchbase \
 --bucket-ramsize 1024


echo "Importing users..."

cbimport json --d file:///users.json --c http://localhost:8091 --u Administrator --p bdnr-12345 --b users  --f list --g %id%

