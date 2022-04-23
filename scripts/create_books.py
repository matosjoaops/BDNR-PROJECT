import pandas as pd
import datetime
import random
from faker import Faker

books = pd.read_csv("scripts/datasets/books.csv")

print(books.columns)

posts = []

columns = ["Book-Title", "Book-Author", "Year-Of-Publication", "Publisher", "ISBN"]

# TO DO: Gerar aleatoriamente numero de paginas.

data = books[columns]

NUMBER_OF_BOOKS = 5000

