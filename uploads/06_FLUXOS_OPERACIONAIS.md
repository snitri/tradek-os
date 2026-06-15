# Fluxos Operacionais — TradeK OS

## 1. Captação e qualificação geral

```mermaid
flowchart TD
    A[Visitante acessa site TradeK] --> B{Canal de entrada}
    B --> C[Agente IA]
    B --> D[Formulário]
    B --> E[Cadastro manual admin]
    C --> F[IA identifica intenção]
    D --> G[Backend recebe formulário]
    E --> H[Admin cria lead]
    F --> I{Unidade detectada}
    G --> I
    H --> I
    I --> J[Supply Chain Finance]
    I --> K[Procurement]
    I --> L[Motos / Produtos]
    I --> M[Suporte / Outro]
    J --> N[Coleta dados específicos]
    K --> N
    L --> N
    M --> N
    N --> O[Calcula score IA]
    O --> P[Cria/atualiza lead no CRM]
    P --> Q[Gera relatório IA]
    Q --> R[Aplica regra de notificação]
    R --> S[Admin recebe aviso]
    S --> T[Admin assume oportunidade]
```

## 2. Agente IA no site

```mermaid
flowchart TD
    A[Usuário abre chat] --> B[Agente apresenta opções]
    B --> C[Usuário escolhe ou digita interesse]
    C --> D[IA classifica intenção]
    D --> E[Coleta dados de contato]
    E --> F[Coleta dados de negócio]
    F --> G{Dados mínimos completos?}
    G -->|Sim| H[Cria lead completo]
    G -->|Não| I[Cria lead parcial]
    H --> J[Calcula score]
    I --> J
    J --> K[Gera resumo]
    K --> L[Envia ao CRM]
    L --> M[Confirma recebimento ao usuário]
```

## 3. Supply Chain Finance

```mermaid
flowchart TD
    A[Lead quer importar com prazo] --> B[IA explica solução]
    B --> C[Coleta empresa, CNPJ e contato]
    C --> D[Coleta produto, fornecedor e valor FOB]
    D --> E[Verifica RADAR/Siscomex]
    E --> F[Coleta prazo desejado e status da compra]
    F --> G{Fit inicial?}
    G -->|Não| H[Status: Desqualificado ou Dados Incompletos]
    G -->|Sim| I[Status: Qualificado]
    I --> J[Admin revisa]
    J --> K{Precisa documentos?}
    K -->|Sim| L[Criar acesso cliente]
    L --> M[Solicitar checklist SCF]
    M --> N[Cliente envia documentos]
    N --> O[Admin revisa]
    O --> P{Documentos OK?}
    P -->|Não| Q[Solicitar reenvio]
    P -->|Sim| R[Em análise TradeK]
    R --> S[Aprovado para proposta]
```

## 4. Procurement

```mermaid
flowchart TD
    A[Lead busca fornecedor] --> B[IA coleta produto/categoria]
    B --> C[Coleta especificações técnicas]
    C --> D[Coleta volume, orçamento e prazo]
    D --> E[Coleta certificações e mercado destino]
    E --> F{Briefing suficiente?}
    F -->|Não| G[Status: Dados Incompletos]
    F -->|Sim| H[Status: Qualificado]
    H --> I[Gera briefing IA]
    I --> J[Admin/Procurement assume]
    J --> K[Solicita complementos se necessário]
    K --> L[Inicia busca/homologação]
    L --> M[Proposta ou plano de sourcing]
```

## 5. Motos / Produtos

```mermaid
flowchart TD
    A[Lead interessado em produto] --> B[IA identifica modelo ou categoria]
    B --> C[Coleta quantidade e região]
    C --> D[Identifica perfil comprador]
    D --> E{Tabela aprovada para IA?}
    E -->|Sim| F[Gerar cotação preliminar]
    E -->|Não| G[Registrar solicitação comercial]
    F --> H[Cria lead/proposta]
    G --> H
    H --> I[Notifica comercial]
    I --> J[Admin valida condições]
    J --> K[Envia proposta formal]
```

## 6. Status do CRM

```mermaid
stateDiagram-v2
    [*] --> NovoLead
    NovoLead --> EmQualificacaoIA
    EmQualificacaoIA --> DadosIncompletos
    EmQualificacaoIA --> Qualificado
    DadosIncompletos --> Qualificado
    DadosIncompletos --> Desqualificado
    Qualificado --> DocumentosSolicitados
    DocumentosSolicitados --> DocumentosRecebidos
    DocumentosRecebidos --> EmAnalise
    EmAnalise --> AprovadoParaProposta
    AprovadoParaProposta --> PropostaEnviada
    PropostaEnviada --> EmNegociacao
    EmNegociacao --> Ganho
    EmNegociacao --> Perdido
    Qualificado --> Desqualificado
    Perdido --> Arquivado
    Desqualificado --> Arquivado
```

## 7. Criação de usuário cliente

```mermaid
flowchart TD
    A[Admin abre lead qualificado] --> B{Precisa portal?}
    B -->|Não| C[Continuar atendimento interno]
    B -->|Sim| D[Clica Criar Acesso Cliente]
    D --> E[Confirma nome, e-mail e empresa]
    E --> F[Seleciona oportunidade]
    F --> G[Seleciona checklist]
    G --> H[Sistema cria usuário]
    H --> I[Envia convite por e-mail]
    I --> J[Cliente cria senha]
    J --> K[Cliente acessa portal]
    K --> L[Cliente envia documentos]
    L --> M[Admin recebe notificação]
```

## 8. Documentos

```mermaid
flowchart TD
    A[Admin solicita documentos] --> B[Sistema cria checklist]
    B --> C[Cliente recebe e-mail]
    C --> D[Cliente acessa portal]
    D --> E[Cliente faz upload]
    E --> F[Documento fica Enviado]
    F --> G[Admin recebe notificação]
    G --> H[Admin revisa]
    H --> I{Documento válido?}
    I -->|Sim| J[Status: Aprovado]
    I -->|Não| K[Status: Reprovado]
    K --> L[Admin informa motivo]
    L --> M[Cliente recebe reenvio solicitado]
    J --> N{Checklist completo?}
    N -->|Sim| O[Avança lead para Em Análise]
    N -->|Não| P[Mantém pendências]
```

## 9. Notificação por e-mail

```mermaid
flowchart TD
    A[Evento ocorre] --> B[Busca regra ativa]
    B --> C{Regra encontrada?}
    C -->|Não| D[Não envia]
    C -->|Sim| E[Monta destinatários]
    E --> F[Carrega template]
    F --> G[Preenche variáveis]
    G --> H{Inclui resumo IA?}
    H -->|Sim| I[Insere resumo]
    H -->|Não| J[Mensagem padrão]
    I --> K[Envia e-mail]
    J --> K
    K --> L[Registra log]
    L --> M{Falha?}
    M -->|Sim| N[Marca erro e permite reenvio]
    M -->|Não| O[Finaliza]
```

## 10. Relatório IA

```mermaid
flowchart TD
    A[Conversa ou lead atualizado] --> B[IA coleta contexto]
    B --> C[Extrai entidades]
    C --> D[Classifica unidade]
    D --> E[Identifica o que cliente quer]
    E --> F[Identifica objeções]
    F --> G[Lista dados coletados]
    G --> H[Lista dados faltantes]
    H --> I[Calcula score]
    I --> J[Sugere próxima ação]
    J --> K[Gera relatório]
    K --> L[Salva versão no CRM]
    L --> M[Disponibiliza copiar/exportar/enviar]
```

## 11. Desqualificação

```mermaid
flowchart TD
    A[Admin decide desqualificar] --> B[Sistema exige motivo]
    B --> C[Admin seleciona motivo]
    C --> D[Admin adiciona observação opcional]
    D --> E[Status vira Desqualificado]
    E --> F[Log de auditoria]
    F --> G{Notificar setor?}
    G -->|Sim| H[Dispara e-mail]
    G -->|Não| I[Finaliza]
```
