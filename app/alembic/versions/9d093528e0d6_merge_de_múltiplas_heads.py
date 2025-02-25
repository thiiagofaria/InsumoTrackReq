"""Merge de múltiplas heads

Revision ID: 9d093528e0d6
Revises: 49e38ff307b1, d1385686323b
Create Date: 2025-02-13 16:59:05.261491

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9d093528e0d6'
down_revision: Union[str, None] = ('49e38ff307b1', 'd1385686323b')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
