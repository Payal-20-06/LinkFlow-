import requests

# 1. Register/Login
print("Logging in...")
res = requests.post("http://localhost:8000/api/v1/auth/login", json={
    "email": "test@example.com",
    "password": "Password123"
})
if res.status_code != 200:
    print("Login failed, trying register...")
    res = requests.post("http://localhost:8000/api/v1/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "Password123"
    })
    if res.status_code != 200:
        print("Register failed:", res.text)
        exit(1)

data = res.json()
token = data.get("access_token")
print("Got token:", token)

# 2. Setup 2FA
print("Setting up 2FA...")
res = requests.post("http://localhost:8000/api/v1/auth/2fa/setup", headers={
    "Authorization": f"Bearer {token}"
})
print("Setup 2FA Status:", res.status_code)
print("Setup 2FA Response:", res.text)
