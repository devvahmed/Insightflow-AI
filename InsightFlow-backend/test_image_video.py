import requests
import json
import time
import os

BASE = 'http://localhost:8000'

# Step 1: Login
print('=== LOGIN ===')
r = requests.post(f'{BASE}/api/login', data={'email': 'testuser@example.com', 'password': 'Test@1234'})
print(f'Status: {r.status_code}')
data = r.json()
token = data['token']
print(f'Token OK: {token[:30]}...')

headers = {'Authorization': f'Bearer {token}'}

# Step 2: Generate Ad Image
print()
print('=== IMAGE GENERATION TEST (Instagram) ===')
start = time.time()
r2 = requests.post(
    f'{BASE}/api/generate-ad-image',
    headers=headers,
    data={'campaign_id': 'test-campaign-001', 'platform': 'instagram'}
)
elapsed = round(time.time() - start, 1)
print(f'Status: {r2.status_code} ({elapsed}s)')
img_resp = r2.json()
print(json.dumps(img_resp, indent=2))

# Verify image file actually exists
image_path = img_resp.get('image_url', '')
if image_path.startswith('/uploads/'):
    local_path = os.path.join('uploads', os.path.basename(image_path))
    exists = os.path.exists(local_path)
    size = os.path.getsize(local_path) if exists else 0
    print(f'\nLocal file exists: {exists} | Size: {size} bytes | Path: {local_path}')

# Step 3: Generate Ad Video
print()
print('=== VIDEO GENERATION TEST ===')
start2 = time.time()
r3 = requests.post(
    f'{BASE}/api/generate-ad-video',
    headers=headers,
    data={'campaign_id': 'test-campaign-001'}
)
elapsed2 = round(time.time() - start2, 1)
print(f'Status: {r3.status_code} ({elapsed2}s)')
vid_resp = r3.json()
print(json.dumps(vid_resp, indent=2))

# Verify video file exists
video_path = vid_resp.get('video_url', '')
if video_path.startswith('/uploads/'):
    local_vid = os.path.join('uploads', os.path.basename(video_path))
    exists_v = os.path.exists(local_vid)
    size_v = os.path.getsize(local_vid) if exists_v else 0
    print(f'\nVideo file exists: {exists_v} | Size: {size_v} bytes | Path: {local_vid}')

print()
print('=== DONE ===')
