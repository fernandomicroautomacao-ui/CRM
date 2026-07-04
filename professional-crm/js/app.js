/**
 * Ploomes CRM Pro - Application JavaScript
 * Sistema completo de CRM com Email Marketing
 */

// ============================================
// CONFIGURAÇÃO E ESTADO GLOBAL
// ============================================
const AppConfig = {
    version: '2.0.0',
    storagePrefix: 'ploomes_crm_',
    dailyEmailLimit: { gmail: 500, outlook: 300 }
};

const AppState = {
    leads: [],
    stages: ['Novo Lead', 'Contato Inicial', 'Proposta', 'Negociação', 'Fechado'],
    tasks: [],
    campaigns: [],
    templates: [],
    sentEmails: [],
    integrations: { gmail: null, outlook: null },
    currentWizardStep: 1,
    campaignData: {
        name: '',
        subject: '',
        from: '',
        recipients: [],
        content: ''
    },
    darkMode: false
};

// ============================================
// UTILITÁRIOS
// ============================================
const Utils = {
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(date));
    },

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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

    replaceVariables(text, lead) {
        if (!text) return '';
        return text
            .replace(/{{nome}}/g, lead.name || '')
            .replace(/{{empresa}}/g, lead.company || '')
            .replace(/{{email}}/g, lead.email || '');
    }
};

// ============================================
// ARMAZENAMENTO LOCAL
// ============================================
const Storage = {
    save(key, data) {
        try {
            localStorage.setItem(AppConfig.storagePrefix + key, JSON.stringify(data));
        } catch (error) {
            console.error('Erro ao salvar:', error);
            Notification.show('Erro ao salvar dados', 'error');
        }
    },

    load(key) {
        try {
            const data = localStorage.getItem(AppConfig.storagePrefix + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar:', error);
            return null;
        }
    },

    saveAll() {
        this.save('leads', AppState.leads);
        this.save('tasks', AppState.tasks);
        this.save('campaigns', AppState.campaigns);
        this.save('templates', AppState.templates);
        this.save('sentEmails', AppState.sentEmails);
        this.save('integrations', AppState.integrations);
    },

    loadAll() {
        AppState.leads = this.load('leads') || [];
        AppState.tasks = this.load('tasks') || [];
        AppState.campaigns = this.load('campaigns') || [];
        AppState.templates = this.load('templates') || [];
        AppState.sentEmails = this.load('sentEmails') || [];
        AppState.integrations = this.load('integrations') || { gmail: null, outlook: null };
    }
};

// ============================================
// NOTIFICAÇÕES TOAST
// ============================================
const Notification = {
    show(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${Utils.sanitizeHTML(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ============================================
// TEMA (DARK MODE)
// ============================================
const Theme = {
    init() {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            this.enable();
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches && !saved) {
            this.enable();
        }
    },

    enable() {
        document.documentElement.setAttribute('data-theme', 'dark');
        AppState.darkMode = true;
        localStorage.setItem('theme', 'dark');
        this.updateButton();
    },

    disable() {
        document.documentElement.removeAttribute('data-theme');
        AppState.darkMode = false;
        localStorage.setItem('theme', 'light');
        this.updateButton();
    },

    toggle() {
        if (AppState.darkMode) {
            this.disable();
        } else {
            this.enable();
        }
    },

    updateButton() {
        const btn = document.getElementById('themeToggle');
        if (btn) {
            const icon = btn.querySelector('i');
            const text = btn.querySelector('span');
            if (AppState.darkMode) {
                icon.className = 'fas fa-sun';
                text.textContent = 'Modo Claro';
            } else {
                icon.className = 'fas fa-moon';
                text.textContent = 'Modo Escuro';
            }
        }
    }
};

// ============================================
// MODAL
// ============================================
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ============================================
// GERENCIADOR DE LEADS
// ============================================
const LeadManager = {
    add(lead) {
        const newLead = {
            id: Utils.generateId(),
            ...lead,
            stage: 'Novo Lead',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        AppState.leads.push(newLead);
        Storage.saveAll();
        Notification.show('Lead criado com sucesso!', 'success');
        return newLead;
    },

    update(id, updates) {
        const index = AppState.leads.findIndex(l => l.id === id);
        if (index !== -1) {
            AppState.leads[index] = {
                ...AppState.leads[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            Storage.saveAll();
            Notification.show('Lead atualizado!', 'success');
        }
    },

    delete(id) {
        AppState.leads = AppState.leads.filter(l => l.id !== id);
        Storage.saveAll();
        Notification.show('Lead removido', 'success');
    },

    getByStage(stage) {
        return AppState.leads.filter(l => l.stage === stage);
    },

    renderList() {
        const container = document.getElementById('leadsContainer');
        if (!container) return;

        if (AppState.leads.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Nenhum lead cadastrado</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="leads-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Empresa</th>
                        <th>Valor</th>
                        <th>Etapa</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${AppState.leads.map(lead => `
                        <tr>
                            <td>
                                <div class="lead-name">
                                    <div class="lead-avatar">${Utils.getInitials(lead.name)}</div>
                                    <span>${Utils.sanitizeHTML(lead.name)}</span>
                                </div>
                            </td>
                            <td>${Utils.sanitizeHTML(lead.email)}</td>
                            <td>${Utils.sanitizeHTML(lead.company || '-')}</td>
                            <td>${lead.value ? Utils.formatCurrency(lead.value) : '-'}</td>
                            <td><span class="status-badge ${lead.stage.toLowerCase().replace(' ', '-')}">${Utils.sanitizeHTML(lead.stage)}</span></td>
                            <td>
                                <button class="action-btn" onclick="LeadManager.edit('${lead.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn" onclick="LeadManager.delete('${lead.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    edit(id) {
        const lead = AppState.leads.find(l => l.id === id);
        if (lead) {
            document.getElementById('leadName').value = lead.name;
            document.getElementById('leadEmail').value = lead.email;
            document.getElementById('leadPhone').value = lead.phone || '';
            document.getElementById('leadCompany').value = lead.company || '';
            document.getElementById('leadValue').value = lead.value || '';
            document.getElementById('leadSource').value = lead.source || 'website';
            openModal('leadModal');
        }
    }
};

// ============================================
// GERENCIADOR DE TAREFAS
// ============================================
const TaskManager = {
    add(task) {
        const newTask = {
            id: Utils.generateId(),
            ...task,
            completed: false,
            createdAt: new Date().toISOString()
        };
        AppState.tasks.push(newTask);
        Storage.saveAll();
        Notification.show('Tarefa criada!', 'success');
    },

    toggle(id) {
        const task = AppState.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            Storage.saveAll();
        }
    },

    render() {
        const container = document.getElementById('tasksContainer');
        if (!container) return;

        if (AppState.tasks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-tasks" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Nenhuma tarefa pendente</p>
                </div>
            `;
            return;
        }

        container.innerHTML = AppState.tasks.map(task => `
            <div class="task-card" style="${task.completed ? 'opacity: 0.6;' : ''}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="TaskManager.toggle('${task.id}')">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-info">
                    <div class="task-title" style="${task.completed ? 'text-decoration: line-through;' : ''}">
                        ${Utils.sanitizeHTML(task.title)}
                    </div>
                    <div class="task-meta">
                        ${task.dueDate ? 'Vence: ' + Utils.formatDate(task.dueDate) : ''}
                    </div>
                </div>
                <span class="task-priority ${task.priority}">${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}</span>
            </div>
        `).join('');
    }
};

// ============================================
// PIPELINE KANBAN
// ============================================
const Pipeline = {
    render() {
        const board = document.getElementById('kanbanBoard');
        if (!board) return;

        board.innerHTML = AppState.stages.map(stage => {
            const leads = LeadManager.getByStage(stage);
            return `
                <div class="kanban-column" data-stage="${Utils.sanitizeHTML(stage)}">
                    <div class="column-header">
                        <div class="column-title">
                            <span>${Utils.sanitizeHTML(stage)}</span>
                            <span class="column-count">${leads.length}</span>
                        </div>
                    </div>
                    <div class="column-body" data-stage="${Utils.sanitizeHTML(stage)}">
                        ${leads.map(lead => `
                            <div class="kanban-card" draggable="true" data-id="${lead.id}">
                                <div class="kanban-card-title">${Utils.sanitizeHTML(lead.name)}</div>
                                <div class="kanban-card-meta">
                                    <span>${Utils.sanitizeHTML(lead.company || 'Sem empresa')}</span>
                                    <span>${lead.value ? Utils.formatCurrency(lead.value) : ''}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        this.initDragDrop();
    },

    initDragDrop() {
        const cards = document.querySelectorAll('.kanban-card');
        const columns = document.querySelectorAll('.column-body');

        cards.forEach(card => {
            card.addEventListener('dragstart', () => {
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', e => {
                e.preventDefault();
                const dragging = document.querySelector('.dragging');
                if (dragging) {
                    column.appendChild(dragging);
                }
            });

            column.addEventListener('drop', e => {
                e.preventDefault();
                const dragging = document.querySelector('.dragging');
                if (dragging) {
                    const leadId = dragging.dataset.id;
                    const newStage = column.dataset.stage;
                    LeadManager.update(leadId, { stage: newStage });
                    this.render();
                    Dashboard.render();
                }
            });
        });
    }
};

// ============================================
// DASHBOARD
// ============================================
const Dashboard = {
    render() {
        // Stats
        document.getElementById('totalLeads').textContent = AppState.leads.length;
        
        const totalValue = AppState.leads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
        document.getElementById('totalValue').textContent = Utils.formatCurrency(totalValue);
        
        const wonDeals = AppState.leads.filter(l => l.stage === 'Fechado').length;
        document.getElementById('dealsWon').textContent = wonDeals;
        
        const emailsSent = AppState.sentEmails.length;
        document.getElementById('emailsSent').textContent = emailsSent;

        // Funnel
        this.renderFunnel();

        // Activity
        this.renderActivity();
    },

    renderFunnel() {
        const container = document.getElementById('funnelChart');
        if (!container) return;

        const maxCount = Math.max(...AppState.stages.map(s => LeadManager.getByStage(s).length), 1);

        container.innerHTML = AppState.stages.map(stage => {
            const count = LeadManager.getByStage(stage).length;
            const percentage = (count / maxCount) * 100;
            
            return `
                <div class="funnel-stage">
                    <div class="funnel-label">${Utils.sanitizeHTML(stage)}</div>
                    <div class="funnel-bar">
                        <div class="funnel-fill" style="width: ${percentage}%">${count}</div>
                    </div>
                    <div class="funnel-count">${count}</div>
                </div>
            `;
        }).join('');
    },

    renderActivity() {
        const container = document.getElementById('activityList');
        if (!container) return;

        const activities = [
            ...AppState.sentEmails.slice(-5).map(email => ({
                icon: 'fa-envelope',
                title: `Email enviado para ${email.recipient}`,
                time: Utils.formatDate(email.sentAt)
            })),
            ...AppState.leads.slice(-5).map(lead => ({
                icon: 'fa-user-plus',
                title: `Novo lead: ${lead.name}`,
                time: Utils.formatDate(lead.createdAt)
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        if (activities.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">Nenhuma atividade recente</p>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${Utils.sanitizeHTML(activity.title)}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
};

// ============================================
// EMAIL MARKETING
// ============================================
const EmailMarketing = {
    init() {
        this.setupTabs();
        this.setupCampaignWizard();
        this.renderCampaigns();
        this.renderTemplates();
        this.renderSentEmails();
        this.renderIntegrations();
    },

    setupTabs() {
        const tabs = document.querySelectorAll('.email-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.email-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${target}Tab`).classList.add('active');
            });
        });
    },

    // Campaigns
    renderCampaigns() {
        const grid = document.getElementById('campaignsGrid');
        if (!grid) return;

        if (AppState.campaigns.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-paper-plane" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Nenhuma campanha criada</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = AppState.campaigns.map(campaign => `
            <div class="campaign-card">
                <div class="campaign-header">
                    <div class="campaign-icon">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <div class="campaign-actions">
                        <button class="action-btn" onclick="EmailMarketing.duplicateCampaign('${campaign.id}')">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn" onclick="EmailMarketing.deleteCampaign('${campaign.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h3>${Utils.sanitizeHTML(campaign.name)}</h3>
                <p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0.5rem 0;">
                    ${Utils.sanitizeHTML(campaign.subject)}
                </p>
                <div class="campaign-stats">
                    <div class="stat-item">
                        <div class="stat-value">${campaign.recipients?.length || 0}</div>
                        <div class="stat-label">Destinatários</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${campaign.status === 'sent' ? 'Enviado' : 'Rascunho'}</div>
                        <div class="stat-label">Status</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${Utils.formatDate(campaign.createdAt)}</div>
                        <div class="stat-label">Criada</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Templates
    renderTemplates() {
        const grid = document.getElementById('templatesGrid');
        if (!grid) return;

        if (AppState.templates.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-file-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Nenhum template criado</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = AppState.templates.map(template => `
            <div class="template-card">
                <div class="template-header">
                    <div class="template-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="template-actions">
                        <button class="action-btn" onclick="EmailMarketing.editTemplate('${template.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="EmailMarketing.deleteTemplate('${template.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h3>${Utils.sanitizeHTML(template.name)}</h3>
                <p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0.5rem 0;">
                    ${Utils.sanitizeHTML(template.subject || 'Sem assunto')}
                </p>
            </div>
        `).join('');
    },

    // Sent Emails
    renderSentEmails() {
        const list = document.getElementById('sentList');
        if (!list) return;

        if (AppState.sentEmails.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-history" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Nenhum email enviado</p>
                </div>
            `;
            return;
        }

        list.innerHTML = AppState.sentEmails.slice().reverse().map(email => `
            <div class="task-card">
                <div class="task-info">
                    <div class="task-title">Para: ${Utils.sanitizeHTML(email.recipient)}</div>
                    <div class="task-meta">Assunto: ${Utils.sanitizeHTML(email.subject)}</div>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${Utils.formatDate(email.sentAt)}</span>
            </div>
        `).join('');
    },

    // Integrations
    renderIntegrations() {
        this.updateIntegrationStatus('gmail');
        this.updateIntegrationStatus('outlook');
        this.populateFromSelect();
    },

    updateIntegrationStatus(provider) {
        const statusEl = document.getElementById(`${provider}Status`);
        const card = document.getElementById(`${provider}Card`);
        const btn = card.querySelector('.btn-connect');
        
        if (AppState.integrations[provider]) {
            statusEl.innerHTML = '<span class="status-badge connected">Conectado</span>';
            btn.textContent = 'Desconectar';
            btn.onclick = () => this.disconnectIntegration(provider);
        } else {
            statusEl.innerHTML = '<span class="status-badge disconnected">Desconectado</span>';
            btn.textContent = `Conectar com ${provider === 'gmail' ? 'Gmail' : 'Outlook'}`;
            btn.onclick = () => this.connectIntegration(provider);
        }
    },

    connectIntegration(provider) {
        // Simulação de OAuth
        Notification.show(`Iniciando conexão com ${provider === 'gmail' ? 'Gmail' : 'Outlook'}...`, 'info');
        
        setTimeout(() => {
            AppState.integrations[provider] = {
                connected: true,
                email: `usuario@${provider}.com`,
                connectedAt: new Date().toISOString(),
                dailySent: 0
            };
            Storage.saveAll();
            this.updateIntegrationStatus(provider);
            Notification.show(`${provider === 'gmail' ? 'Gmail' : 'Outlook'} conectado com sucesso!`, 'success');
        }, 1500);
    },

    disconnectIntegration(provider) {
        AppState.integrations[provider] = null;
        Storage.saveAll();
        this.updateIntegrationStatus(provider);
        Notification.show('Conta desconectada', 'success');
    },

    populateFromSelect() {
        const select = document.getElementById('campaignFrom');
        if (!select) return;

        const options = ['<option value="">Selecione uma integração</option>'];
        
        if (AppState.integrations.gmail) {
            options.push('<option value="gmail">Gmail</option>');
        }
        if (AppState.integrations.outlook) {
            options.push('<option value="outlook">Outlook</option>');
        }

        select.innerHTML = options.join('');
    },

    // Campaign Wizard
    setupCampaignWizard() {
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        const sendBtn = document.getElementById('sendCampaignBtn');

        prevBtn?.addEventListener('click', () => this.changeStep(-1));
        nextBtn?.addEventListener('click', () => this.changeStep(1));
        sendBtn?.addEventListener('click', () => this.sendCampaign());

        // Recipient selection
        document.getElementById('recipientSearch')?.addEventListener('input', 
            Utils.debounce(() => this.filterRecipients(), 300));
        document.getElementById('recipientStageFilter')?.addEventListener('change', 
            () => this.filterRecipients());

        // Template selector
        document.getElementById('templateSelector')?.addEventListener('change', (e) => {
            if (e.target.value) {
                const template = AppState.templates.find(t => t.id === e.target.value);
                if (template) {
                    document.getElementById('emailContent').value = template.content;
                }
            }
        });

        // Insert variable
        document.getElementById('insertVariableBtn')?.addEventListener('click', () => {
            const textarea = document.getElementById('emailContent');
            const variables = ['{{nome}}', '{{empresa}}', '{{email}}'];
            const selected = variables[Math.floor(Math.random() * variables.length)];
            textarea.value += selected;
        });
    },

    changeStep(direction) {
        const steps = document.querySelectorAll('.wizard-step');
        const stepIndicators = document.querySelectorAll('.step');
        
        // Validate current step
        if (direction === 1 && !this.validateCurrentStep()) return;

        const newStep = AppState.currentWizardStep + direction;
        if (newStep < 1 || newStep > 4) return;

        // Update indicators
        stepIndicators.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < newStep) {
                step.classList.add('completed');
            } else if (index + 1 === newStep) {
                step.classList.add('active');
            }
        });

        // Update content
        steps.forEach(step => step.classList.remove('active'));
        document.getElementById(`step${newStep}`).classList.add('active');

        AppState.currentWizardStep = newStep;

        // Update buttons
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        const sendBtn = document.getElementById('sendCampaignBtn');

        prevBtn.disabled = newStep === 1;

        if (newStep === 4) {
            nextBtn.style.display = 'none';
            sendBtn.style.display = 'inline-flex';
            this.updateReview();
        } else {
            nextBtn.style.display = 'inline-flex';
            sendBtn.style.display = 'none';
        }

        if (newStep === 2) {
            this.renderRecipientList();
        }
    },

    validateCurrentStep() {
        switch(AppState.currentWizardStep) {
            case 1:
                const name = document.getElementById('campaignName').value;
                const subject = document.getElementById('campaignSubject').value;
                if (!name || !subject) {
                    Notification.show('Preencha nome e assunto da campanha', 'error');
                    return false;
                }
                break;
            case 2:
                if (AppState.campaignData.recipients.length === 0) {
                    Notification.show('Selecione pelo menos um destinatário', 'error');
                    return false;
                }
                break;
            case 3:
                const content = document.getElementById('emailContent').value;
                if (!content.trim()) {
                    Notification.show('Digite o conteúdo do email', 'error');
                    return false;
                }
                break;
        }
        return true;
    },

    renderRecipientList() {
        const list = document.getElementById('recipientList');
        if (!list) return;

        this.filterRecipients();
    },

    filterRecipients() {
        const search = document.getElementById('recipientSearch')?.value.toLowerCase() || '';
        const stageFilter = document.getElementById('recipientStageFilter')?.value || '';
        
        let filtered = AppState.leads;
        
        if (search) {
            filtered = filtered.filter(l => 
                l.name.toLowerCase().includes(search) || 
                l.email.toLowerCase().includes(search)
            );
        }
        
        if (stageFilter) {
            filtered = filtered.filter(l => l.stage === stageFilter);
        }

        const list = document.getElementById('recipientList');
        list.innerHTML = filtered.map(lead => {
            const isSelected = AppState.campaignData.recipients.includes(lead.id);
            return `
                <div class="recipient-item ${isSelected ? 'selected' : ''}" 
                     onclick="EmailMarketing.toggleRecipient('${lead.id}')">
                    <input type="checkbox" class="recipient-checkbox" 
                           ${isSelected ? 'checked' : ''}>
                    <div>
                        <strong>${Utils.sanitizeHTML(lead.name)}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">
                            ${Utils.sanitizeHTML(lead.email)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('selectedCount').textContent = AppState.campaignData.recipients.length;
    },

    toggleRecipient(leadId) {
        const index = AppState.campaignData.recipients.indexOf(leadId);
        if (index === -1) {
            AppState.campaignData.recipients.push(leadId);
        } else {
            AppState.campaignData.recipients.splice(index, 1);
        }
        this.filterRecipients();
    },

    updateReview() {
        document.getElementById('reviewName').textContent = AppState.campaignData.name;
        document.getElementById('reviewSubject').textContent = AppState.campaignData.subject;
        document.getElementById('reviewRecipients').textContent = 
            `${AppState.campaignData.recipients.length} destinatários`;
        
        const fromSelect = document.getElementById('campaignFrom');
        const fromText = fromSelect.options[fromSelect.selectedIndex]?.text || 'Não selecionado';
        document.getElementById('reviewFrom').textContent = fromText;

        // Preview with first recipient
        const firstRecipient = AppState.leads.find(l => 
            AppState.campaignData.recipients.includes(l.id)
        );
        if (firstRecipient) {
            const content = Utils.replaceVariables(
                AppState.campaignData.content, 
                firstRecipient
            );
            document.getElementById('emailPreview').innerHTML = content.replace(/\n/g, '<br>');
        }
    },

    sendCampaign() {
        const fromProvider = document.getElementById('campaignFrom').value;
        
        if (!fromProvider) {
            Notification.show('Selecione uma integração de email', 'error');
            return;
        }

        const integration = AppState.integrations[fromProvider];
        if (!integration) {
            Notification.show('Integração não encontrada', 'error');
            return;
        }

        // Check daily limit
        const today = new Date().toDateString();
        const todaySent = AppState.sentEmails.filter(e => 
            new Date(e.sentAt).toDateString() === today && 
            e.provider === fromProvider
        ).length;

        const limit = AppConfig.dailyEmailLimit[fromProvider];
        if (todaySent + AppState.campaignData.recipients.length > limit) {
            Notification.show(`Limite diário excedido (${limit} emails/dia)`, 'error');
            return;
        }

        // Send emails
        const campaign = {
            id: Utils.generateId(),
            name: AppState.campaignData.name,
            subject: AppState.campaignData.subject,
            content: AppState.campaignData.content,
            recipients: [...AppState.campaignData.recipients],
            from: fromProvider,
            status: 'sent',
            createdAt: new Date().toISOString(),
            sentAt: new Date().toISOString()
        };

        AppState.campaigns.push(campaign);

        // Create sent email records
        AppState.campaignData.recipients.forEach(leadId => {
            const lead = AppState.leads.find(l => l.id === leadId);
            if (lead) {
                AppState.sentEmails.push({
                    id: Utils.generateId(),
                    campaignId: campaign.id,
                    recipient: lead.email,
                    recipientName: lead.name,
                    subject: campaign.subject,
                    provider: fromProvider,
                    sentAt: new Date().toISOString()
                });
            }
        });

        Storage.saveAll();
        
        Notification.show(`Campanha enviada com ${AppState.campaignData.recipients.length} emails!`, 'success');
        
        // Reset and close
        this.resetWizard();
        closeModal('campaignModal');
        this.renderCampaigns();
        this.renderSentEmails();
        Dashboard.render();
    },

    resetWizard() {
        AppState.currentWizardStep = 1;
        AppState.campaignData = {
            name: '',
            subject: '',
            from: '',
            recipients: [],
            content: ''
        };

        document.getElementById('campaignName').value = '';
        document.getElementById('campaignSubject').value = '';
        document.getElementById('campaignFrom').value = '';
        document.getElementById('emailContent').value = '';
        document.getElementById('templateSelector').value = '';

        // Reset steps UI
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index === 0) step.classList.add('active');
        });

        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            step.classList.remove('active');
            if (index === 0) step.classList.add('active');
        });

        document.getElementById('prevStepBtn').disabled = true;
        document.getElementById('nextStepBtn').style.display = 'inline-flex';
        document.getElementById('sendCampaignBtn').style.display = 'none';
    },

    // Template management
    saveTemplate() {
        const name = document.getElementById('templateName').value;
        const subject = document.getElementById('templateSubject').value;
        const content = document.getElementById('templateContent').value;

        if (!name || !content) {
            Notification.show('Preencha nome e conteúdo', 'error');
            return;
        }

        const template = {
            id: Utils.generateId(),
            name,
            subject,
            content,
            createdAt: new Date().toISOString()
        };

        AppState.templates.push(template);
        Storage.saveAll();
        Notification.show('Template salvo!', 'success');
        closeModal('templateModal');
        this.renderTemplates();
    },

    editTemplate(id) {
        const template = AppState.templates.find(t => t.id === id);
        if (template) {
            document.getElementById('templateName').value = template.name;
            document.getElementById('templateSubject').value = template.subject || '';
            document.getElementById('templateContent').value = template.content;
            document.getElementById('templateModalTitle').textContent = 'Editar Template';
            openModal('templateModal');
        }
    },

    deleteTemplate(id) {
        if (confirm('Tem certeza que deseja excluir este template?')) {
            AppState.templates = AppState.templates.filter(t => t.id !== id);
            Storage.saveAll();
            Notification.show('Template excluído', 'success');
            this.renderTemplates();
        }
    },

    // Campaign management
    duplicateCampaign(id) {
        const campaign = AppState.campaigns.find(c => c.id === id);
        if (campaign) {
            const newCampaign = {
                ...campaign,
                id: Utils.generateId(),
                name: campaign.name + ' (Cópia)',
                status: 'draft',
                createdAt: new Date().toISOString()
            };
            AppState.campaigns.push(newCampaign);
            Storage.saveAll();
            Notification.show('Campanha duplicada!', 'success');
            this.renderCampaigns();
        }
    },

    deleteCampaign(id) {
        if (confirm('Tem certeza que deseja excluir esta campanha?')) {
            AppState.campaigns = AppState.campaigns.filter(c => c.id !== id);
            Storage.saveAll();
            Notification.show('Campanha excluída', 'success');
            this.renderCampaigns();
        }
    }
};

// ============================================
// NAVEGAÇÃO
// ============================================
const Navigation = {
    init() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateTo(section);
            });
        });

        // Mobile menu
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });

        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    },

    navigateTo(section) {
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Update sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}Section`)?.classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            pipeline: 'Pipeline de Vendas',
            leads: 'Gerenciar Leads',
            tasks: 'Tarefas',
            email: 'Email Marketing'
        };
        document.getElementById('pageTitle').textContent = titles[section] || section;

        // Close mobile menu
        document.querySelector('.sidebar').classList.remove('active');

        // Refresh section data
        if (section === 'pipeline') {
            Pipeline.render();
        } else if (section === 'leads') {
            LeadManager.renderList();
        } else if (section === 'tasks') {
            TaskManager.render();
        } else if (section === 'email') {
            EmailMarketing.init();
        } else if (section === 'dashboard') {
            Dashboard.render();
        }
    }
};

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Load data
    Storage.loadAll();
    
    // Init theme
    Theme.init();

    // Setup event listeners
    document.getElementById('themeToggle')?.addEventListener('click', () => Theme.toggle());
    
    document.getElementById('newLeadBtn')?.addEventListener('click', () => {
        document.getElementById('leadForm').reset();
        openModal('leadModal');
    });

    document.getElementById('saveLeadBtn')?.addEventListener('click', () => {
        const name = document.getElementById('leadName').value;
        const email = document.getElementById('leadEmail').value;
        
        if (!name || !email) {
            Notification.show('Preencha nome e email', 'error');
            return;
        }

        LeadManager.add({
            name,
            email,
            phone: document.getElementById('leadPhone').value,
            company: document.getElementById('leadCompany').value,
            value: parseFloat(document.getElementById('leadValue').value) || 0,
            source: document.getElementById('leadSource').value,
            notes: document.getElementById('leadNotes').value
        });

        closeModal('leadModal');
        LeadManager.renderList();
        Pipeline.render();
        Dashboard.render();
    });

    document.getElementById('newTaskBtn')?.addEventListener('click', () => {
        document.getElementById('taskForm').reset();
        document.getElementById('taskModalTitle').textContent = 'Nova Tarefa';
        openModal('taskModal');
    });

    document.getElementById('saveTaskBtn')?.addEventListener('click', () => {
        const title = document.getElementById('taskTitle').value;
        if (!title) {
            Notification.show('Preencha o título da tarefa', 'error');
            return;
        }

        TaskManager.add({
            title,
            description: document.getElementById('taskDescription').value,
            dueDate: document.getElementById('taskDueDate').value,
            priority: document.getElementById('taskPriority').value
        });

        closeModal('taskModal');
        TaskManager.render();
    });

    document.getElementById('newCampaignBtn')?.addEventListener('click', () => {
        // Populate stage filter
        const stageFilter = document.getElementById('recipientStageFilter');
        stageFilter.innerHTML = '<option value="">Todas as etapas</option>' +
            AppState.stages.map(s => `<option value="${s}">${s}</option>`).join('');
        
        // Populate template selector
        const templateSelector = document.getElementById('templateSelector');
        templateSelector.innerHTML = '<option value="">Selecionar template...</option>' +
            AppState.templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
        
        openModal('campaignModal');
    });

    document.getElementById('newTemplateBtn')?.addEventListener('click', () => {
        document.getElementById('templateForm').reset();
        document.getElementById('templateModalTitle').textContent = 'Novo Template';
        openModal('templateModal');
    });

    document.getElementById('saveTemplateBtn')?.addEventListener('click', () => {
        EmailMarketing.saveTemplate();
    });

    document.getElementById('connectGmailBtn')?.addEventListener('click', () => {
        EmailMarketing.connectIntegration('gmail');
    });

    document.getElementById('connectOutlookBtn')?.addEventListener('click', () => {
        EmailMarketing.connectIntegration('outlook');
    });

    // Global search
    document.getElementById('globalSearch')?.addEventListener('input', 
        Utils.debounce((e) => {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) return;
            
            const results = AppState.leads.filter(l => 
                l.name.toLowerCase().includes(query) || 
                l.email.toLowerCase().includes(query) ||
                l.company?.toLowerCase().includes(query)
            );
            
            if (results.length > 0) {
                Notification.show(`${results.length} leads encontrados`, 'info');
            }
        }, 300)
    );

    // Initialize app
    Navigation.init();
    EmailMarketing.init();
    Dashboard.render();
    
    // Populate filters
    const stageFilter = document.getElementById('stageFilter');
    stageFilter.innerHTML = '<option value="">Todas as Etapas</option>' +
        AppState.stages.map(s => `<option value="${s}">${s}</option>`).join('');

    console.log('Ploomes CRM Pro v' + AppConfig.version + ' initialized');
});
