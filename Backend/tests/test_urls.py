def test_create_and_redirect(client):
    # Register and login
    r = client.post(
        "/api/v1/auth/register",
        json={"name": "U", "email": "u@example.com", "password": "Secret123"},
    )
    assert r.status_code in (200, 201)

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "u@example.com", "password": "Secret123"},
    )
    assert login.status_code == 200
    token = login.json().get("access_token")
    assert token

    headers = {"Authorization": f"Bearer {token}"}
    create = client.post(
        "/api/v1/urls",
        json={"original_url": "https://example.com"},
        headers=headers,
    )
    assert create.status_code == 201
    data = create.json()
    assert "short_code" in data

    short_code = data["short_code"]
    r2 = client.get(f"/{short_code}", follow_redirects=False)
    assert r2.status_code == 302
    assert r2.headers.get("location").rstrip("/") == "https://example.com"
