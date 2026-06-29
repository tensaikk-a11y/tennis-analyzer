const STORAGE_KEY = "tennisAnalyzerPointsV01";

let points = loadPoints();
let currentPoint = createEmptyPoint();
let draftPoint = createEmptyPoint();
let editingIndex = null;

const pointTitle = document.getElementById("pointTitle");
const pointCount = document.getElementById("pointCount");
const pointsList = document.getElementById("pointsList");
const savePointButton = document.getElementById("savePointButton");
const clearCurrentButton = document.getElementById("clearCurrentButton");
const resetAllButton = document.getElementById("resetAllButton");

document.querySelectorAll("[data-field]").forEach((group) => {
  group.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const field = group.dataset.field;
      const value = button.dataset.value;
      currentPoint[field] = value;


      updateSelectedButtons();
    });
  });
});

document.querySelectorAll("[data-check]").forEach((button) => {
  button.addEventListener("click", () => {
    const field = button.dataset.check;
    currentPoint[field] = !currentPoint[field];
    updateSelectedButtons();
  });
});

savePointButton.addEventListener("click", () => {
  if (editingIndex === null) {
    points.push({
      ...currentPoint,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
    currentPoint = createEmptyPoint();
    draftPoint = createEmptyPoint();
  } else {
    points[editingIndex] = {
      ...points[editingIndex],
      ...currentPoint,
      updatedAt: new Date().toISOString(),
    };
    editingIndex = null;
    currentPoint = { ...draftPoint };
  }

  savePoints();
  updateScreen();
});

clearCurrentButton.addEventListener("click", () => {
  currentPoint = createEmptyPoint();
  draftPoint = createEmptyPoint();
  editingIndex = null;
  updateScreen();
});

resetAllButton.addEventListener("click", () => {
  const ok = confirm("全ポイントデータを削除します。よろしいですか？");
  if (!ok) return;

  points = [];
  currentPoint = createEmptyPoint();
  draftPoint = createEmptyPoint();
  editingIndex = null;
  localStorage.removeItem(STORAGE_KEY);
  updateScreen();
});

function createEmptyPoint() {
  return {
    sr: "",
    serveNumber: "",
    serveCourse: "",
    returnType: "",
    serveResult: "",
    rally: "",
    finalShot: "",
    position: "",
    finalResult: "",
    pointWinner: "",
    errorReason: "",
    effectivePlayer: "",
    effectiveShot: "",
    tension: false,
    footStop: false,
  };
}

function loadPoints() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function savePoints() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
}

function updateScreen() {
  updateTitle();
  updateSelectedButtons();
  renderPoints();
}

function updateTitle() {
  if (editingIndex === null) {
    pointTitle.textContent = `Point ${points.length + 1}`;
    savePointButton.textContent = "Save & Next";
  } else {
    pointTitle.textContent = `Edit Point ${editingIndex + 1}`;
    savePointButton.textContent = "Update Point";
  }

  pointCount.textContent = `${points.length} points`;
}

function updateSelectedButtons() {
  document.querySelectorAll("[data-field]").forEach((group) => {
    const field = group.dataset.field;

    group.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("selected", currentPoint[field] === button.dataset.value);
    });
  });

  document.querySelectorAll("[data-check]").forEach((button) => {
    const field = button.dataset.check;
    button.classList.toggle("selected", !!currentPoint[field]);
  });
}

function renderPoints() {
  pointsList.innerHTML = "";

  points.forEach((point, index) => {
    const item = document.createElement("div");
    item.className = "point-item";
if (point.pointWinner === "Me") {
    item.classList.add("point-win");
}

if (point.pointWinner === "Opponent") {
    item.classList.add("point-lose");
}
    if (editingIndex === index) {
      item.classList.add("editing");
    }

    const number = document.createElement("div");
    number.className = "point-number";
    number.textContent = String(index + 1).padStart(3, "0");

    const summary = document.createElement("div");
    summary.className = "point-summary";
    summary.textContent = buildSummary(point);

    item.appendChild(number);
    item.appendChild(summary);

    item.addEventListener("click", () => {
      if (editingIndex === null) {
        draftPoint = { ...currentPoint };
      }

      editingIndex = index;
      currentPoint = normalizePoint(point);
      updateScreen();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    pointsList.appendChild(item);
  });

  const nextPointItem = document.createElement("div");
  nextPointItem.className =
    editingIndex === null ? "point-item next-point active-next" : "point-item next-point";
  nextPointItem.innerHTML = `
    <div class="point-number">${String(points.length + 1).padStart(3, "0")}</div>
    <div class="point-summary">入力中の次ポイント</div>
  `;
  nextPointItem.addEventListener("click", () => {
    editingIndex = null;
    currentPoint = { ...draftPoint };
    updateScreen();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  if (points.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-message";
    empty.textContent = "まだ保存済みポイントはありません。";
    pointsList.appendChild(empty);
  }

  pointsList.appendChild(nextPointItem);
}

function normalizePoint(point) {
  return {
    ...createEmptyPoint(),
    ...point,
  };
}

function buildSummary(point) {
  const formFlags = [
    point.tension ? "力み" : "",
    point.footStop ? "足止" : "",
  ].filter(Boolean).join(",");

  const effective =
    point.effectivePlayer === "None"
      ? "Eff:None"
      : point.effectivePlayer
        ? `Eff:${point.effectivePlayer}-${point.effectiveShot || "-"}`
        : "Eff:-";

  return [
    point.sr || "-",
    point.serveNumber || "-",
    point.serveCourse || "-",
    point.returnType || "-",
    point.serveResult || "-",
    `R${point.rally || "-"}`,
    point.finalShot || "-",
    point.position || "-",
    point.finalResult || "-",
    point.pointWinner || "-",
    point.errorReason || "-",
    effective,
    formFlags || "-",
  ].join(" / ");
}

updateScreen();