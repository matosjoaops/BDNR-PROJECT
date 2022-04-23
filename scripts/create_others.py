import pandas as pd
import random
import json
from faker import Faker
import math

fake = Faker()

products = pd.read_csv("scripts/datasets/other_items.csv")

posts = []

columns = ["Title", "Description"]

data = products[columns]

NUMBER_OF_POSTS = 1000

for i in range(NUMBER_OF_POSTS):

    others_row = products.sample(n = 1)

    purchase_date = fake.date_between(start_date="-10y", end_date="-1y")
    post_type = random.choice(["buy", "sale", "normal"])
    
    prefix_title = ""
      
    if post_type == "buy":
        prefix_title = "Buying product"
    elif post_type == "sale":
        prefix_title = "Selling product"
    else:
        prefix_title = random.choice(["I'm really happy with the product", "Reviewing the product", "Don't buy the product"]) 

    post_title = prefix_title + " " + others_row["Title"].values[0]

    picture_urls = ["url1", "url2", "url3"]

    post = {
        "timestamp": str(fake.date_between(start_date="-1y", end_date="now")),
        "post_title": post_title,
        "post_type": post_type,
        "item_type": "other",
        "description": others_row["Description"].values[0],
        "pictures": picture_urls
    }

    if (post_type == "sale"):
        post["purchase_date"] = str(purchase_date)
    
    if (type(post["description"]) == int or type(post["description"]) == float)  and math.isnan(post["description"]):
        post["description"] = ""

    price = random.randint(1, 10000)

    if post_type == "sale":
        post["price"] = price
    elif post_type == "buy":

        lowerLimitPrice = random.randint(0, 40)
        upperLimitPrice = random.randint(5, 100) + lowerLimitPrice

        post["price_range"] = [
            lowerLimitPrice, 
            upperLimitPrice
        ]

    posts.append(post)


with open("scripts/results/others.json", "w") as file:
    json.dump(posts, file)

