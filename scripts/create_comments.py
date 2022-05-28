import pandas as pd
import json
import random


comments_dataset = pd.read_csv("scripts/datasets/product_reviews.csv")

NUMBER_OF_COMMENTS = 1000

comments = []

with open("scripts/results/users.json", "r") as file:
    users = json.load(file)

for i in range(NUMBER_OF_COMMENTS):
    
    comment_row = comments_dataset.sample(n = 1)
    
    text = comment_row["reviews.text"].values[0]
    comment = {
        "id": str(i),
        "text": text,
        "created_by": random.choice(users)["id"]
    }

    comments.append(comment)
    
with open("scripts/results/comments.json", "w") as file:
    json.dump(comments, file)

