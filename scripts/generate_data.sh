#!/bin/bash

echo
echo "Generating data..."
echo

# Create users
python3 scripts/create_users_first_time.py
python3 scripts/create_users.py

# Create comments
python3 scripts/create_comments.py

# Create items
python3 scripts/create_books.py
python3 scripts/create_cars.py
python3 scripts/create_laptops.py
python3 scripts/create_others.py
python3 scripts/create_phones.py
python3 scripts/merge_posts.py

# Copy and format final files
cat scripts/results/users.json | jq . > scripts/results/final/users.json
cat scripts/results/posts.json | jq . > scripts/results/final/posts.json

echo
echo "Data generated!"
echo
