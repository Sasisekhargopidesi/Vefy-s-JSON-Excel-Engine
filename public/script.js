/* ================= SHOW CONVERTER ================= */
const getStartedBtns = document.querySelectorAll(".btn.primary");
const converter = document.getElementById("converter");

function scrollToConverter() {
  converter.classList.remove("hidden");
  converter.scrollIntoView({ behavior: "smooth" });
}

/* ================= UPLOAD JSON ================= */
const uploadBtn = document.getElementById("uploadBtn");
const downloadBtn = document.getElementById("downloadBtn");
const fileInput = document.getElementById("jsonFile");
const statusText = document.getElementById("status");

let excelBlob = null;

uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];

  if (!file) { alert("Please select a JSON file."); return; }
  if (!file.name.endsWith(".json")) { alert("Only JSON files are allowed."); return; }
  if (file.size > 5*1024*1024) { alert("File too large. Use streaming option."); return; }

  statusText.textContent = "Uploading and converting...";
  downloadBtn.disabled = true;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/convert/json-to-excel", {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Conversion failed");
    excelBlob = await response.blob();

    statusText.textContent = "Conversion successful!";
    downloadBtn.disabled = false;
  } catch (err) {
    statusText.textContent = "Error converting file.";
  }
});

/* ================= DOWNLOAD ================= */
downloadBtn.addEventListener("click", () => {
  if (!excelBlob) return;
  const url = URL.createObjectURL(excelBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "output.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
