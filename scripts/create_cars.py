import pandas as pd
import random
import json
from faker import Faker

fake = Faker()

cars_dataframe = pd.read_csv("scripts/datasets/cars.csv")

posts = []

columns = ["name", "year", "selling_price", "km_driven", "fuel", "transmission", "owner"]

data = cars_dataframe[columns]

NUMBER_OF_POSTS = 1000

for i in range(NUMBER_OF_POSTS):
    cars_row = cars_dataframe.sample(n = 1)

    purchase_date = fake.date_between(start_date="-20y", end_date="now")
    post_type = random.choice(["buy", "sale", "normal"])
    
    prefix_title = ""
      
    if post_type == "buy":
        prefix_title = "Buying car"
    elif post_type == "sale":
        prefix_title = "Selling car"
    else:
        prefix_title = random.choice(["I'm really happy with the car", "Reviewing the car", "Don't buy the car"]) 

    post_title = prefix_title + " " + cars_row["name"].values[0]

    post = {
        "post_title": post_title,
        "post_type": post_type,
        "item_type": "car",
        "year": min(int(cars_row["year"].values[0]), purchase_date.year),
        "km_driven": int(cars_row["km_driven"].values[0]),
        "fuel": cars_row["fuel"].values[0],
        "transmission": cars_row["transmission"].values[0],
        "owner": cars_row["owner"].values[0]
    }

    if (post_type != "normal"):
        post["purchase_date"] = str(purchase_date)

    if post_type == "normal":
        if prefix_title == "I'm really happy with the car":
            description = "This car is really great! I really recommend that you give it a try!"
        elif prefix_title == "Don't buy the car":
            description = "I hate this car, never trust this seller again!"
        else:
            description = random.choice([
                "Great autonomy! Great design! Overall it's a good car.",
                "I'm really disappointed with this! The autonomy is too low, the car is very slow, and I don't like the design!"
            ])

        post["description"] = description
        
    price = int(cars_row["selling_price"].values[0])

    if post_type == "sale":
        post["price"] = price
    elif post_type == "buy":
        post["price_range"] = [
            price - random.randint(0, 300), 
            price + random.randint(0, 300)
        ]

    posts.append(post)


with open("scripts/results/cars.json", "w") as file:
    json.dump(posts, file)