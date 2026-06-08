import requests

payload = {
  "job_id": "JOB-123",
  "budget": 15000,
  "inputs": {
    "csv_sales_data": "Transaction_ID,Timestamp,Product_Line,Gross_Amount_PKR,Payment_Method,Outlet_Location\nTXN-2026-9901,2026-05-24 14:32:00,Premium Bridal Stilettos,18500,Cash,Dolmen Mall Clifton",
    "pdf_report": "Inventory Stock Status: 8500 units\nMarketing Monthly Spend: PKR 150000",
    "news_text": "Customer Leads synced: Manual list pasted.\nSocial Reviews sentiment log: - @Zoya_Khan99 (Instagram): Just bought...",
    "social_posts": "- @Zoya_Khan99 (Instagram): Just bought...",
    "web_url": "https://insightflow.ai"
  },
  "business_knowledge_level": "beginner",
  "business_name": "Sandbox Brand",
  "brand_color": "#0A84FF"
}

try:
    response = requests.post("http://localhost:8000/api/analyze", json=payload)
    print("STATUS CODE:", response.status_code)
    print("RESPONSE HEADERS:", response.headers)
    print("RESPONSE BODY:", response.text[:200])
except Exception as e:
    print("EXCEPTION:", e)
