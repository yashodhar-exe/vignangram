import requests
import sys

token = "1be2ea8110eeefbf25469cd068960310"
url = "https://sandbox.api.mailtrap.io/api/accounts"
headers = {
    "Api-Token": token
}
response = requests.get(url, headers=headers)
print("Accounts:", response.status_code, response.text)
