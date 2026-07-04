/**
 * Ploomes CRM - Aplicação Modularizada
 * Versão melhorada com foco em segurança, performance e manutenibilidade
 */

// ============================================
// CONFIGURAÇÃO E ESTADO GLOBAL
// ============================================
const AppConfig = {
    STORAGE_KEY: 'ploomes_crm_data',
    THEME_KEY: 'ploomes_crm_theme',
    VERSION: '2.0.0',
    MAX_STORAGE_RETRIES: 3,
    STORAGE_QUOTA_WARNING: 4 * 1024 * 1024 // 4MB
};

const AppState = {
    leads: [],
    tasks: [],
    currentSection: 'dashboard',
    darkMode: false,
    draggedCard: null,
    searchQuery: '',
    filterStage: 'all'
};

// ============================================
// UTILITÁRIOS
// ============================================
const Utils = {
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    formatDate(dateString) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(dateString));
    },

    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    getStageColor(stage) {
        const colors = {
            'leads': 'var(--stage-leads)',
            'qualificacao': 'var(--stage-qualificacao)',
            'oportunidades': 'var(--stage-oportunidades)',
            'orcamento': 'var(--stage-orcamento)',
            'pedido': 'var(--stage-pedido)'
        };
        return colors[stage] || 'var(--stage-leads)';
    }
};

// ============================================
// ARMAZENAMENTO LOCALSTORAGE COM TRATAMENTO DE ERROS
// ============================================
const StorageManager = {
    save(data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(AppConfig.STORAGE_KEY, serialized);
            
            const size = new Blob([serialized]).size;
            if (size > AppConfig.STORAGE_QUOTA_WARNING) {
                Notification.show('warning', 'Quase atingindo limite', 'Armazenamento local quase cheio');
            }
            
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                Notification.show('error', 'Limite excedido', 'Armazenamento local cheio. Exporte seus dados.');
            } else {
                Notification.show('error', 'Erro ao salvar', error.message);
            }
            return false;
        }
    },

    load() {
        try {
            const data = localStorage.getItem(AppConfig.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    },

    clear() {
        try {
            localStorage.removeItem(AppConfig.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            return false;
        }
    },

    exportData() {
        const data = this.load();
        if (!data) return;
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ploomes-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Notification.show('success', 'Exportação concluída', 'Backup realizado com sucesso');
    },

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (this.validateImportData(data)) {
                    this.save(data);
                    location.reload();
                } else {
                    throw new Error('Formato de dados inválido');
                }
            } catch (error) {
                Notification.show('error', 'Importação falhou', error.message);
            }
        };
        reader.readAsText(file);
    },

    validateImportData(data) {
        return data && typeof data === 'object' && 
               Array.isArray(data.leads) && 
               Array.isArray(data.tasks);
    }
};

// ============================================
// SISTEMA DE NOTIFICAÇÕES
// ============================================
const Notification = {
    container: null,

    init() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    },

    show(type, title, message, duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <div class="notification-content">
                <div class="notification-title">${Utils.sanitizeHTML(title)}</div>
                <div class="notification-message">${Utils.sanitizeHTML(message)}</div>
            </div>
            <button class="notification-close" onclick="Notification.remove(this.parentElement)">×</button>
        `;

        this.container.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => this.remove(notification), duration);
        }
    },

    remove(notification) {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }
};

// ============================================
// GERENCIADOR DE TEMA (DARK/LIGHT MODE)
// ============================================
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem(AppConfig.THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            this.enableDarkMode();
        }
    },

    toggle() {
        if (AppState.darkMode) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }
    },

    enableDarkMode() {
        document.documentElement.setAttribute('data-theme', 'dark');
        AppState.darkMode = true;
        localStorage.setItem(AppConfig.THEME_KEY, 'dark');
    },

    disableDarkMode() {
        document.documentElement.removeAttribute('data-theme');
        AppState.darkMode = false;
        localStorage.setItem(AppConfig.THEME_KEY, 'light');
    }
};

// ============================================
// VALIDAÇÃO DE FORMULÁRIOS
// ============================================
const FormValidator = {
    rules: {
        required: (value) => value && value.trim() !== '',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        phone: (value) => /^[\d\s\-\+\(\)]+$/.test(value),
        min_length: (value, min) => value.length >= min,
        number: (value) => !isNaN(parseFloat(value)) && isFinite(value)
    },

    messages: {
        required: 'Este campo é obrigatório',
        email: 'E-mail inválido',
        phone: 'Telefone inválido',
        min_length: 'Mínimo de {min} caracteres',
        number: 'Digite um número válido'
    },

    validate(field, rules) {
        const value = field.value;
        let error = null;

        for (const rule of rules) {
            const ruleName = typeof rule === 'string' ? rule : rule.name;
            const params = rule.params || [];
            
            if (this.rules[ruleName] && !this.rules[ruleName](value, ...params)) {
                error = this.messages[ruleName]?.replace('{min}', params[0]) || 'Valor inválido';
                break;
            }
        }

        this.setFieldError(field, error);
        return !error;
    },

    setFieldError(field, error) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        const errorElement = formGroup.querySelector('.error-message') || 
                            this.createErrorElement(formGroup);

        if (error) {
            field.classList.add('error');
            errorElement.textContent = error;
            errorElement.classList.add('visible');
        } else {
            field.classList.remove('error');
            errorElement.classList.remove('visible');
        }
    },

    createErrorElement(formGroup) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
        return errorElement;
    },

    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            const rules = input.dataset.validate ? input.dataset.validate.split('|') : [];
            if (rules.length > 0 && !this.validate(input, rules)) {
                isValid = false;
            }
        });

        return isValid;
    }
};

// ============================================
// GERENCIADOR DE MODAL
// ============================================
const ModalManager = {
    open(contentId) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById(contentId)?.cloneNode(true);
        
        if (!content) return;

        const modalBody = document.querySelector('.modal .modal-body');
        modalBody.innerHTML = '';
        modalBody.appendChild(content);

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        content.style.display = 'block';
    },

    close() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';

        const modalBody = document.querySelector('.modal .modal-body');
        modalBody.innerHTML = '';
    },

    init() {
        const overlay = document.getElementById('modal-overlay');
        const closeBtn = document.querySelector('.modal-close');

        closeBtn?.addEventListener('click', () => this.close());
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay?.classList.contains('active')) {
                this.close();
            }
        });
    }
};

// ============================================
// DRAG AND DROP DO KANBAN
// ============================================
const KanbanDragDrop = {
    init() {
        this.setupDragEvents();
    },

    setupDragEvents() {
        document.addEventListener('dragstart', (e) => this.handleDragStart(e));
        document.addEventListener('dragover', (e) => this.handleDragOver(e));
        document.addEventListener('drop', (e) => this.handleDrop(e));
        document.addEventListener('dragend', (e) => this.handleDragEnd(e));
    },

    handleDragStart(e) {
        if (!e.target.classList.contains('pipeline-card')) return;

        AppState.draggedCard = e.target;
        e.target.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
    },

    handleDragOver(e) {
        e.preventDefault();
        const column = e.target.closest('.pipeline-column');
        if (column) {
            column.style.background = 'var(--bg-primary)';
        }
    },

    handleDrop(e) {
        e.preventDefault();
        const column = e.target.closest('.pipeline-column');
        if (!column || !AppState.draggedCard) return;

        const newStage = column.dataset.stage;
        const leadId = AppState.draggedCard.dataset.id;

        LeadManager.updateStage(leadId, newStage);

        column.style.background = '';
    },

    handleDragEnd(e) {
        if (AppState.draggedCard) {
            AppState.draggedCard.style.opacity = '';
            AppState.draggedCard = null;
        }

        document.querySelectorAll('.pipeline-column').forEach(col => {
            col.style.background = '';
        });
    }
};

// ============================================
// GERENCIADOR DE LEADS
// ============================================
const LeadManager = {
    getAll() {
        return AppState.leads;
    },

    getById(id) {
        return AppState.leads.find(lead => lead.id === id);
    },

    add(leadData) {
        const newLead = {
            id: Utils.generateId(),
            stage: 'leads',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...leadData
        };

        AppState.leads.push(newLead);
        this.save();
        Dashboard.updateStats();
        Pipeline.render();
        Notification.show('success', 'Lead criado', `${leadData.title} adicionado com sucesso`);
    },

    update(id, updates) {
        const lead = this.getById(id);
        if (!lead) return false;

        Object.assign(lead, updates, { updatedAt: new Date().toISOString() });
        this.save();
        Pipeline.render();
        Notification.show('success', 'Lead atualizado', 'Alterações salvas com sucesso');
        return true;
    },

    updateStage(id, newStage) {
        const lead = this.getById(id);
        if (!lead || lead.stage === newStage) return false;

        lead.stage = newStage;
        lead.updatedAt = new Date().toISOString();
        this.save();
        Dashboard.updateStats();
        Pipeline.render();
        Notification.show('info', 'Stage alterado', `Movido para ${newStage}`);
        return true;
    },

    delete(id) {
        const index = AppState.leads.findIndex(lead => lead.id === id);
        if (index === -1) return false;

        const lead = AppState.leads[index];
        AppState.leads.splice(index, 1);
        this.save();
        Dashboard.updateStats();
        Pipeline.render();
        Notification.show('success', 'Lead removido', `${lead.title} foi excluído`);
        return true;
    },

    save() {
        StorageManager.save({ leads: AppState.leads, tasks: AppState.tasks });
    },

    search(query) {
        if (!query) return AppState.leads;
        
        const searchTerm = query.toLowerCase();
        return AppState.leads.filter(lead => 
            lead.title?.toLowerCase().includes(searchTerm) ||
            lead.company?.toLowerCase().includes(searchTerm) ||
            lead.email?.toLowerCase().includes(searchTerm)
        );
    },

    filterByStage(stage) {
        if (stage === 'all') return AppState.leads;
        return AppState.leads.filter(lead => lead.stage === stage);
    }
};

// ============================================
// GERENCIADOR DE TAREFAS
// ============================================
const TaskManager = {
    getAll() {
        return AppState.tasks;
    },

    add(taskData) {
        const newTask = {
            id: Utils.generateId(),
            status: 'pendente',
            createdAt: new Date().toISOString(),
            ...taskData
        };

        AppState.tasks.push(newTask);
        this.save();
        Tasks.render();
        Notification.show('success', 'Tarefa criada', 'Nova tarefa adicionada');
    },

    toggleStatus(id) {
        const task = AppState.tasks.find(t => t.id === id);
        if (!task) return;

        task.status = task.status === 'concluida' ? 'pendente' : 'concluida';
        this.save();
        Tasks.render();
    },

    delete(id) {
        const index = AppState.tasks.findIndex(t => t.id === id);
        if (index === -1) return;

        AppState.tasks.splice(index, 1);
        this.save();
        Tasks.render();
        Notification.show('success', 'Tarefa removida', 'Tarefa excluída com sucesso');
    },

    save() {
        StorageManager.save({ leads: AppState.leads, tasks: AppState.tasks });
    }
};

// ============================================
// DASHBOARD
// ============================================
const Dashboard = {
    init() {
        this.render();
    },

    render() {
        this.updateStats();
        this.renderFunnel();
    },

    updateStats() {
        const leads = AppState.leads;
        
        const stats = {
            total: leads.length,
            leads: leads.filter(l => l.stage === 'leads').length,
            qualificacao: leads.filter(l => l.stage === 'qualificacao').length,
            oportunidades: leads.filter(l => l.stage === 'oportunidades').length,
            orcamento: leads.filter(l => l.stage === 'orcamento').length,
            pedido: leads.filter(l => l.stage === 'pedido').length,
            valorTotal: leads
                .filter(l => l.stage === 'pedido')
                .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0)
        };

        this.updateStatCard('total-leads', stats.total);
        this.updateStatCard('total-qualificacao', stats.qualificacao);
        this.updateStatCard('total-oportunidades', stats.oportunidades);
        this.updateStatCard('total-orcamento', stats.orcamento);
        this.updateStatCard('total-pedido', stats.pedido);
        this.updateStatCard('valor-total', Utils.formatCurrency(stats.valorTotal));
    },

    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    renderFunnel() {
        const stages = ['leads', 'qualificacao', 'oportunidades', 'orcamento', 'pedido'];
        const leads = AppState.leads;
        const maxCount = Math.max(...stages.map(s => 
            leads.filter(l => l.stage === s).length
        ), 1);

        stages.forEach(stage => {
            const count = leads.filter(l => l.stage === stage).length;
            const percentage = (count / maxCount) * 100;
            const value = leads
                .filter(l => l.stage === stage)
                .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

            const bar = document.querySelector(`.funil-item[data-stage="${stage}"] .funil-fill`);
            const countEl = document.querySelector(`.funil-item[data-stage="${stage}"] .funil-count`);
            const valueEl = document.querySelector(`.funil-item[data-stage="${stage}"] .funil-valor`);

            if (bar) bar.style.width = `${percentage}%`;
            if (countEl) countEl.textContent = count;
            if (valueEl) valueEl.textContent = Utils.formatCurrency(value);
        });
    }
};

// ============================================
// PIPELINE / KANBAN
// ============================================
const Pipeline = {
    init() {
        this.render();
        KanbanDragDrop.init();
    },

    render() {
        const stages = ['leads', 'qualificacao', 'oportunidades', 'orcamento', 'pedido'];
        
        stages.forEach(stage => {
            const column = document.querySelector(`.pipeline-column[data-stage="${stage}"]`);
            if (!column) return;

            const cardsContainer = column.querySelector('.cards-container');
            if (!cardsContainer) return;

            const stageLeads = LeadManager.filterByStage(stage);
            const totalValue = stageLeads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

            column.querySelector('.column-count').textContent = stageLeads.length;
            column.querySelector('.column-total').innerHTML = `Total: <strong>${Utils.formatCurrency(totalValue)}</strong>`;

            cardsContainer.innerHTML = stageLeads.map(lead => `
                <div class="pipeline-card ${lead.stage}" draggable="true" data-id="${lead.id}">
                    <div class="card-title">${Utils.sanitizeHTML(lead.title)}</div>
                    <div class="card-sub">${Utils.sanitizeHTML(lead.company || '')}</div>
                    <div class="card-sub">${lead.value ? Utils.formatCurrency(lead.value) : ''}</div>
                    <div class="card-actions">
                        <button class="btn btn-sm btn-outline" onclick="LeadModal.edit('${lead.id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="LeadManager.delete('${lead.id}')">Excluir</button>
                    </div>
                </div>
            `).join('');
        });
    }
};

// ============================================
// TAREFAS UI
// ============================================
const Tasks = {
    init() {
        this.render();
    },

    render() {
        const container = document.getElementById('tasks-list');
        if (!container) return;

        const tasks = TaskManager.getAll();
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <div class="empty-title">Nenhuma tarefa</div>
                    <div class="empty-subtitle">Crie uma nova tarefa para começar</div>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="task-item ${task.status === 'concluida' ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" 
                    ${task.status === 'concluida' ? 'checked' : ''} 
                    onchange="TaskManager.toggleStatus('${task.id}')">
                <div class="task-info">
                    <div class="task-title">${Utils.sanitizeHTML(task.title)}</div>
                    <div class="task-meta">${Utils.formatDate(task.dueDate)} • ${task.leadTitle || ''}</div>
                </div>
                <span class="task-status ${task.status}">${task.status}</span>
                <button class="btn btn-xs btn-danger" onclick="TaskManager.delete('${task.id}')">×</button>
            </div>
        `).join('');
    }
};

// ============================================
// MODAL DE LEAD
// ============================================
const LeadModal = {
    form: null,

    init() {
        this.form = document.getElementById('lead-form');
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    },

    open(mode = 'create', leadId = null) {
        this.mode = mode;
        this.currentLeadId = leadId;

        if (mode === 'edit' && leadId) {
            const lead = LeadManager.getById(leadId);
            if (lead) this.fillForm(lead);
        } else {
            this.resetForm();
        }

        ModalManager.open('lead-form-container');
    },

    edit(leadId) {
        this.open('edit', leadId);
    },

    fillForm(lead) {
        const fields = ['title', 'company', 'email', 'phone', 'value', 'stage', 'notes'];
        fields.forEach(field => {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (input) input.value = lead[field] || '';
        });
    },

    resetForm() {
        this.form?.reset();
        this.form?.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        this.form?.querySelectorAll('.error-message.visible').forEach(el => el.classList.remove('visible'));
    },

    handleSubmit(e) {
        e.preventDefault();

        if (!FormValidator.validateForm(this.form)) {
            Notification.show('error', 'Validação falhou', 'Corrija os erros no formulário');
            return;
        }

        const formData = new FormData(this.form);
        const leadData = Object.fromEntries(formData.entries());
        leadData.value = parseFloat(leadData.value) || 0;

        if (this.mode === 'create') {
            LeadManager.add(leadData);
        } else {
            LeadManager.update(this.currentLeadId, leadData);
        }

        ModalManager.close();
    }
};

// ============================================
// NAVEGAÇÃO E ROTEAMENTO
// ============================================
const Navigation = {
    init() {
        const navLinks = document.querySelectorAll('.sidebar nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                this.navigateTo(sectionId);
            });
        });
    },

    navigateTo(sectionId) {
        AppState.currentSection = sectionId;

        document.querySelectorAll('.section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });

        document.querySelectorAll('.sidebar nav a').forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });

        document.querySelector('.header h1').textContent = 
            sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    }
};

// ============================================
// BUSCA E FILTROS
// ============================================
const SearchFilter = {
    init() {
        const searchInput = document.getElementById('search-input');
        const filterSelect = document.getElementById('filter-stage');

        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                AppState.searchQuery = e.target.value;
                this.applyFilters();
            }, 300));
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                AppState.filterStage = e.target.value;
                this.applyFilters();
            });
        }
    },

    applyFilters() {
        let filtered = AppState.leads;

        if (AppState.searchQuery) {
            filtered = LeadManager.search(AppState.searchQuery);
        }

        if (AppState.filterStage !== 'all') {
            filtered = filtered.filter(lead => lead.stage === AppState.filterStage);
        }

        Pipeline.render();
    }
};

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================
const App = {
    async init() {
        try {
            Notification.init();
            ThemeManager.init();
            ModalManager.init();

            const savedData = StorageManager.load();
            if (savedData) {
                AppState.leads = savedData.leads || [];
                AppState.tasks = savedData.tasks || [];
            } else {
                this.loadSampleData();
            }

            Navigation.init();
            Dashboard.init();
            Pipeline.init();
            Tasks.init();
            LeadModal.init();
            SearchFilter.init();

            Notification.show('success', 'CRM Carregado', `Versão ${AppConfig.VERSION}`);
        } catch (error) {
            console.error('Erro na inicialização:', error);
            Notification.show('error', 'Erro crítico', 'Falha ao carregar aplicação');
        }
    },

    loadSampleData() {
        const sampleLeads = [
            { title: 'Empresa ABC', company: 'ABC Ltda', email: 'contato@abc.com', value: 15000, stage: 'leads' },
            { title: 'Tech Solutions', company: 'Tech Sol', email: 'vendas@techsol.com', value: 25000, stage: 'qualificacao' },
            { title: 'Consultoria XYZ', company: 'XYZ Consult', email: 'info@xyz.com', value: 35000, stage: 'oportunidades' },
            { title: 'Indústria 123', company: 'Ind 123', email: 'comercial@ind123.com', value: 50000, stage: 'orcamento' },
            { title: 'Varejo Mais', company: 'Varejo Mais', email: 'compras@varejomais.com', value: 75000, stage: 'pedido' }
        ];

        sampleLeads.forEach(lead => LeadManager.add(lead));

        const sampleTasks = [
            { title: 'Ligar para cliente', dueDate: new Date().toISOString(), leadTitle: 'Empresa ABC' },
            { title: 'Enviar proposta', dueDate: new Date().toISOString(), leadTitle: 'Tech Solutions' }
        ];

        sampleTasks.forEach(task => TaskManager.add(task));
    }
};

// Iniciar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => App.init());

// Expor funções globais necessárias
window.Notification = Notification;
window.LeadManager = LeadManager;
window.TaskManager = TaskManager;
window.LeadModal = LeadModal;
window.ThemeManager = ThemeManager;
window.ModalManager = ModalManager;
