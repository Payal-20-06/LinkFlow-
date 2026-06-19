import sqlite3

db_path = r'linkflow.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print('Tables:', tables)

    cursor.execute("SELECT * FROM urls WHERE short_code='test-db'")
    row = cursor.fetchone()
    if row:
        print('Found test-db:', row)
    else:
        print('test-db not found in urls table')

    cursor.execute("SELECT short_code, original_url, is_active FROM urls LIMIT 5")
    print('Sample rows:', cursor.fetchall())
except Exception as e:
    print('Error:', e)
finally:
    conn.close()
