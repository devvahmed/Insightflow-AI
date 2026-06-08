import requests

payload = {
  "job_id": "JOB-999",
  "budget": "15000",
  "inputs": {
    "csv_sales_data": "Week,Sales\n1,400\n2,380",
    "pdf_report": "Inventory Stock Status: 8500 units\nMarketing Monthly Spend: PKR 150000",
    "news_text": "Customer Leads synced: Manual list pasted.",
    "social_posts": "General brand reputation stable in Clifton & DHA.",
    "web_url": "https://sapphireonline.pk"
  },
  "business_knowledge_level": "beginner",
  "business_name": "SAPPHIRE",
  "brand_color": "#2A2A72"
}

try:
    response = requests.post("http://localhost:8000/api/analyze", json=payload)
    print("STATUS CODE:", response.status_code)
    if response.status_code != 200:
        print("ERROR BODY:", response.text)
    else:
        print("SUCCESS")
except Exception as e:
    print("EXCEPTION:", e)
