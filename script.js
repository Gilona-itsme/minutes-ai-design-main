// Modal open/close — needs to be global since onclick attributes call it directly
const mnOpenModal = (id) => {
	const el = document.getElementById(id);
	if (el) {
		el.classList.add("mn-modal-open");
		document.body.style.overflow = "hidden";
	}
}
function mnCloseModal(id) {
	const el = document.getElementById(id);
	if (el) {
		el.classList.remove("mn-modal-open");
		document.body.style.overflow = "";
	}
}
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		document
			.querySelectorAll(".mn-modal-overlay.mn-modal-open")
			.forEach((el) => {
				el.classList.remove("mn-modal-open");
				document.body.style.overflow = "";
			});
	}
});

(function () {
	const root = document.currentScript.previousElementSibling;

	// FAQ accordion
	document.querySelectorAll(".mn-faq-item").forEach((item) => {
		item.querySelector(".mn-faq-q").addEventListener("click", () => {
			const wasOpen = item.classList.contains("mn-open");
			document
				.querySelectorAll(".mn-faq-item")
				.forEach((i) => i.classList.remove("mn-open"));
			if (!wasOpen) item.classList.add("mn-open");
		});
	});

	// Scroll reveal
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) {
					e.target.classList.add("mn-in");
					observer.unobserve(e.target);
				}
			});
		},
		{ threshold: 0.15 },
	);
	document.querySelectorAll(".mn-reveal").forEach((el) => observer.observe(el));

	// Hero transcript typing -> tasks reveal
	const lines = [
		"Олена: тоді зробимо оновлення лендінгу до п'ятниці",
		"Макс: добре, я надішлю бриф клієнту сьогодні",
		"Ілона: бюджет на Q3 погодимо на наступному дзвінку",
	];
	const el = document.getElementById("mnTranscript");
	const tasks = document.querySelectorAll("#mnTaskStack .mn-task");
	let li = 0,
		ci = 0;

	function typeLine() {
		if (li >= lines.length) {
			setTimeout(() => {
				el.innerHTML = "";
				tasks.forEach((t) => t.classList.remove("mn-show"));
				li = 0;
				ci = 0;
				typeLine();
			}, 2600);
			return;
		}
		if (ci === 0) el.innerHTML += li > 0 ? "<br/>" : "";
		const line = lines[li];
		el.innerHTML = el.innerHTML.slice(
			0,
			el.innerHTML.lastIndexOf(">") + 1 === el.innerHTML.length
				? el.innerHTML.length
				: el.innerHTML.length,
		);
		if (ci < line.length) {
			el.innerHTML =
				getBase() + line.slice(0, ci + 1) + '<span class="mn-cursor"></span>';
			ci++;
			setTimeout(typeLine, 28);
		} else {
			el.innerHTML = getBase() + line;
			if (tasks[li]) setTimeout(() => tasks[li].classList.add("mn-show"), 200);
			li++;
			ci = 0;
			setTimeout(typeLine, 500);
		}
	}
	function getBase() {
		let base = "";
		for (let i = 0; i < li; i++) {
			base += (i > 0 ? "<br/>" : "") + lines[i];
		}
		if (li > 0) base += "<br/>";
		return base;
	}
	typeLine();

	// Typewriter effect for the About block paragraph
	const aboutTypedEl = document.getElementById("mnAboutTyped");
	if (aboutTypedEl) {
		const fullText =
			"Minutes AI створили люди, які самі втомились конспектувати. Ми віримо, що жива розмова важливіша за нотатки під час неї — тому AI бере рутину на себе, а команда лишається зосередженою одне на одному.";
		let typed = false;
		const aboutObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !typed) {
						typed = true;
						let i = 0;
						function typeChar() {
							if (i <= fullText.length) {
								aboutTypedEl.innerHTML =
									fullText.slice(0, i) + '<span class="mn-cursor"></span>';
								i++;
								setTimeout(typeChar, 18);
							} else {
								aboutTypedEl.innerHTML = fullText;
							}
						}
						typeChar();
						aboutObserver.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.4 },
		);
		aboutObserver.observe(aboutTypedEl);
	}

	// Toast notifications
	const mnToast = document.getElementById("mnToast");
	const mnToastIcon = document.getElementById("mnToastIcon");
	const mnToastText = document.getElementById("mnToastText");
	let mnToastTimer = null;
	function mnShowToast(message, type) {
		if (!mnToast) return;
		clearTimeout(mnToastTimer);
		mnToast.classList.remove("mn-toast-success", "mn-toast-error");
		mnToast.classList.add(
			type === "error" ? "mn-toast-error" : "mn-toast-success",
		);
		mnToastIcon.textContent = type === "error" ? "!" : "✓";
		mnToastText.textContent = message;
		mnToast.classList.add("mn-toast-show");
		mnToastTimer = setTimeout(() => {
			mnToast.classList.remove("mn-toast-show");
		}, 4500);
	}

	// Lead form -> Google Sheet (via Apps Script Web App)
	// ⚠️ ЗАМІНИ на URL свого розгорнутого Apps Script (див. інструкцію нижче в чаті)
	const MN_SHEET_ENDPOINT =
		"https://script.google.com/macros/s/AKfycbxqAoudw2Z6AL5YoLUq40Lfy1qA7DaA3_muOkK0XXzFDbDQmRAwu9UP9QG8vyzi6ysw/exec";

	const leadSubmit = document.getElementById("mnLeadSubmit");
	const leadStatus = document.getElementById("mnLeadStatus");
	if (leadSubmit) {
		leadSubmit.addEventListener("click", () => {
			const nameEl = document.getElementById("mnLeadName");
			const emailEl = document.getElementById("mnLeadEmail");
			const companyEl = document.getElementById("mnLeadCompany");
			const name = nameEl.value.trim();
			const email = emailEl.value.trim();
			const company = companyEl.value.trim();

			if (!email || !email.includes("@")) {
				leadStatus.textContent = "Вкажи коректний email";
				leadStatus.style.color = "var(--orange-soft)";
				mnShowToast("Вкажи коректний email перед відправкою", "error");
				emailEl.focus();
				return;
			}

			if (MN_SHEET_ENDPOINT.indexOf("YOUR_DEPLOYMENT_ID") !== -1) {
				leadStatus.textContent = "Форму ще не підключено до таблиці";
				leadStatus.style.color = "var(--orange-soft)";
				mnShowToast(
					"Форму ще не підключено до Google Таблиці (див. інструкцію)",
					"error",
				);
				return;
			}

			leadSubmit.disabled = true;
			leadStatus.textContent = "Надсилаємо…";
			leadStatus.style.color = "var(--ink-faint)";

			const payload = new URLSearchParams({
				name,
				email,
				company,
				submittedAt: new Date().toISOString(),
			});

			fetch(MN_SHEET_ENDPOINT, {
				method: "POST",
				mode: "no-cors", // Apps Script web apps don't return CORS headers; response is opaque
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: payload.toString(),
			})
				.then(() => {
					// no-cors означає, що ми не бачимо реальний статус відповіді — вважаємо запит успішним, якщо fetch не впав з мережевою помилкою
					nameEl.value = "";
					emailEl.value = "";
					companyEl.value = "";
					leadStatus.textContent = "Дякуємо! Ми зв'яжемось найближчим часом.";
					leadStatus.style.color = "var(--orange-soft)";
					mnShowToast("Заявку успішно надіслано!", "success");
					leadSubmit.disabled = false;
				})
				.catch(() => {
					leadStatus.textContent =
						"Щось пішло не так. Спробуй ще раз або напиши на hello@minutes.ai";
					leadStatus.style.color = "var(--orange-soft)";
					mnShowToast("Не вдалося надіслати заявку. Спробуй ще раз", "error");
					leadSubmit.disabled = false;
				});
		});
	}

	// Mobile burger menu
	const burger = document.getElementById("mnBurger");
	const mobileMenu = document.getElementById("mnMobileMenu");
	if (burger && mobileMenu) {
		burger.addEventListener("click", () => {
			burger.classList.toggle("mn-open");
			mobileMenu.classList.toggle("mn-open");
		});
		mobileMenu.querySelectorAll("a").forEach((a) => {
			a.addEventListener("click", () => {
				burger.classList.remove("mn-open");
				mobileMenu.classList.remove("mn-open");
			});
		});
	}

	// Smooth scroll for all anchor links (nav + footer + in-page CTAs)
	const navHeight = document.querySelector(".mn-nav")?.offsetHeight || 0;
	function mnEaseInOutCubic(t) {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}
	function mnSmoothScrollTo(targetY, duration) {
		const startY = window.scrollY;
		const diff = targetY - startY;
		let startTime = null;
		function step(ts) {
			if (startTime === null) startTime = ts;
			const progress = Math.min((ts - startTime) / duration, 1);
			window.scrollTo(0, startY + diff * mnEaseInOutCubic(progress));
			if (progress < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}
	document.querySelectorAll('a[href^="#"]').forEach((link) => {
		const href = link.getAttribute("href");
		if (href.length < 2) return; // skip bare "#"
		const target = document.querySelector(href);
		if (!target) return;
		link.addEventListener("click", (e) => {
			e.preventDefault();
			const targetY =
				target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
			mnSmoothScrollTo(Math.max(targetY, 0), 800);
		});
	});

	// Signature moment: warm glow drifts toward the cursor across the whole site
	const cursorGlow = document.getElementById("mnCursorGlow");
	if (
		cursorGlow &&
		window.matchMedia("(hover: hover) and (pointer: fine)").matches
	) {
		let ticking = false;
		document.addEventListener("mousemove", (e) => {
			cursorGlow.classList.add("mn-active");
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				cursorGlow.style.setProperty("--mn-cx", e.clientX + "px");
				cursorGlow.style.setProperty("--mn-cy", e.clientY + "px");
				ticking = false;
			});
		});
		document.addEventListener("mouseleave", () => {
			cursorGlow.classList.remove("mn-active");
		});
	}
})();
