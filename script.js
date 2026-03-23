const form = document.getElementById("attendanceForm");
const list = document.getElementById("attendanceList");
const totalCount = document.getElementById("totalCount");
const totalWorkTime = document.getElementById("totalWorkTime");
const averageWorkTime = document.getElementById("averageWorkTime");
const searchInput = document.getElementById("searchInput");
const resetButton = document.getElementById("resetButton");

let records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];

// 登録処理
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const date = document.getElementById("date").value;
  const name = document.getElementById("name").value.trim();
  const clockIn = document.getElementById("clockIn").value;
  const clockOut = document.getElementById("clockOut").value;
  const breakTime = document.getElementById("breakTime").value;
  const note = document.getElementById("note").value.trim();

  const workMinutes = calculateWorkMinutes(clockIn, clockOut, breakTime);

  if (workMinutes < 0) {
    alert("退勤時間は出勤時間より後の時間を入力してください。");
    return;
  }

  const record = {
    id: Date.now(),
    date,
    name,
    clockIn,
    clockOut,
    breakTime: Number(breakTime),
    note,
    workMinutes
  };

  records.push(record);
  saveRecords();
  renderList();
  updateSummary();
  form.reset();
});

// 実働時間計算
function calculateWorkMinutes(clockIn, clockOut, breakTime) {
  const [inHour, inMinute] = clockIn.split(":").map(Number);
  const [outHour, outMinute] = clockOut.split(":").map(Number);

  const startMinutes = inHour * 60 + inMinute;
  const endMinutes = outHour * 60 + outMinute;

  return endMinutes - startMinutes - Number(breakTime);
}

// 分 → ○時間○分 表示
function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}時間${mins}分`;
}

// 保存
function saveRecords() {
  localStorage.setItem("attendanceRecords", JSON.stringify(records));
}

// 一覧表示
function renderList(filteredRecords = records) {
  list.innerHTML = "";

  filteredRecords.forEach((record) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${record.date}</td>
      <td>${record.name}</td>
      <td>${record.clockIn}</td>
      <td>${record.clockOut}</td>
      <td>${record.breakTime}分</td>
      <td>${formatMinutes(record.workMinutes)}</td>
      <td>${record.note}</td>
      <td>
        <button class="delete-button" onclick="deleteRecord(${record.id})">
          削除
        </button>
      </td>
    `;

    list.appendChild(tr);
  });
}
// 削除処理
function deleteRecord(id) {
  records = records.filter((record) => record.id !== id);
  saveRecords();
  renderList();
  updateSummary();
}

// 集計表示
function updateSummary() {
  totalCount.textContent = records.length;

  const totalMinutes = records.reduce((sum, record) => sum + record.workMinutes, 0);
  totalWorkTime.textContent = formatMinutes(totalMinutes);

  if (records.length === 0) {
    averageWorkTime.textContent = "0時間0分";
    return;
  }

  const averageMinutes = Math.floor(totalMinutes / records.length);
  averageWorkTime.textContent = formatMinutes(averageMinutes);
}

searchInput.addEventListener("input", function () {
  const keyword = searchInput.value.toLowerCase();

  const filtered = records.filter(record =>
    record.name.toLowerCase().includes(keyword)
  );

  renderList(filtered);
});

resetButton.addEventListener("click", function () {
  searchInput.value = "";
  renderList();
});

// 初期表示
renderList();
updateSummary();