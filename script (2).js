// script.js - makes the pages and does the notes stuff
// (AGENTS comes from data.js)

var agentNames = Object.keys(AGENTS);   // jett, raze, phoenix
var NOTES_KEY = "valorant-entry-notes";
var notes = {};          // all the saved notes go in here
var noteRenderers = {};  // so the notes page can update the cards

var footerHTML = '<footer>made by a legend &bull; <b>not</b> affiliated with Riot &bull; tips change after patches so scrim em first or ur team will flame u</footer>';


// ---------- saving and loading notes ----------

function loadNotes() {
  try {
    var saved = localStorage.getItem(NOTES_KEY);
    if (saved) {
      notes = JSON.parse(saved);
    }
  } catch (e) {
    // if it breaks just start with no notes
    notes = {};
  }
}

function saveNotes() {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (e) {
    console.log("couldnt save", e);
    return false;
  }
}

// turns "A-site" into "a-site" etc so it can be used in the key
function makeSlug(text) {
  text = text.trim().toLowerCase();
  text = text.replace(/[^a-z0-9]+/g, "-");
  text = text.replace(/(^-|-$)/g, "");
  return text;
}

function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}


// ---------- making the html ----------

function makeNav() {
  var html = '<nav class="topnav">';
  html += '<a href="#" class="brand nav-link" data-target="home">Field Notes.</a>';
  html += '<div class="links">';
  for (var i = 0; i < agentNames.length; i++) {
    var id = agentNames[i];
    html += '<a href="#" class="nav-link" data-target="' + id + '">' + AGENTS[id].name + '</a>';
  }
  html += '<a href="#" class="nav-link" data-target="notes">My Notes</a>';
  html += '</div>';
  html += '</nav>';
  return html;
}

function makeHomePage() {
  var html = '<section class="view" data-view="home">';
  html += makeNav();

  html += '<div class="hero">';
  html += '<p class="kicker">DUELIST ENTRY GUIDES</p>';
  html += '<h1>Type an agent,<br><span>get the playbook.</span></h1>';
  html += '<p>Every entry duelists abilities and site by site tips. One search away. No more dying first</p>';
  html += '</div>';

  html += '<div class="search-wrap">';
  html += '<form class="search-box" id="agent-form">';
  html += '<input type="text" id="agent-input" placeholder="type an agent... jett, raze, phoenix" autocomplete="off">';
  html += '<button type="submit">GO</button>';
  html += '</form>';
  html += '<p class="search-hint" id="agent-hint"></p>';
  html += '</div>';

  // one card for each agent
  html += '<div class="agent-grid">';
  for (var i = 0; i < agentNames.length; i++) {
    var id = agentNames[i];
    var agent = AGENTS[id];
    html += '<a class="agent-card nav-link" href="#" data-target="' + id + '">';
    html += '<div class="avatar-circle">' + agent.letter + '</div>';
    html += '<p class="agent-role">Duelist</p>';
    html += '<h3>' + agent.name + '</h3>';
    html += '<p>' + agent.blurb + '</p>';
    html += '</a>';
  }
  html += '</div>';

  html += footerHTML;
  html += '</section>';
  return html;
}

function makeAgentPage(id) {
  var agent = AGENTS[id];

  var html = '<section class="view" data-view="' + id + '">';
  html += makeNav();

  html += '<div class="hero">';
  html += '<div class="hero-avatar">' + agent.letter + '</div>';
  html += '<p class="kicker">' + agent.name.toUpperCase() + ' - ENTRY NOTES</p>';
  html += '<h1>' + agent.h1[0] + '<br><span>' + agent.h1[1] + '</span></h1>';
  html += '<p>Every site on the map pool. Click a map to see how ' + agent.name + ' opens each entry.</p>';
  html += '</div>';

  // the 3 abilities
  html += '<div class="abilities">';
  for (var i = 0; i < agent.abilities.length; i++) {
    html += '<div class="ability-card">';
    html += '<h3>' + agent.abilities[i][0] + '</h3>';
    html += '<p>' + agent.abilities[i][1] + '</p>';
    html += '</div>';
  }
  html += '</div>';

  // all the maps
  html += '<div class="maps-section">';
  html += '<div class="section-head"><h2>Maps</h2><span>tap a map to open its sites</span></div>';

  for (var m = 0; m < agent.maps.length; m++) {
    var mapName = agent.maps[m][0];
    var sites = agent.maps[m][1];

    html += '<details class="map-row">';
    html += '<summary>';
    html += '<div><span class="map-name">' + mapName + '</span><span class="site-count">' + sites.length + ' sites</span></div>';
    html += '<span class="arrow">&#9660;</span>';
    html += '</summary>';

    html += '<div class="map-body">';
    for (var s = 0; s < sites.length; s++) {
      html += '<div class="site-card">';
      html += '<div class="site-card-top"><span class="site-letter">' + sites[s][0] + '</span><span class="tag">' + sites[s][1] + '</span></div>';
      html += '<p>' + sites[s][2] + '</p>';
      html += '</div>';
    }
    html += '</div>';

    html += '</details>';
  }

  html += '</div>';
  html += footerHTML;
  html += '</section>';
  return html;
}

function makeNotesPage() {
  var html = '<section class="view" data-view="notes">';
  html += makeNav();

  html += '<div class="hero">';
  html += '<p class="kicker">YOUR SAVED STUFF</p>';
  html += '<h1>Notes u<br><span>wrote urself.</span></h1>';
  html += '<p>Every tip u save on any map page shows up here too. Its saved in ur browser so it stays next time u open it.</p>';
  html += '</div>';

  html += '<div class="notes-page">';
  html += '<div class="section-head"><h2>Saved notes</h2><span id="notes-count"></span></div>';
  html += '<div id="notes-list"></div>';
  html += '</div>';

  html += footerHTML;
  html += '</section>';
  return html;
}

// put all the pages on the screen
var allPages = makeHomePage();
for (var i = 0; i < agentNames.length; i++) {
  allPages += makeAgentPage(agentNames[i]);
}
allPages += makeNotesPage();
document.getElementById("app").innerHTML = allPages;


// ---------- changing pages ----------

function showView(name) {
  var views = document.querySelectorAll(".view");
  for (var i = 0; i < views.length; i++) {
    if (views[i].getAttribute("data-view") === name) {
      views[i].classList.add("active");
    } else {
      views[i].classList.remove("active");
    }
  }
  window.scrollTo(0, 0);
}

var navLinks = document.querySelectorAll(".nav-link");
for (var i = 0; i < navLinks.length; i++) {
  navLinks[i].addEventListener("click", function (e) {
    e.preventDefault();
    showView(this.getAttribute("data-target"));
  });
}


// ---------- the search box ----------

var form = document.getElementById("agent-form");
var input = document.getElementById("agent-input");
var hint = document.getElementById("agent-hint");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  var typed = input.value.trim();
  var key = typed.toLowerCase();

  if (key === "") {
    hint.textContent = "type an agent name first lol";
    hint.classList.add("error");
    return;
  }

  if (AGENTS[key]) {
    showView(key);
  } else {
    hint.textContent = 'no guide for "' + typed + '" yet. try Jett, Raze or Phoenix';
    hint.classList.add("error");
  }
});

// clear the error when they start typing again
input.addEventListener("input", function () {
  hint.textContent = "";
  hint.classList.remove("error");
});


// ---------- notes on each site card ----------

function addNoteBox(card) {
  // work out which agent / map / site this card is
  var agent = card.closest(".view").getAttribute("data-view");
  var mapName = card.closest(".map-row").querySelector(".map-name").textContent.trim();
  var siteLetter = card.querySelector(".site-letter").textContent.trim();
  var key = "note:" + makeSlug(agent) + ":" + makeSlug(mapName) + ":" + makeSlug(siteLetter);

  var box = document.createElement("div");
  box.className = "note-ui";
  box.innerHTML =
    '<div class="note-display" style="display:none;"><span class="note-label">YOUR NOTE</span><span class="note-text"></span></div>' +
    '<div class="note-btn-row">' +
      '<button type="button" class="note-edit-btn">+ add ur note</button>' +
      '<button type="button" class="note-delete-btn" style="display:none;">delete</button>' +
    '</div>' +
    '<div class="note-form" style="display:none;">' +
      '<textarea class="note-input"></textarea>' +
      '<div class="note-form-actions">' +
        '<button type="button" class="note-save-btn">save</button>' +
        '<button type="button" class="note-cancel-btn">cancel</button>' +
      '</div>' +
    '</div>' +
    '<p class="note-status"></p>';
  card.appendChild(box);

  var displayBox = box.querySelector(".note-display");
  var noteText = box.querySelector(".note-text");
  var editBtn = box.querySelector(".note-edit-btn");
  var deleteBtn = box.querySelector(".note-delete-btn");
  var noteForm = box.querySelector(".note-form");
  var noteInput = box.querySelector(".note-input");
  var saveBtn = box.querySelector(".note-save-btn");
  var cancelBtn = box.querySelector(".note-cancel-btn");
  var status = box.querySelector(".note-status");

  noteInput.placeholder = "ur own tip for " + capitalise(agent) + " on " + mapName + " " + siteLetter + "...";

  // shows or hides the note depending if theres one saved
  function showNote() {
    if (notes[key] && notes[key].text) {
      noteText.textContent = notes[key].text;
      displayBox.style.display = "block";
      editBtn.textContent = "edit note";
      deleteBtn.style.display = "inline-block";
    } else {
      noteText.textContent = "";
      displayBox.style.display = "none";
      editBtn.textContent = "+ add ur note";
      deleteBtn.style.display = "none";
    }
  }

  function flashStatus(message) {
    status.textContent = message;
    setTimeout(function () {
      status.textContent = "";
    }, 1500);
  }

  editBtn.addEventListener("click", function () {
    if (notes[key] && notes[key].text) {
      noteInput.value = notes[key].text;
    } else {
      noteInput.value = "";
    }
    noteForm.style.display = "block";
    noteInput.focus();
  });

  cancelBtn.addEventListener("click", function () {
    noteForm.style.display = "none";
    status.textContent = "";
  });

  saveBtn.addEventListener("click", function () {
    var value = noteInput.value.trim();
    if (value === "") {
      status.textContent = "write something first lol";
      return;
    }

    var oldNote = notes[key];
    notes[key] = {
      text: value,
      agent: agent,
      mapName: mapName,
      siteLetter: siteLetter,
      savedAt: new Date().toISOString()
    };

    if (saveNotes()) {
      flashStatus("saved!");
    } else {
      // put it back how it was
      if (oldNote) {
        notes[key] = oldNote;
      } else {
        delete notes[key];
      }
      status.textContent = "couldnt save, try again";
    }

    noteForm.style.display = "none";
    showNote();
    showNotesPage();
  });

  deleteBtn.addEventListener("click", function () {
    var oldNote = notes[key];
    delete notes[key];

    if (saveNotes()) {
      flashStatus("deleted");
    } else {
      notes[key] = oldNote;
      status.textContent = "couldnt save, try again";
    }

    showNote();
    showNotesPage();
  });

  noteRenderers[key] = showNote;
  showNote();
}


// ---------- the My Notes page ----------

function showNotesPage() {
  var list = document.getElementById("notes-list");
  var count = document.getElementById("notes-count");

  // put the notes in an array so they can be sorted newest first
  var entries = [];
  for (var key in notes) {
    if (notes[key] && notes[key].text) {
      entries.push({ key: key, data: notes[key] });
    }
  }
  entries.sort(function (a, b) {
    return (b.data.savedAt || "").localeCompare(a.data.savedAt || "");
  });

  if (entries.length === 0) {
    count.textContent = "";
    list.innerHTML = '<p class="notes-empty">no notes yet. open an agent, open a map and hit "+ add ur note" on any site.</p>';
    return;
  }

  count.textContent = entries.length + " saved";

  var html = "";
  for (var i = 0; i < entries.length; i++) {
    var d = entries[i].data;
    html += '<div class="saved-note-card" data-key="' + entries[i].key + '">';
    html += '<div class="saved-note-top">';
    html += '<span class="saved-note-meta">' + capitalise(d.agent) + ' - ' + d.mapName + ' - ' + d.siteLetter + '</span>';
    html += '<button type="button" class="note-delete-btn notes-page-delete">delete</button>';
    html += '</div>';
    html += '<p class="saved-note-text"></p>';
    html += '</div>';
  }
  list.innerHTML = html;

  // fill in the text with textContent so weird characters dont break the page
  var cards = list.querySelectorAll(".saved-note-card");
  for (var j = 0; j < cards.length; j++) {
    var cardKey = cards[j].getAttribute("data-key");
    cards[j].querySelector(".saved-note-text").textContent = notes[cardKey].text;

    cards[j].querySelector(".notes-page-delete").addEventListener("click", function () {
      var thisKey = this.closest(".saved-note-card").getAttribute("data-key");
      var oldNote = notes[thisKey];
      delete notes[thisKey];

      if (!saveNotes()) {
        notes[thisKey] = oldNote;
      }

      if (noteRenderers[thisKey]) {
        noteRenderers[thisKey]();
      }
      showNotesPage();
    });
  }
}


// ---------- start everything ----------

loadNotes();

var siteCards = document.querySelectorAll(".site-card");
for (var k = 0; k < siteCards.length; k++) {
  addNoteBox(siteCards[k]);
}

showNotesPage();
showView("home");
