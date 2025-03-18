// מידע אודות הפרויקט
var projectData = {
  name: "חדר הבריחה שלי",
  rooms: {
    room1: {
      id: "room1",
      name: "חדר 1: מעבדה",
      background: "lab",
      backgroundImage: null,
      items: {
        item1: {
          id: "item1",
          name: "כספת",
          type: "safe",
          x: 200,
          y: 300,
          width: 60,
          height: 60,
          puzzle: "code-puzzle",
          locked: true,
          requiredItem: null,
          nextRoom: null,
          image: null
        },
        item2: {
          id: "item2",
          name: "מחשב",
          type: "computer",
          x: 400,
          y: 150,
          width: 50,
          height: 50,
          puzzle: "text-puzzle",
          locked: false,
          requiredItem: null,
          nextRoom: null,
          image: null
        }
      }
    },
    room2: {
      id: "room2",
      name: "חדר 2: ספרייה",
      background: "library",
      backgroundImage: null,
      items: {}
    }
  },
  puzzles: {
    "code-puzzle": {
      id: "code-puzzle",
      name: "חידת קוד - כספת",
      type: "code",
      description: "מצא את הקוד לפתיחת הכספת!",
      answer: "1234",
      hint: "חפש רמזים בחדר...",
      successMessage: "הכספת נפתחה!"
    },
    "text-puzzle": {
      id: "text-puzzle",
      name: "חידת טקסט - מחשב",
      type: "text",
      question: "מהו שמו של המדען הידוע שגילה את חוק הכבידה?",
      answer: "אייזק ניוטון",
      hint: "הוא ראה תפוח נופל...",
      successMessage: "נכון! המחשב נפתח!"
    }
  },
  connections: [
    { from: "room1", to: "room2", requiredPuzzle: "code-puzzle" }
  ],
  settings: {
    title: "חדר הבריחה שלי - המעבדה המסתורית",
    description: "ברוכים הבאים לחדר הבריחה המקוון! מצאת את עצמך נעול במעבדה מסתורית. עליך לפתור את החידות ולמצוא את הדרך החוצה תוך 60 דקות.",
    timeLimit: 60
  }
};

// חדר נוכחי שמוצג
var currentRoomId = "room1";

// אובייקט נבחר
var selectedItem = null;

// פונקציה להמרת קובץ תמונה ל-Data URL
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = function(event) {
      resolve(event.target.result);
    };
    reader.onerror = function(error) {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

// פונקציה לטעינת החדר הנוכחי
function loadCurrentRoom() {
  // נקה את תצוגת החדר
  var roomPreview = document.getElementById("room-preview");
  // מחק את כל האובייקטים, אבל השאר את החדר עצמו
  var items = roomPreview.querySelectorAll(".room-item");
  for (var i = 0; i < items.length; i++) {
    items[i].remove();
  }
  
  // הגדר את הרקע של החדר
  var room = projectData.rooms[currentRoomId];
  
  // בדוק אם יש תמונת רקע
  if (room.backgroundImage) {
    roomPreview.style.backgroundImage = "url('" + room.backgroundImage + "')";
    roomPreview.style.backgroundColor = "transparent";
  } else {
    roomPreview.style.backgroundImage = "none";
    // הגדר את צבע הרקע לפי סוג החדר
    if (room.background === "lab") {
      roomPreview.style.backgroundColor = "#243447";
    } else if (room.background === "library") {
      roomPreview.style.backgroundColor = "#4b3621";
    } else if (room.background === "office") {
      roomPreview.style.backgroundColor = "#34515e";
    } else if (room.background === "mansion") {
      roomPreview.style.backgroundColor = "#544e4d";
    }
  }
  
  // הוסף את כל האובייקטים בחדר
  for (var itemId in room.items) {
    var item = room.items[itemId];
    var itemElement = document.createElement("div");
    itemElement.id = item.id;
    itemElement.className = "room-item";
    itemElement.style.width = item.width + "px";
    itemElement.style.height = item.height + "px";
    itemElement.style.left = item.x + "px";
    itemElement.style.top = item.y + "px";
    itemElement.setAttribute("data-type", item.type);
    
    // בדוק אם יש תמונה לאובייקט
    if (item.image) {
      var imgElement = document.createElement("img");
      imgElement.src = item.image;
      imgElement.style.width = "100%";
      imgElement.style.height = "100%";
      imgElement.style.objectFit = "contain";
      itemElement.appendChild(imgElement);
    } else {
      // אם אין תמונה, השתמש בטקסט
      itemElement.textContent = item.name;
    }
    
    // הוסף את האובייקט לחדר
    roomPreview.appendChild(itemElement);
    
    // טיפול באירועי עכבר
    itemElement.addEventListener("mousedown", selectItem);
    itemElement.addEventListener("mousemove", moveItem);
    itemElement.addEventListener("mouseup", deselectItem);
  }
  
  // עדכן את שם החדר
  document.getElementById("room-name").value = room.name;
  
  // עדכן את הרקע בתפריט
  document.getElementById("room-background").value = room.background;
  
  // עדכן את הרשימה של החדרים
  var roomItems = document.querySelectorAll(".room-item-list");
  for (var i = 0; i < roomItems.length; i++) {
    roomItems[i].classList.remove("active");
    if (roomItems[i].getAttribute("data-room-id") === currentRoomId) {
      roomItems[i].classList.add("active");
    }
  }
}

// פונקציה לבחירת אובייקט
function selectItem(e) {
  e.preventDefault(); // מנע ברירת מחדל של האירוע
  
  // שמור את האובייקט הנבחר
  selectedItem = {
    element: this,
    offsetX: e.clientX - this.getBoundingClientRect().left,
    offsetY: e.clientY - this.getBoundingClientRect().top,
    moving: true
  };
  
  // סמן את האובייקט בחזותית
  var items = document.querySelectorAll(".room-item");
  for (var i = 0; i < items.length; i++) {
    items[i].classList.remove("selected");
    // הסר ידיות שינוי גודל אם קיימות
    var handles = items[i].querySelectorAll(".resize-handle");
    for (var j = 0; j < handles.length; j++) {
      handles[j].remove();
    }
  }
  
  this.classList.add("selected");
  
  // הוסף ידית שינוי גודל בפינה הימנית תחתונה
  var handleSE = document.createElement("div");
  handleSE.className = "resize-handle resize-handle-se";
  this.appendChild(handleSE);
  
  // הוסף מאזין אירוע נפרד לידית שינוי הגודל
  handleSE.addEventListener("mousedown", function(evt) {
    evt.stopPropagation(); // חשוב - מונע מאירוע ה-mousedown להתפשט לאובייקט ההורה
    startResize(evt, selectedItem.element);
  });
  
  // הצג את התכונות שלו
  showItemProperties(this.id);
}

// פונקציה להזזת אובייקט
function moveItem(e) {
  if (selectedItem && selectedItem.moving && selectedItem.element === this) {
    var roomPreview = document.getElementById("room-preview");
    var roomRect = roomPreview.getBoundingClientRect();
    
    var newX = e.clientX - roomRect.left - selectedItem.offsetX;
    var newY = e.clientY - roomRect.top - selectedItem.offsetY;
    
    // וודא שהאובייקט נשאר בגבולות החדר
    var width = parseInt(this.style.width);
    var height = parseInt(this.style.height);
    
    newX = Math.max(0, Math.min(newX, roomRect.width - width));
    newY = Math.max(0, Math.min(newY, roomRect.height - height));
    
    // עדכן את המיקום
    this.style.left = newX + "px";
    this.style.top = newY + "px";
    
    // עדכן את מידע האובייקט בפרויקט
    var itemId = this.id;
    projectData.rooms[currentRoomId].items[itemId].x = newX;
    projectData.rooms[currentRoomId].items[itemId].y = newY;
  }
}

// פונקציה לשחרור אובייקט
function deselectItem() {
  if (selectedItem && selectedItem.element === this) {
    selectedItem.moving = false;
  }
}

// פונקציה להתחלת שינוי גודל
function startResize(e, item) {
  e.preventDefault();
  
  var itemId = item.id;
  var startX = e.clientX;
  var startY = e.clientY;
  var startWidth = parseInt(item.style.width);
  var startHeight = parseInt(item.style.height);
  
  function doResize(e) {
    // חשב את הגודל החדש
    var newWidth = startWidth + (e.clientX - startX);
    var newHeight = startHeight + (e.clientY - startY);
    
    // הגבל לגודל מינימלי ומקסימלי
    newWidth = Math.max(20, Math.min(400, newWidth));
    newHeight = Math.max(20, Math.min(400, newHeight));
    
    // עדכן את האובייקט
    item.style.width = newWidth + "px";
    item.style.height = newHeight + "px";
    
    // עדכן את הטופס
    document.getElementById("object-width").value = newWidth;
    document.getElementById("object-height").value = newHeight;
    
    // עדכן את נתוני האובייקט
    projectData.rooms[currentRoomId].items[itemId].width = newWidth;
    projectData.rooms[currentRoomId].items[itemId].height = newHeight;
    
    // הוסף הדפסת דיבוג
    console.log("Resizing: " + newWidth + "x" + newHeight);
  }
  
  function stopResize() {
    document.removeEventListener("mousemove", doResize);
    document.removeEventListener("mouseup", stopResize);
  }
  
  document.addEventListener("mousemove", doResize);
  document.addEventListener("mouseup", stopResize);
}

// פונקציה להצגת תכונות של אובייקט נבחר
function showItemProperties(itemId) {
  var item = projectData.rooms[currentRoomId].items[itemId];
  if (!item) return;
  
  // הצג את פאנל התכונות
  document.getElementById("no-object-selected").style.display = "none";
  document.getElementById("object-properties").style.display = "block";
  
  // מלא את הערכים בטופס
  document.getElementById("object-name").value = item.name;
  document.getElementById("object-puzzle").value = item.puzzle || "";
  document.getElementById("object-locked").checked = item.locked;
  document.getElementById("object-required-item").value = item.requiredItem || "";
  document.getElementById("object-next-room").value = item.nextRoom || "";
  document.getElementById("object-width").value = item.width;
  document.getElementById("object-height").value = item.height;
  
  // איפוס שדה העלאת התמונה
  document.getElementById("object-image").value = "";
}

// פונקציה להוספת אובייקט חדש
function addNewItem(type) {
  // צור מזהה ייחודי
  var itemCount = Object.keys(projectData.rooms[currentRoomId].items).length;
  var newItemId = "item" + (itemCount + 1);
  
  // הגדר מידות ברירת מחדל לפי הסוג
  var width = 50, height = 50;
  var name = "";
  
  if (type === "safe") {
    width = 60;
    height = 60;
    name = "כספת";
  } else if (type === "key") {
    width = 40;
    height = 40;
    name = "מפתח";
  } else if (type === "book") {
    width = 50;
    height = 40;
    name = "ספר";
  } else if (type === "computer") {
    width = 50;
    height = 50;
    name = "מחשב";
  }
  
  // הוסף את האובייקט לנתוני הפרויקט
  projectData.rooms[currentRoomId].items[newItemId] = {
    id: newItemId,
    name: name,
    type: type,
    x: 200,
    y: 200,
    width: width,
    height: height,
    puzzle: "",
    locked: false,
    requiredItem: null,
    nextRoom: null,
    image: null
  };
  
  // טען מחדש את החדר
  loadCurrentRoom();
}

// פונקציה למחיקת אובייקט
function deleteSelectedItem() {
  if (selectedItem) {
    var itemId = selectedItem.element.id;
    delete projectData.rooms[currentRoomId].items[itemId];
    
    // טען מחדש את החדר
    loadCurrentRoom();
    
    // הסתר את תכונות האובייקט
    document.getElementById("object-properties").style.display = "none";
    document.getElementById("no-object-selected").style.display = "block";
    
    selectedItem = null;
  }
}

// פונקציה להוספת חדר חדש
function addNewRoom() {
  var roomName = document.getElementById("new-room-name").value;
  var roomBackground = document.getElementById("new-room-background").value;
  
  // צור מזהה ייחודי
  var roomCount = Object.keys(projectData.rooms).length;
  var newRoomId = "room" + (roomCount + 1);
  
  // הוסף את החדר לנתוני הפרויקט
  projectData.rooms[newRoomId] = {
    id: newRoomId,
    name: roomName,
    background: roomBackground,
    backgroundImage: null,
    items: {}
  };
  
  // עדכן את רשימת החדרים
  var roomsList = document.getElementById("rooms-list");
  var li = document.createElement("li");
  li.className = "room-item-list";
  li.setAttribute("data-room-id", newRoomId);
  li.textContent = roomName;
  li.addEventListener("click", function() {
    currentRoomId = this.getAttribute("data-room-id");
    loadCurrentRoom();
  });
  roomsList.appendChild(li);
  
  // סגור את המודאל
  document.getElementById("add-room-modal").style.display = "none";
  
  // עדכן את רשימת החדרים בתפריט של "מעבר לחדר"
  var nextRoomSelect = document.getElementById("object-next-room");
  var option = document.createElement("option");
  option.value = newRoomId;
  option.textContent = roomName;
  nextRoomSelect.appendChild(option);
}

// פונקציה להוספת חידה חדשה
function addNewPuzzle() {
  var puzzleType = document.getElementById("new-puzzle-type").value;
  var puzzleName = document.getElementById("new-puzzle-name").value;
  
  // צור מזהה ייחודי
  var puzzleCount = Object.keys(projectData.puzzles).length;
  var newPuzzleId = puzzleType + "-puzzle-" + (puzzleCount + 1);
  
  // הוסף את החידה לנתוני הפרויקט
  if (puzzleType === "code") {
    projectData.puzzles[newPuzzleId] = {
      id: newPuzzleId,
      name: puzzleName,
      type: "code",
      description: "הזן את הקוד הנכון",
      answer: "1234",
      hint: "חפש רמזים בחדר...",
      successMessage: "הצלחת!"
    };
  } else if (puzzleType === "text") {
    projectData.puzzles[newPuzzleId] = {
      id: newPuzzleId,
      name: puzzleName,
      type: "text",
      question: "ענה על השאלה",
      answer: "תשובה",
      hint: "רמז...",
      successMessage: "תשובה נכונה!"
    };
  }
  
  // עדכן את רשימת החידות
  var puzzleList = document.querySelector(".puzzle-list");
  var div = document.createElement("div");
  div.className = "puzzle-list-item";
  div.setAttribute("data-puzzle-id", newPuzzleId);
  div.textContent = puzzleName;
  div.addEventListener("click", function() {
    showPuzzleForm(this.getAttribute("data-puzzle-id"));
  });
  puzzleList.appendChild(div);
  
  // עדכן את רשימת החידות בתפריט של "חידה מקושרת"
  var puzzleSelect = document.getElementById("object-puzzle");
  var option = document.createElement("option");
  option.value = newPuzzleId;
  option.textContent = puzzleName;
  puzzleSelect.appendChild(option);
  
  // סגור את המודאל
  document.getElementById("add-puzzle-modal").style.display = "none";
}

// פונקציה להצגת טופס עריכת חידה
function showPuzzleForm(puzzleId) {
  var puzzle = projectData.puzzles[puzzleId];
  if (!puzzle) return;
  
  // הסתר את כל טפסי החידות
  var puzzleForms = document.querySelectorAll(".puzzle-form");
  for (var i = 0; i < puzzleForms.length; i++) {
    puzzleForms[i].style.display = "none";
  }
  
  // הצג את הטופס המתאים
  if (puzzle.type === "code") {
    var form = document.getElementById("code-puzzle-form");
    form.style.display = "block";
    document.getElementById("code-puzzle-name").value = puzzle.name;
    document.getElementById("code-puzzle-description").value = puzzle.description;
    document.getElementById("code-puzzle-answer").value = puzzle.answer;
    document.getElementById("code-puzzle-hint").value = puzzle.hint;
    document.getElementById("code-puzzle-success").value = puzzle.successMessage;
    
    // קבע אירוע שמירה לטופס
    document.getElementById("save-code-puzzle").onclick = function() {
      savePuzzle(puzzleId, "code");
    };
  } else if (puzzle.type === "text") {
    var form = document.getElementById("text-puzzle-form");
    form.style.display = "block";
    document.getElementById("text-puzzle-name").value = puzzle.name;
    document.getElementById("text-puzzle-question").value = puzzle.question;
    document.getElementById("text-puzzle-answer").value = puzzle.answer;
    document.getElementById("text-puzzle-hint").value = puzzle.hint;
    document.getElementById("text-puzzle-success").value = puzzle.successMessage;
    
    // קבע אירוע שמירה לטופס
    document.getElementById("save-text-puzzle").onclick = function() {
      savePuzzle(puzzleId, "text");
    };
  }
}

// פונקציה לשמירת חידה
function savePuzzle(puzzleId, type) {
  if (type === "code") {
    projectData.puzzles[puzzleId] = {
      id: puzzleId,
      name: document.getElementById("code-puzzle-name").value,
      type: "code",
      description: document.getElementById("code-puzzle-description").value,
      answer: document.getElementById("code-puzzle-answer").value,
      hint: document.getElementById("code-puzzle-hint").value,
      successMessage: document.getElementById("code-puzzle-success").value
    };
    
    // עדכן את שם החידה ברשימה
    var puzzleItem = document.querySelector('.puzzle-list-item[data-puzzle-id="' + puzzleId + '"]');
    if (puzzleItem) {
      puzzleItem.textContent = document.getElementById("code-puzzle-name").value;
    }
      
  } else if (type === "text") {
    projectData.puzzles[puzzleId] = {
      id: puzzleId,
      name: document.getElementById("text-puzzle-name").value,
      type: "text",
      question: document.getElementById("text-puzzle-question").value,
      answer: document.getElementById("text-puzzle-answer").value,
      hint: document.getElementById("text-puzzle-hint").value,
      successMessage: document.getElementById("text-puzzle-success").value
    };
    
    // עדכן את שם החידה ברשימה
    var puzzleItem = document.querySelector('.puzzle-list-item[data-puzzle-id="' + puzzleId + '"]');
    if (puzzleItem) {
      puzzleItem.textContent = document.getElementById("text-puzzle-name").value;
    }
  }
  
  // עדכן את רשימת החידות בתפריט של "חידה מקושרת"
  var puzzleSelect = document.getElementById("object-puzzle");
  var option = puzzleSelect.querySelector('option[value="' + puzzleId + '"]');
  if (option) {
    option.textContent = projectData.puzzles[puzzleId].name;
  }
  
  alert("החידה נשמרה בהצלחה!");
}

// פונקציה לייצוא המשחק
function exportGame() {
  // עדכון נתוני הפרויקט מהטופס
  projectData.settings.title = document.getElementById("game-title").value;
  projectData.settings.description = document.getElementById("game-description").value;
  projectData.settings.timeLimit = parseInt(document.getElementById("game-time-limit").value);
  
  // יצירת קריאה לקובץ התבנית וטעינת תוכנו
  fetch('game-template.html')
    .then(response => response.text())
    .then(template => {
      // החלפת המקומות השמורים בתבנית
      var gameHTML = template
        .replace('{{GAME_TITLE}}', projectData.settings.title)
        .replace('{{GAME_DESCRIPTION}}', projectData.settings.description)
        .replace(/{{GAME_TIME_LIMIT}}/g, projectData.settings.timeLimit)
        .replace('{{GAME_DATA_JSON}}', JSON.stringify(projectData));
      
      // הצג את המודאל ייצוא המשחק
      document.getElementById("export-game-modal").style.display = "block";
      
      // שמור את קוד המשחק עבור הורדה
      document.getElementById("download-game-btn").onclick = function() {
        var blob = new Blob([gameHTML], { type: "text/html;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "escape-room-game.html";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
    })
    .catch(error => {
      console.error('שגיאה בטעינת תבנית המשחק:', error);
      alert('אירעה שגיאה בטעינת תבנית המשחק. אנא נסה שוב.');
    });
}

// הוספת מאזיני אירועים לשדה העלאת תמונת רקע
document.getElementById("room-background-image").addEventListener("change", async function(e) {
  if (this.files && this.files[0]) {
    try {
      // המרת הקובץ ל-Data URL
      var dataURL = await fileToDataURL(this.files[0]);
      
      // עדכון נתוני הפרויקט
      projectData.rooms[currentRoomId].backgroundImage = dataURL;
      
      // עדכון תצוגת החדר
      document.getElementById("room-preview").style.backgroundImage = "url('" + dataURL + "')";
      document.getElementById("room-preview").style.backgroundColor = "transparent";
    } catch (error) {
      alert("אירעה שגיאה בטעינת התמונה: " + error);
    }
  }
});

// הוספת מאזין אירועים לכפתור הסרת תמונת רקע
document.getElementById("remove-room-bg-image").addEventListener("click", function() {
  // הסרת תמונת הרקע והחזרת צבע הרקע המקורי
  delete projectData.rooms[currentRoomId].backgroundImage;
  var room = projectData.rooms[currentRoomId];
  
  document.getElementById("room-preview").style.backgroundImage = "none";
  
  // הצג את צבע הרקע המקורי לפי סוג החדר
  if (room.background === "lab") {
    document.getElementById("room-preview").style.backgroundColor = "#243447";
  } else if (room.background === "library") {
    document.getElementById("room-preview").style.backgroundColor = "#4b3621";
  } else if (room.background === "office") {
    document.getElementById("room-preview").style.backgroundColor = "#34515e";
  } else if (room.background === "mansion") {
    document.getElementById("room-preview").style.backgroundColor = "#544e4d";
  }
});

// הוספת מאזין אירועים לשדה העלאת תמונת אובייקט
document.getElementById("object-image").addEventListener("change", async function(e) {
  if (this.files && this.files[0] && selectedItem) {
    try {
      // המרת הקובץ ל-Data URL
      var dataURL = await fileToDataURL(this.files[0]);
      
      // עדכון נתוני הפרויקט
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].image = dataURL;
      
      // עדכון תצוגת האובייקט
      var imgElement = document.createElement("img");
      imgElement.src = dataURL;
      imgElement.style.width = "100%";
      imgElement.style.height = "100%";
      imgElement.style.objectFit = "contain";
      
      // נקה את תוכן האובייקט ושים את התמונה
      selectedItem.element.textContent = "";
      selectedItem.element.appendChild(imgElement);
    } catch (error) {
      alert("אירעה שגיאה בטעינת התמונה: " + error);
    }
  }
});

// הוספת מאזין אירועים לכפתור הסרת תמונת אובייקט
document.getElementById("remove-object-image").addEventListener("click", function() {
  if (selectedItem) {
    var itemId = selectedItem.element.id;
    var item = projectData.rooms[currentRoomId].items[itemId];
    
    // הסרת התמונה מנתוני הפרויקט
    delete item.image;
    
    // שחזור הטקסט המקורי של האובייקט
    selectedItem.element.innerHTML = "";
    selectedItem.element.textContent = item.name;
  }
});

// טעינת הדף
document.addEventListener("DOMContentLoaded", function() {
  // טען את החדר הנוכחי
  loadCurrentRoom();
  
  // אירועי לחיצה על הלשוניות
  var tabs = document.querySelectorAll(".tab");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function() {
      // הסר סימון מכל הלשוניות
      var allTabs = document.querySelectorAll(".tab");
      for (var j = 0; j < allTabs.length; j++) {
        allTabs[j].classList.remove("active");
      }
      // סמן את הלשונית הנוכחית
      this.classList.add("active");
      
      // הסתר את כל התוכן
      var allContent = document.querySelectorAll(".tab-content");
      for (var j = 0; j < allContent.length; j++) {
        allContent[j].style.display = "none";
      }
      
      // הצג את התוכן המתאים
      var tabId = this.getAttribute("data-tab") + "-tab";
      document.getElementById(tabId).style.display = "block";
    });
  }
  
  // אירועי לחיצה על אובייקטי הגלריה
  var thumbnails = document.querySelectorAll(".object-thumbnail");
  for (var i = 0; i < thumbnails.length; i++) {
    thumbnails[i].addEventListener("click", function() {
      addNewItem(this.getAttribute("data-type"));
    });
  }
  
  // אירועי לחיצה על רשימת החדרים
  var roomItems = document.querySelectorAll(".room-item-list");
  for (var i = 0; i < roomItems.length; i++) {
    roomItems[i].addEventListener("click", function() {
      currentRoomId = this.getAttribute("data-room-id");
      loadCurrentRoom();
    });
  }
  
  // אירוע לחיצה על כפתור הוספת חדר
  document.getElementById("add-room-btn").addEventListener("click", function() {
    document.getElementById("add-room-modal").style.display = "block";
  });
  
  // אירוע לחיצה על כפתור הוספת חידה
  document.getElementById("add-puzzle-btn").addEventListener("click", function() {
    document.getElementById("add-puzzle-modal").style.display = "block";
  });
  
  // אירוע לחיצה על כפתור יצירת חדר חדש
  document.getElementById("create-room-btn").addEventListener("click", addNewRoom);
  
  // אירוע לחיצה על כפתור יצירת חידה חדשה
  document.getElementById("create-puzzle-btn").addEventListener("click", addNewPuzzle);
  
  // אירוע לחיצה על פריט בגלריית החידות
  var puzzleItems = document.querySelectorAll(".puzzle-list-item");
  for (var i = 0; i < puzzleItems.length; i++) {
    puzzleItems[i].addEventListener("click", function() {
      showPuzzleForm(this.getAttribute("data-puzzle-id"));
    });
  }
  
  // אירוע לחיצה על כפתור מחיקת אובייקט
  document.getElementById("delete-object-btn").addEventListener("click", deleteSelectedItem);
  
  // אירוע לחיצה על כפתור ייצוא משחק
  document.getElementById("generate-game").addEventListener("click", exportGame);
  
  // אירועי סגירת מודאלים
  var closeButtons = document.querySelectorAll(".close-modal");
  for (var i = 0; i < closeButtons.length; i++) {
    closeButtons[i].addEventListener("click", function() {
      this.closest(".modal").style.display = "none";
    });
  }
  
  // אירוע עדכון שם חדר
  document.getElementById("room-name").addEventListener("change", function() {
    projectData.rooms[currentRoomId].name = this.value;
    var roomItem = document.querySelector('.room-item-list[data-room-id="' + currentRoomId + '"]');
    if (roomItem) {
      roomItem.textContent = this.value;
    }
  });
  
  // אירוע שינוי רקע חדר
  document.getElementById("room-background").addEventListener("change", function() {
    projectData.rooms[currentRoomId].background = this.value;
    loadCurrentRoom();
  });
  
  // אירועי עדכון תכונות אובייקט
  document.getElementById("object-name").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].name = this.value;
      
      // בדוק אם יש תמונה לאובייקט
      if (!projectData.rooms[currentRoomId].items[itemId].image) {
        selectedItem.element.textContent = this.value;
      }
    }
  });
  
  document.getElementById("object-puzzle").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].puzzle = this.value || null;
    }
  });
  
  document.getElementById("object-locked").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].locked = this.checked;
    }
  });
  
  document.getElementById("object-required-item").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].requiredItem = this.value || null;
    }
  });
  
  document.getElementById("object-next-room").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].nextRoom = this.value || null;
    }
  });
  
  // אירועי עדכון תכונות אובייקט - מידות
  document.getElementById("object-width").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var newWidth = parseInt(this.value);
      
      // וודא שהערך תקין
      if (newWidth < 20) newWidth = 20;
      if (newWidth > 400) newWidth = 400;
      
      // עדכן את נתוני האובייקט
      projectData.rooms[currentRoomId].items[itemId].width = newWidth;
      
      // עדכן את התצוגה
      selectedItem.element.style.width = newWidth + "px";
    }
  });

  document.getElementById("object-height").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var newHeight = parseInt(this.value);
      
      // וודא שהערך תקין
      if (newHeight < 20) newHeight = 20;
      if (newHeight > 400) newHeight = 400;
      
      // עדכן את נתוני האובייקט
      projectData.rooms[currentRoomId].items[itemId].height = newHeight;
      
      // עדכן את התצוגה
      selectedItem.element.style.height = newHeight + "px";
    }
  });
  
  // אירועי שמירה וטעינה של פרויקט
  document.getElementById("save-project-btn").addEventListener("click", function() {
    localStorage.setItem("escape-room-project", JSON.stringify(projectData));
    alert("הפרויקט נשמר בהצלחה!");
  });
  
  document.getElementById("load-project-btn").addEventListener("click", function() {
    var savedProject = localStorage.getItem("escape-room-project");
    if (savedProject) {
      try {
        projectData = JSON.parse(savedProject);
        currentRoomId = Object.keys(projectData.rooms)[0] || "room1";
        
        // עדכן את רשימת החדרים
        var roomsList = document.getElementById("rooms-list");
        roomsList.innerHTML = "";
        for (var roomId in projectData.rooms) {
          var room = projectData.rooms[roomId];
          var li = document.createElement("li");
          li.className = "room-item-list" + (roomId === currentRoomId ? " active" : "");
          li.setAttribute("data-room-id", roomId);
          li.textContent = room.name;
          li.addEventListener("click", function() {
            currentRoomId = this.getAttribute("data-room-id");
            loadCurrentRoom();
          });
          roomsList.appendChild(li);
        }
        
        loadCurrentRoom();
        alert("הפרויקט נטען בהצלחה!");
      } catch (error) {
        alert("שגיאה בטעינת הפרויקט: " + error);
      }
    } else {
      alert("לא נמצא פרויקט שמור!");
    }
  });
  
  // אירוע פרויקט חדש
  document.getElementById("new-project-btn").addEventListener("click", function() {
    if (confirm("האם אתה בטוח שברצונך ליצור פרויקט חדש? כל השינויים שלא נשמרו יאבדו.")) {
      projectData = {
        name: "חדר הבריחה שלי",
        rooms: {
          room1: {
            id: "room1",
            name: "חדר 1: מעבדה",
            background: "lab",
            backgroundImage: null,
            items: {}
          }
        },
        puzzles: {},
        connections: [],
        settings: {
          title: "חדר הבריחה שלי",
          description: "ברוכים הבאים לחדר הבריחה המקוון!",
          timeLimit: 60
        }
      };
      
      // עדכן את רשימת החדרים
      var roomsList = document.getElementById("rooms-list");
      roomsList.innerHTML = '<li class="room-item-list active" data-room-id="room1">חדר 1: מעבדה</li>';
      var roomItem = document.querySelector(".room-item-list");
      roomItem.addEventListener("click", function() {
        currentRoomId = this.getAttribute("data-room-id");
        loadCurrentRoom();
      });
      
      currentRoomId = "room1";
      loadCurrentRoom();
      
      // נקה את בחירת האובייקט
      selectedItem = null;
      document.getElementById("object-properties").style.display = "none";
      document.getElementById("no-object-selected").style.display = "block";
    }
  });
});
