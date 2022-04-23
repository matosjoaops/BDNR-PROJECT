import json
import random


def read_file(filename):
    with open("scripts/results/" + filename + ".json", "r") as file:
        return json.load(file)

    
books = read_file("books")
cars = read_file("cars")
laptops = read_file("laptops")
phones = read_file("phones")
others = read_file("others")

items = [*books, *cars, *laptops, *phones, *others]

random.shuffle(items)

users = read_file("users")
comments = read_file("comments")

for item in items:
    item["created_by"] = random.choice(users)["id"]
    num_likes = random.randint(0, 50)
    item["liked_by"] = []
    for j in range(num_likes): 
        item["liked_by"].append(random.choice(users)["id"])

    number_of_comments = random.randint(0, 20)
    item["comments"] = []
    for j in range(number_of_comments):

        comment = random.choice(comments)
        num_likes_comments = random.randint(0, 10)
        comment["liked_by"] = []
        for k in range(num_likes_comments):
            comment["liked_by"].append(random.choice(users)["id"])
        item["comments"].append(comment)


with open("scripts/results/items.json", "w") as file:
    json.dump(items, file)
