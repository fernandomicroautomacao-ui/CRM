# Ploomes CRM Pro - Email Marketing & Automação

Sistema completo de CRM com integração profissional de Email Marketing, incluindo conexão com Gmail e Outlook.

## 🚀 Funcionalidades Principais

### Email Marketing (Novo!)
- **Campanhas de Email**: Crie e envie campanhas personalizadas
- **Templates**: Modelos reutilizáveis com variáveis dinâmicas ({{nome}}, {{empresa}}, {{email}})
- **Integrações**:
  - **Gmail/Google Workspace**: OAuth 2.0, limite de 500 emails/dia
  - **Outlook/Microsoft 365**: Microsoft Graph API, limite de 300 emails/dia
- **Histórico**: Acompanhamento de todos os emails enviados
- **Personalização**: Conteúdo dinâmico baseado nos dados do lead

### Pipeline de Vendas
- Kanban interativo com drag-and-drop
- 5 estágios configuráveis
- Acompanhamento de valores por etapa

### Gestão de Leads
- CRUD completo de leads
- Filtros por status
- Campos personalizáveis

### Tarefas
- Quadro de tarefas pendentes/concluídas
- Prioridades e vencimentos
- Atribuição de responsáveis

### Dashboard
- Cards estatísticos em tempo real
- Funil de vendas visual
- Atividades recentes

## 📁 Estrutura do Projeto

```
professional-crm/
├── index.html          # Interface principal
├── css/
│   └── styles.css      # Estilos profissionais
├── js/
│   └── app.js          # Lógica da aplicação
└── README.md           # Esta documentação
```

## 🛠️ Como Usar

1. **Abrir o sistema**: Basta abrir `index.html` em qualquer navegador moderno
2. **Conectar provedor de email**:
   - Acesse "Email Marketing" → "Integrações"
   - Clique em "Conectar com Gmail" ou "Conectar com Outlook"
   - Simule a autenticação OAuth
3. **Criar campanha**:
   - Clique em "Nova Campanha"
   - Preencha as 4 etapas do wizard
   - Selecione destinatários
   - Envie imediatamente ou agende

## 🔧 Recursos Técnicos

- **Armazenamento**: localStorage do navegador
- **Design Responsivo**: Mobile, tablet e desktop
- **Tema**: Claro/escuro automático
- **Segurança**: Sanitização HTML contra XSS
- **Performance**: Debounce em buscas, renderização eficiente

## 📊 Dados de Exemplo

O sistema inicia com:
- 5 leads pré-cadastrados
- 3 templates de email
- 3 negócios no pipeline
- 3 tarefas de exemplo

## 🎨 Personalização

Edite `css/styles.css` para modificar:
- Cores do tema (variáveis CSS)
- Espaçamento e bordas
- Breakpoints responsivos

## ⚠️ Importante

Esta é uma versão demo que utiliza:
- Simulação de OAuth (para produção, implemente backend real)
- Armazenamento local (dados não sincronizam entre dispositivos)
- APIs simuladas de envio de email

Para uso em produção, integre com:
- Backend Node.js/Python/PHP
- APIs reais: Gmail API e Microsoft Graph API
- Banco de dados PostgreSQL/MySQL

## 📄 Licença

Uso livre para fins educacionais e de demonstração.

---

**Desenvolvido com ❤️ para demonstração profissional**
