const historyList = document.getElementById("historyList");
const copyButton = document.getElementById("copyCurrent");

function updateUI(history) {
  historyList.innerHTML = "";
  history.forEach((entry, index) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = entry;
    const recopyBtn = document.createElement("button");
    recopyBtn.textContent = "Copy";
    recopyBtn.onclick = () => navigator.clipboard.writeText(entry);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.onclick = async () => {
      const updated = [...history.slice(0, index), ...history.slice(index + 1)];
      await chrome.storage.local.set({ clipboardHistory: updated });
      updateUI(updated);
    };

    const buttonGroup = document.createElement("div");
    buttonGroup.appendChild(recopyBtn);
    buttonGroup.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(buttonGroup);
    historyList.appendChild(li);
  });
}

async function loadHistory() {
  const result = await chrome.storage.local.get("clipboardHistory");
  updateUI(result.clipboardHistory || []);
}

copyButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString(),
  }, async (results) => {
    const selected = results[0].result.trim();
    if (selected) {
      const result = await chrome.storage.local.get("clipboardHistory");
      const history = result.clipboardHistory || [];
      if (!history.includes(selected)) {
        history.unshift(selected);
        await chrome.storage.local.set({ clipboardHistory: history.slice(0, 20) }); // limit to 20
        updateUI(history);
      }
    }
  });
});

loadHistory();
