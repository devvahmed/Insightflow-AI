import requests

try:
    response = requests.options("http://localhost:8000/api/analyze", headers={"Origin": "http://localhost:8081", "Access-Control-Request-Method": "POST"})
    print("OPTIONS STATUS CODE:", response.status_code)
    print("OPTIONS HEADERS:", response.headers)
except Exception as e:
    print("EXCEPTION:", e)
