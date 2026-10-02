const fs = require("fs");
const content = fs.readFileSync("app/globals.css");
if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
  console.log("Found BOM, removing...");
  fs.writeFileSync("app/globals.css", content.slice(3));
} else {
  console.log("No BOM found.");
}
