def test_get_activities_returns_all_activities(client):
    # Arrange
    expected_activity_count = 9

    # Act
    response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == expected_activity_count
    assert "Chess Club" in payload


def test_root_redirects_to_static_index(client):
    # Arrange
    redirect_target = "/static/index.html"

    # Act
    response = client.get("/", follow_redirects=False)

    # Assert
    assert response.status_code == 307
    assert response.headers["location"] == redirect_target