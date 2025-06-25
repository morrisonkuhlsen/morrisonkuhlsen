// Iniciar o script quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando script da tabela Z...');
    
    // Elementos da interface
    const table = document.getElementById('myTable');
    const copyBtn = document.getElementById('copyBtn');
    let z1Value = document.getElementById('z1Value');
    let z2Value = document.getElementById('z2Value');
    let intervalValue = document.getElementById('intervalValue');
    
    // Verificar se o DOM está totalmente carregado
    if (!document.body) {
        console.error('Erro: O corpo do documento não foi carregado!');
        return;
    }
    
    // Debug: Verificar se os elementos foram encontrados
    console.log('Elementos do painel:', { 
        table: table ? 'Encontrado' : 'Não encontrado', 
        copyBtn: copyBtn ? 'Encontrado' : 'Não encontrado',
        z1Value: z1Value ? 'Encontrado' : 'Não encontrado',
        z2Value: z2Value ? 'Encontrado' : 'Não encontrado',
        intervalValue: intervalValue ? 'Encontrado' : 'Não encontrado'
    });
    
    // Verificar elementos essenciais
    if (!table) {
        console.error('Erro: Tabela não encontrada!');
        return;
    }
    
    // Criar elementos dinamicamente se não existirem
    const selectionInfo = document.querySelector('.selection-info');
    if (selectionInfo) {
        if (!z1Value) {
            console.warn('Criando elemento z1Value dinamicamente');
            const el = document.createElement('span');
            el.id = 'z1Value';
            el.textContent = '-';
            document.querySelector('.selection-item:first-child').appendChild(el);
            z1Value = el;
        }
        if (!z2Value) {
            console.warn('Criando elemento z2Value dinamicamente');
            const el = document.createElement('span');
            el.id = 'z2Value';
            el.textContent = '-';
            document.querySelectorAll('.selection-item')[1].appendChild(el);
            z2Value = el;
        }
        if (!intervalValue) {
            console.warn('Criando elemento intervalValue dinamicamente');
            const el = document.createElement('span');
            el.id = 'intervalValue';
            el.textContent = '-';
            document.querySelectorAll('.selection-item')[2].appendChild(el);
            intervalValue = el;
        }
    }
    
    // Variáveis globais
    let selectedCells = [];
    let tooltip = null;
    
    // Inicialização
    function init() {
        setupEventListeners();
        setupTooltips();
        setupTable();
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Botão de copiar
        if (copyBtn) {
            copyBtn.addEventListener('click', copyToClipboard);
        }
        
        // Limpar seleções ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#myTable') && !e.target.closest('.selection-info')) {
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
                const row = cell.parentElement;
                const zValue = parseFloat(row.cells[0].textContent) + (cell.cellIndex - 1) * 0.01;
                const pValue = parseFloat(cell.textContent);
                cell.setAttribute('data-z', zValue.toFixed(2));
                cell.setAttribute('data-p', pValue);
            }
        });
        
        // Adicionar eventos de clique
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
    }
    
    // Manipuladores de eventos
    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            clearSelections();
        } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            copyToClipboard();
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
            updateSelectionInfo();
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
        updateSelectionInfo();
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
    
    function updateSelectionInfo() {
        try {
            console.log('Atualizando informações de seleção...');
            
            // Verificar se os elementos do painel existem
            if (!z1Value || !z2Value || !intervalValue) {
                console.error('Elementos do painel não encontrados');
                return;
            }
            
            // Função auxiliar para formatar o valor de probabilidade
            const formatProbability = (p) => {
                if (p === null || p === undefined || p === '') return '';
                const num = parseFloat(p);
                return isNaN(num) ? '' : num.toFixed(4);
            };
            
            if (selectedCells.length === 0) {
                console.log('Nenhuma célula selecionada, limpando painel');
                z1Value.textContent = '-';
                z2Value.textContent = '-';
                intervalValue.textContent = '-';
                return;
            }
            
            // Atualizar Z1
            const cell1 = selectedCells[0];
            const row1 = cell1.parentElement;
            
            // Obter o valor Z da célula selecionada
            const cellZValue = cell1.getAttribute('data-z');
            const cellPValue = cell1.getAttribute('data-p');
            
            console.log('Valores da célula 1:', { z: cellZValue, p: cellPValue });
            
            let z1Display = '-';
            let p1Display = '-';
            
            // Verifica se os valores são válidos
            if (cellZValue && !isNaN(Number(cellZValue)) && cellPValue && !isNaN(Number(cellPValue))) {
                z1Display = Number(cellZValue).toFixed(2);
                p1Display = formatProbability(cellPValue);
            } else {
                // Se não encontrar os atributos válidos, tenta calcular
                const rowZ = parseFloat(row1.cells[0].textContent);
                const colZ = (cell1.cellIndex - 1) * 0.01;
                const z1 = rowZ + colZ;
                const p1 = formatProbability(cell1.textContent);
                
                if (!isNaN(z1)) z1Display = z1.toFixed(2);
                if (p1 !== '') p1Display = p1;
            }
            
            // Monta o texto final, mostrando apenas os valores válidos
            if (z1Display !== '-' && p1Display !== '-') {
                z1Value.textContent = `${z1Display} (${p1Display})`;
            } else if (z1Display !== '-') {
                z1Value.textContent = z1Display;
            } else if (p1Display !== '-') {
                z1Value.textContent = `P: ${p1Display}`;
            } else {
                z1Value.textContent = '-';
            }
            
            // Atualizar Z2 e intervalo se existir
            if (selectedCells.length > 1) {
                const cell2 = selectedCells[1];
                const row2 = cell2.parentElement;
                
                // Obter o valor Z da segunda célula selecionada
                const cell2ZValue = cell2.getAttribute('data-z');
                const cell2PValue = cell2.getAttribute('data-p');
                
                console.log('Valores da célula 2:', { z: cell2ZValue, p: cell2PValue });
                
                let z2Display = '-';
                let p2Display = '-';
                
                // Verifica se os valores são válidos
                if (cell2ZValue && !isNaN(Number(cell2ZValue)) && cell2PValue && !isNaN(Number(cell2PValue))) {
                    z2Display = Number(cell2ZValue).toFixed(2);
                    p2Display = formatProbability(cell2PValue);
                } else {
                    // Se não encontrar os atributos válidos, tenta calcular
                    const rowZ2 = parseFloat(row2.cells[0].textContent);
                    const colZ2 = (cell2.cellIndex - 1) * 0.01;
                    const z2 = rowZ2 + colZ2;
                    const p2 = formatProbability(cell2.textContent);
                    
                    if (!isNaN(z2)) z2Display = z2.toFixed(2);
                    if (p2 !== '') p2Display = p2;
                }
                
                // Monta o texto final, mostrando apenas os valores válidos
                if (z2Display !== '-' && p2Display !== '-') {
                    z2Value.textContent = `${z2Display} (${p2Display})`;
                } else if (z2Display !== '-') {
                    z2Value.textContent = z2Display;
                } else if (p2Display !== '-') {
                    z2Value.textContent = `P: ${p2Display}`;
                } else {
                    z2Value.textContent = '-';
                }
                
                // Calcular intervalo
                const p1 = cell1.getAttribute('data-p') ? parseFloat(cell1.getAttribute('data-p')) : parseFloat(cell1.textContent);
                const p2 = cell2.getAttribute('data-p') ? parseFloat(cell2.getAttribute('data-p')) : parseFloat(cell2.textContent);
                
                if (!isNaN(p1) && !isNaN(p2)) {
                    const interval = Math.abs(p2 - p1);
                    intervalValue.textContent = interval.toFixed(4);
                    console.log(`Intervalo calculado: ${p2} - ${p1} = ${interval.toFixed(4)}`);
                } else {
                    intervalValue.textContent = '-';
                }
            } else {
                z2Value.textContent = '-';
                intervalValue.textContent = '-';
                console.log('Apenas uma célula selecionada, Z2 e intervalo limpos');
            }
        } catch (error) {
            console.error('Erro ao atualizar informações de seleção:', error);
        }
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
                    tooltipText += `\nIntervalo: ${interval.toFixed(4)}`;
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
    
    function copyToClipboard() {
        if (selectedCells.length === 0 || !copyBtn) return;
        
        let text = '';
        if (selectedCells.length === 1) {
            const z = selectedCells[0].getAttribute('data-z');
            const p = selectedCells[0].getAttribute('data-p');
            const isValidZ = z && !isNaN(Number(z));
            const isValidP = p && !isNaN(Number(p));
            
            const parts = [];
            if (isValidZ) parts.push(`Z = ${Number(z).toFixed(2)}`);
            if (isValidP) parts.push(`P = ${formatNumber(p)}`);
            
            text = parts.join(', ');
        } else {
            const z1 = selectedCells[0].getAttribute('data-z');
            const z2 = selectedCells[1].getAttribute('data-z');
            const p1 = selectedCells[0].getAttribute('data-p');
            const p2 = selectedCells[1].getAttribute('data-p');
            
            const isValidZ1 = z1 && !isNaN(Number(z1));
            const isValidZ2 = z2 && !isNaN(Number(z2));
            const isValidP1 = p1 && !isNaN(Number(p1));
            const isValidP2 = p2 && !isNaN(Number(p2));
            
            const line1 = [];
            if (isValidZ1) line1.push(`Z1 = ${Number(z1).toFixed(2)}`);
            if (isValidP1) line1.push(`P1 = ${formatNumber(p1)}`);
            
            const line2 = [];
            if (isValidZ2) line2.push(`Z2 = ${Number(z2).toFixed(2)}`);
            if (isValidP2) line2.push(`P2 = ${formatNumber(p2)}`);
            
            let intervalText = '';
            if (isValidP1 && isValidP2) {
                const interval = Math.abs(parseFloat(p2) - parseFloat(p1)).toFixed(4);
                intervalText = `\nIntervalo: ${interval}`;
            }
            
            text = '';
            if (line1.length > 0) text += line1.join(', ');
            if (line2.length > 0) text += (text ? '\n' : '') + line2.join(', ');
            if (intervalText) text += intervalText;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.title = 'Copiado!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.title = 'Copiar valores';
            }, 2000);
        }).catch(err => {
            console.error('Erro ao copiar para a área de transferência:', err);
        });
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
        updateSelectionInfo();
        
        console.log('Seleções limpas');
    }
    
    // Inicializar
    init();
});
