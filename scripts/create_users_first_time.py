from faker import Faker
import json
import random
import uuid
from os.path import exists
import sys

file_exists = exists("scripts/results/users_first_time.json")

if file_exists
    sys.exit(0)

faker = Faker()

NUMBER_OF_USERS = 1000

users = []

for i in range(NUMBER_OF_USERS):
    username = faker.profile(fields=['username'])['username']
    name = faker.name()
    color = faker.color_name()
    city = faker.city()
    job = faker.job()
    contact = faker.phone_number()

    gender = 'M' if random.randint(0,1) == 0 else 'F'
    possessive_pronoun = "Her" if gender == "F" else "His"
    personal_pronoun = "She" if gender == "F" else "He"

    bio = '{} name is {}. {} lives in {}. {} favorite color is {}. {} works as a {}'.format(
        possessive_pronoun,
        name,
        personal_pronoun,
        city,
        possessive_pronoun,
        color,
        personal_pronoun,
        job
    )

    user = {
        "id": str(uuid.uuid4()),
        "username": username,
        "name": name,
        "bio": bio,
        "city": city,
        "contact": contact
    }

    users.append(user)


with open("scripts/results/users_first_time.json", "w") as file:
    json.dump(users, file)
