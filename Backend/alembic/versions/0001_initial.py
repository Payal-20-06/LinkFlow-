"""initial migration

Revision ID: 0001_initial
Revises: 
Create Date: 2026-06-18 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('1')),
        sa.Column('auth_provider', sa.String(length=20), nullable=False, server_default=sa.text("'local'")),
        sa.Column('google_id', sa.String(length=255), nullable=True, unique=True),
        sa.Column('plan', sa.String(length=50), nullable=False, server_default=sa.text("'Free'")),
        sa.Column('company', sa.String(length=100), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('bio', sa.String(length=500), nullable=True),
        sa.Column('avatar', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        'urls',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('original_url', sa.String(length=2048), nullable=False),
        sa.Column('short_code', sa.String(length=20), nullable=False, unique=True),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('clicks', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('1')),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index(op.f('ix_urls_user_id'), 'urls', ['user_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_urls_user_id'), table_name='urls')
    op.drop_table('urls')
    op.drop_table('users')
