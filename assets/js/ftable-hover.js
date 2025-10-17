// ...new file...
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var table = document.getElementById('myTable');
    if (!table) return;

    // criar tooltip
    var tip = document.createElement('div');
    tip.className = 'ftable-tooltip';
    tip.style.display = 'none';
    document.body.appendChild(tip);

    // linha vertical (coluna) overlay
    var vline = document.createElement('div');
    vline.className = 'ftable-vline';
    vline.style.display = 'none';
    document.body.appendChild(vline);

    // pegar headers (th) por índice
    var headerCells = [];
    var thead = table.querySelector('thead');
    if (thead) {
      var ths = thead.querySelectorAll('th');
      ths.forEach(function (th) { headerCells.push(th.textContent.trim()); });
    }

    var selectedCell = null;
    var hoveredCell = null;

    function computeCellInfo(cell) {
      var row = cell.parentElement;
      var value = cell.textContent.trim();
      var alpha = (row.cells[1] && row.cells[1].textContent) ? row.cells[1].textContent.trim() : '';

      // v1: procurar para cima até encontrar a célula v1 (primeira coluna)
      var v1 = '';
      if (row.cells[0] && row.cells[0].textContent.trim() !== '') {
        v1 = row.cells[0].textContent.trim();
      } else {
        var prev = row.previousElementSibling;
        while (prev) {
          if (prev.cells[0] && prev.cells[0].textContent.trim() !== '') {
            v1 = prev.cells[0].textContent.trim();
            break;
          }
          prev = prev.previousElementSibling;
        }
      }

      var v2 = headerCells[cell.cellIndex] || '';

      return { v1: v1, v2: v2, alpha: alpha, value: value, row: row, cellIndex: cell.cellIndex };
    }

    function showTipAtCell(cell) {
      var info = computeCellInfo(cell);
      var lines = [];
      if (info.v1) lines.push('v1 = ' + info.v1);
      if (info.v2) lines.push('v2 = ' + info.v2);
      if (info.alpha) lines.push('α = ' + info.alpha);
      if (info.value) lines.push('F = ' + info.value);
      tip.textContent = lines.join(' • ');

      tip.style.display = 'block';
      tip.classList.add('visible');

      requestAnimationFrame(function () {
        var rect = cell.getBoundingClientRect();
        var tipRect = tip.getBoundingClientRect();
        var left = rect.left + (rect.width / 2) - (tipRect.width / 2);
        var top = rect.top - tipRect.height - 8;

        if (left < 8) left = 8;
        if (left + tipRect.width > window.innerWidth - 8) left = window.innerWidth - tipRect.width - 8;
        if (top < 8) top = rect.bottom + 8;

        tip.style.left = left + window.pageXOffset + 'px';
        tip.style.top = top + window.pageYOffset + 'px';
      });
    }

    function hideTip() {
      tip.style.display = 'none';
      tip.classList.remove('visible');
    }

    function showCrossForCell(cell) {
      // horizontal: add class to row
      var info = computeCellInfo(cell);
      table.querySelectorAll('tbody tr').forEach(function (r) {
        r.classList.remove('ftable-hover-row', 'ftable-selected-row');
      });
      info.row.classList.add(selectedCell === cell ? 'ftable-selected-row' : 'ftable-hover-row');

      // vertical: position vline over the entire tbody at column left/width
      var tbody = table.querySelector('tbody');
      var tbodyRect = tbody.getBoundingClientRect();
      var cellRect = cell.getBoundingClientRect();
      var left = cellRect.left;
      var width = cellRect.width;

      // set vline to cover tbody vertically and align to column
      vline.style.width = Math.max(2, width) + 'px';
      vline.style.left = left + window.pageXOffset + 'px';
      vline.style.top = tbodyRect.top + window.pageYOffset + 'px';
      vline.style.height = tbodyRect.height + 'px';
      vline.style.display = 'block';
      vline.classList.toggle('selected', selectedCell === cell);
    }

    function clearCross() {
      table.querySelectorAll('tbody tr').forEach(function (r) {
        r.classList.remove('ftable-hover-row');
      });
      vline.style.display = 'none';
      vline.classList.remove('selected');
    }

    // eventos para células de corpo (somente colunas de valor)
    table.querySelectorAll('tbody td').forEach(function (cell) {
      if (cell.cellIndex < 2) return;

      cell.addEventListener('mouseenter', function () {
        // se existe uma célula selecionada persistentemente, não mostrar hover para outras células
        if (selectedCell && selectedCell !== cell) return;
        hoveredCell = cell;
        showTipAtCell(cell);
        showCrossForCell(cell);
      });

      cell.addEventListener('mouseleave', function () {
        hoveredCell = null;
        // se não está selecionado persistentemente, esconder
        if (selectedCell === cell) return;
        hideTip();
        clearCross();
      });

      cell.addEventListener('click', function (ev) {
        ev.stopPropagation();
        // toggle seleção persistente
        if (selectedCell === cell) {
          // deselecionar
          cell.classList.remove('ftable-selected');
          selectedCell = null;
          hideTip();
          clearCross();
        } else {
          // remove previous selected state
          if (selectedCell) {
            selectedCell.classList.remove('ftable-selected');
          }
          table.querySelectorAll('tbody tr').forEach(function (r) {
            r.classList.remove('ftable-selected-row');
          });

          selectedCell = cell;
          cell.classList.add('ftable-selected');
          selectedCell.parentElement.classList.add('ftable-selected-row');
          showTipAtCell(cell);
          showCrossForCell(cell);
        }
      });

      // touch: abrir seleção no primeiro toque, fechar no toque fora ou no mesmo
      cell.addEventListener('touchstart', function (ev) {
        ev.stopPropagation();
        var evt = new Event('click');
        cell.dispatchEvent(evt);
      }, { passive: false });
    });

    // clicar fora do table remove seleção persistente
    document.addEventListener('click', function (ev) {
      if (!table.contains(ev.target)) {
        if (selectedCell) {
          selectedCell.classList.remove('ftable-selected');
          selectedCell = null;
        }
        hideTip();
        clearCross();
      }
    });

    document.addEventListener('touchstart', function (ev) {
      if (!table.contains(ev.target)) {
        if (selectedCell) {
          selectedCell.classList.remove('ftable-selected');
          selectedCell = null;
        }
        hideTip();
        clearCross();
      }
    });

    // Escape fecha seleção/tooltip
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        if (selectedCell) {
          selectedCell.classList.remove('ftable-selected');
          selectedCell = null;
        }
        hideTip();
        clearCross();
      }
    });

    // Reposicionar vline/tooltip ao redimensionar/scroll
    window.addEventListener('resize', function () {
      if (hoveredCell || selectedCell) {
        var cell = selectedCell || hoveredCell;
        if (cell) {
          showCrossForCell(cell);
          showTipAtCell(cell);
        }
      } else {
        clearCross();
      }
    });
    window.addEventListener('scroll', function () {
      if (hoveredCell || selectedCell) {
        var cell = selectedCell || hoveredCell;
        if (cell) {
          showCrossForCell(cell);
          showTipAtCell(cell);
        }
      }
    }, true);
  });
})();
// ...new file...