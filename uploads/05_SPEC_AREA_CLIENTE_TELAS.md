# SPEC de Telas — Área do Cliente

## 1. Objetivo

A área do cliente permite que um lead qualificado continue o processo com segurança, enviando documentos, preenchendo ficha cadastral, recebendo solicitações e conversando com a equipe TradeK.

## 2. Princípios

- Cliente vê apenas seus próprios dados.
- Cliente não vê score interno.
- Cliente não vê comentários internos.
- Cliente não vê riscos comerciais ou análise financeira interna.
- Cliente tem uma visão simples: status, pendências, documentos e mensagens.
- Toda ação do cliente gera registro no admin.

## 3. CLI-01 — Login do Cliente

### Componentes

- Logo TradeK.
- E-mail.
- Senha.
- Entrar.
- Esqueci senha.
- Link para criar senha via convite.
- Política de privacidade.

### Regras

- Convite pode expirar.
- Primeiro acesso pode exigir troca de senha.
- Usuário bloqueado não entra.
- Tentativas inválidas geram log.

## 4. CLI-02 — Primeiro Acesso

### Fluxo

```text
Cliente clica no link
↓
Sistema valida token
↓
Cliente cria senha
↓
Aceita termos
↓
Acessa dashboard
```

### Campos

- Nova senha.
- Confirmar senha.
- Aceite de termos.
- Aceite de política de privacidade.

## 5. CLI-03 — Dashboard do Cliente

### Objetivo

Mostrar estado geral da solicitação.

### Componentes

- Saudação.
- Oportunidade principal.
- Status atual.
- Próximo passo.
- Documentos pendentes.
- Mensagens recentes.
- Botões de ação.

### Exemplo

```text
Olá, João.

Sua solicitação:
Supply Chain Finance — Importação da China

Status:
Documentos solicitados

Próximo passo:
Envie os documentos pendentes para análise.

Pendências:
[ ] Contrato Social
[ ] Cartão CNPJ
[ ] Comprovante de Endereço
[ ] RG/CPF Representante Legal
```

## 6. CLI-04 — Minhas Oportunidades

### Lista

- Unidade.
- Produto/serviço.
- Status.
- Última atualização.
- Próxima ação.
- Botão abrir.

### Status simplificados

| Status interno | Status visível ao cliente |
|---|---|
| Novo Lead | Solicitação recebida |
| Em Qualificação IA | Em triagem |
| Dados Incompletos | Aguardando informações |
| Qualificado | Em preparação |
| Documentos Solicitados | Documentos solicitados |
| Documentos Recebidos | Documentos recebidos |
| Em Análise | Em análise |
| Proposta Enviada | Proposta enviada |
| Em Negociação | Em negociação |
| Ganho | Concluído |
| Perdido/Desqualificado | Encerrado |

## 7. CLI-05 — Detalhe da Oportunidade

### Componentes

- Unidade.
- Status.
- Próximo passo.
- Dados principais.
- Checklist.
- Chat.
- Histórico simplificado.

### Dados exibidos

- Nome da empresa.
- CNPJ.
- Contato.
- Unidade.
- Produto/serviço.
- Prazo informado.
- Documentos pendentes.
- Mensagens.

### Dados ocultos

- Score IA.
- Classificação interna.
- Comentários internos.
- Motivos de risco.
- Parecer de análise.
- E-mails internos.
- Outros clientes.

## 8. CLI-06 — Checklist de Documentos

### Item do checklist

- Nome do documento.
- Status.
- Descrição.
- Formatos aceitos.
- Botão enviar.
- Histórico de versões.
- Motivo de reprovação, se houver.

### Status

- Pendente.
- Enviado.
- Em revisão.
- Aprovado.
- Reprovado.
- Reenvio solicitado.

### Regras

- Cliente pode reenviar documento reprovado.
- Documento aprovado não deve ser substituído sem autorização.
- Cada upload notifica admin.
- Admin vê versões anteriores.
- Upload deve ter limite de tamanho e tipo.

## 9. CLI-07 — Upload de Documentos

### Campos

- Tipo de documento.
- Arquivo.
- Observação opcional.
- Confirmação de envio.

### Tipos aceitos

- PDF.
- JPG.
- PNG.
- DOCX.
- XLSX.

### Regras

- Validar extensão.
- Validar tamanho.
- Gerar hash/registro do arquivo.
- Salvar data/hora.
- Atualizar status.
- Notificar e-mails configurados.

## 10. CLI-08 — Ficha Cadastral

### Seções

1. Dados da empresa.
2. Importações.
3. Endereço comercial.
4. Contato.
5. Representante legal.
6. Dados bancários.
7. Referências comerciais.

### Funcionalidades

- Salvar rascunho.
- Enviar para análise.
- Validação de obrigatórios.
- Máscara de CNPJ, CPF, CEP e telefone.
- Campo “não se aplica” quando permitido.

### Campos principais

#### Dados da empresa

- Razão social.
- Nome fantasia.
- CNPJ.
- Inscrição estadual.
- Inscrição municipal.
- Data de fundação.
- CNAE principal.
- CNAE secundário.

#### Importações

- Possui RADAR?
- Tipo de RADAR.
- Média de importações.
- Produtos importados.
- Países de origem.

#### Endereço

- Rua/avenida.
- Número.
- Complemento.
- Bairro.
- Cidade.
- Estado.
- CEP.

#### Contato

- Telefone fixo.
- Celular/WhatsApp.
- E-mail principal.
- E-mail secundário.
- Site.

#### Representante legal

- Nome.
- CPF.
- Cargo.
- E-mail.
- Telefone.

#### Dados bancários

- Banco principal.
- Agência.
- Conta.
- Tempo de conta.
- Banco secundário.
- Agência.
- Conta.
- Tempo de conta.

#### Referências comerciais

- Empresa 1.
- Telefone 1.
- Empresa 2.
- Telefone 2.

## 11. CLI-09 — Chat com TradeK

### Funcionalidades

- Enviar mensagem.
- Anexar arquivo.
- Ver resposta.
- Receber notificação.
- Ver histórico.
- Marcar como resolvido.

### Regras

- Cliente não vê comentários internos.
- Admin pode transformar mensagem em tarefa.
- Admin pode vincular documento enviado pelo chat ao checklist.

## 12. CLI-10 — Notificações

### Eventos exibidos

- Documento solicitado.
- Documento enviado.
- Documento aprovado.
- Documento reprovado.
- Nova mensagem.
- Status alterado.
- Proposta enviada.
- Pendência criada.

### Campos

- Data/hora.
- Tipo.
- Mensagem.
- Link relacionado.
- Lida/não lida.

## 13. CLI-11 — Perfil e Segurança

### Funcionalidades

- Alterar senha.
- Atualizar telefone.
- Ver e-mail de acesso.
- Sair.
- Solicitar suporte.
- Solicitar exclusão/privacidade, se aplicável.
