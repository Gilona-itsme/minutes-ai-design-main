
	// Modal open/close — needs to be global since onclick attributes call it directly
	function mnOpenModal(id) {
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
		document
			.querySelectorAll(".mn-reveal")
			.forEach((el) => observer.observe(el));

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
				if (tasks[li])
					setTimeout(() => tasks[li].classList.add("mn-show"), 200);
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
