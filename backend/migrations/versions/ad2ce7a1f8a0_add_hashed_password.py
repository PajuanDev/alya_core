"""add hashed_password column to users"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'ad2ce7a1f8a0'
down_revision: Union[str, None] = '6f2132b417b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('hashed_password', sa.String(), nullable=False, server_default=''))
    op.alter_column('users', 'hashed_password', server_default=None)


def downgrade() -> None:
    op.drop_column('users', 'hashed_password')
