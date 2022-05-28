
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
sleep 1
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE PRIMARY INDEX ON \`posts\`;"
sleep 1
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX post_type_index ON \`posts\`(post_type);"
sleep 1
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX item_type_index ON \`posts\`(item_type);"
sleep 1
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX price_range_index ON \`posts\`(price_range);"
sleep 1
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX price_index ON \`posts\`(price);"
sleep 1
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX id_index ON \`users\`(id);"
sleep 1
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX username_index ON \`users\`(username);"
sleep 1

echo
echo "Adding couchbase2 to the cluster"
echo

# curl -u Administrator:bdnr-12345 -v -X POST \
# 0.0.0.0:8091/controller/addNode \
# -d 'hostname=172.19.0.4&user=Administrator&password=bdnr-12345&services=kv'

couchbase-cli server-add -c http://0.0.0.0:8091 \
--username Administrator \
--password bdnr-12345 \
--server-add 172.19.0.4 \
--server-add-username Administrator \
--server-add-password bdnr-12345 \
--services "data, query, index, fts, eventing"


echo
echo "Done!"
echo
