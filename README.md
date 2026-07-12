# 📜 CGPA Calculator — Academic Transcript Ledger

A CGPA / GPA calculator built to look and feel like an actual academic transcript — subjects logged in a ledger, a wax-seal style badge that stamps your live CGPA, and a **What If** mode that lets you project the CGPA you'd graduate with based on hypothetical future semesters.

Built with plain **HTML, CSS and JavaScript** — no frameworks, no build step.

![Frontend](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJS-1A2942?style=flat-square)
![No dependencies](https://img.shields.io/badge/dependencies-none-A97C2F?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-8E3B3B?style=flat-square)

## ✨ Features

- **Add subjects per semester** — name, credit etc.
- **Live SGPA per semester** and a **running CGPA** across every semester logged.
- **What If mode** — flip the switch in the header to simulate remaining semesters (count, average credit load, target grade) and see the projected CGPA you'd graduate with, without touching your real record.
- **Semester history table** and a grade-key reference in the sidebar.
- Fully responsive, keyboard-accessible, and respects `prefers-reduced-motion`.
- Zero dependencies — open `index.html` and it just works.

## 🖥️ Live demo

Once published with GitHub Pages, add your link here:

```
https://<your-username>.github.io/cgpa-calculator/
```

## 🧰 Tech stack

| Layer | Choice |
|---|---|
| Structure | Semantic HTML5 |
| Styling | Hand-written CSS (custom properties, grid, no framework) |
| Logic | Vanilla JavaScript (ES6+, no libraries) |
| Fonts | Fraunces (display), Inter (body), IBM Plex Mono (data) — via Google Fonts |

## 📁 Project structure

```
cgpa-calculator/
├── index.html      # markup / structure
├── style.css        # visual design (transcript / ledger theme)
├── script.js         # state, GPA/CGPA math, what-if simulation
└── README.md
```

## 🚀 Running it locally

No build tools required.

```bash
git clone https://github.com/ayushvardhan/cgpa-calculator.git
cd cgpa-calculator
```

Then just open `index.html` in your browser, or serve it locally:

```bash
# Python
python3 -m http.server 5500

# or, if you have Node
npx serve .
```

Visit `http://localhost:5500`.

## 🧮 How the math works

- **SGPA (semester)** = Σ(credit × grade point) ÷ Σ(credit) for that semester.
- **CGPA (cumulative)** = Σ(credit × grade point) across **all** semesters ÷ Σ(credit) across all semesters.
- **What If projection** = takes your current total quality points (`CGPA × credits so far`), adds hypothetical future quality points (`future credits × target grade`), and divides by the new total credit count.

## 📌 Notes

- Nothing is sent to a server — all data lives in memory in the browser tab and resets on refresh (by design, so no personal academic data is stored anywhere).
- Grade scales are configurable in `script.js` under the `SCALES` object if your institution uses a different one.

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use, modify, and distribute.

## 👤 Author

**Built by Ayush Vardhan**
[GitHub](https://github.com/AyushVardhanOG) · [LinkedIn](https://www.linkedin.com/in/ayush-vardhan-singh/)

---

If you use or fork this, a ⭐ on the repo is always appreciated.