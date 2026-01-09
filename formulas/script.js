document.addEventListener("DOMContentLoaded", () => {
  // Função principal que inicializa a página com base nos dados da fórmula fornecidos.
  function initializeFormulaPage(formulaData) {
    if (!formulaData) {
      console.error("Dados da fórmula não encontrados!");
      return;
    }
    const { parts, explanations } = formulaData;

    renderParts(parts);
    initInteraction(explanations);
  }

  function renderParts(parts) {
    document.querySelectorAll(".part").forEach(el => {
      const key = el.dataset.part;
      if (parts[key]) {
        try {
          el.innerHTML = katex.renderToString(parts[key], { throwOnError: false });
        } catch {
          el.textContent = parts[key];
        }
      }
    });
  }

  function initInteraction(explanations) {
    const partEls = Array.from(document.querySelectorAll(".part"));
    const modalContainer = document.getElementById('modal-container');
    const equalsOp = document.getElementById('op-equals');
    let selectedEl = null;

    for (const key in explanations) {
      const modal = document.createElement('div');
      modal.id = `modal-${key}`;
      modal.className = 'explain-modal';
      const colorVar = `--${key.replace(/_/g, '-')}`;
      const color = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
      modal.style.color = color;
      modal.innerHTML = `
        <div class="modal-title">${explanations[key].title}</div>
        <div class="modal-text">${explanations[key].text}</div>
      `;
      modalContainer.appendChild(modal);
    }
    const modalEls = document.querySelectorAll('.explain-modal');

    function positionModal(partEl) {
      const key = partEl.dataset.part;
      const modal = document.getElementById(`modal-${key}`);
      const rect = partEl.getBoundingClientRect();
      const modalOffset = 40;
      const denominatorOffset = 60;

      modal.style.visibility = 'hidden';
      modal.style.display = 'block';
      const modalHeight = modal.offsetHeight;
      const modalWidth = modal.offsetWidth;
      modal.style.visibility = '';
      modal.style.display = '';

      let top, left;
      
      const denominatorKeys = ['marginal', 'k_factorial', 'nk_factorial', 'k_factorial_poisson', 'divisor', 'g_prime', 'std_x', 'std_y', 'divisor_2a', 'denominator_chi', 'sum_reciprocals', 'sample_size', 'pop_std_dev', 'e_squared', 'pop_size', 'sum_neyman', 'p_b'];
      const isDenominator = denominatorKeys.includes(key);

      if (isDenominator) {
        top = rect.bottom + denominatorOffset;
      } else {
        top = rect.top - modalHeight - modalOffset;
      }
      
      left = rect.left + rect.width / 2 - modalWidth / 2;
      left = Math.max(10, Math.min(left, window.innerWidth - modalWidth - 10));

      modal.style.top = `${top}px`;
      modal.style.left = `${left}px`;
      modal.classList.add("show");
    }

    function clearSelection() {
      partEls.forEach(p => {
        p.classList.remove("selected");
        p.style.transform = "";
      });
      modalEls.forEach(m => m.classList.remove("show"));
      selectedEl = null;
    }

    function selectPart(el) {
      const isAlreadySelected = selectedEl === el;
      clearSelection();
      if (isAlreadySelected) return;

      selectedEl = el;
      el.classList.add("selected");
      
      const key = el.dataset.part;
      const denominatorKeys = ['marginal', 'k_factorial', 'nk_factorial', 'k_factorial_poisson', 'divisor', 'g_prime', 'std_x', 'std_y', 'divisor_2a', 'denominator_chi', 'sum_reciprocals', 'sample_size', 'pop_std_dev', 'e_squared', 'pop_size', 'sum_neyman', 'p_b'];
      const isDenominator = denominatorKeys.includes(key);
      el.style.transform = isDenominator ? "translateY(10px)" : "translateY(-10px)";

      positionModal(el);
    }

    function groupPartsByRow(parts) {
        if (!parts.length) return [];
        const groups = [];
        let currentGroup = [parts[0]];
        
        for (let i = 1; i < parts.length; i++) {
            const prevRect = parts[i-1].getBoundingClientRect();
            const currentRect = parts[i].getBoundingClientRect();
            if (Math.abs(prevRect.top - currentRect.top) < 20) {
                currentGroup.push(parts[i]);
            } else {
                groups.push(currentGroup);
                currentGroup = [parts[i]];
            }
        }
        groups.push(currentGroup);
        return groups;
    }

    function toggleAllModals() {
      const isAllSelected = selectedEl === 'all';
      clearSelection();
      if (isAllSelected) return;

      const partGroups = groupPartsByRow(partEls);
      const modalGap = 10;

      partGroups.forEach(group => {
          const modalInfos = group.map(partEl => {
              const modal = document.getElementById(`modal-${partEl.dataset.part}`);
              modal.style.visibility = 'hidden';
              modal.style.display = 'block';
              const info = { partEl, modal, width: modal.offsetWidth, height: modal.offsetHeight };
              modal.style.visibility = '';
              modal.style.display = '';
              return info;
          });

          const totalModalsWidth = modalInfos.reduce((sum, info) => sum + info.width, 0) + (modalInfos.length - 1) * modalGap;
          const firstPartRect = group[0].getBoundingClientRect();
          const lastPartRect = group[group.length - 1].getBoundingClientRect();
          const groupWidth = lastPartRect.right - firstPartRect.left;
          const groupCenter = firstPartRect.left + groupWidth / 2;
          let currentLeft = groupCenter - totalModalsWidth / 2;

          modalInfos.forEach(info => {
              const { partEl, modal, width, height } = info;
              partEl.classList.add("selected");
              const key = partEl.dataset.part;
              const denominatorKeys = ['marginal', 'k_factorial', 'nk_factorial', 'k_factorial_poisson', 'divisor', 'g_prime', 'std_x', 'std_y', 'divisor_2a', 'denominator_chi', 'sum_reciprocals', 'sample_size', 'pop_std_dev', 'e_squared', 'pop_size', 'sum_neyman', 'p_b'];
              const isDenominator = denominatorKeys.includes(key);
              partEl.style.transform = isDenominator ? "translateY(10px)" : "translateY(-10px)";

              const rect = partEl.getBoundingClientRect();
              const modalOffset = 40;
              const denominatorOffset = 60;
              let top;

              if (isDenominator) {
                  top = rect.bottom + denominatorOffset;
              } else {
                  top = rect.top - height - modalOffset;
              }

              const finalLeft = Math.max(10, currentLeft);
              modal.style.left = `${finalLeft}px`;
              modal.style.top = `${top}px`;
              modal.classList.add("show");
              currentLeft = finalLeft + width + modalGap;
          });
      });

      selectedEl = 'all';
    }

    partEls.forEach((el, index) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        selectPart(el);
      });
      el.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectPart(el); }
        if (e.key === "Escape") clearSelection();

        let nextIndex = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          nextIndex = (index + 1) % partEls.length;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          nextIndex = (index - 1 + partEls.length) % partEls.length;
        }

        if (nextIndex !== -1) partEls[nextIndex].focus();
      });
    });

    if (equalsOp) {
        equalsOp.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAllModals();
        });
    }

    document.addEventListener("click", e => {
      if (!e.target.closest(".part") && !e.target.closest(".explain-modal") && e.target !== equalsOp) {
        clearSelection();
      }
    });

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(clearSelection, 150);
    });
  }

  if (window.katex) {
    initializeFormulaPage(window.formulaConfig);
  } else {
    const t = setInterval(() => {
      if (window.katex) {
        clearInterval(t);
        initializeFormulaPage(window.formulaConfig);
      }
    }, 100);
  }
});