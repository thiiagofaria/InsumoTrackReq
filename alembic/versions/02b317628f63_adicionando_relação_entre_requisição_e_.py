"""Adicionando relação entre requisição e itens

Revision ID: 02b317628f63
Revises: ea93823f46c5
Create Date: 2025-02-12 10:46:44.775532

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '02b317628f63'
down_revision: Union[str, None] = 'ea93823f46c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
