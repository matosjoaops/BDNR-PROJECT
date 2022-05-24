
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

cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX post_type_index ON \`posts\`(post_type);"
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX item_type_index ON \`posts\`(item_type);"
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX price_range_index ON \`posts\`(price_range);"
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX price_index ON \`posts\`(price);"
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX id_index ON \`users\`(id);"
cbq -u Administrator -p bdnr-12345 -e "http://0.0.0.0:8091" --script="CREATE INDEX username_index ON \`users\`(username);"


sleep 5

echo
echo "Creating Full-Text searc index for POSTS"
echo

curl 'http://localhost:8091/_p/fts/api/index/posts-index' -X PUT -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0' -H 'Accept: application/json, text/plain, */*' -H 'Accept-Language: pt-PT,pt;q=0.8,en;q=0.5,en-US;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'invalid-auth-response: on' -H 'Cache-Control: no-cache' -H 'Pragma: no-cache' -H 'ns-server-ui: yes' -H 'Content-Type: application/json;charset=utf-8' -H 'Origin: http://localhost:8091' -H 'Connection: keep-alive' -H 'Referer: http://localhost:8091/ui/index.html' -H 'Cookie: ui-auth-localhost%3A8091=520974c0874e8a029b5b61df049456c8' -H 'Sec-Fetch-Dest: empty' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: same-origin' --data-raw '{"name":"posts-index","type":"fulltext-index","params":{"mapping":{"default_mapping":{"enabled":true,"dynamic":true},"default_type":"_default","default_analyzer":"standard","default_datetime_parser":"dateTimeOptional","default_field":"_all","store_dynamic":false,"index_dynamic":true,"docvalues_dynamic":false},"store":{"indexType":"scorch","kvStoreName":""},"doc_config":{"mode":"type_field","type_field":"type"}},"sourceType":"couchbase","sourceName":"posts","sourceUUID":"f4b41d0d7474f58cbb836192cf68a290","sourceParams":{},"planParams":{"maxPartitionsPerPIndex":1024,"numReplicas":0,"indexPartitions":1},"uuid":""}'

echo
echo "Done!"
echo