import sqlite3

try:
    conn = sqlite3.connect('linkflow.db')
    conn.execute('ALTER TABLE users ADD COLUMN is_2fa_enabled BOOLEAN NOT NULL DEFAULT 0')
    conn.execute('ALTER TABLE users ADD COLUMN totp_secret VARCHAR(32)')
    conn.commit()
    print("Columns added successfully")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Columns already exist")
    else:
        raise
finally:
    conn.close()
