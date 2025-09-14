document.addEventListener('DOMContentLoaded', () => {

    // ===========================================
    // SEÇÃO: VERIFICAÇÃO DE PERFIL DE USUÁRIO
    // ===========================================
    const userRole = sessionStorage.getItem('userRole');
    if (userRole === 'Administrador') {
        // Mostra elementos que são apenas para admins
        const adminLinks = document.querySelectorAll('.admin-only');
        adminLinks.forEach(link => {
            link.style.display = 'inline-block'; 
        });

        // Esconde elementos que são apenas para membros
        const memberSections = document.querySelectorAll('.member-only');
        memberSections.forEach(section => {
            section.style.display = 'none';
        });
    }

    // ===========================================
    // SEÇÃO: LÓGICA DO FORMULÁRIO DE LOGIN
    // ===========================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const loginTitle = document.getElementById('login-title');
        const params = new URLSearchParams(window.location.search);
        const profile = params.get('profile') || 'Membro';

        if (loginTitle) {
            loginTitle.textContent = `Entrar como ${profile}`;
        }
        
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            sessionStorage.setItem('userRole', profile);
            window.location.href = 'dashboard.html';
        });
    }
    
    // ===========================================
    // SEÇÃO: LÓGICA DE LOGOUT
    // ===========================================
    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', () => {
            sessionStorage.removeItem('userRole');
        });
    });

    // ===========================================
    // SEÇÃO: LÓGICA DA PÁGINA DE CADASTRO
    // ===========================================
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        const WEBHOOK_URL = 'https://lacerda.app.n8n.cloud/webhook/13eb80b9-ab04-410e-bdbf-5221418920ad';
        const submitButton = document.getElementById('submit-button');
        const successPopup = document.getElementById('success-popup');
        const errorMessage = document.getElementById('error-message');
        
        const radioSim = document.getElementById('filhos_sim');
        if (radioSim) {
            const radioNao = document.getElementById('filhos_nao');
            const containerQuantosFilhos = document.getElementById('container_quantos_filhos');
            const toggleQuantosFilhos = () => {
                containerQuantosFilhos.classList.toggle('hidden', !radioSim.checked);
            };
            radioSim.addEventListener('change', toggleQuantosFilhos);
            radioNao.addEventListener('change', toggleQuantosFilhos);
            toggleQuantosFilhos();
        }

        submitButton.addEventListener('click', async (event) => {
            event.preventDefault();
            if (!registrationForm.checkValidity()) {
                errorMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
                errorMessage.classList.remove('hidden');
                return;
            }
            errorMessage.classList.add('hidden');

            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
            
            const formData = new FormData(registrationForm);
            
            try {
                const response = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    successPopup.classList.remove('hidden');
                    setTimeout(() => {
                        registrationForm.reset();
                        window.location.href = 'index.html';
                    }, 4000);
                } else {
                    throw new Error('Falha no envio para o webhook.');
                }
            } catch (error) {
                console.error('Erro:', error);
                errorMessage.textContent = 'Ocorreu um erro ao enviar seu cadastro. Tente novamente.';
                errorMessage.classList.remove('hidden');
                submitButton.disabled = false;
                submitButton.textContent = 'Enviar para Aprovação';
            }
        });
    }

    // ===========================================
    // SEÇÃO: LÓGICA DA PÁGINA DE CONVIDADO (CARROSSEL)
    // ===========================================
    if (document.getElementById('carousel-container')) {
        const slides = document.querySelectorAll('.form-slide');
        const prevButton = document.getElementById('prev-slide');
        const nextNavButton = document.getElementById('next-slide');
        const finishButton = document.getElementById('finish-button');
        let currentSlide = 0;

        const showSlide = (index) => {
            slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        };

        const validateSlide = (slideIndex) => {
            const currentSlideElement = slides[slideIndex];
            const textInputs = currentSlideElement.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
            let allTextInputsValid = true;
            textInputs.forEach(input => {
                if (input.value.trim() === '') allTextInputsValid = false;
            });
            return allTextInputsValid;
        };

        const nextSlide = () => {
            if (validateSlide(currentSlide)) {
                if (currentSlide < slides.length - 1) {
                    currentSlide++;
                    showSlide(currentSlide);
                }
            } else {
                const okButton = slides[currentSlide].querySelector('.ok-button');
                if (okButton) {
                    okButton.classList.add('shake');
                    setTimeout(() => okButton.classList.remove('shake'), 500);
                }
            }
        };

        const prevSlide = () => {
            if (currentSlide > 0) {
                currentSlide--;
                showSlide(currentSlide);
            }
        };

        document.querySelectorAll('.ok-button:not(#finish-button)').forEach(button => button.addEventListener('click', nextSlide));
        if(nextNavButton) nextNavButton.addEventListener('click', nextSlide);
        if(prevButton) prevButton.addEventListener('click', prevSlide);
        if(finishButton) finishButton.addEventListener('click', () => { window.location.href = 'index.html'; });
        
        showSlide(currentSlide);
    }

    // ========================================================
    // SEÇÃO: LÓGICA DA PÁGINA DE STATUS (MODAIS)
    // ========================================================
    const confirmationModal = document.getElementById('confirmation-modal');
    if (confirmationModal) {
        const modalCloseBtn = document.getElementById('confirmation-modal-close-btn');
        const modalTitle = document.getElementById('confirmation-modal-title');
        const modalText = document.getElementById('confirmation-modal-text');
        
        const modalTriggers = [
            document.getElementById('request-chat-btn'),
            document.getElementById('request-group-chat-btn')
        ];

        const openConfirmationModal = (title, text) => {
            modalTitle.textContent = title;
            modalText.textContent = text;
            confirmationModal.classList.remove('hidden');
        };

        const closeConfirmationModal = () => {
            confirmationModal.classList.add('hidden');
        };

        modalTriggers.forEach(button => {
            if (button) {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    const title = button.dataset.modalTitle;
                    const text = button.dataset.modalText;
                    openConfirmationModal(title, text);
                });
            }
        });

        modalCloseBtn.addEventListener('click', closeConfirmationModal);
        confirmationModal.addEventListener('click', (event) => {
            if (event.target === confirmationModal) {
                closeConfirmationModal();
            }
        });
    }

    const recommendModal = document.getElementById('recommend-modal');
    if (recommendModal) {
        const members = [
            { id: 1, name: 'Ana Clara Souza', company: 'InovaTech Soluções' },
            { id: 2, name: 'Bruno Costa', company: 'BuildRight Engenharia' },
            { id: 3, name: 'Carla Dias', company: 'Mercado Digital ABC' },
            { id: 4, name: 'Daniel Martins', company: 'Agro Forte' },
            { id: 5, name: 'Eduarda Lima', company: 'Educa Mais Consultoria' },
            { id: 6, name: 'Felipe Rocha', company: 'Rocha & Advogados' },
        ];
        let selectedMemberId = null;

        const recommendBtn = document.getElementById('recommend-member-btn');
        const searchInput = document.getElementById('member-search-input');
        const memberListContainer = document.getElementById('member-list-container');
        const confirmBtn = document.getElementById('recommend-modal-confirm-btn');
        const cancelBtn = document.getElementById('recommend-modal-cancel-btn');

        const openRecommendModal = () => {
            renderMemberList(members);
            recommendModal.classList.remove('hidden');
        };

        const closeRecommendModal = () => {
            recommendModal.classList.add('hidden');
            searchInput.value = '';
            confirmBtn.disabled = true;
            selectedMemberId = null;
        };

        const renderMemberList = (memberArray) => {
            memberListContainer.innerHTML = '';
            if (memberArray.length === 0) {
                memberListContainer.innerHTML = '<p class="member-item-name" style="padding: 1rem;">Nenhum membro encontrado.</p>';
                return;
            }
            memberArray.forEach(member => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'member-item';
                memberDiv.dataset.id = member.id;
                memberDiv.innerHTML = `<p class="member-item-name">${member.name}</p><p class="member-item-company">${member.company}</p>`;
                memberListContainer.appendChild(memberDiv);
            });
        };
        
        recommendBtn.addEventListener('click', (event) => {
            event.preventDefault();
            openRecommendModal();
        });

        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchTerm));
            renderMemberList(filteredMembers);
        });

        memberListContainer.addEventListener('click', (event) => {
            const clickedItem = event.target.closest('.member-item');
            if (!clickedItem) return;
            const currentlySelected = memberListContainer.querySelector('.selected');
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
            }
            clickedItem.classList.add('selected');
            selectedMemberId = clickedItem.dataset.id;
            confirmBtn.disabled = false;
        });

        confirmBtn.addEventListener('click', () => {
            if (selectedMemberId) {
                const selectedMember = members.find(m => m.id == selectedMemberId);
                console.log('Indicando membro:', selectedMember.name);
                
                closeRecommendModal();
                
                const title = "Indicação Realizada!";
                const text = `Você indicou ${selectedMember.name} com sucesso.`;
                const confModalEl = document.getElementById('confirmation-modal');
                const confTitleEl = document.getElementById('confirmation-modal-title');
                const confTextEl = document.getElementById('confirmation-modal-text');
                
                if (confModalEl && confTitleEl && confTextEl) {
                    confTitleEl.textContent = title;
                    confTextEl.textContent = text;
                    confModalEl.classList.remove('hidden');
                }
            }
        });

        cancelBtn.addEventListener('click', closeRecommendModal);
        recommendModal.addEventListener('click', (event) => {
            if (event.target === recommendModal) {
                closeRecommendModal();
            }
        });
    }

    // ========================================================
    // SEÇÃO: LÓGICA DO MENU RESPONSIVO (HAMBÚRGUER)
    // ========================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const primaryNav = document.getElementById('primary-navigation');
    if (menuToggle && primaryNav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = primaryNav.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });

        primaryNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                primaryNav.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ========================================================
    // SEÇÃO: LÓGICA DA PÁGINA DE RELATÓRIOS
    // ========================================================
    if (document.getElementById('tblRel')) {
        const rows = [
            {data:'2025-08-02', membro:'José Favato', tipo:'negocio', desc:'Fornecimento de fardamentos', valor:120000, status:'concluido'},
            {data:'2025-08-08', membro:'Ana Lima', tipo:'indicacao', desc:'Indicação para Silvato', valor:80000, status:'concluido'},
            {data:'2025-08-10', membro:'Carlos Souza', tipo:'negocio', desc:'Projeto tático', valor:50000, status:'pendente'},
            {data:'2025-08-12', membro:'Maria Silva', tipo:'indicacao', desc:'Indicação B2B', valor:20000, status:'cancelado'},
            {data:'2025-08-20', membro:'José Favato', tipo:'negocio', desc:'Contrato manutenção', valor:30000, status:'concluido'},
            {data:'2025-09-01', membro:'Beatriz Araújo', tipo:'indicacao', desc:'Indicação premium', valor:150000, status:'concluido'},
            {data:'2025-09-05', membro:'Rafael Lima', tipo:'negocio', desc:'Lote especial', valor:90000, status:'pendente'},
            {data:'2025-09-08', membro:'José Favato', tipo:'indicacao', desc:'Indicação externa', valor:40000, status:'concluido'}
        ];
        let page = 1;
        const pageSize = 5;
        let filtered = [...rows];

        const elKpiDeals = document.getElementById('kpiDeals');
        const elKpiValue = document.getElementById('kpiValue');
        const elKpiRefIn  = document.getElementById('kpiRefIn');
        const elKpiRefOut = document.getElementById('kpiRefOut');
        const tbody = document.querySelector('#tblRel tbody');
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const chip = document.getElementById('activeFilters');

        function fmtBRL(v){ return v.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}); }
        function badge(status){
            if(status==='concluido') return '<span class="status-badge status-ok">Concluído</span>';
            if(status==='pendente')  return '<span class="status-badge status-pend">Pendente</span>';
            return '<span class="status-badge status-canc">Cancelado</span>';
        }
        function applyKPIs(list){
            const deals = list.filter(r=>r.tipo==='negocio').length;
            const total = list.reduce((s,r)=>s+(r.valor||0),0);
            const inRef = list.filter(r=>r.tipo==='indicacao').length;
            const refOut = list.filter(r=>r.tipo==='indicacao' && /favato/i.test(r.membro)).length;
            elKpiDeals.textContent = deals;
            elKpiValue.textContent = fmtBRL(total);
            elKpiRefIn.textContent = inRef;
            elKpiRefOut.textContent = refOut;
        }
        function render(){
            const start = (page-1)*pageSize;
            const pageRows = filtered.slice(start, start+pageSize);
            tbody.innerHTML = pageRows.map(r => `<tr><td>${new Date(r.data).toLocaleDateString('pt-BR')}</td><td>${r.membro}</td><td>${r.tipo === 'negocio' ? 'Negócio' : 'Indicação'}</td><td>${r.desc}</td><td>${fmtBRL(r.valor)}</td><td>${badge(r.status)}</td></tr>`).join('');
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
            page = Math.min(page, totalPages);
            pageInfo.textContent = `Página ${page} de ${totalPages} — ${filtered.length} registro(s)`;
            prevBtn.disabled = (page<=1);
            nextBtn.disabled = (page>=totalPages);
            applyKPIs(filtered);
        }
        function getFilters(){
            const fInicio = document.getElementById('fInicio').value;
            const fFim = document.getElementById('fFim').value;
            const fMembro = document.getElementById('fMembro').value.trim();
            const fTipo = document.getElementById('fTipo').value;
            const fStatus = document.getElementById('fStatus').value;
            return {fInicio, fFim, fMembro, fTipo, fStatus};
        }
        function applyFilters(){
            const {fInicio,fFim,fMembro,fTipo,fStatus} = getFilters();
            filtered = rows.filter(r=>{
                const d = new Date(r.data); let ok = true;
                if(fInicio){ ok = ok && (d >= new Date(fInicio+'T00:00:00')); }
                if(fFim){ ok = ok && (d <= new Date(fFim+'T23:59:59')); }
                if(fMembro){ ok = ok && r.membro.toLowerCase().includes(fMembro.toLowerCase()); }
                if(fTipo){ ok = ok && r.tipo===fTipo; }
                if(fStatus){ ok = ok && r.status===fStatus; }
                return ok;
            });
            const active = Object.values(getFilters()).filter(v=>v && v.length!==0).length;
            if(active>0){ chip.textContent = `${active} filtro(s) ativo(s)`; chip.classList.remove('hidden'); }
            else{ chip.classList.add('hidden'); }
            page = 1; render();
        }
        document.getElementById('btnFiltrar').addEventListener('click', applyFilters);
        document.getElementById('btnLimpar').addEventListener('click', ()=>{
            ['fInicio','fFim','fMembro','fTipo','fStatus'].forEach(id=>document.getElementById(id).value='');
            applyFilters();
        });
        prevBtn.addEventListener('click', ()=>{ if(page>1){ page--; render(); }});
        nextBtn.addEventListener('click', ()=>{
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
            if(page<totalPages){ page++; render(); }
        });
        function toCSV(list){
            const head = ['Data','Membro','Tipo','Descrição','Valor (R$)','Status'];
            const lines = list.map(r=>[ new Date(r.data).toLocaleDateString('pt-BR'), r.membro, r.tipo==='negocio'?'Negócio':'Indicação', r.desc.replaceAll(';',','), fmtBRL(r.valor), r.status ].join(';'));
            return [head.join(';'), ...lines].join('\n');
        }
        document.getElementById('btnExport').addEventListener('click', ()=>{
            const csv = toCSV(filtered);
            const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'relatorios_enjoy.csv';
            a.click();
            URL.revokeObjectURL(url);
        });
        document.getElementById('btnPrint').addEventListener('click', ()=> window.print());
        applyFilters();
    }

});