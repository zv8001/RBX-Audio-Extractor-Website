(function () {
  "use strict";

  var CHANGELOG_URL =
    "https://raw.githubusercontent.com/zv8001/RBX-Audio-Extractor/refs/heads/main/CHANGELOG.md";

  function parseLatestEntry(markdown) {
    var lines = markdown.split(/\r?\n/);
    var entry = null;
    var section = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var versionMatch = line.match(/^##\s+\[([^\]]+)\]\s*-\s*(.+)$/);

      if (versionMatch) {
        if (entry) break;
        entry = {
          version: versionMatch[1],
          date: versionMatch[2].trim(),
          sections: [],
        };
        section = null;
        continue;
      }

      if (!entry) continue;

      var sectionMatch = line.match(/^###\s+(.+)$/);
      if (sectionMatch) {
        section = { title: sectionMatch[1].trim(), items: [] };
        entry.sections.push(section);
        continue;
      }

      var itemMatch = line.match(/^[-*]\s+(.+)$/);
      if (itemMatch && section) section.items.push(itemMatch[1].trim());
    }

    return entry;
  }

  function addTextElement(parent, tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function render(entry) {
    var heading = document.getElementById("changelog-heading");
    var content = document.getElementById("changelog-content");
    content.replaceChildren();

    if (!entry) {
      heading.textContent = "Latest release";
      addTextElement(
        content,
        "p",
        "changelog-error",
        "Could not load the changelog right now."
      );
      return;
    }

    heading.textContent = "Latest release — " + entry.version;
    addTextElement(content, "p", "changelog-date", entry.date);

    entry.sections.forEach(function (section) {
      addTextElement(content, "h3", "", section.title);
      var list = document.createElement("ul");

      section.items.forEach(function (item) {
        addTextElement(list, "li", "", item);
      });

      content.appendChild(list);
    });
  }

  function loadChangelog() {
    fetch(CHANGELOG_URL, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to fetch changelog: " + response.status);
        }
        return response.text();
      })
      .then(function (markdown) {
        render(parseLatestEntry(markdown));
      })
      .catch(function () {
        render(null);
      });
  }

  document.addEventListener("DOMContentLoaded", loadChangelog);
})();