
#!/bin/bash

echo
echo "Importing data to Couchbase..."
echo

cbimport json --dataset file://./scripts/results/books.json --cluster couchbase://localhost --username Administrator --password password --bucket marketplace --scope-collection-exp marketplace.books --f list
