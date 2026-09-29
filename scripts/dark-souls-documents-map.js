const table = document.querySelector("div.contentd table");
const cells = [];
cells.push(...table.querySelectorAll("td:has(font.font612192)"));

const maps = [];
let game = 1;
let index = 0;
cells.forEach((cell) => {
  const content = cell.textContent.trim();
  const names = content.split("\n").map(n => n.trim());
  if (names.length != 3) return;

  const [chinese, japanese, english] = names;
  if (chinese == '一线天森林') {
    game = 2;
    index = 0;
  }
  if (chinese == '灰烬墓地') {
    game = 3;
    index = 0;
  }

  index++;
  maps.push({
    game,
    index,
    chinese,
    japanese,
    english,
  });
});

console.table(maps);
