import json
import random

with open("scripts/results/users_first_time.json", "r") as file:
    users = json.load(file)

for user in users:
    num_followers = random.randint(0, 10)
    num_following = random.randint(0, 10)

    user["following"] = []

    for i in range(num_following):
        following_id = random.choice(users)["id"]
        while following_id == user["id"]:
            following_id = random.choice(users)["id"]
        user["following"].append(following_id)

    user["followers"] = []
    for i in range(num_followers):
        follower_id = random.choice(users)["id"]
        while follower_id == user["id"]:
            follower_id = random.choice(users)["id"]
        user["followers"].append(follower_id)

with open("scripts/results/users.json", "w") as file:
    json.dump(users, file)
