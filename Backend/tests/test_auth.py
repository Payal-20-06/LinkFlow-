def test_register_and_login(client):
    # Register a user
    resp = client.post(
        "/api/v1/auth/register",
        json={"name": "Tester", "email": "tester@example.com", "password": "Secret123"},
    )
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert "user" in data
    assert "id" in data["user"]

    # Login with the created user
    resp2 = client.post(
        "/api/v1/auth/login",
        json={"email": "tester@example.com", "password": "Secret123"},
    )
    assert resp2.status_code == 200
    token = resp2.json().get("access_token")
    assert token and isinstance(token, str)
