const rows = document.querySelectorAll("div.contentd table tr");
const nameRows = [];
for (const row of rows) {
  const amount = row.children.length;
  if (amount == 13) {
    nameRows.push(row);
  }
}

let game = 1;
let index = 0;
const npcs = [];
nameRows.forEach((row) => {
  const cell = row.children[0];
  const content = cell.textContent.trim();
  if (content == '') {
    game++;
    index = 0;
    return;
  }

  const names = content.split("\n").map((t) => t.trim());
  if (names.length == 3) {
    const [chinese, japanese, english] = names;
    index++;
    npcs.push({
      game,
      index,
      chinese,
      japanese,
      english,
    });
  }
});

console.table(npcs);
