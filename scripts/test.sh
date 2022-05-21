echo
echo "Creating Full-Text searc index for POSTS"
echo

curl -XPUT -H "Content-Type: application/json" \
-u Administrator:bdnr-12345 http://localhost:8093/api/index/posts-index -d \
'{
 "name": "posts-index",
 "type": "fulltext-index",
 "params": {
  "mapping": {
   "default_mapping": {
    "enabled": true,
    "dynamic": true
   },
   "default_type": "_default",
   "default_analyzer": "standard",
   "default_datetime_parser": "dateTimeOptional",
   "default_field": "_all",
   "store_dynamic": false,
   "index_dynamic": true,
   "docvalues_dynamic": false
  },
  "store": {
   "indexType": "scorch",
   "kvStoreName": ""
  },
  "doc_config": {
   "mode": "type_field",
   "type_field": "type",
   "docid_prefix_delim": "",
   "docid_regexp": ""
  }
 },
 "sourceType": "couchbase",
 "sourceName": "posts",
 "sourceUUID": "3fbf094e45e5e1d36fbe3c00ba08347a",
 "sourceParams": {},
 "planParams": {
  "maxPartitionsPerPIndex": 1024,
  "numReplicas": 0,
  "indexPartitions": 1
 },
 "uuid": ""
}'

echo
echo "done"
echo