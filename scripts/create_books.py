import pandas as pd
import random
import json
from faker import Faker

fake = Faker()

books = pd.read_csv("scripts/datasets/books.csv", on_bad_lines='skip', sep = ';',  dtype={'Year-Of-Publication': 'str'})

posts = []

columns = ["Book-Title", "Book-Author", "Year-Of-Publication", "Publisher", "ISBN", "Image-URL-S"]

data = books[columns]

NUMBER_OF_POSTS = 1000

for i in range(NUMBER_OF_POSTS):

    book_row = books.sample(n = 1)

    purchase_date = fake.date_between(start_date="-10y", end_date="-1y")
    post_type = random.choice(["buy", "sale", "normal"])
    
    prefix_title = ""
      
    if post_type == "buy":
        prefix_title = "Buying book"
    elif post_type == "sale":
        prefix_title = "Selling book"
    else:
        prefix_title = random.choice(["I'm really happy with the book", "Reviewing the book", "Don't buy the book"]) 

    post_title = prefix_title + " " + book_row["Book-Title"].values[0] + " by " + book_row["Book-Author"].values[0]

    picture_urls = ["url1", "url2", "url3"]

    post = {
        "timestamp": str(fake.date_between(start_date="-1y", end_date="now")),
        "post_title": post_title,
        "post_type": post_type,
        "item_type": "book",
        "authors": book_row["Book-Author"].values[0],
        "title": book_row["Book-Title"].values[0],
        "year_of_publication": int(book_row["Year-Of-Publication"].values[0]),
        "isbn": book_row["ISBN"].values[0],
        "publisher": book_row["Publisher"].values[0],
        "number_of_pages": random.randint(125, 1100),
        "pictures": picture_urls
    }

    if (post_type == "sale"):
        post["purchase_date"] = str(purchase_date)

    if post_type == "normal":
        if prefix_title == "I'm really happy with the book":
            description = "This reading was really great! I really recommend that you give it a try!"
        elif prefix_title == "Don't buy the book":
            description = "I hate this book, very bad piece of literature!"
        else:
            description = random.choice([
                "The edition is lovely, pages are yellow and the font is nice. The plot was very interesting and refreshing.",
                "I'm really disappointed with this book! The plot concept was interesting, but I think that the author was not able to deliver it."
            ])

        post["description"] = description
        
    price = random.randint(5, 40)

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


with open("scripts/results/books.json", "w") as file:
    json.dump(posts, file)

