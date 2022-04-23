import math
from numpy import NaN
import pandas as pd
import random
import json
from faker import Faker

fake = Faker()

phones = pd.read_csv("scripts/datasets/phones.csv")
phones["NFC"].fillna("No", inplace=True)
phones["Chipset"].fillna("n/a", inplace=True)
phones["RAM"].fillna("n/a", inplace=True)
phones["internal_memory"].fillna("n/a", inplace=True)
phones["primary_camera"].fillna("n/a", inplace=True)
phones["display_size"].fillna("n/a", inplace=True)
phones["battery"].fillna("n/a", inplace=True)

posts = []

columns = ["model", "brand", "Chipset", "RAM", "internal_memory", "display_size", "primary_camera", "battery", "NFC"]

NUMBER_OF_POSTS = 1000

for i in range(NUMBER_OF_POSTS):
    phones_row = phones.sample(n = 1)

    timestamp = fake.date_between(start_date="-1y", end_date="now")
    purchase_date = fake.date_between(start_date="-10y", end_date="-1y")
    post_type = random.choice(["buy", "sale", "normal"])

    if post_type == "buy":
        prefix_title = "Buying phone"
    elif post_type == "sale":
        prefix_title = "Selling phone"
    else:
        prefix_title = random.choice(["I'm really happy with the phone", "Reviewing the phone", "Don't buy the phone"]) 

    post_title = prefix_title + " " + phones_row["brand"].values[0] + " " + phones_row["model"].values[0]

    post = {
        "post_title": post_title,
        "timestamp": str(timestamp),
        "post_type": post_type,
        "item_type": "phone",
        "model": phones_row["model"].values[0],
        "brand": phones_row["brand"].values[0],
        "chipset": phones_row["Chipset"].values[0],
        "ram": phones_row["RAM"].values[0],
        "internal_memory": phones_row["internal_memory"].values[0],
        "display_size": phones_row["display_size"].values[0],
        "primary_camera": phones_row["primary_camera"].values[0],
        "battery": phones_row["battery"].values[0],
        "nfc": phones_row["NFC"].values[0]
    }

    if (post_type == "sale"):
        post["purchase_date"] = str(purchase_date)

    if post_type == "normal":
        if prefix_title == "I'm really happy with the phone":
            description = "This item is really great! I really recommend that you give it a try!"
        elif prefix_title == "Don't buy the phone":
            description = "I hate this product, never trust this seller again!"
        else:
            description = random.choice([
                "Great battery life! Great screen! Normal sound quality! Overall it's a good product.",
                "I'm really disappointed with this! The screen is too small, things are very slow, and I don't have any space for files!"
            ])

        post["description"] = description

    price = phones_row["approx_price_EUR"].values[0]

    if math.isnan(price):
        rand_price = random.randint(0,1000)
        if post_type == "sale":
            post["price"] = rand_price
        elif post_type == "buy":
            post["price_range"] = [
                rand_price - random.randint(0, 300), 
                rand_price + random.randint(0, 300)
            ]
    else:
        if post_type == "sale":
            post["price"] = int(price)
        elif post_type == "buy":
            post["price_range"] = [
                int(price) - random.randint(0, 300), 
                int(price) + random.randint(0, 300)
            ]
    
    if post_type == "buy" and post["price_range"][0] < 0:
        post["price_range"][0] = 0

    posts.append(post)

with open("scripts/results/phones.json", "w") as file:
    json.dump(posts, file)
