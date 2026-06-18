export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  tradek: {
    Tables: {
      agent_configs: {
        Row: {
          ativo: boolean
          avatar: string | null
          campos_saida: Json
          checklist_id: string | null
          created_at: string
          guardrails: string | null
          id: string
          mensagem_inicial: string | null
          nome: string
          perguntas_condicionais: Json
          perguntas_obrigatorias: Json
          produtos_consultaveis: boolean
          prompt: string | null
          score_minimo: number
          status_inicial: Database["tradek"]["Enums"]["lead_status"]
          unidade: Database["tradek"]["Enums"]["unidade"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avatar?: string | null
          campos_saida?: Json
          checklist_id?: string | null
          created_at?: string
          guardrails?: string | null
          id?: string
          mensagem_inicial?: string | null
          nome: string
          perguntas_condicionais?: Json
          perguntas_obrigatorias?: Json
          produtos_consultaveis?: boolean
          prompt?: string | null
          score_minimo?: number
          status_inicial?: Database["tradek"]["Enums"]["lead_status"]
          unidade?: Database["tradek"]["Enums"]["unidade"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avatar?: string | null
          campos_saida?: Json
          checklist_id?: string | null
          created_at?: string
          guardrails?: string | null
          id?: string
          mensagem_inicial?: string | null
          nome?: string
          perguntas_condicionais?: Json
          perguntas_obrigatorias?: Json
          produtos_consultaveis?: boolean
          prompt?: string | null
          score_minimo?: number
          status_inicial?: Database["tradek"]["Enums"]["lead_status"]
          unidade?: Database["tradek"]["Enums"]["unidade"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_configs_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          acao: string
          created_at: string
          entidade: string | null
          entidade_id: string | null
          id: string
          ip: string | null
          origem: string | null
          usuario_id: string | null
          valor_anterior: Json | null
          valor_novo: Json | null
        }
        Insert: {
          acao: string
          created_at?: string
          entidade?: string | null
          entidade_id?: string | null
          id?: string
          ip?: string | null
          origem?: string | null
          usuario_id?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
        }
        Update: {
          acao?: string
          created_at?: string
          entidade?: string | null
          entidade_id?: string | null
          id?: string
          ip?: string | null
          origem?: string | null
          usuario_id?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          checklist_id: string
          created_at: string
          descricao: string | null
          formatos_aceitos: string[]
          id: string
          obrigatorio: boolean
          ordem: number
          tipo_documento: string
        }
        Insert: {
          checklist_id: string
          created_at?: string
          descricao?: string | null
          formatos_aceitos?: string[]
          id?: string
          obrigatorio?: boolean
          ordem?: number
          tipo_documento: string
        }
        Update: {
          checklist_id?: string
          created_at?: string
          descricao?: string | null
          formatos_aceitos?: string[]
          id?: string
          obrigatorio?: boolean
          ordem?: number
          tipo_documento?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          unidade: Database["tradek"]["Enums"]["unidade"] | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          unidade?: Database["tradek"]["Enums"]["unidade"] | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          unidade?: Database["tradek"]["Enums"]["unidade"] | null
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          anonimizado: boolean
          anonimizado_em: string | null
          cnae_principal: string | null
          cnae_secundario: string | null
          cnpj: string | null
          created_at: string
          data_fundacao: string | null
          endereco: Json
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          media_importacoes: string | null
          nome_fantasia: string | null
          observacoes: string | null
          possui_radar: boolean | null
          razao_social: string | null
          site: string | null
          tipo_radar: string | null
          updated_at: string
        }
        Insert: {
          anonimizado?: boolean
          anonimizado_em?: string | null
          cnae_principal?: string | null
          cnae_secundario?: string | null
          cnpj?: string | null
          created_at?: string
          data_fundacao?: string | null
          endereco?: Json
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          media_importacoes?: string | null
          nome_fantasia?: string | null
          observacoes?: string | null
          possui_radar?: boolean | null
          razao_social?: string | null
          site?: string | null
          tipo_radar?: string | null
          updated_at?: string
        }
        Update: {
          anonimizado?: boolean
          anonimizado_em?: string | null
          cnae_principal?: string | null
          cnae_secundario?: string | null
          cnpj?: string | null
          created_at?: string
          data_fundacao?: string | null
          endereco?: Json
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          media_importacoes?: string | null
          nome_fantasia?: string | null
          observacoes?: string | null
          possui_radar?: boolean | null
          razao_social?: string | null
          site?: string | null
          tipo_radar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          cargo: string | null
          company_id: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          principal: boolean
          telefone: string | null
          tipo: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          cargo?: string | null
          company_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          principal?: boolean
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          cargo?: string | null
          company_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          principal?: boolean
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          role: string
          tool_calls: Json | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          tool_calls?: Json | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assumida_por: string | null
          created_at: string
          id: string
          lead_id: string | null
          resumo: string | null
          status: string
          unidade_detectada: Database["tradek"]["Enums"]["unidade"] | null
          updated_at: string
          visitor_id: string | null
        }
        Insert: {
          assumida_por?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          resumo?: string | null
          status?: string
          unidade_detectada?: Database["tradek"]["Enums"]["unidade"] | null
          updated_at?: string
          visitor_id?: string | null
        }
        Update: {
          assumida_por?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          resumo?: string | null
          status?: string
          unidade_detectada?: Database["tradek"]["Enums"]["unidade"] | null
          updated_at?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assumida_por_fkey"
            columns: ["assumida_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      document_requests: {
        Row: {
          checklist_item_id: string | null
          company_id: string | null
          created_at: string
          descricao: string | null
          id: string
          lead_id: string | null
          solicitado_em: string
          status: Database["tradek"]["Enums"]["doc_status"]
          tipo_documento: string
          updated_at: string
          vencimento: string | null
        }
        Insert: {
          checklist_item_id?: string | null
          company_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lead_id?: string | null
          solicitado_em?: string
          status?: Database["tradek"]["Enums"]["doc_status"]
          tipo_documento: string
          updated_at?: string
          vencimento?: string | null
        }
        Update: {
          checklist_item_id?: string | null
          company_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lead_id?: string | null
          solicitado_em?: string
          status?: Database["tradek"]["Enums"]["doc_status"]
          tipo_documento?: string
          updated_at?: string
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_requests_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          company_id: string | null
          created_at: string
          enviado_em: string
          enviado_por: string | null
          hash_arquivo: string | null
          id: string
          lead_id: string | null
          mime: string | null
          motivo_reprovacao: string | null
          nome_original: string | null
          observacoes: string | null
          request_id: string | null
          revisado_em: string | null
          revisado_por: string | null
          status: Database["tradek"]["Enums"]["doc_status"]
          storage_key: string
          tamanho: number | null
          tipo_documento: string | null
          updated_at: string
          versao: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          enviado_em?: string
          enviado_por?: string | null
          hash_arquivo?: string | null
          id?: string
          lead_id?: string | null
          mime?: string | null
          motivo_reprovacao?: string | null
          nome_original?: string | null
          observacoes?: string | null
          request_id?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: Database["tradek"]["Enums"]["doc_status"]
          storage_key: string
          tamanho?: number | null
          tipo_documento?: string | null
          updated_at?: string
          versao?: number
        }
        Update: {
          company_id?: string | null
          created_at?: string
          enviado_em?: string
          enviado_por?: string | null
          hash_arquivo?: string | null
          id?: string
          lead_id?: string | null
          mime?: string | null
          motivo_reprovacao?: string | null
          nome_original?: string | null
          observacoes?: string | null
          request_id?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: Database["tradek"]["Enums"]["doc_status"]
          storage_key?: string
          tamanho?: number | null
          tipo_documento?: string | null
          updated_at?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "document_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_log: {
        Row: {
          assunto: string | null
          created_at: string
          erro: string | null
          id: string
          lead_id: string | null
          para: string[]
          provider_id: string | null
          rule_id: string | null
          status: string
          template_id: string | null
        }
        Insert: {
          assunto?: string | null
          created_at?: string
          erro?: string | null
          id?: string
          lead_id?: string | null
          para?: string[]
          provider_id?: string | null
          rule_id?: string | null
          status?: string
          template_id?: string | null
        }
        Update: {
          assunto?: string | null
          created_at?: string
          erro?: string | null
          id?: string
          lead_id?: string | null
          para?: string[]
          provider_id?: string | null
          rule_id?: string | null
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "notification_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_log_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          assunto: string
          ativo: boolean
          chave: string | null
          corpo_html: string
          created_at: string
          id: string
          nome: string
          updated_at: string
          variaveis: string[]
        }
        Insert: {
          assunto: string
          ativo?: boolean
          chave?: string | null
          corpo_html: string
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
          variaveis?: string[]
        }
        Update: {
          assunto?: string
          ativo?: boolean
          chave?: string | null
          corpo_html?: string
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          variaveis?: string[]
        }
        Relationships: []
      }
      interactions: {
        Row: {
          anexos: Json
          autor_id: string | null
          autor_tipo: Database["tradek"]["Enums"]["autor_tipo"]
          canal: Database["tradek"]["Enums"]["interaction_canal"]
          created_at: string
          id: string
          lead_id: string | null
          mensagem: string | null
          tipo: Database["tradek"]["Enums"]["interaction_tipo"]
          visivel_cliente: boolean
        }
        Insert: {
          anexos?: Json
          autor_id?: string | null
          autor_tipo?: Database["tradek"]["Enums"]["autor_tipo"]
          canal?: Database["tradek"]["Enums"]["interaction_canal"]
          created_at?: string
          id?: string
          lead_id?: string | null
          mensagem?: string | null
          tipo?: Database["tradek"]["Enums"]["interaction_tipo"]
          visivel_cliente?: boolean
        }
        Update: {
          anexos?: Json
          autor_id?: string | null
          autor_tipo?: Database["tradek"]["Enums"]["autor_tipo"]
          canal?: Database["tradek"]["Enums"]["interaction_canal"]
          created_at?: string
          id?: string
          lead_id?: string | null
          mensagem?: string | null
          tipo?: Database["tradek"]["Enums"]["interaction_tipo"]
          visivel_cliente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_status_history: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          motivo: string | null
          status_anterior: Database["tradek"]["Enums"]["lead_status"] | null
          status_novo: Database["tradek"]["Enums"]["lead_status"]
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          motivo?: string | null
          status_anterior?: Database["tradek"]["Enums"]["lead_status"] | null
          status_novo: Database["tradek"]["Enums"]["lead_status"]
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          motivo?: string | null
          status_anterior?: Database["tradek"]["Enums"]["lead_status"] | null
          status_novo?: Database["tradek"]["Enums"]["lead_status"]
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_status_history_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          classificacao: string | null
          cliente_portal_criado: boolean
          company_id: string | null
          consentimento_lgpd: boolean
          contact_id: string | null
          created_at: string
          dados_coletados: Json
          dados_faltantes: Json
          dados_oportunidade: Json
          id: string
          moeda: string | null
          motivo_desqualificacao:
            | Database["tradek"]["Enums"]["motivo_desqualificacao"]
            | null
          motivo_perda: Database["tradek"]["Enums"]["motivo_perda"] | null
          o_que_nao_quer: string | null
          o_que_quer: string | null
          origem: Database["tradek"]["Enums"]["origem"]
          pendencias: Json
          prazo_desejado: string | null
          produto_servico_interesse: string | null
          proxima_acao: string | null
          proxima_tarefa_em: string | null
          responsavel_id: string | null
          resumo_ia: string | null
          riscos: Json
          score_ia: number | null
          status: Database["tradek"]["Enums"]["lead_status"]
          tags: string[]
          ultimo_contato_em: string | null
          unidade: Database["tradek"]["Enums"]["unidade"]
          updated_at: string
          urgencia: Database["tradek"]["Enums"]["urgencia"] | null
          valor_estimado: number | null
          volume_estimado: string | null
        }
        Insert: {
          classificacao?: string | null
          cliente_portal_criado?: boolean
          company_id?: string | null
          consentimento_lgpd?: boolean
          contact_id?: string | null
          created_at?: string
          dados_coletados?: Json
          dados_faltantes?: Json
          dados_oportunidade?: Json
          id?: string
          moeda?: string | null
          motivo_desqualificacao?:
            | Database["tradek"]["Enums"]["motivo_desqualificacao"]
            | null
          motivo_perda?: Database["tradek"]["Enums"]["motivo_perda"] | null
          o_que_nao_quer?: string | null
          o_que_quer?: string | null
          origem?: Database["tradek"]["Enums"]["origem"]
          pendencias?: Json
          prazo_desejado?: string | null
          produto_servico_interesse?: string | null
          proxima_acao?: string | null
          proxima_tarefa_em?: string | null
          responsavel_id?: string | null
          resumo_ia?: string | null
          riscos?: Json
          score_ia?: number | null
          status?: Database["tradek"]["Enums"]["lead_status"]
          tags?: string[]
          ultimo_contato_em?: string | null
          unidade?: Database["tradek"]["Enums"]["unidade"]
          updated_at?: string
          urgencia?: Database["tradek"]["Enums"]["urgencia"] | null
          valor_estimado?: number | null
          volume_estimado?: string | null
        }
        Update: {
          classificacao?: string | null
          cliente_portal_criado?: boolean
          company_id?: string | null
          consentimento_lgpd?: boolean
          contact_id?: string | null
          created_at?: string
          dados_coletados?: Json
          dados_faltantes?: Json
          dados_oportunidade?: Json
          id?: string
          moeda?: string | null
          motivo_desqualificacao?:
            | Database["tradek"]["Enums"]["motivo_desqualificacao"]
            | null
          motivo_perda?: Database["tradek"]["Enums"]["motivo_perda"] | null
          o_que_nao_quer?: string | null
          o_que_quer?: string | null
          origem?: Database["tradek"]["Enums"]["origem"]
          pendencias?: Json
          prazo_desejado?: string | null
          produto_servico_interesse?: string | null
          proxima_acao?: string | null
          proxima_tarefa_em?: string | null
          responsavel_id?: string | null
          resumo_ia?: string | null
          riscos?: Json
          score_ia?: number | null
          status?: Database["tradek"]["Enums"]["lead_status"]
          tags?: string[]
          ultimo_contato_em?: string | null
          unidade?: Database["tradek"]["Enums"]["unidade"]
          updated_at?: string
          urgencia?: Database["tradek"]["Enums"]["urgencia"] | null
          valor_estimado?: number | null
          volume_estimado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_rules: {
        Row: {
          ativo: boolean
          created_at: string
          emails_bcc: string[]
          emails_cc: string[]
          emails_para: string[]
          enviar_anexos: boolean
          enviar_resumo_ia: boolean
          evento: string
          frequencia: string
          id: string
          nome: string
          status_destino: Database["tradek"]["Enums"]["lead_status"] | null
          status_origem: Database["tradek"]["Enums"]["lead_status"] | null
          template_id: string | null
          unidade: Database["tradek"]["Enums"]["unidade"] | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          emails_bcc?: string[]
          emails_cc?: string[]
          emails_para?: string[]
          enviar_anexos?: boolean
          enviar_resumo_ia?: boolean
          evento: string
          frequencia?: string
          id?: string
          nome: string
          status_destino?: Database["tradek"]["Enums"]["lead_status"] | null
          status_origem?: Database["tradek"]["Enums"]["lead_status"] | null
          template_id?: string | null
          unidade?: Database["tradek"]["Enums"]["unidade"] | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          emails_bcc?: string[]
          emails_cc?: string[]
          emails_para?: string[]
          enviar_anexos?: boolean
          enviar_resumo_ia?: boolean
          evento?: string
          frequencia?: string
          id?: string
          nome?: string
          status_destino?: Database["tradek"]["Enums"]["lead_status"] | null
          status_origem?: Database["tradek"]["Enums"]["lead_status"] | null
          template_id?: string | null
          unidade?: Database["tradek"]["Enums"]["unidade"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_rules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          lida: boolean
          link: string | null
          mensagem: string
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem: string
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      pipeline_statuses: {
        Row: {
          cor: string | null
          key: Database["tradek"]["Enums"]["lead_status"]
          label_admin: string
          label_cliente: string
          ordem: number
          visivel_kanban: boolean
        }
        Insert: {
          cor?: string | null
          key: Database["tradek"]["Enums"]["lead_status"]
          label_admin: string
          label_cliente: string
          ordem?: number
          visivel_kanban?: boolean
        }
        Update: {
          cor?: string | null
          key?: Database["tradek"]["Enums"]["lead_status"]
          label_admin?: string
          label_cliente?: string
          ordem?: number
          visivel_kanban?: boolean
        }
        Relationships: []
      }
      products: {
        Row: {
          autonomia: string | null
          bateria: string | null
          capacidade: string | null
          categoria: string | null
          condicao_comercial: string | null
          created_at: string
          descricao_completa: string | null
          descricao_curta: string | null
          ficha_tecnica: Json
          freios: string | null
          id: string
          imagens: Json
          modelo: string
          moeda: string | null
          moq: string | null
          motor: string | null
          permitir_cotacao_ia: boolean
          preco_base: number | null
          publicado_site: boolean
          status: string
          updated_at: string
          velocidade: string | null
        }
        Insert: {
          autonomia?: string | null
          bateria?: string | null
          capacidade?: string | null
          categoria?: string | null
          condicao_comercial?: string | null
          created_at?: string
          descricao_completa?: string | null
          descricao_curta?: string | null
          ficha_tecnica?: Json
          freios?: string | null
          id?: string
          imagens?: Json
          modelo: string
          moeda?: string | null
          moq?: string | null
          motor?: string | null
          permitir_cotacao_ia?: boolean
          preco_base?: number | null
          publicado_site?: boolean
          status?: string
          updated_at?: string
          velocidade?: string | null
        }
        Update: {
          autonomia?: string | null
          bateria?: string | null
          capacidade?: string | null
          categoria?: string | null
          condicao_comercial?: string | null
          created_at?: string
          descricao_completa?: string | null
          descricao_curta?: string | null
          ficha_tecnica?: Json
          freios?: string | null
          id?: string
          imagens?: Json
          modelo?: string
          moeda?: string | null
          moq?: string | null
          motor?: string | null
          permitir_cotacao_ia?: boolean
          preco_base?: number | null
          publicado_site?: boolean
          status?: string
          updated_at?: string
          velocidade?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          bloqueado: boolean
          company_id: string | null
          created_at: string
          id: string
          nome: string | null
          role: Database["tradek"]["Enums"]["user_role"]
          telefone: string | null
          ultimo_login: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          bloqueado?: boolean
          company_id?: string | null
          created_at?: string
          id: string
          nome?: string | null
          role?: Database["tradek"]["Enums"]["user_role"]
          telefone?: string | null
          ultimo_login?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          bloqueado?: boolean
          company_id?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          role?: Database["tradek"]["Enums"]["user_role"]
          telefone?: string | null
          ultimo_login?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          aceite_em: string | null
          created_at: string
          enviada_em: string | null
          id: string
          lead_id: string | null
          moeda: string | null
          observacoes: string | null
          pdf_storage_key: string | null
          recusa_em: string | null
          status: Database["tradek"]["Enums"]["proposal_status"]
          updated_at: string
          valor: number | null
        }
        Insert: {
          aceite_em?: string | null
          created_at?: string
          enviada_em?: string | null
          id?: string
          lead_id?: string | null
          moeda?: string | null
          observacoes?: string | null
          pdf_storage_key?: string | null
          recusa_em?: string | null
          status?: Database["tradek"]["Enums"]["proposal_status"]
          updated_at?: string
          valor?: number | null
        }
        Update: {
          aceite_em?: string | null
          created_at?: string
          enviada_em?: string | null
          id?: string
          lead_id?: string | null
          moeda?: string | null
          observacoes?: string | null
          pdf_storage_key?: string | null
          recusa_em?: string | null
          status?: Database["tradek"]["Enums"]["proposal_status"]
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_chunks: {
        Row: {
          chunk_index: number
          conteudo: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
        }
        Insert: {
          chunk_index?: number
          conteudo: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
        }
        Update: {
          chunk_index?: number
          conteudo?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rag_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "rag_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_documents: {
        Row: {
          categoria: string | null
          created_at: string
          id: string
          restrito_admin: boolean
          status: string
          storage_key: string | null
          titulo: string
          unidade: Database["tradek"]["Enums"]["unidade"] | null
          updated_at: string
          validade: string | null
          versao: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          id?: string
          restrito_admin?: boolean
          status?: string
          storage_key?: string | null
          titulo: string
          unidade?: Database["tradek"]["Enums"]["unidade"] | null
          updated_at?: string
          validade?: string | null
          versao?: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          id?: string
          restrito_admin?: boolean
          status?: string
          storage_key?: string | null
          titulo?: string
          unidade?: Database["tradek"]["Enums"]["unidade"] | null
          updated_at?: string
          validade?: string | null
          versao?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          conteudo: string | null
          created_at: string
          enviado_por_email: boolean
          gerado_por: Database["tradek"]["Enums"]["autor_tipo"]
          id: string
          lead_id: string
          modelo_ia: string | null
          prompt_version: string | null
          score: number | null
          tipo: string
          versao: number
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          enviado_por_email?: boolean
          gerado_por?: Database["tradek"]["Enums"]["autor_tipo"]
          id?: string
          lead_id: string
          modelo_ia?: string | null
          prompt_version?: string | null
          score?: number | null
          tipo?: string
          versao?: number
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          enviado_por_email?: boolean
          gerado_por?: Database["tradek"]["Enums"]["autor_tipo"]
          id?: string
          lead_id?: string
          modelo_ia?: string | null
          prompt_version?: string | null
          score?: number | null
          tipo?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "reports_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      request_log: {
        Row: {
          action: string | null
          created_at: string
          id: number
          ip: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          id?: never
          ip?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          id?: never
          ip?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          agente_id: string | null
          categoria: string | null
          checklist_id: string | null
          created_at: string
          descricao: string | null
          emails_notificados: string[]
          id: string
          nome: string
          perguntas_qualificacao: Json
          publico_alvo: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agente_id?: string | null
          categoria?: string | null
          checklist_id?: string | null
          created_at?: string
          descricao?: string | null
          emails_notificados?: string[]
          id?: string
          nome: string
          perguntas_qualificacao?: Json
          publico_alvo?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agente_id?: string | null
          categoria?: string | null
          checklist_id?: string | null
          created_at?: string
          descricao?: string | null
          emails_notificados?: string[]
          id?: string
          nome?: string
          perguntas_qualificacao?: Json
          publico_alvo?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_agente_id_fkey"
            columns: ["agente_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          chave: string
          updated_at: string
          valor: Json
        }
        Insert: {
          chave: string
          updated_at?: string
          valor?: Json
        }
        Update: {
          chave?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: []
      }
      tasks: {
        Row: {
          checklist_item_id: string | null
          concluida_em: string | null
          created_at: string
          criada_por: string | null
          descricao: string | null
          id: string
          lead_id: string | null
          prazo: string | null
          prioridade: Database["tradek"]["Enums"]["urgencia"]
          responsavel_id: string | null
          status: Database["tradek"]["Enums"]["task_status"]
          titulo: string
          updated_at: string
        }
        Insert: {
          checklist_item_id?: string | null
          concluida_em?: string | null
          created_at?: string
          criada_por?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string | null
          prazo?: string | null
          prioridade?: Database["tradek"]["Enums"]["urgencia"]
          responsavel_id?: string | null
          status?: Database["tradek"]["Enums"]["task_status"]
          titulo: string
          updated_at?: string
        }
        Update: {
          checklist_item_id?: string | null
          concluida_em?: string | null
          created_at?: string
          criada_por?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string | null
          prazo?: string | null
          prioridade?: Database["tradek"]["Enums"]["urgencia"]
          responsavel_id?: string | null
          status?: Database["tradek"]["Enums"]["task_status"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_checklist_item_fk"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_criada_por_fkey"
            columns: ["criada_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_write: { Args: never; Returns: boolean }
      current_user_company: { Args: never; Returns: string }
      current_user_role: {
        Args: never
        Returns: Database["tradek"]["Enums"]["user_role"]
      }
      is_internal: { Args: never; Returns: boolean }
      match_documents: {
        Args: {
          match_count?: number
          p_include_restrito?: boolean
          query_embedding: string
        }
        Returns: {
          categoria: string
          chunk_id: string
          conteudo: string
          document_id: string
          similarity: number
          titulo: string
          unidade: string
        }[]
      }
      rate_check: {
        Args: {
          p_action: string
          p_ip: string
          p_max: number
          p_window_secs: number
        }
        Returns: boolean
      }
      recalc_lead_score: { Args: { p_lead: string }; Returns: number }
    }
    Enums: {
      autor_tipo: "cliente" | "admin" | "ia" | "sistema"
      doc_status:
        | "nao_solicitado"
        | "solicitado"
        | "enviado"
        | "em_revisao"
        | "aprovado"
        | "reprovado"
        | "reenvio_solicitado"
        | "vencido"
      interaction_canal:
        | "chat_ia"
        | "portal"
        | "email"
        | "whatsapp"
        | "telefone"
        | "interno"
        | "sistema"
      interaction_tipo:
        | "mensagem"
        | "comentario_interno"
        | "status_change"
        | "email_enviado"
        | "upload"
        | "relatorio"
        | "tarefa"
        | "sistema"
      lead_status:
        | "novo"
        | "qualificacao_ia"
        | "dados_incompletos"
        | "qualificado"
        | "doc_solicitados"
        | "doc_recebidos"
        | "em_analise"
        | "aprovado_proposta"
        | "proposta_enviada"
        | "negociacao"
        | "ganho"
        | "perdido"
        | "desqualificado"
        | "arquivado"
      motivo_desqualificacao:
        | "sem_cnpj"
        | "pessoa_fisica_sem_fit"
        | "sem_demanda_real"
        | "produto_fora_escopo"
        | "volume_muito_baixo"
        | "sem_orcamento"
        | "sem_resposta"
        | "regiao_nao_atendida"
        | "duplicado"
        | "teste_spam"
        | "outro"
      motivo_perda:
        | "preco"
        | "prazo"
        | "concorrencia"
        | "sem_resposta"
        | "desistiu"
        | "sem_orcamento"
        | "fora_escopo"
        | "outro"
      origem:
        | "site_chat_ia"
        | "formulario_site"
        | "cadastro_manual"
        | "email"
        | "whatsapp"
        | "indicacao"
        | "evento"
        | "trafego_pago"
        | "importacao_manual"
        | "outro"
      proposal_status:
        | "rascunho"
        | "aguardando_dados"
        | "em_validacao"
        | "enviada"
        | "aceita"
        | "recusada"
        | "cancelada"
      task_status: "aberta" | "em_andamento" | "concluida" | "cancelada"
      unidade:
        | "supply_chain_finance"
        | "procurement"
        | "produtos_motos"
        | "suporte_importacao"
        | "outro"
      urgencia: "baixa" | "media" | "alta" | "critica"
      user_role:
        | "master"
        | "gerente"
        | "comercial"
        | "operacional"
        | "financeiro"
        | "atendimento"
        | "leitura"
        | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  tradek: {
    Enums: {
      autor_tipo: ["cliente", "admin", "ia", "sistema"],
      doc_status: [
        "nao_solicitado",
        "solicitado",
        "enviado",
        "em_revisao",
        "aprovado",
        "reprovado",
        "reenvio_solicitado",
        "vencido",
      ],
      interaction_canal: [
        "chat_ia",
        "portal",
        "email",
        "whatsapp",
        "telefone",
        "interno",
        "sistema",
      ],
      interaction_tipo: [
        "mensagem",
        "comentario_interno",
        "status_change",
        "email_enviado",
        "upload",
        "relatorio",
        "tarefa",
        "sistema",
      ],
      lead_status: [
        "novo",
        "qualificacao_ia",
        "dados_incompletos",
        "qualificado",
        "doc_solicitados",
        "doc_recebidos",
        "em_analise",
        "aprovado_proposta",
        "proposta_enviada",
        "negociacao",
        "ganho",
        "perdido",
        "desqualificado",
        "arquivado",
      ],
      motivo_desqualificacao: [
        "sem_cnpj",
        "pessoa_fisica_sem_fit",
        "sem_demanda_real",
        "produto_fora_escopo",
        "volume_muito_baixo",
        "sem_orcamento",
        "sem_resposta",
        "regiao_nao_atendida",
        "duplicado",
        "teste_spam",
        "outro",
      ],
      motivo_perda: [
        "preco",
        "prazo",
        "concorrencia",
        "sem_resposta",
        "desistiu",
        "sem_orcamento",
        "fora_escopo",
        "outro",
      ],
      origem: [
        "site_chat_ia",
        "formulario_site",
        "cadastro_manual",
        "email",
        "whatsapp",
        "indicacao",
        "evento",
        "trafego_pago",
        "importacao_manual",
        "outro",
      ],
      proposal_status: [
        "rascunho",
        "aguardando_dados",
        "em_validacao",
        "enviada",
        "aceita",
        "recusada",
        "cancelada",
      ],
      task_status: ["aberta", "em_andamento", "concluida", "cancelada"],
      unidade: [
        "supply_chain_finance",
        "procurement",
        "produtos_motos",
        "suporte_importacao",
        "outro",
      ],
      urgencia: ["baixa", "media", "alta", "critica"],
      user_role: [
        "master",
        "gerente",
        "comercial",
        "operacional",
        "financeiro",
        "atendimento",
        "leitura",
        "cliente",
      ],
    },
  },
} as const
