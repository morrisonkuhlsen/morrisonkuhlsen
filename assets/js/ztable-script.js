document.addEventListener('DOMContentLoaded', () => {
        const table = document.getElementById('myTable');
        const headers = table.getElementsByTagName('th');
        const rows = table.getElementsByTagName('tr');

        Array.from(table.getElementsByTagName('td')).forEach(cell => {
            // Evento de hover (mouseover)
            cell.addEventListener('mouseover', () => {
                const cellIndex = cell.cellIndex;
                const rowIndex = cell.parentElement.rowIndex;

                // Destacar o cabeçalho da coluna
                if (headers[cellIndex]) {
                    headers[cellIndex].classList.add('highlight-header');
                }

                // Destacar a primeira célula da linha
                table.rows[rowIndex].cells[0].classList.add('highlight-first-cell');

                // Destacar toda a linha
                for (let i = 0; i < rows[rowIndex].cells.length; i++) {
                    table.rows[rowIndex].cells[i].classList.add('highlight-full-row');
                }

                // Destacar toda a coluna
                for (let i = 1; i < rows.length; i++) {
                    rows[i].cells[cellIndex].classList.add('highlight-full-col');
                }
            });

            // Remover o destaque ao sair do hover (mouseout)
            cell.addEventListener('mouseout', () => {
                // Remove destaque do cabeçalho da coluna
                Array.from(headers).forEach(header => {
                    header.classList.remove('highlight-header');
                });

                // Remove destaque da primeira célula da linha
                Array.from(table.getElementsByTagName('td')).forEach(cell => {
                    cell.classList.remove('highlight-first-cell');
                });

                // Remove destaque da linha completa
                Array.from(table.rows[cell.parentElement.rowIndex].cells).forEach(rowCell => {
                    rowCell.classList.remove('highlight-full-row');
                });

                // Remove destaque da coluna completa
                for (let i = 1; i < rows.length; i++) {
                    rows[i].cells[cell.cellIndex].classList.remove('highlight-full-col');
                }
            });
        });

        // NOVO: Sticky para a fileira do Z positivo
        const zPositiveRow = Array.from(table.rows).find(row => {
            // Procura a fileira que tem o header "Z" e "+ 0.00"
            return row.cells.length > 1 &&
                row.cells[0].textContent.trim() === "Z" &&
                row.cells[1].textContent.includes("+");
        });

        if (zPositiveRow) {
            zPositiveRow.classList.add('sticky-z-positive');
        }
    });

    const cells = document.querySelectorAll("td");

    // Função para remover destaques de uma célula específica
    function removeHighlight(cell) {
        const cellIndex = cell.cellIndex;
        const rowIndex = cell.parentElement.rowIndex;

        // Remove o zoom da célula
        cell.classList.remove("zoomed");

        // Remove destaque da linha até a célula clicada
        for (let i = 0; i <= cellIndex; i++) {
            cell.parentElement.cells[i].classList.remove("highlight-click");
        }

        // Remove destaque da coluna até a célula clicada
        const rows = cell.closest("table").rows;
        for (let i = 1; i <= rowIndex; i++) {
            rows[i].cells[cellIndex].classList.remove("highlight-click");
        }
    }

    cells.forEach(cell => {
        // Evento de clique (click)
        cell.addEventListener("click", function() {
            const cellIndex = this.cellIndex;
            const rowIndex = this.parentElement.rowIndex;

            // Verifica se já está marcado
            const isHighlighted = this.classList.contains("zoomed");

            // Se já estiver marcado, desmarque
            if (isHighlighted) {
                removeHighlight(this);
            } else {
                // Verifica se já há duas células destacadas
                const highlightedCells = document.querySelectorAll(".zoomed");

                // Se houver duas, remove o destaque da mais antiga (primeira)
                if (highlightedCells.length >= 2) {
                    removeHighlight(highlightedCells[0]);
                }

                // Aplica o destaque à célula clicada
                this.classList.add("zoomed");

                // Destaca a linha até a célula clicada
                for (let i = 0; i <= cellIndex; i++) {
                    this.parentElement.cells[i].classList.add("highlight-click");
                }

                // Destaca a coluna até a célula clicada
                const rows = this.closest("table").rows;
                for (let i = 1; i <= rowIndex; i++) {
                    rows[i].cells[cellIndex].classList.add("highlight-click");
                }

                // NOVO: Destaca a primeira célula (coluna Z) da linha do z
                this.parentElement.cells[0].classList.add("highlight-click");
            }
        });
    });

// Função para calcular Z-Score
function calculateZScore() {
        const x = parseFloat(document.getElementById("testValue").value);
        const mu = parseFloat(document.getElementById("meanValue").value);
        const sigma = parseFloat(document.getElementById("stdDev").value);
        
        if (!isNaN(x) && !isNaN(mu) && !isNaN(sigma) && sigma !== 0) {
            const z = (x - mu) / sigma;
            document.getElementById("result").innerText = `Z-Score: ${z.toFixed(4)}`;
        } else {
            document.getElementById("result").innerText = "Please enter valid values.";
        }
    }

    // Implementação da função erf (Função de erro)
    function erf(x) {
        const sign = (x >= 0) ? 1 : -1;
        x = Math.abs(x);

        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return sign * y;
    }

    // Função de distribuição normal cumulativa (CDF)
    function normalCDF(z) {
        return (1.0 + erf(z / Math.sqrt(2))) / 2;
    }

    // Variável global para o gráfico
    let gaussianChart = null;

    // Função para calcular a probabilidade entre dois Z-Scores
    function calculateProbability() {
        const z1 = parseFloat(document.getElementById("zScore1").value);
        const z2 = parseFloat(document.getElementById("zScore2").value);
        
        if (!isNaN(z1) && !isNaN(z2)) {
            const prob1 = normalCDF(z1);
            const prob2 = normalCDF(z2);
            const prob = Math.abs(prob2 - prob1);

            document.getElementById("probResult").innerText = `Probability between two Z-Scores: ${(prob * 100).toFixed(2)}%`;

            // Atualiza o gráfico da curva gaussiana
            updateGaussianChart(z1, z2);
        } else {
            document.getElementById("probResult").innerText = "Please enter valid Z-Scores.";
        }
    }

    function updateGaussianChart(z1, z2) {
    const ctx = document.getElementById('gaussianChart').getContext('2d');

    // Verifica se já existe um gráfico e destrói o anterior
    if (gaussianChart) {
        gaussianChart.destroy();
    }

    const dataPoints = [];
    const highlightedArea = [];

    // Certifique-se de que z1 é o menor e z2 é o maior
    const lowerZ = Math.min(z1, z2);
    const upperZ = Math.max(z1, z2);

    for (let z = -4; z <= 4; z += 0.1) {
        const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
        dataPoints.push({ x: z, y: y });

        // Destaca a área apenas se z estiver entre lowerZ e upperZ
        if (z >= lowerZ && z <= upperZ) {
            highlightedArea.push({ x: z, y: y });
        }
    }

    gaussianChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Curva Gaussiana',
                    data: dataPoints,
                    borderColor: 'white',
                    borderWidth: 2, // Define a largura da linha da curva gaussiana
                    fill: false,
                    pointRadius: 0 // Remove os pontos da linha da curva
                },
                {
                    label: 'Área entre Z-Scores',
                    data: highlightedArea,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    pointRadius: 0 // Remove os pontos da linha da curva
                }
            ]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                    },
                    min: -4,
                    max: 4
                },
                y: {
                    title: {
                        display: true,
                    },
                    min: 0,
                    max: 0.5
                }
            },
            plugins: {
                legend: {
                    display: false // Desativa a legenda
                }
            }
        }
    });
}