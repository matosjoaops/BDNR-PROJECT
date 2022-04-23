import pandas as pd
import random
import json
from faker import Faker

fake = Faker()

laptops = pd.read_csv("scripts/datasets/laptops.csv")

posts = []

columns = ["Operating System", "Manufacturer", "CPU", "RAM", "Storage", "GPU", "Screen Size", "Model Name", "Screen", "Price (Euros)"]

data = laptops[columns]

NUMBER_OF_POSTS = 1000

for i in range(NUMBER_OF_POSTS):
    laptops_row = laptops.sample(n = 1)

    timestamp = fake.date_between(start_date="-10y", end_date="now")
    post_type = random.choice(["buy", "sale", "normal"])
    
    prefix_title = ""
      
    if post_type == "buy":
        prefix_title = "Buying laptop"
    elif post_type == "sale":
        prefix_title = "Selling laptop"
    else:
        prefix_title = random.choice(["I'm really happy with the laptop", "Reviewing the laptop", "Don't buy the laptop"]) 

    post_title = prefix_title + " " + laptops_row["Manufacturer"].values[0] + " " + laptops_row["Model Name"].values[0]

    post = {
        "post_title": post_title,
        "timestamp": str(timestamp),
        "post_type": post_type,
        "operating_system": laptops_row["Operating System"].values[0],
        "manufacturer": laptops_row["Manufacturer"].values[0],
        "cpu": laptops_row["CPU"].values[0],
        "ram": laptops_row["RAM"].values[0],
        "storage": laptops_row["Storage"].values[0],
        "screen_size": laptops_row["Screen Size"].values[0],
        "model": laptops_row["Model Name"].values[0],
        "screen": laptops_row["Screen"].values[0],
        "gpu": laptops_row["GPU"].values[0]
    }

    if post_type == "normal":
        if prefix_title == "I'm really happy with the laptop":
            description = "This item is really great! I really recommend that you give it a try!"
        elif prefix_title == "Don't buy the laptop":
            description = "I hate this product, never trust this seller again!"
        else:
            description = random.choice([
                "Great battery life! Great screen! Normal sound quality! Overall it's a good product.",
                "I'm really disappointed with this! The screen is too small, things are very slow, and I don't have any space for files!"
            ])

        post["description"] = description
        
    price = int(float(laptops_row["Price (Euros)"].values[0].replace(',', '.')))

    if post_type == "sale":
        post["price"] = price
    elif post_type == "buy":
        post["price_range"] = [
            price - random.randint(0, 300), 
            price + random.randint(0, 300)
        ]

    posts.append(post)


with open("scripts/results/laptops.json", "w") as file:
    json.dump(posts, file)