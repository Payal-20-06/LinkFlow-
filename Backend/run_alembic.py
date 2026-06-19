import sys
from alembic.config import main

if __name__ == "__main__":
    if len(sys.argv) > 1:
        sys.argv[0] = "alembic"
        main()
