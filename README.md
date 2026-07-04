# Ploomes CRM - Versão Melhorada

Uma versão refactorizada e melhorada do CRM Offline Ploomes, com foco em segurança, performance e manutenibilidade.

## 📁 Estrutura do Projeto

```
/workspace/
├── index.html          # Arquivo HTML principal
├── css/
│   └── styles.css      # Estilos CSS modularizados
├── js/
│   └── app.js          # Lógica JavaScript modular
└── README.md           # Esta documentação
```

## ✨ Melhorias Implementadas

### 1. **Arquitetura Modular**
- Separação de CSS e JavaScript em arquivos independentes
- Código organizado em módulos com responsabilidades únicas
- Fácil manutenção e escalabilidade

### 2. **Segurança**
- Sanitização de HTML para prevenir XSS
- Validação de formulários no client-side
- Tratamento seguro de dados do localStorage

### 3. **Gerenciamento de Estado**
- AppState centralizado para controle de dados
- StorageManager com tratamento de erros e quota
- Backup e exportação de dados

### 4. **UX/UI Melhorados**
- Sistema de notificações toast
- Loading states e feedback visual
- Dark mode com detecção automática
- Design responsivo para mobile

### 5. **Performance**
- Debounce em buscas
- Renderização eficiente do Kanban
- Event listeners otimizados

### 6. **Acessibilidade**
- Navegação por teclado
- ARIA labels (pronto para expansão)
- Contraste adequado em ambos temas

## 🚀 Funcionalidades

- **Dashboard**: Visão geral com cards estatísticos e funil de vendas
- **Pipeline/Kanban**: Gestão visual de leads com drag-and-drop
- **Tarefas**: Lista de tarefas com status e vencimento
- **Busca e Filtros**: Filtragem por texto e estágio
- **Dark Mode**: Alternância entre temas claro/escuro
- **Backup**: Exportação e importação de dados JSON

## 🛠 Módulos JavaScript

| Módulo | Descrição |
|--------|-----------|
| `AppConfig` | Configurações globais |
| `AppState` | Estado da aplicação |
| `Utils` | Funções utilitárias |
| `StorageManager` | Gerenciamento de localStorage |
| `Notification` | Sistema de notificações |
| `ThemeManager` | Controle de tema dark/light |
| `FormValidator` | Validação de formulários |
| `ModalManager` | Gerenciamento de modais |
| `KanbanDragDrop` | Drag-and-drop do pipeline |
| `LeadManager` | CRUD de leads |
| `TaskManager` | CRUD de tarefas |
| `Dashboard` | Renderização do dashboard |
| `Pipeline` | Renderização do kanban |
| `Tasks` | UI de tarefas |
| `LeadModal` | Modal de edição de leads |
| `Navigation` | Roteamento entre seções |
| `SearchFilter` | Busca e filtros |

## 🎨 Variáveis CSS

O projeto utiliza CSS Custom Properties para facilitar a customização:

```css
--bg-primary, --bg-secondary, --bg-card
--text-primary, --text-secondary, --text-muted
--stage-leads, --stage-qualificacao, --stage-oportunidades
--stage-orcamento, --stage-pedido
--task-pendente, --task-concluida, --task-adiada, --task-cancelada
```

## 📱 Responsividade

- **Desktop**: Layout completo com sidebar fixa
- **Tablet (≤1024px)**: Pipeline com 3 colunas
- **Mobile (≤768px)**: Sidebar retrátil, pipeline em coluna única
- **Mobile Small (≤480px)**: Cards estatísticos empilhados

## 🔧 Como Usar

1. Abra o arquivo `index.html` em um navegador moderno
2. Os dados são salvos automaticamente no localStorage
3. Use o botão de exportar para fazer backup
4. Importe backups usando a função de importação

## 📝 Próximas Melhorias Sugeridas

- [ ] Integração com API externa
- [ ] Autenticação de usuários
- [ ] Relatórios e analytics
- [ ] Notificações push
- [ ] Modo offline com Service Workers
- [ ] Testes automatizados

## 📄 Licença

Projeto desenvolvido para fins educacionais e de demonstração.
