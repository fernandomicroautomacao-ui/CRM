# Ploomes CRM Pro - Sistema Completo de CRM com Email Marketing

## 🚀 Visão Geral

Sistema profissional de CRM (Customer Relationship Management) com integração completa de Email Marketing, permitindo conexão com Gmail e Outlook para envio de campanhas em massa.

## ✨ Funcionalidades Principais

### 📊 Dashboard
- Estatísticas em tempo real (leads, valor total, negócios fechados, emails enviados)
- Funil de vendas visual
- Atividade recente do sistema

### 🎯 Pipeline de Vendas
- Quadro Kanban com drag-and-drop
- 5 etapas personalizáveis
- Movimentação intuitiva de leads entre etapas

### 👥 Gestão de Leads
- CRUD completo de leads
- Campos: nome, email, telefone, empresa, valor, origem
- Filtros por etapa e origem
- Visualização em lista ou grid

### ✅ Tarefas
- Criação e gerenciamento de tarefas
- Prioridades (baixa, média, alta)
- Marcar como concluída
- Data de vencimento

### 📧 Email Marketing (NOVO!)

#### Campanhas
- Wizard de 4 etapas para criação de campanhas
- Configurações da campanha (nome, assunto, remetente)
- Seleção múltipla de destinatários com filtros
- Editor de conteúdo com variáveis dinâmicas
- Revisão antes do envio
- Histórico de campanhas

#### Templates
- Criação de templates reutilizáveis
- Variáveis dinâmicas: {{nome}}, {{empresa}}, {{email}}
- Edição e exclusão de templates
- Carregamento automático em campanhas

#### Histórico de Envios
- Lista completa de emails enviados
- Informações de destinatário e assunto
- Data de envio

#### Integrações
- **Gmail / Google Workspace**
  - Limite: 500 emails/dia
  - Simulação de OAuth 2.0
  
- **Outlook / Microsoft 365**
  - Limite: 300 emails/dia
  - Simulação de Microsoft Graph API

## 🛠️ Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com variáveis CSS
- **JavaScript ES6+** - Lógica modularizada
- **LocalStorage** - Persistência de dados
- **Font Awesome** - Ícones
- **Google Fonts** - Tipografia Inter

## 📁 Estrutura do Projeto

```
professional-crm/
├── index.html          # Interface principal
├── css/
│   └── styles.css      # Estilos completos
├── js/
│   └── app.js          # Lógica da aplicação
└── README.md           # Documentação
```

## 🚀 Como Usar

### Instalação
1. Baixe ou clone o projeto
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Pronto! Não requer servidor ou build

### Primeiros Passos

1. **Criar Leads**
   - Clique em "Novo Lead" no header
   - Preencha as informações
   - Salve

2. **Gerenciar Pipeline**
   - Navegue até "Pipeline"
   - Arraste cards entre etapas
   - Acompanhe o progresso

3. **Configurar Email Marketing**
   - Vá para "Email Marketing"
   - Clique em "Integrações"
   - Conecte Gmail ou Outlook
   - Crie templates
   - Lance campanhas

### Criar Primeira Campanha

1. Conecte uma conta (Gmail ou Outlook)
2. Crie um template (opcional)
3. Clique em "Nova Campanha"
4. Preencha configurações (etapa 1)
5. Selecione destinatários (etapa 2)
6. Escreva o conteúdo (etapa 3)
7. Revise e envie (etapa 4)

## 🎨 Recursos de UI/UX

- **Dark Mode**: Automático ou manual
- **Responsivo**: Funciona em mobile, tablet e desktop
- **Notificações Toast**: Feedback visual de ações
- **Modais**: Interfaces limpas para formulários
- **Drag & Drop**: Pipeline intuitivo
- **Filtros**: Busca e filtragem avançada

## 🔒 Segurança

- Sanitização de HTML contra XSS
- Validação de formulários
- Limites diários de envio de emails
- Armazenamento local seguro

## 📊 Módulos JavaScript

O código é organizado em módulos especializados:

1. **AppConfig** - Configurações globais
2. **AppState** - Estado da aplicação
3. **Utils** - Utilitários (formatadores, sanitização)
4. **Storage** - Gerenciamento de localStorage
5. **Notification** - Sistema de notificações toast
6. **Theme** - Controle de tema (dark/light mode)
7. **LeadManager** - CRUD de leads
8. **TaskManager** - Gestão de tarefas
9. **Pipeline** - Quadro Kanban
10. **Dashboard** - Métricas e funil
11. **EmailMarketing** - Sistema completo de email
12. **Navigation** - Navegação entre seções

## 🎯 Casos de Uso

### Para Vendedores
- Acompanhar leads no pipeline
- Criar tarefas de follow-up
- Enviar emails personalizados

### Para Marketers
- Criar campanhas em massa
- Usar templates padronizados
- Personalizar mensagens com variáveis

### Para Gestores
- Visualizar dashboard com métricas
- Acompanhar conversão por etapa
- Monitorar emails enviados

## 🔄 Persistência de Dados

Todos os dados são salvos automaticamente no localStorage do navegador:
- Leads
- Tarefas
- Campanhas
- Templates
- Histórico de emails
- Integrações

## ⚠️ Limitações

- Versão demo: integrações simuladas (sem API real)
- Dados armazenados apenas localmente
- Limite de armazenamento do navegador (~5MB)

## 🚀 Próximos Passos (Produção)

Para usar em produção, implemente:

1. **API Real**
   - Backend para persistência
   - Autenticação de usuários
   
2. **Integrações Verdadeiras**
   - OAuth 2.0 para Gmail
   - Microsoft Graph API para Outlook
   
3. **Recursos Avançados**
   - Agendamento de envios
   - A/B testing
   - Analytics de abertura/cliques
   - Webhooks

## 📝 Licença

Uso livre para desenvolvimento e aprendizado.

## 💡 Dicas

- Use templates para economizar tempo
- Personalize emails com {{nome}} para melhor engagement
- Monitore limites diários de envio
- Faça backup dos dados regularmente

---

**Versão**: 2.0.0  
**Desenvolvido com**: ❤️ e café
