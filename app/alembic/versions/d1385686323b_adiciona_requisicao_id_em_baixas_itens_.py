from alembic import op
import sqlalchemy as sa

# Revisão e identificação da migration
revision = 'd1385686323b'
down_revision = 'bdcf18bda823'  # Substitua pelo ID da migration anterior
branch_labels = None
depends_on = None

def upgrade():
    # 1. Adiciona a coluna como nullable inicialmente
    op.add_column('baixas_itens_requisicao', 
        sa.Column('requisicao_id', sa.Integer(), nullable=True)
    )
    
    # 2. Atualiza os registros existentes:
    op.execute("""
        UPDATE baixas_itens_requisicao AS b
        SET requisicao_id = i.requisicao_id
        FROM itens_requisicao AS i
        WHERE b.item_requisicao_id = i.id;
    """)

    # 3. Altera a coluna para NOT NULL
    op.alter_column('baixas_itens_requisicao', 'requisicao_id', nullable=False)

def downgrade():
    op.drop_column('baixas_itens_requisicao', 'requisicao_id')
