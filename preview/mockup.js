'use strict';

(function () {
	const root = document.documentElement;
	const clock = document.getElementById('clock');
	const toggle = document.getElementById('theme-toggle');
	const mq = window.matchMedia('(prefers-color-scheme: light)');

	if (clock) {
		const tick = () => {
			const d = new Date();
			const p = (n) => String(n).padStart(2, '0');
			clock.textContent = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}Z`;
		};
		tick();
		setInterval(tick, 1000);
	}

	if (!toggle) return;

	const isLight = () =>
		root.dataset.c2Theme === 'light' ||
		(!root.dataset.c2Theme && mq.matches);

	const sync = () => {
		const light = isLight();
		toggle.textContent = light ? 'mode: light' : 'mode: dark';
		toggle.setAttribute('aria-pressed', String(light));
	};

	toggle.addEventListener('click', () => {
		root.dataset.c2Theme = isLight() ? 'dark' : 'light';
		sync();
	});

	mq.addEventListener('change', sync);
	sync();
})();
