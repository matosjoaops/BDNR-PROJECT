
#!/bin/bash


echo
echo "Creating cluster for Couchbase..."
echo

couchbase-cli cluster-init -c http://0.0.0.0:8091 --cluster-name bdnr-project --cluster-username Administrator \
--cluster-password bdnr-12345 --services "data, query, index, fts, eventing, fts" --cluster-ramsize 4836

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


sleep 5


echo
echo "Importing posts..."
echo

cbimport json -d file:///posts.json -c http://0.0.0.0:8091 -u Administrator -p bdnr-12345 -b posts  -f list -g post::#MONO_INCR#



sleep 5
echo
echo "Creating bucket for users..."
echo

# Users: Create bucket and import documents.
couchbase-cli bucket-create -c http://0.0.0.0:8091 --username Administrator \
--password bdnr-12345 --bucket users --bucket-type couchbase \
--bucket-ramsize 1024


sleep 5

echo
echo "Importing users..."
echo

cbimport json -d file:///users.json -c http://0.0.0.0:8091 -u Administrator -p bdnr-12345 -b users  -f list -g %id%

sleep 5

echo
echo "Creating indexes..."
echo

#cbq -u Administrator -p bdnr-12345 --script="\CONNECT http://0.0.0.0:8091"

cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE PRIMARY INDEX ON \`users\`;"

cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE PRIMARY INDEX ON \`posts\`;"


sleep 5

# Create Full-Text search index for POSTS.



echo
echo "Done!"
echo