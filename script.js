(function () {
  "use strict";

  // ---------------------------------------------------------------
  // Grade scales
  // ---------------------------------------------------------------
  const SCALES = {
    "10": [
      { grade: "S", points: 10 },
      { grade: "A", points: 9 },
      { grade: "B", points: 8 },
      { grade: "C", points: 7 },
      { grade: "D", points: 6 },
      { grade: "E", points: 5 },
      { grade: "F", points: 0 },
    ],
    "4": [
      { grade: "A",  points: 4.0 },
      { grade: "A-", points: 3.7 },
      { grade: "B+", points: 3.3 },
      { grade: "B",  points: 3.0 },
      { grade: "B-", points: 2.7 },
      { grade: "C+", points: 2.3 },
      { grade: "C",  points: 2.0 },
      { grade: "D",  points: 1.0 },
      { grade: "F",  points: 0 },
    ],
  };

  // Typical Manipal (MAHE) per-subject credit values
  const CREDIT_OPTIONS = [4, 3, 3.5, 1, 0.5];

  // ---------------------------------------------------------------
  // State
  // ---------------------------------------------------------------
  let scale = "10";
  let semesters = []; // { id, name, subjects: [{id, name, credit, grade}] }
  let semCounter = 0;
  let subjCounter = 0;
  let whatIfMode = false;

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------
  function pointsFor(grade) {
    const entry = SCALES[scale].find((g) => g.grade === grade);
    return entry ? entry.points : 0;
  }

  function calcSemesterGPA(sem) {
    let totalCredit = 0;
    let totalPoints = 0;
    sem.subjects.forEach((s) => {
      const credit = parseFloat(s.credit) || 0;
      const points = pointsFor(s.grade);
      totalCredit += credit;
      totalPoints += credit * points;
    });
    const gpa = totalCredit > 0 ? totalPoints / totalCredit : 0;
    return { gpa, totalCredit, totalPoints };
  }

  function calcCGPA() {
    let totalCredit = 0;
    let totalPoints = 0;
    semesters.forEach((sem) => {
      const r = calcSemesterGPA(sem);
      totalCredit += r.totalCredit;
      totalPoints += r.totalPoints;
    });
    const cgpa = totalCredit > 0 ? totalPoints / totalCredit : 0;
    return { cgpa, totalCredit };
  }

  function makeSubject() {
    subjCounter += 1;
    return { id: "s" + subjCounter, name: "", credit: CREDIT_OPTIONS[0], grade: SCALES[scale][0].grade };
  }

  function makeSemester() {
    semCounter += 1;
    return { id: "sem" + semCounter, name: "Semester " + semCounter, subjects: [makeSubject()] };
  }

  // ---------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------
  const semestersEl = document.getElementById("semesters");
  const subjectRowTemplate = document.getElementById("subjectRowTemplate");

  function gradeOptionsHTML(selected) {
    return SCALES[scale]
      .map((g) => `<option value="${g.grade}" ${g.grade === selected ? "selected" : ""}>${g.grade} (${g.points})</option>`)
      .join("");
  }

  function creditOptionsHTML(selected) {
    return CREDIT_OPTIONS
      .map((c) => `<option value="${c}" ${parseFloat(selected) === c ? "selected" : ""}>${c}</option>`)
      .join("");
  }

  function renderGradeKey() {
    const el = document.getElementById("gradeKeyList");
    el.innerHTML = SCALES[scale]
      .map((g) => `<div class="gk-row"><span>${g.grade}</span><span>${g.points}</span></div>`)
      .join("");
  }

  function renderWhatIfGradeOptions() {
    const el = document.getElementById("whatifGrade");
    const current = el.value;
    el.innerHTML = SCALES[scale]
      .map((g) => `<option value="${g.grade}">${g.grade} (${g.points})</option>`)
      .join("");
    if (SCALES[scale].some((g) => g.grade === current)) el.value = current;
  }

  function renderSemesters() {
    semestersEl.innerHTML = "";
    semesters.forEach((sem) => {
      const { gpa, totalCredit } = calcSemesterGPA(sem);

      const wrap = document.createElement("div");
      wrap.className = "semester";
      wrap.dataset.id = sem.id;

      wrap.innerHTML = `
        <div class="semester-head">
          <input type="text" class="sem-title" value="${escapeAttr(sem.name)}" maxlength="30">
          <div class="semester-meta">
            <span>${totalCredit} credits</span>
            <strong>SGPA ${gpa.toFixed(2)}</strong>
            <button class="semester-remove" title="Remove semester" aria-label="Remove semester">&times;</button>
          </div>
        </div>
        <div class="subjects-table-head">
          <span>Subject</span><span>Credits</span><span>Grade</span><span>Points</span><span></span>
        </div>
        <div class="subject-rows"></div>
        <button class="add-subject-btn">+ Add subject</button>
      `;

      const rowsEl = wrap.querySelector(".subject-rows");
      sem.subjects.forEach((subj) => rowsEl.appendChild(buildSubjectRow(sem, subj)));

      wrap.querySelector(".add-subject-btn").addEventListener("click", () => {
        const subj = makeSubject();
        sem.subjects.push(subj);
        renderAll();
      });

      wrap.querySelector(".semester-remove").addEventListener("click", () => {
        semesters = semesters.filter((s) => s.id !== sem.id);
        renderAll();
      });

      wrap.querySelector(".sem-title").addEventListener("input", (e) => {
        sem.name = e.target.value;
        renderSidebar(); // keep history table labels in sync without full re-render
      });

      semestersEl.appendChild(wrap);
    });
  }

  function buildSubjectRow(sem, subj) {
    const node = subjectRowTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.id = subj.id;

    const nameInput = node.querySelector(".subj-name");
    const creditInput = node.querySelector(".subj-credit");
    const gradeSelect = node.querySelector(".subj-grade");
    const pointsSpan = node.querySelector(".subj-points");
    const removeBtn = node.querySelector(".subj-remove");

    nameInput.value = subj.name;
    creditInput.innerHTML = creditOptionsHTML(subj.credit);
    gradeSelect.innerHTML = gradeOptionsHTML(subj.grade);
    pointsSpan.textContent = (parseFloat(subj.credit || 0) * pointsFor(subj.grade)).toFixed(2);

    nameInput.addEventListener("input", (e) => { subj.name = e.target.value; });

    creditInput.addEventListener("change", (e) => {
      subj.credit = e.target.value;
      pointsSpan.textContent = (parseFloat(subj.credit || 0) * pointsFor(subj.grade)).toFixed(2);
      renderSemesterMeta(sem);
      renderSidebar();
    });

    gradeSelect.addEventListener("change", (e) => {
      subj.grade = e.target.value;
      pointsSpan.textContent = (parseFloat(subj.credit || 0) * pointsFor(subj.grade)).toFixed(2);
      renderSemesterMeta(sem);
      renderSidebar();
    });

    removeBtn.addEventListener("click", () => {
      sem.subjects = sem.subjects.filter((s) => s.id !== subj.id);
      renderAll();
    });

    return node;
  }

  function renderSemesterMeta(sem) {
    const wrap = semestersEl.querySelector(`.semester[data-id="${sem.id}"]`);
    if (!wrap) return;
    const { gpa, totalCredit } = calcSemesterGPA(sem);
    wrap.querySelector(".semester-meta span:first-child").textContent = `${totalCredit} credits`;
    wrap.querySelector(".semester-meta strong").textContent = `SGPA ${gpa.toFixed(2)}`;
  }

  function renderSidebar() {
    const { cgpa, totalCredit } = calcCGPA();
    document.getElementById("cgpaValue").textContent = cgpa.toFixed(2);
    document.getElementById("cgpaScale").textContent = "/ " + parseFloat(scale).toFixed(1);
    document.getElementById("totalCredits").textContent = totalCredit;
    document.getElementById("totalSemesters").textContent = semesters.length;

    const hasSubjects = semesters.some((s) => s.subjects.length > 0);
    document.getElementById("sealCaption").textContent = hasSubjects
      ? (semesters.length + " semester" + (semesters.length === 1 ? "" : "s") + " on record")
      : "No subjects recorded yet";

    const historyBody = document.getElementById("historyBody");
    if (semesters.length === 0) { 
      historyBody.innerHTML = '<tr class="empty-row"><td colspan="3">—</td></tr>';
    } else {
      historyBody.innerHTML = semesters
        .map((sem) => {
          const r = calcSemesterGPA(sem);
          return `<tr><td>${escapeHTML(sem.name)}</td><td>${r.totalCredit}</td><td>${r.gpa.toFixed(2)}</td></tr>`;
        })
        .join("");
    }

    computeWhatIf();
  }

  function renderAll() {
    renderSemesters();
    renderSidebar();
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
  function escapeAttr(str) { return escapeHTML(str); }

  // ---------------------------------------------------------------
  // What-if simulation
  // ---------------------------------------------------------------
  function computeWhatIf() {
    const count = parseFloat(document.getElementById("whatifCount").value) || 0;
    const creditsPerSem = parseFloat(document.getElementById("whatifCredits").value) || 0;
    const targetGrade = document.getElementById("whatifGrade").value;
    const targetPoints = pointsFor(targetGrade);

    const { cgpa, totalCredit } = calcCGPA();
    const currentQualityPoints = cgpa * totalCredit;

    const futureCredits = count * creditsPerSem;
    const futureQualityPoints = futureCredits * targetPoints;

    const projectedCredit = totalCredit + futureCredits;
    const projectedCGPA = projectedCredit > 0
      ? (currentQualityPoints + futureQualityPoints) / projectedCredit
      : 0;

    const resultEl = document.getElementById("whatifResult");
    if (count <= 0 || creditsPerSem <= 0) {
      resultEl.innerHTML = "Set a semester count and credit load to see a projection.";
      return;
    }
    resultEl.innerHTML = `
      If you average a <strong>${targetGrade}</strong> across
      <strong>${count}</strong> more semester${count == 1 ? "" : "s"}
      (${futureCredits} additional credits), you would graduate with a
      CGPA of <strong>${projectedCGPA.toFixed(2)}</strong> on ${projectedCredit} total credits.
    `;
  }

  // ---------------------------------------------------------------
  // Mode switch (Official / What If)
  // ---------------------------------------------------------------
  const modeSwitch = document.getElementById("modeSwitch");
  const whatifPanel = document.getElementById("whatifPanel");

  function setWhatIfMode(on) {
    whatIfMode = on;
    modeSwitch.setAttribute("aria-pressed", String(on));
    document.body.classList.toggle("whatif-mode", on);
    whatifPanel.hidden = !on;
    if (on) computeWhatIf();
  }

  modeSwitch.addEventListener("click", () => setWhatIfMode(!whatIfMode));
  modeSwitch.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setWhatIfMode(!whatIfMode);
    }
  });

  ["whatifCount", "whatifCredits", "whatifGrade"].forEach((id) => {
    document.getElementById(id).addEventListener("input", computeWhatIf);
    document.getElementById(id).addEventListener("change", computeWhatIf);
  });

  // ---------------------------------------------------------------
  // Scale switch
  // ---------------------------------------------------------------
  document.getElementById("scaleSelect").addEventListener("change", (e) => {
    scale = e.target.value;
    // reset every subject's grade to the top grade of the new scale to avoid stale mismatches
    semesters.forEach((sem) => sem.subjects.forEach((s) => { s.grade = SCALES[scale][0].grade; }));
    renderGradeKey();
    renderWhatIfGradeOptions();
    renderAll();
  });

  // ---------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------
  document.getElementById("addSemesterBtn").addEventListener("click", () => {
    semesters.push(makeSemester());
    renderAll();
  });

  function init() {
    renderGradeKey();
    renderWhatIfGradeOptions();
    semesters.push(makeSemester());
    renderAll();
  }

  init();
})();
