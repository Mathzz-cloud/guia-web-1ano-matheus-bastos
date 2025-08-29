// Guia Profissional de Desenvolvimento Web - JS
// Handles: menu toggle, theme toggle (localStorage), and keyboard shortcuts

(function () {
	const menuToggle = document.getElementById('menu-toggle');
	const mainMenu = document.getElementById('main-menu');
	const themeToggle = document.getElementById('theme-toggle');
	const root = document.documentElement;

	// Menu toggle
	if (menuToggle && mainMenu) {
		menuToggle.addEventListener('click', () => {
			const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
			menuToggle.setAttribute('aria-expanded', String(!expanded));
			if (!expanded) {
				mainMenu.hidden = false;
				mainMenu.setAttribute('aria-hidden', 'false');
			} else {
				mainMenu.hidden = true;
				mainMenu.setAttribute('aria-hidden', 'true');
			}
		});

		// Close menu on outside click
		document.addEventListener('click', (e) => {
			if (!mainMenu || !menuToggle) return;
			if (!mainMenu.contains(e.target) && !menuToggle.contains(e.target)) {
				mainMenu.hidden = true;
				mainMenu.setAttribute('aria-hidden', 'true');
				menuToggle.setAttribute('aria-expanded', 'false');
			}
		});
	}

	// Theme toggle with persistence
	const THEME_KEY = 'guia_theme';
	function applyTheme(theme) {
		if (theme === 'dark') {
			root.setAttribute('data-theme', 'dark');
			if (themeToggle) themeToggle.setAttribute('aria-pressed', 'true');
		} else {
			root.removeAttribute('data-theme');
			if (themeToggle) themeToggle.setAttribute('aria-pressed', 'false');
		}
	}

	// Load stored theme
	const stored = localStorage.getItem(THEME_KEY);
	if (stored) applyTheme(stored);

	if (themeToggle) {
		themeToggle.addEventListener('click', () => {
			const isDark = root.getAttribute('data-theme') === 'dark';
			const next = isDark ? 'light' : 'dark';
			applyTheme(next === 'dark' ? 'dark' : 'light');
			localStorage.setItem(THEME_KEY, next === 'dark' ? 'dark' : 'light');
		});
	}

	// Keyboard shortcuts
	document.addEventListener('keydown', (e) => {
		// '/' focuses search - we don't have a search yet, so focus first link
		if (e.key === '/') {
			const firstLink = document.querySelector('a');
			if (firstLink) { e.preventDefault(); firstLink.focus(); }
		}
		// Alt+M focuses menu button
		if (e.altKey && (e.key === 'm' || e.key === 'M')) {
			const btn = document.getElementById('menu-toggle');
			if (btn) { e.preventDefault(); btn.focus(); }
		}
		// Home key scrolls to top
		if (e.key === 'Home') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
		// Escape closes menus/modals
		if (e.key === 'Escape') {
			if (mainMenu) {
				mainMenu.hidden = true;
				mainMenu.setAttribute('aria-hidden', 'true');
			}
		}
	});

	/* --- Additional page-specific features --- */

	// Tecnologias: filters, search, modal
	(function techModule() {
		const grid = document.getElementById('tech-grid');
		const filters = Array.from(document.querySelectorAll('.filter-btn'));
		const search = document.getElementById('tech-search');
		const modal = document.getElementById('tech-modal');
		const modalTitle = modal ? modal.querySelector('#modal-title') : null;
		const modalDesc = modal ? modal.querySelector('#modal-desc') : null;
		const modalClose = modal ? modal.querySelector('.modal-close') : null;

		if (filters.length) {
			filters.forEach(btn => btn.addEventListener('click', () => {
				filters.forEach(b=>b.setAttribute('aria-pressed','false'));
				btn.setAttribute('aria-pressed','true');
				const filter = btn.dataset.filter;
				Array.from(document.querySelectorAll('.tech-card')).forEach(card => {
					card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
				});
			}));
		}

		if (search && grid) {
			search.addEventListener('input', (e) => {
				const q = e.target.value.toLowerCase().trim();
				Array.from(grid.querySelectorAll('.tech-card')).forEach(card => {
					const text = (card.textContent || '').toLowerCase();
					card.style.display = q === '' || text.includes(q) ? '' : 'none';
				});
			});
		}

		// Card click -> modal
		if (grid) {
			grid.addEventListener('click', (e) => {
				const card = e.target.closest('.tech-card');
				if (!card) return;
				if (!modal) return;
				modalTitle.textContent = card.querySelector('h3')?.textContent || 'Detalhe';
				modalDesc.textContent = card.querySelector('p')?.textContent || '';
				modal.setAttribute('aria-hidden','false');
				modal.style.display = 'block';
			});
		}

		if (modalClose) modalClose.addEventListener('click', () => {
			modal.setAttribute('aria-hidden','true');
			modal.style.display = 'none';
		});

		// close modal on outside click
		document.addEventListener('click', (e) => {
			if (!modal) return;
			if (modal.getAttribute('aria-hidden') === 'false' && !modal.querySelector('.modal-content').contains(e.target)) {
				modal.setAttribute('aria-hidden','true');
				modal.style.display = 'none';
			}
		});
	})();

	// Boas práticas: accordion and checklist
	(function bpModule() {
		const accordions = Array.from(document.querySelectorAll('.accordion-toggle'));
		accordions.forEach(btn => {
			btn.addEventListener('click', () => {
				const panel = btn.nextElementSibling;
				const open = panel.style.display === 'block';
				panel.style.display = open ? 'none' : 'block';
			});
		});

		// Checklist persistence
		const checklist = document.getElementById('bp-checklist');
		const PROGRESS_KEY = 'bp_checklist';
		if (checklist) {
			const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
			Array.from(checklist.querySelectorAll('input[type="checkbox"]')).forEach(cb => {
				const key = cb.dataset.key;
				if (stored[key]) cb.checked = true;
				cb.addEventListener('change', () => {
					stored[key] = cb.checked;
					localStorage.setItem(PROGRESS_KEY, JSON.stringify(stored));
					updateProgress();
				});
			});
			function updateProgress() {
				const total = checklist.querySelectorAll('input[type="checkbox"]').length;
				const checked = checklist.querySelectorAll('input[type="checkbox"]:checked').length;
				document.getElementById('check-progress').textContent = `Progresso: ${Math.round((checked/total)*100)}%`;
			}
			updateProgress();
		}
	})();

	// Quiz logic: scoring and best score in localStorage
	(function quizModule() {
		const submit = document.getElementById('submit-quiz');
		const result = document.getElementById('quiz-result');
		const BEST_KEY = 'quiz_best_score';
		if (!submit) return;
		submit.addEventListener('click', () => {
			const questions = Array.from(document.querySelectorAll('#questions-list li'));
			let correct = 0;
			questions.forEach((li, idx) => {
				const answer = li.dataset.answer;
				const chosen = li.querySelector('input[type="radio"]:checked');
				if (chosen && chosen.value === answer) correct += 1;
			});
			const score = Math.round((correct / questions.length) * 100);
			const best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
			if (score > best) {
				localStorage.setItem(BEST_KEY, String(score));
			}
			result.innerHTML = `<p>Você acertou ${correct} de ${questions.length} (${score}%). Melhor pontuação: ${Math.max(score,best)}%</p>`;
		});
	})();

})();
