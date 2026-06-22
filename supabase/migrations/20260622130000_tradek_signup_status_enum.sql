-- Passo 1: novos status do fluxo de autocadastro no Portal do Cliente
-- (precisa estar em migration própria — ALTER TYPE ... ADD VALUE não pode
-- ser usado na mesma transação em que o valor é referenciado).
alter type tradek.lead_status add value if not exists 'lead_qualificado';
alter type tradek.lead_status add value if not exists 'lead_pendente_consulta';
