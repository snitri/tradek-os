-- Corrige leads com status 'qualificado' (legado) que não têm coluna no Kanban
-- Mapeia para 'pronto_atendimento' que é o equivalente pós-migration
update tradek.leads set status = 'pronto_atendimento' where status = 'qualificado';
