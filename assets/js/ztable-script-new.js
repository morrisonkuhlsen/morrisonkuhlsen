// Iniciar o script quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos da interface
    const table = document.getElementById('myTable');

    if (!document.body) {
        console.error('Erro: O corpo do documento não foi carregado!');
        return;
    }

    if (!table) {
        console.error('Erro: Tabela não encontrada!');
        return;
    }

    // Variáveis globais
    let selectedCells = [];
    let tooltip = null;
    
    // Inicialização
    /* Ano do rodapé, nas três tabelas. Estava preso em 2025 no HTML. */
    function anoDoRodape() {
        document.querySelectorAll('[data-ano]').forEach(el => {
            el.textContent = new Date().getFullYear();
        });
    }

    function init() {
        setupEventListeners();
        setupTooltips();
        setupTable();
        setupStickyPositiveHeader(); // <-- adiciona comportamento de "congelar" o cabeçalho positivo
        anoDoRodape();
    }
    
    // Torna a fileira do Z positivo "sticky" quando atinge o topo, e oculta o thead negativo
    function setupStickyPositiveHeader() {
        const table = document.getElementById('myTable');
        if (!table) return;

        const thead = table.querySelector('thead');
        // Encontra a linha que contém o cabeçalho positivo (linha com <th>Z</th> e colunas começando com "+")
        const rows = Array.from(table.querySelectorAll('tr'));
        const positiveRow = rows.find(tr => {
            const ths = Array.from(tr.querySelectorAll('th'));
            if (!ths.length) return false;
            const first = ths[0].textContent.trim();
            const second = ths[1] ? ths[1].textContent.trim() : '';
            return first === 'Z' && (second.startsWith('+') || second.startsWith('+'));
        });
        if (!positiveRow) return;

        let isSticky = false;

        function getTheadHeight() {
            return thead ? thead.getBoundingClientRect().height : 0;
        }

        function checkSticky() {
            const rect = positiveRow.getBoundingClientRect();
            const threshold = getTheadHeight();
            // quando a linha positiva passar por cima do topo do viewport (considerando o thead)
            if (rect.top <= threshold && !isSticky) {
                positiveRow.classList.add('sticky-z-positive');
                if (thead) thead.style.visibility = 'hidden';
                isSticky = true;
            } else if (rect.top > threshold && isSticky) {
                positiveRow.classList.remove('sticky-z-positive');
                if (thead) thead.style.visibility = 'visible';
                isSticky = false;
            }
        }

        // throttle simples para evitar muitas chamadas no scroll
        function throttle(fn, wait) {
            let last = 0;
            return function (...args) {
                const now = Date.now();
                if (now - last >= wait) {
                    last = now;
                    fn.apply(this, args);
                }
            };
        }

        window.addEventListener('scroll', throttle(checkSticky, 16));
        window.addEventListener('resize', throttle(checkSticky, 100));
        // checa imediatamente (útil se a página já estiver rolada)
        checkSticky();
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Limpar seleções ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#myTable')) {
                clearSelections();
            }
        });
        
        // Teclas de atalho
        document.addEventListener('keydown', handleKeyDown);
    }
    
    // Configurar tooltips e hovers
    function setupTooltips() {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
        
        // Adicionar tooltips e hovers às células
        const cells = document.querySelectorAll('#myTable td');
        cells.forEach(cell => {
            if (cell.cellIndex > 0) {
                cell.addEventListener('mouseenter', handleCellHover);
                cell.addEventListener('mouseleave', handleCellHoverOut);
                cell.addEventListener('mouseenter', showTooltip);
                cell.addEventListener('mouseleave', hideTooltip);
            }
        });
        
        // Adicionar hovers aos cabeçalhos
        const headers = document.querySelectorAll('#myTable th');
        headers.forEach((header, index) => {
            if (index > 0) { // Ignora o primeiro cabeçalho (Z)
                header.addEventListener('mouseenter', () => highlightColumn(index, true));
                header.addEventListener('mouseleave', () => highlightColumn(index, false));
            }
        });
    }
    
    // Manipuladores de hover
    function handleCellHover(e) {
        const cell = e.target;
        const row = cell.parentElement;
        const cellIndex = cell.cellIndex;
        
        // Destacar linha
        row.classList.add('highlight-row');
        
        // Destacar coluna (exceto a primeira coluna)
        if (cellIndex > 0) {
            highlightColumn(cellIndex, true);
        }
    }
    
    function handleCellHoverOut(e) {
        const cell = e.target;
        const row = cell.parentElement;
        const cellIndex = cell.cellIndex;
        
        // Remover destaque da linha
        row.classList.remove('highlight-row');
        
        // Remover destaque da coluna
        if (cellIndex > 0) {
            highlightColumn(cellIndex, false);
        }
    }
    
    function highlightColumn(colIndex, highlight) {
        const rows = document.querySelectorAll('#myTable tr');
        const header = document.querySelector(`#myTable th:nth-child(${colIndex + 1})`);
        
        if (highlight) {
            // Adiciona classe de destaque
            rows.forEach(row => {
                const cell = row.cells[colIndex];
                if (cell) cell.classList.add('highlight-col');
            });
            if (header) header.classList.add('highlight-header');
        } else {
            // Remove classe de destaque
            rows.forEach(row => {
                const cell = row.cells[colIndex];
                if (cell) cell.classList.remove('highlight-col');
            });
            if (header) header.classList.remove('highlight-header');
        }
    }
    
    // Configurar tabela
    function setupTable() {
        if (!table) return;
        
        // Adicionar data attributes para Z e P
        const cells = document.querySelectorAll('#myTable td');
        cells.forEach(cell => {
            if (cell.cellIndex > 0) {
                const zValue = zDaCelula(cell);
                const pValue = parseFloat(cell.textContent);
                if (zValue !== null) cell.setAttribute('data-z', zValue.toFixed(2));
                cell.setAttribute('data-p', pValue);
            }
        });
        
        // Adicionar eventos de clique
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
    }
    
    /* O Z de uma célula, a partir do rótulo da linha e da coluna.
       Duas armadilhas moram aqui: a coluna Z escreve o negativo com o sinal
       tipográfico − (U+2212), em que parseFloat devolve NaN — era por isso que
       a metade negativa da tabela não mostrava Z nenhum no painel —, e nessas
       linhas a coluna precisa ser subtraída: −1.9 com .06 é −1.96, não −1.84. */
    function zDaCelula(cell) {
        const linha = cell.parentElement;
        if (!linha || !linha.cells[0] || cell.cellIndex < 1) return null;
        const rotulo = linha.cells[0].textContent.trim().replace(/\u2212/g, '-');
        const base = parseFloat(rotulo);
        if (isNaN(base)) return null;
        const passo = (cell.cellIndex - 1) * 0.01;
        return rotulo.charAt(0) === '-' ? base - passo : base + passo;
    }

    // Manipuladores de eventos
    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            clearSelections();
        }
    }
    
    function handleCellClick(e) {
        e.stopPropagation();
        const cell = e.target;
        
        // Se já está selecionado, remove a seleção
        const index = selectedCells.indexOf(cell);
        if (index > -1) {
            cell.classList.remove('selected');
            selectedCells.splice(index, 1);
            updateSelectionHighlight();
                return;
        }
        
        // Se já tem 2 selecionados, remove o mais antigo
        if (selectedCells.length >= 2) {
            selectedCells[0].classList.remove('selected');
            selectedCells.shift();
        }
        
        // Adiciona nova seleção
        cell.classList.add('selected');
        selectedCells.push(cell);
        updateSelectionHighlight();
    }
    
    function updateSelectionHighlight() {
        // Remove todas as classes de highlight
        document.querySelectorAll('.has-selected, .has-selected-col').forEach(el => {
            el.classList.remove('has-selected', 'has-selected-col');
        });
        
        // Adiciona as classes de highlight para as células selecionadas
        selectedCells.forEach(cell => {
            // Destaca a linha
            const row = cell.parentElement;
            row.classList.add('has-selected');
            
            // Destaca a coluna
            const colIndex = cell.cellIndex;
            if (colIndex > 0) {
                const rows = document.querySelectorAll('#myTable tr');
                rows.forEach(row => {
                    const colCell = row.cells[colIndex];
                    if (colCell) colCell.classList.add('has-selected-col');
                });
            }
        });
    }
    
    
    // Funções de utilidade
    function formatNumber(num) {
        const n = Number(num);
        return isNaN(n) ? '' : n.toFixed(4);
    }
    
    function showTooltip(e) {
        const cell = e.target;
        if (cell.cellIndex === 0) return;
        
        const z = cell.getAttribute('data-z');
        const p = cell.getAttribute('data-p');
        let tooltipText = '';
        
        // Verifica se os valores são válidos
        const isValidZ = z && !isNaN(Number(z));
        const isValidP = p && !isNaN(Number(p));
        
        if (isValidZ || isValidP) {
            const parts = [];
            if (isValidZ) parts.push(`Z = ${Number(z).toFixed(2)}`);
            if (isValidP) parts.push(`P = ${formatNumber(p)}`);
            
            tooltipText = parts.join(', ');
            
            // Se já há uma célula selecionada (mas não duas), calcula o intervalo
            if (selectedCells.length === 1 && selectedCells[0] !== cell && isValidP) {
                const selectedCell = selectedCells[0];
                const selectedP = selectedCell.getAttribute('data-p');
                if (selectedP && !isNaN(parseFloat(selectedP))) {
                    const interval = Math.abs(parseFloat(selectedP) - parseFloat(p));
                    tooltipText += `\nInterval: ${interval.toFixed(4)}`;
                }
            }
            tooltip.textContent = tooltipText;
            tooltip.style.opacity = '1';
            tooltip.style.position = 'absolute';
            tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '5px 10px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '1000';
            
            const rect = cell.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
        }
    }
    
    function hideTooltip() {
        if (tooltip) {
            tooltip.style.opacity = '0';
        }
    }
    
    
    function clearSelections() {
        // Remover classes de seleção
        selectedCells.forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // Limpar array de células selecionadas
        selectedCells = [];
        
        // Atualizar interface
        updateSelectionHighlight();
        
    }
    
    // Inicializar
    init();
});
