
#!/bin/bash

echo
echo "Importing data to Couchbase..."
echo


# Books: Create bucket and import documents.
couchbase-cli bucket-create -c http://localhost:8091 --username Administrator \
 --password bdnr-12345 --bucket books --bucket-type couchbase \
 --bucket-ramsize 1024

cbimport json --d file:///books.json --c http://localhost:8091 --u Administrator --p bdnr-12345 --b books  --f list --g book::#MONO_INCR#


# Cars: Create bucket and import documents.
couchbase-cli bucket-create -c http://localhost:8091 --username Administrator \
 --password bdnr-12345 --bucket cars --bucket-type couchbase \
 --bucket-ramsize 1024

cbimport json --d file:///cars.json --c http://localhost:8091 --u Administrator --p bdnr-12345 --b cars  --f list --g cars::#MONO_INCR#

# Comments: Create bucket and import documents.
couchbase-cli bucket-create -c http://localhost:8091 --username Administrator \
 --password bdnr-12345 --bucket comments --bucket-type couchbase \
 --bucket-ramsize 1024

cbimport json --d file:///comments.json --c http://localhost:8091 --u Administrator --p bdnr-12345 --b comments  --f list --g comments::#MONO_INCR#


# Laptops: Create bucket and import documents.
couchbase-cli bucket-create -c http://localhost:8091 --username Administrator \
 --password bdnr-12345 --bucket laptop --bucket-type couchbase \
 --bucket-ramsize 1024

cbimport json --d file:///laptop.json --c http://localhost:8091 --u Administrator --p bdnr-12345 --b laptop  --f list --g laptop::#MONO_INCR#


# Others: Create bucket and import documents.
couchbase-cli bucket-create -c http://localhost:8091 --username Administrator \
 --password bdnr-12345 --bucket others --bucket-type couchbase \
 --bucket-ramsize 1024

cbimport json --d file:///others.json --c http://localhost:8091 --u Administrator --p bdnr-12345 --b others  --f list --g others::#MONO_INCR#


# Phones: Create bucket and import documents.
couchbase-cli bucket-create -c http://localhost:8091 --username Administrator \
 --password bdnr-12345 --bucket phones --bucket-type couchbase \
 --bucket-ramsize 1024

cbimport json --d file:///phones.json --c http://localhost:8091 --u Administrator --p bdnr-12345 --b phones  --f list --g phones::#MONO_INCR#


# Posts: Create bucket and import documents.
couchbase-cli bucket-create -c http://localhost:8091 --username Administrator \
 --password bdnr-12345 --bucket posts --bucket-type couchbase \
 --bucket-ramsize 1024

cbimport json --d file:///posts.json --c http://localhost:8091 --u Administrator --p bdnr-12345 --b phones  --f list --g posts::#MONO_INCR#