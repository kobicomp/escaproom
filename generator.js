// מודל הנתונים המורחב לפרויקט חדר בריחה
var projectData = {
  name: "חדר הבריחה שלי",

  // חדרים במשחק
  rooms: {
    room1: {
      id: "room1",
      name: "חדר 1: מעבדה",
      background: "lab",
      backgroundImage: null,
      description: "מעבדה מסתורית עם מכשירים מדעיים וחפצים מעניינים.",
      items: {},
      onEnter: [],  // תסריטים שמופעלים בכניסה לחדר
      onExit: [],   // תסריטים שמופעלים ביציאה מהחדר
      initiallyLocked: false,
      requiredCondition: null  // תנאי לכניסה לחדר מעבר לקשרים במפה
    }
  },

  // חידות במשחק
  puzzles: {},

  // קשרים במפה
  connections: [],

  // תסריטים גלובליים
  scripts: {},

  // משתנים גלובליים למשחק
  variables: {
    // לדוגמה: visitedLab: false - האם השחקן ביקר במעבדה
  },

  // אירועים מתוזמנים
  timedEvents: [],

  // הגדרות כלליות
  settings: {
    title: "חדר הבריחה שלי - המעבדה המסתורית",
    description: "ברוכים הבאים לחדר הבריחה המקוון! מצאת את עצמך נעול במעבדה מסתורית. עליך לפתור את החידות ולמצוא את הדרך החוצה.",
    timeLimit: 60,
    storyTexts: {
      intro: "התעוררת בחדר לא מוכר. הדלת נעולה ואתה צריך למצוא דרך החוצה.",
      ending: "הצלחת למצוא את הדרך החוצה! כל הכבוד!"
    },
    maxInventorySize: 8  // גודל מלאי גמיש
  },

  // קטגוריות מלאי (ארגון משופר)
  inventoryCategories: [
    { id: "keys", name: "מפתחות" },
    { id: "tools", name: "כלים" },
    { id: "documents", name: "מסמכים" }
  ],

  // סוגי חפצים מוגדרים מראש
  itemTypes: {
    key: {
      name: "מפתח",
      category: "keys",
      collectible: true,
      combinable: true,
      usableOn: ["door", "chest", "safe"]
    },
    document: {
      name: "מסמך",
      category: "documents",
      collectible: true,
      readable: true
    },
    tool: {
      name: "כלי",
      category: "tools",
      collectible: true,
      combinable: true,
      usableOn: ["mechanism", "lock", "device"]
    },
    door: {
      name: "דלת",
      isExit: true,
      lockable: true,
      connectsTo: null
    },
    safe: {
      name: "כספת",
      lockable: true,
      container: true
    },
    computer: {
      name: "מחשב",
      interactive: true,
      canHavePuzzle: true
    },
    chest: {
      name: "תיבה",
      lockable: true,
      container: true
    },
    book: {
      name: "ספר",
      readable: true
    },
    mechanism: {
      name: "מנגנון",
      interactive: true,
      canTriggerEvent: true
    },
    device: {
      name: "מכשיר",
      interactive: true,
      canTriggerEvent: true,
      canHavePuzzle: true
    },
    note: {
      name: "פתק",
      readable: true,
      collectible: true
    },
    painting: {
      name: "ציור",
      interactive: true,
      canHideItem: true
    },
    furniture: {
      name: "רהיט",
      canHideItem: true
    }
  }
};

// חדר נוכחי שמוצג
var currentRoomId = "room1";

// אובייקט נבחר
var selectedItem = null;

// חלק מהמערכת שנבחר לעריכה (תסריט, חידה וכו')
var selectedComponent = null;

// משתנים נוספים
var creatingCondition = false;
var editingScript = false;
var currentScript = null;

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

// פונקציה לאתחול המחולל - תיקראה ב-DOMContentLoaded בסוף הקובץ
function initGenerator() {
  console.log("מאתחל את המחולל המשופר...");

  try {
    // קישור מאזיני אירועים
    setupEventListeners();
    console.log("מאזיני אירועים הוגדרו בהצלחה");

    // יצירת טפסי חידות מורחבים
    createPuzzleForms();
    console.log("טפסי חידות נוצרו בהצלחה");

    // אתחול ממשק המפה
    initMapInterface();
    console.log("ממשק המפה אותחל בהצלחה");

    // אתחול עורך תסריטים
    initScriptEditor();
    console.log("עורך התסריטים אותחל בהצלחה");

    // אתחול עורך תנאים
    initConditionsEditor();
    console.log("עורך התנאים אותחל בהצלחה");

    // אתחול קטגוריות המלאי
    initInventoryCategories();
    console.log("קטגוריות המלאי אותחלו בהצלחה");

    // טעינת החדר הראשון
    loadCurrentRoom();
    console.log("החדר הראשון נטען בהצלחה");

    console.log("המחולל המשופר אותחל בהצלחה!");
  } catch (error) {
    console.error("שגיאה באתחול המחולל:", error);
    alert("אירעה שגיאה באתחול המחולל: " + error.message);
  }
}

// פונקציה לטעינת החדר הנוכחי
function loadCurrentRoom() {
  console.log("טוען חדר:", currentRoomId);

  // נקה את תצוגת החדר
  var roomPreview = document.getElementById("room-preview");
  if (!roomPreview) {
    console.error("אלמנט room-preview לא נמצא");
    return;
  }

  roomPreview.innerHTML = "";

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

    // הוסף מאפיינים נוספים לאובייקט במחולל
    if (item.puzzle) {
      itemElement.setAttribute("data-puzzle", item.puzzle);
    }
    if (item.locked) {
      itemElement.setAttribute("data-locked", "true");
    }
    if (item.requiredItems && item.requiredItems.length > 0) {
      itemElement.setAttribute("data-required-items", JSON.stringify(item.requiredItems));
    }
    if (item.nextRoom) {
      itemElement.setAttribute("data-next-room", item.nextRoom);
    }
    if (item.containsItems) {
      itemElement.setAttribute("data-contains-items", "true");
    }
    if (item.hidden) {
      itemElement.setAttribute("data-hidden", "true");
      itemElement.style.opacity = "0.4";  // מוצג שקוף במחולל
    }
    if (item.onUse) {
      itemElement.setAttribute("data-on-use", item.onUse);
    }
    if (item.onOpen) {
      itemElement.setAttribute("data-on-open", item.onOpen);
    }
    if (item.condition) {
      itemElement.setAttribute("data-condition", item.condition);
    }

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

    // סמן אם יש תסריטים מקושרים
    if (item.onUse || item.onOpen || item.onExamine) {
      var scriptIndicator = document.createElement("div");
      scriptIndicator.className = "script-indicator";
      scriptIndicator.title = "יש תסריט מקושר לאובייקט זה";
      itemElement.appendChild(scriptIndicator);
    }

    // הוסף את האובייקט לחדר
    roomPreview.appendChild(itemElement);

    // טיפול באירועי עכבר
    itemElement.addEventListener("mousedown", selectItem);
  }

  // עדכן את שם החדר ותיאורו
  var roomNameElement = document.getElementById("room-name");
  var roomDescElement = document.getElementById("room-description");
  if (roomNameElement) roomNameElement.value = room.name;
  if (roomDescElement) roomDescElement.value = room.description || "";

  // עדכן את הרקע בתפריט
  var roomBackgroundElement = document.getElementById("room-background");
  if (roomBackgroundElement) {
    roomBackgroundElement.value = room.background;
  }

  // עדכן את הרשימה של החדרים
  var roomItems = document.querySelectorAll(".room-item-list");
  for (var i = 0; i < roomItems.length; i++) {
    roomItems[i].classList.remove("active");
    if (roomItems[i].getAttribute("data-room-id") === currentRoomId) {
      roomItems[i].classList.add("active");
    }
  }

  // עדכן את תצוגת התסריטים של החדר
  updateRoomScripts();

  // עדכן את תצוגת התנאים של החדר
  updateRoomConditions();

  // הסתר את תכונות האובייקט
  var objectPropertiesElement = document.getElementById("object-properties");
  var noObjectSelectedElement = document.getElementById("no-object-selected");

  if (objectPropertiesElement) {
    objectPropertiesElement.style.display = "none";
  }

  if (noObjectSelectedElement) {
    noObjectSelectedElement.style.display = "block";
  }

  // עדכן את רשימת החדרים בתפריט יעד הדלת
  updateDoorTargets();
}

// פונקציה לעדכון רשימת יעדי הדלת
function updateDoorTargets() {
  var nextRoomSelect = document.getElementById("object-next-room");
  if (!nextRoomSelect) {
    return;
  }

  nextRoomSelect.innerHTML = '<option value="">בחר חדר</option>';

  for (var roomId in projectData.rooms) {
    if (roomId !== currentRoomId) { // אל תציג את החדר הנוכחי
      var room = projectData.rooms[roomId];
      var option = document.createElement("option");
      option.value = roomId;
      option.textContent = room.name;
      nextRoomSelect.appendChild(option);
    }
  }
}

// פונקציה לאתחול עורך התסריטים
function initScriptEditor() {
  // יצירת הממשק לעורך התסריטים
  var scriptEditor = document.getElementById("script-editor");
  if (!scriptEditor) return;

  // מילוי תבנית לפעולות אפשריות בתסריט
  var actionTypeSelect = document.getElementById("script-action-type");
  if (actionTypeSelect) {
    actionTypeSelect.innerHTML = `
      <option value="">בחר פעולה</option>
      <option value="showMessage">הצג הודעה</option>
      <option value="showItem">הצג חפץ מוסתר</option>
      <option value="hideItem">הסתר חפץ</option>
      <option value="unlockItem">פתח נעילת חפץ</option>
      <option value="lockItem">נעל חפץ</option>
      <option value="addToInventory">הוסף למלאי</option>
      <option value="removeFromInventory">הסר מהמלאי</option>
      <option value="moveToRoom">עבור לחדר</option>
      <option value="playSound">השמע צליל</option>
      <option value="setVariable">קבע ערך משתנה</option>
      <option value="wait">המתן (שניות)</option>
      <option value="runAnotherScript">הפעל תסריט אחר</option>
    `;
  }

  // הוספת אירוע לשינוי סוג הפעולה
  actionTypeSelect.addEventListener("change", function() {
    // הצג את הטופס המתאים לסוג הפעולה
    updateScriptActionForm(this.value);
  });

  // כפתור הוספת פעולה
  var addActionButton = document.getElementById("add-script-action");
  if (addActionButton) {
    addActionButton.addEventListener("click", function() {
      addActionToScript();
    });
  }

  // כפתור שמירת תסריט
  var saveScriptButton = document.getElementById("save-script");
  if (saveScriptButton) {
    saveScriptButton.addEventListener("click", function() {
      saveCurrentScript();
    });
  }
}

// פונקציה לעדכון הטופס של פעולת התסריט לפי הסוג הנבחר
function updateScriptActionForm(actionType) {
  var actionParamsContainer = document.getElementById("script-action-params");
  if (!actionParamsContainer) return;

  // נקה את המיכל הקודם
  actionParamsContainer.innerHTML = "";

  // בנה את הטופס המתאים לסוג הפעולה
  switch (actionType) {
    case "showMessage":
      actionParamsContainer.innerHTML = `
        <div class="form-group">
          <label for="message-text">תוכן ההודעה:</label>
          <textarea id="message-text" rows="3" placeholder="הזן את תוכן ההודעה..."></textarea>
        </div>
        <div class="form-group">
          <label for="message-duration">משך הצגה (שניות, 0 לסגירה ידנית):</label>
          <input type="number" id="message-duration" min="0" value="3">
        </div>
      `;
      break;
    case "showItem":
      var itemsSelect = document.createElement("select");
      itemsSelect.id = "show-item-id";

      var defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "בחר חפץ...";
      itemsSelect.appendChild(defaultOption);

      // הוסף אפשרויות של חפצים מוסתרים בחדר הנוכחי
      var room = projectData.rooms[currentRoomId];
      for (var itemId in room.items) {
        if (room.items[itemId].hidden) {
          var option = document.createElement("option");
          option.value = itemId;
          option.textContent = room.items[itemId].name;
          itemsSelect.appendChild(option);
        }
      }

      var formGroup = document.createElement("div");
      formGroup.className = "form-group";

      var label = document.createElement("label");
      label.htmlFor = "show-item-id";
      label.textContent = "חפץ להצגה:";

      formGroup.appendChild(label);
      formGroup.appendChild(itemsSelect);
      actionParamsContainer.appendChild(formGroup);
      break;
    case "setVariable":
      actionParamsContainer.innerHTML = `
        <div class="form-group">
          <label for="variable-name">שם המשתנה:</label>
          <input type="text" id="variable-name" placeholder="הזן שם משתנה...">
        </div>
        <div class="form-group">
          <label for="variable-value">ערך:</label>
          <input type="text" id="variable-value" placeholder="הזן ערך...">
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="variable-is-number">
            ערך מספרי
          </label>
        </div>
      `;
      break;
    // המשך עם יתר סוגי הפעולות...
    default:
      actionParamsContainer.innerHTML = "<p>בחר סוג פעולה</p>";
  }
}

// פונקציה להוספת פעולה לתסריט נוכחי
function addActionToScript() {
  if (!currentScript) {
    alert("אנא בחר תסריט לעריכה תחילה");
    return;
  }

  var actionType = document.getElementById("script-action-type").value;
  if (!actionType) {
    alert("אנא בחר סוג פעולה");
    return;
  }

  // בנה את אובייקט הפעולה בהתאם לסוג
  var action = { type: actionType };

  // הוסף פרמטרים בהתאם לסוג הפעולה
  switch (actionType) {
    case "showMessage":
      var messageText = document.getElementById("message-text").value;
      var messageDuration = parseInt(document.getElementById("message-duration").value);
      if (!messageText) {
        alert("אנא הזן תוכן הודעה");
        return;
      }
      action.text = messageText;
      action.duration = messageDuration;
      break;
    case "showItem":
      var itemId = document.getElementById("show-item-id").value;
      if (!itemId) {
        alert("אנא בחר חפץ להצגה");
        return;
      }
      action.itemId = itemId;
      break;
    case "setVariable":
      var variableName = document.getElementById("variable-name").value;
      var variableValue = document.getElementById("variable-value").value;
      var isNumber = document.getElementById("variable-is-number").checked;

      if (!variableName) {
        alert("אנא הזן שם משתנה");
        return;
      }

      action.name = variableName;
      if (isNumber) {
        action.value = parseFloat(variableValue);
      } else {
        action.value = variableValue;
      }
      break;
    // המשך עם שאר סוגי הפעולות...
  }

  // הוסף את הפעולה לתסריט הנוכחי
  if (!currentScript.actions) {
    currentScript.actions = [];
  }
  currentScript.actions.push(action);

  // עדכן את תצוגת התסריט
  updateScriptDisplay();

  // נקה את הטופס
  document.getElementById("script-action-type").value = "";
  document.getElementById("script-action-params").innerHTML = "";
}

// פונקציה לעדכון תצוגת התסריט הנוכחי
function updateScriptDisplay() {
  var scriptActionsList = document.getElementById("script-actions-list");
  if (!scriptActionsList || !currentScript || !currentScript.actions) return;

  scriptActionsList.innerHTML = "";

  // הוסף כל פעולה לרשימה
  currentScript.actions.forEach((action, index) => {
    var actionItem = document.createElement("div");
    actionItem.className = "script-action-item";

    // הצג תיאור מתאים לסוג הפעולה
    var actionDescription = getActionDescription(action);

    actionItem.innerHTML = `
      <div class="action-number">${index + 1}</div>
      <div class="action-description">${actionDescription}</div>
      <div class="action-controls">
        <button class="btn-small" onclick="moveActionUp(${index})">↑</button>
        <button class="btn-small" onclick="moveActionDown(${index})">↓</button>
        <button class="btn-small btn-danger" onclick="removeAction(${index})">🗑️</button>
      </div>
    `;

    scriptActionsList.appendChild(actionItem);
  });
}

// פונקציה ליצירת תיאור פעולה בתסריט
function getActionDescription(action) {
  switch (action.type) {
    case "showMessage":
      return `הצג הודעה: "${action.text.substring(0, 30)}${action.text.length > 30 ? '...' : ''}" למשך ${action.duration} שניות`;
    case "showItem":
      var itemName = "";
      var room = projectData.rooms[currentRoomId];
      if (room.items[action.itemId]) {
        itemName = room.items[action.itemId].name;
      }
      return `הצג חפץ: ${itemName || action.itemId}`;
    case "setVariable":
      return `קבע משתנה: ${action.name} = ${action.value}`;
    case "wait":
      return `המתן ${action.seconds} שניות`;
    // המשך עם שאר סוגי הפעולות...
    default:
      return `פעולה: ${action.type}`;
  }
}

// פונקציות שליטה בפעולות (העברה, מחיקה)
function moveActionUp(index) {
  if (!currentScript || !currentScript.actions || index <= 0) return;

  // החלף מיקום עם הפעולה הקודמת
  var temp = currentScript.actions[index];
  currentScript.actions[index] = currentScript.actions[index - 1];
  currentScript.actions[index - 1] = temp;

  // עדכן תצוגה
  updateScriptDisplay();
}

function moveActionDown(index) {
  if (!currentScript || !currentScript.actions || index >= currentScript.actions.length - 1) return;

  // החלף מיקום עם הפעולה הבאה
  var temp = currentScript.actions[index];
  currentScript.actions[index] = currentScript.actions[index + 1];
  currentScript.actions[index + 1] = temp;

  // עדכן תצוגה
  updateScriptDisplay();
}

function removeAction(index) {
  if (!currentScript || !currentScript.actions) return;

  // הסר את הפעולה מהמערך
  currentScript.actions.splice(index, 1);

  // עדכן תצוגה
  updateScriptDisplay();
}

// פונקציה לשמירת התסריט הנוכחי
function saveCurrentScript() {
  if (!currentScript) {
    alert("אין תסריט פעיל לשמירה");
    return;
  }

  var scriptNameInput = document.getElementById("script-name");
  if (scriptNameInput) {
    currentScript.name = scriptNameInput.value;
  }

  // טיפול בתסריטים שונים לפי המיקום שלהם
  if (editingScript === "room") {
    // עדכן תסריט של חדר
    if (currentScript.trigger === "onEnter") {
      projectData.rooms[currentRoomId].onEnter = currentScript.actions;
    } else if (currentScript.trigger === "onExit") {
      projectData.rooms[currentRoomId].onExit = currentScript.actions;
    }
  } else if (editingScript === "item") {
    // עדכן תסריט של חפץ
    if (selectedItem && selectedItem.element) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];

      if (currentScript.trigger === "onUse") {
        item.onUse = currentScript.actions;
      } else if (currentScript.trigger === "onOpen") {
        item.onOpen = currentScript.actions;
      } else if (currentScript.trigger === "onExamine") {
        item.onExamine = currentScript.actions;
      }
    }
  } else if (editingScript === "global") {
    // עדכן תסריט גלובלי
    projectData.scripts[currentScript.id] = currentScript;
  }

  // סגור את עורך התסריטים
  var scriptEditor = document.getElementById("script-editor-container");
  if (scriptEditor) {
    scriptEditor.style.display = "none";
  }

  // נקה משתנים
  currentScript = null;
  editingScript = false;

  // רענן תצוגת החדר
  loadCurrentRoom();

  alert("התסריט נשמר בהצלחה!");
}

// פונקציה לאתחול עורך התנאים
function initConditionsEditor() {
  var conditionTypeSelect = document.getElementById("condition-type");
  if (!conditionTypeSelect) return;

  // מילוי סוגי תנאים
  conditionTypeSelect.innerHTML = `
    <option value="">בחר סוג תנאי</option>
    <option value="variable">ערך משתנה</option>
    <option value="itemInInventory">פריט במלאי</option>
    <option value="puzzleSolved">חידה פתורה</option>
    <option value="roomVisited">ביקור בחדר</option>
    <option value="itemState">מצב חפץ</option>
    <option value="multipleConditions">תנאים מרובים (AND/OR)</option>
  `;

  // אירוע לשינוי סוג התנאי
  conditionTypeSelect.addEventListener("change", function() {
    updateConditionForm(this.value);
  });

  // כפתור שמירת תנאי
  var saveConditionButton = document.getElementById("save-condition");
  if (saveConditionButton) {
    saveConditionButton.addEventListener("click", saveCurrentCondition);
  }
}

// פונקציה לעדכון טופס התנאי לפי הסוג הנבחר
function updateConditionForm(conditionType) {
  var conditionParamsContainer = document.getElementById("condition-params");
  if (!conditionParamsContainer) return;

  // נקה את המיכל הקודם
  conditionParamsContainer.innerHTML = "";

  // בנה את הטופס המתאים לסוג התנאי
  switch (conditionType) {
    case "variable":
      conditionParamsContainer.innerHTML = `
        <div class="form-group">
          <label for="condition-variable-name">שם המשתנה:</label>
          <input type="text" id="condition-variable-name" placeholder="הזן שם משתנה...">
        </div>
        <div class="form-group">
                  <label for="condition-variable-operator">אופרטור:</label>
                  <select id="condition-variable-operator">
                    <option value="equals">שווה (=)</option>
                    <option value="notEquals">לא שווה (!=)</option>
                    <option value="greaterThan">גדול מ (>)</option>
                    <option value="lessThan">קטן מ (<)</option>
                    <option value="greaterOrEqual">גדול או שווה (>=)</option>
                    <option value="lessOrEqual">קטן או שווה (<=)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="condition-variable-value">ערך לבדיקה:</label>
                  <input type="text" id="condition-variable-value" placeholder="הזן ערך...">
                </div>
                <div class="form-group">
                  <label>
                    <input type="checkbox" id="condition-variable-is-number">
                    ערך מספרי
                  </label>
                </div>
              `;
              break;
            case "itemInInventory":
              var itemsSelect = document.createElement("select");
              itemsSelect.id = "condition-inventory-item";

              var defaultOption = document.createElement("option");
              defaultOption.value = "";
              defaultOption.textContent = "בחר חפץ...";
              itemsSelect.appendChild(defaultOption);

              // הוסף כל החפצים האפשריים במלאי
              for (var roomId in projectData.rooms) {
                var room = projectData.rooms[roomId];
                for (var itemId in room.items) {
                  var item = room.items[itemId];
                  if (item.collectible || projectData.itemTypes[item.type]?.collectible) {
                    var option = document.createElement("option");
                    option.value = itemId;
                    option.textContent = item.name;
                    itemsSelect.appendChild(option);
                  }
                }
              }

              var formGroup = document.createElement("div");
              formGroup.className = "form-group";

              var label = document.createElement("label");
              label.htmlFor = "condition-inventory-item";
              label.textContent = "חפץ במלאי:";

              formGroup.appendChild(label);
              formGroup.appendChild(itemsSelect);

              // בחירה האם החפץ צריך להיות במלאי או לא
              var operatorDiv = document.createElement("div");
              operatorDiv.className = "form-group";
              operatorDiv.innerHTML = `
                <label for="condition-inventory-operator">תנאי:</label>
                <select id="condition-inventory-operator">
                  <option value="has">קיים במלאי</option>
                  <option value="notHas">לא קיים במלאי</option>
                </select>
              `;

              conditionParamsContainer.appendChild(formGroup);
              conditionParamsContainer.appendChild(operatorDiv);
              break;
            case "puzzleSolved":
              var puzzlesSelect = document.createElement("select");
              puzzlesSelect.id = "condition-puzzle-id";

              var defaultOption = document.createElement("option");
              defaultOption.value = "";
              defaultOption.textContent = "בחר חידה...";
              puzzlesSelect.appendChild(defaultOption);

              // הוסף את כל החידות
              for (var puzzleId in projectData.puzzles) {
                var puzzle = projectData.puzzles[puzzleId];
                var option = document.createElement("option");
                option.value = puzzleId;
                option.textContent = puzzle.name;
                puzzlesSelect.appendChild(option);
              }

              var formGroup = document.createElement("div");
              formGroup.className = "form-group";

              var label = document.createElement("label");
              label.htmlFor = "condition-puzzle-id";
              label.textContent = "חידה:";

              formGroup.appendChild(label);
              formGroup.appendChild(puzzlesSelect);

              // בחירה האם החידה צריכה להיות פתורה או לא
              var operatorDiv = document.createElement("div");
              operatorDiv.className = "form-group";
              operatorDiv.innerHTML = `
                <label for="condition-puzzle-operator">תנאי:</label>
                <select id="condition-puzzle-operator">
                  <option value="solved">פתורה</option>
                  <option value="notSolved">לא פתורה</option>
                </select>
              `;

              conditionParamsContainer.appendChild(formGroup);
              conditionParamsContainer.appendChild(operatorDiv);
              break;
            case "multipleConditions":
              conditionParamsContainer.innerHTML = `
                <div class="form-group">
                  <label for="condition-multiple-type">סוג הקשר הלוגי:</label>
                  <select id="condition-multiple-type">
                    <option value="and">וגם (AND) - כל התנאים חייבים להתקיים</option>
                    <option value="or">או (OR) - לפחות אחד מהתנאים צריך להתקיים</option>
                  </select>
                </div>
                <div class="sub-conditions" id="sub-conditions-list">
                  <!-- כאן יתווספו תנאי משנה -->
                </div>
                <button type="button" class="btn" id="add-sub-condition">הוסף תנאי משנה</button>
              `;

              // הוסף אירוע ללחצן הוספת תנאי משנה
              setTimeout(() => {
                const addSubConditionBtn = document.getElementById("add-sub-condition");
                if (addSubConditionBtn) {
                  addSubConditionBtn.addEventListener("click", addSubCondition);
                }
              }, 100);
              break;
            // המשך עם שאר סוגי התנאים...
            default:
              conditionParamsContainer.innerHTML = "<p>בחר סוג תנאי</p>";
          }
        }

        // פונקציה להוספת תנאי משנה לתנאי מרובה
        function addSubCondition() {
          // יצירת חלון מודאלי לבחירת תנאי משנה
          var subConditionModal = document.getElementById("sub-condition-modal");
          if (!subConditionModal) {
            // יצירת המודאל אם לא קיים
            subConditionModal = document.createElement("div");
            subConditionModal.id = "sub-condition-modal";
            subConditionModal.className = "modal";
            subConditionModal.innerHTML = `
              <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>הוסף תנאי משנה</h3>
                <div class="form-group">
                  <label for="sub-condition-type">סוג תנאי:</label>
                  <select id="sub-condition-type">
                    <option value="variable">ערך משתנה</option>
                    <option value="itemInInventory">פריט במלאי</option>
                    <option value="puzzleSolved">חידה פתורה</option>
                  </select>
                </div>
                <div id="sub-condition-params"></div>
                <button type="button" class="btn" id="save-sub-condition">הוסף</button>
              </div>
            `;
            document.body.appendChild(subConditionModal);

            // אירוע לסגירת המודאל
            var closeBtn = subConditionModal.querySelector(".close-modal");
            if (closeBtn) {
              closeBtn.addEventListener("click", function() {
                subConditionModal.style.display = "none";
              });
            }

            // אירוע לשינוי סוג תנאי המשנה
            var subConditionTypeSelect = document.getElementById("sub-condition-type");
            if (subConditionTypeSelect) {
              subConditionTypeSelect.addEventListener("change", function() {
                updateSubConditionForm(this.value);
              });
            }

            // אירוע לשמירת תנאי המשנה
            var saveSubConditionBtn = document.getElementById("save-sub-condition");
            if (saveSubConditionBtn) {
              saveSubConditionBtn.addEventListener("click", saveSubCondition);
            }
          }

          // פתח את המודאל
          subConditionModal.style.display = "block";

          // אפס את הטופס
          var subConditionTypeSelect = document.getElementById("sub-condition-type");
          if (subConditionTypeSelect) {
            subConditionTypeSelect.value = "variable";
            updateSubConditionForm("variable");
          }
        }

        // פונקציה לעדכון טופס תנאי המשנה
        function updateSubConditionForm(conditionType) {
          var conditionParamsContainer = document.getElementById("sub-condition-params");
          if (!conditionParamsContainer) return;

          // נקה את המיכל הקודם
          conditionParamsContainer.innerHTML = "";

          // בנה את הטופס המתאים לסוג התנאי - דומה לפונקציה updateConditionForm
          // אבל עם מזהים אחרים
          switch (conditionType) {
            case "variable":
              conditionParamsContainer.innerHTML = `
                <div class="form-group">
                  <label for="sub-variable-name">שם המשתנה:</label>
                  <input type="text" id="sub-variable-name" placeholder="הזן שם משתנה...">
                </div>
                <div class="form-group">
                  <label for="sub-variable-operator">אופרטור:</label>
                  <select id="sub-variable-operator">
                    <option value="equals">שווה (=)</option>
                    <option value="notEquals">לא שווה (!=)</option>
                    <option value="greaterThan">גדול מ (>)</option>
                    <option value="lessThan">קטן מ (<)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="sub-variable-value">ערך לבדיקה:</label>
                  <input type="text" id="sub-variable-value" placeholder="הזן ערך...">
                </div>
                <div class="form-group">
                  <label>
                    <input type="checkbox" id="sub-variable-is-number">
                    ערך מספרי
                  </label>
                </div>
              `;
              break;
            // סוגי תנאים נוספים...
          }
        }

        // פונקציה לשמירת תנאי משנה
        function saveSubCondition() {
          var conditionType = document.getElementById("sub-condition-type").value;
          if (!conditionType) return;

          // בנה את אובייקט התנאי בהתאם לסוג
          var condition = { type: conditionType };

          // הוסף פרמטרים בהתאם לסוג התנאי
          switch (conditionType) {
            case "variable":
              var variableName = document.getElementById("sub-variable-name").value;
              var operator = document.getElementById("sub-variable-operator").value;
              var value = document.getElementById("sub-variable-value").value;
              var isNumber = document.getElementById("sub-variable-is-number").checked;

              if (!variableName) {
                alert("אנא הזן שם משתנה");
                return;
              }

              condition.name = variableName;
              condition.operator = operator;
              if (isNumber) {
                condition.value = parseFloat(value);
              } else {
                condition.value = value;
              }
              break;
            // טיפול בשאר סוגי התנאים...
          }

          // הוסף את התנאי לרשימת תנאי המשנה
          var subConditionsList = document.getElementById("sub-conditions-list");
          if (subConditionsList) {
            var subCondItem = document.createElement("div");
            subCondItem.className = "sub-condition-item";
            subCondItem.dataset.condition = JSON.stringify(condition);

            // הצג תיאור של התנאי
            var conditionDesc = getConditionDescription(condition);
            subCondItem.innerHTML = `
              <div class="sub-condition-description">${conditionDesc}</div>
              <button type="button" class="btn-small btn-danger remove-sub-condition">הסר</button>
            `;

            // אירוע להסרת תנאי המשנה
            var removeBtn = subCondItem.querySelector(".remove-sub-condition");
            if (removeBtn) {
              removeBtn.addEventListener("click", function() {
                subCondItem.remove();
              });
            }

            subConditionsList.appendChild(subCondItem);
          }

          // סגור את המודאל
          var subConditionModal = document.getElementById("sub-condition-modal");
          if (subConditionModal) {
            subConditionModal.style.display = "none";
          }
        }

        // פונקציה ליצירת תיאור של תנאי
        function getConditionDescription(condition) {
          switch (condition.type) {
            case "variable":
              var operatorText = "";
              switch (condition.operator) {
                case "equals": operatorText = "="; break;
                case "notEquals": operatorText = "!="; break;
                case "greaterThan": operatorText = ">"; break;
                case "lessThan": operatorText = "<"; break;
                case "greaterOrEqual": operatorText = ">="; break;
                case "lessOrEqual": operatorText = "<="; break;
              }
              return `המשתנה ${condition.name} ${operatorText} ${condition.value}`;
            case "itemInInventory":
              var itemName = condition.itemName || condition.itemId;
              return condition.operator === "has" ?
                `יש במלאי: ${itemName}` :
                `אין במלאי: ${itemName}`;
            case "puzzleSolved":
              var puzzleName = condition.puzzleName || condition.puzzleId;
              return condition.operator === "solved" ?
                `חידה פתורה: ${puzzleName}` :
                `חידה לא פתורה: ${puzzleName}`;
            case "multipleConditions":
              return condition.operator === "and" ?
                "כל התנאים חייבים להתקיים (AND)" :
                "לפחות אחד מהתנאים צריך להתקיים (OR)";
            default:
              return `תנאי: ${condition.type}`;
          }
        }

        // פונקציה לשמירת התנאי הנוכחי
        function saveCurrentCondition() {
          var conditionType = document.getElementById("condition-type").value;
          if (!conditionType) {
            alert("אנא בחר סוג תנאי");
            return;
          }

          // בנה את אובייקט התנאי בהתאם לסוג
          var condition = { type: conditionType };

          // הוסף פרמטרים בהתאם לסוג התנאי
          switch (conditionType) {
            case "variable":
              var variableName = document.getElementById("condition-variable-name").value;
              var operator = document.getElementById("condition-variable-operator").value;
              var value = document.getElementById("condition-variable-value").value;
              var isNumber = document.getElementById("condition-variable-is-number").checked;

              if (!variableName) {
                alert("אנא הזן שם משתנה");
                return;
              }

              condition.name = variableName;
              condition.operator = operator;
              if (isNumber) {
                condition.value = parseFloat(value);
              } else {
                condition.value = value;
              }
              break;
            case "multipleConditions":
              var logicType = document.getElementById("condition-multiple-type").value;
              var subCondItems = document.querySelectorAll("#sub-conditions-list .sub-condition-item");
              var subConditions = [];

              subCondItems.forEach(item => {
                var subCond = JSON.parse(item.dataset.condition);
                subConditions.push(subCond);
              });

              if (subConditions.length < 2) {
                alert("תנאי מרובה דורש לפחות שני תנאי משנה");
                return;
              }

              condition.operator = logicType;
              condition.conditions = subConditions;
              break;
            // טיפול בשאר סוגי התנאים...
          }

          // טיפול בתנאים שונים לפי המיקום שלהם
          if (creatingCondition === "room") {
            // עדכן תנאי של חדר
            projectData.rooms[currentRoomId].requiredCondition = condition;
          } else if (creatingCondition === "item") {
            // עדכן תנאי של חפץ
            if (selectedItem && selectedItem.element) {
              var itemId = selectedItem.element.id;
              projectData.rooms[currentRoomId].items[itemId].condition = condition;
            }
          } else if (creatingCondition === "puzzle") {
            // עדכן תנאי של חידה
            if (selectedComponent) {
              projectData.puzzles[selectedComponent].requiredCondition = condition;
            }
          }

          // סגור את עורך התנאים
          var conditionEditor = document.getElementById("condition-editor-container");
          if (conditionEditor) {
            conditionEditor.style.display = "none";
          }

          // נקה משתנים
          creatingCondition = false;

          // רענן תצוגת החדר
          loadCurrentRoom();

          alert("התנאי נשמר בהצלחה!");
        }

        // פונקציה לאתחול קטגוריות המלאי
        function initInventoryCategories() {
          var categoriesContainer = document.getElementById("inventory-categories");
          if (!categoriesContainer) return;

          // נקה את המיכל
          categoriesContainer.innerHTML = "";

          // הוסף כל קטגוריה
          projectData.inventoryCategories.forEach(category => {
            var categoryItem = document.createElement("div");
            categoryItem.className = "inventory-category";
            categoryItem.dataset.categoryId = category.id;
            categoryItem.innerHTML = `
              <div class="category-name">${category.name}</div>
              <div class="category-controls">
                <button class="btn-small edit-category" data-category-id="${category.id}">ערוך</button>
                <button class="btn-small btn-danger delete-category" data-category-id="${category.id}">מחק</button>
              </div>
            `;
            categoriesContainer.appendChild(categoryItem);
          });

          // הוסף אירועים לכפתורי העריכה והמחיקה
          var editButtons = document.querySelectorAll(".edit-category");
          var deleteButtons = document.querySelectorAll(".delete-category");

          editButtons.forEach(btn => {
            btn.addEventListener("click", function() {
              var categoryId = this.dataset.categoryId;
              editInventoryCategory(categoryId);
            });
          });

          deleteButtons.forEach(btn => {
            btn.addEventListener("click", function() {
              var categoryId = this.dataset.categoryId;
              deleteInventoryCategory(categoryId);
            });
          });

          // הוסף כפתור להוספת קטגוריה חדשה
          var addCategoryBtn = document.createElement("button");
          addCategoryBtn.className = "btn";
          addCategoryBtn.textContent = "+ הוסף קטגוריה חדשה";
          addCategoryBtn.addEventListener("click", addNewInventoryCategory);
          categoriesContainer.appendChild(addCategoryBtn);
        }

        // פונקציה להוספת קטגוריית מלאי חדשה
        function addNewInventoryCategory() {
          var newCategoryName = prompt("הזן שם לקטגוריה החדשה:");
          if (!newCategoryName) return;

          // יצירת מזהה ייחודי
          var newCategoryId = "cat_" + new Date().getTime();

          // הוספת הקטגוריה לנתוני הפרויקט
          projectData.inventoryCategories.push({
            id: newCategoryId,
            name: newCategoryName
          });

          // עדכון תצוגת הקטגוריות
          initInventoryCategories();
        }

        // פונקציה לעריכת קטגוריית מלאי
        function editInventoryCategory(categoryId) {
          var category = projectData.inventoryCategories.find(cat => cat.id === categoryId);
          if (!category) return;

          var newName = prompt("ערוך את שם הקטגוריה:", category.name);
          if (!newName) return;

          // עדכון שם הקטגוריה
          category.name = newName;

          // עדכון תצוגת הקטגוריות
          initInventoryCategories();
        }

        // פונקציה למחיקת קטגוריית מלאי
        function deleteInventoryCategory(categoryId) {
          if (!confirm("האם אתה בטוח שברצונך למחוק קטגוריה זו? פעולה זו אינה ניתנת לביטול.")) {
            return;
          }

          // הסרת הקטגוריה מנתוני הפרויקט
          var categoryIndex = projectData.inventoryCategories.findIndex(cat => cat.id === categoryId);
          if (categoryIndex !== -1) {
            projectData.inventoryCategories.splice(categoryIndex, 1);
          }

          // עדכון תצוגת הקטגוריות
          initInventoryCategories();

          // הסרת הקטגוריה מכל החפצים שמשתמשים בה
          for (var roomId in projectData.rooms) {
            var room = projectData.rooms[roomId];
            for (var itemId in room.items) {
              var item = room.items[itemId];
              if (item.category === categoryId) {
                item.category = null;
              }
            }
          }
        }

        // פונקציה לבחירת אובייקט בחדר
        function selectItem(e) {
          e.preventDefault();

          // הסר בחירה קודמת
          var items = document.querySelectorAll(".room-item");
          for (var i = 0; i < items.length; i++) {
            items[i].classList.remove("selected");
            // הסר ידיות שינוי גודל אם קיימות
            var handles = items[i].querySelectorAll(".resize-handle");
            for (var j = 0; j < handles.length; j++) {
              handles[j].remove();
            }
          }

          // סמן את האובייקט בחזותית
          this.classList.add("selected");

          // שמור את האובייקט הנבחר
          selectedItem = {
            element: this,
            offsetX: e.clientX - this.getBoundingClientRect().left,
            offsetY: e.clientY - this.getBoundingClientRect().top,
            moving: true
          };

          // הוסף ידית שינוי גודל בפינה הימנית תחתונה
          var handleSE = document.createElement("div");
          handleSE.className = "resize-handle resize-handle-se";
          this.appendChild(handleSE);

          // הוסף מאזין אירוע נפרד לידית שינוי הגודל
          handleSE.addEventListener("mousedown", function(evt) {
            evt.stopPropagation();
            startResize(evt, selectedItem.element);
          });

          // התחל גרירה
          document.addEventListener("mousemove", moveItem);
          document.addEventListener("mouseup", stopMovingItem);

          // הצג את התכונות שלו
          showItemProperties(this.id);
        }

        // פונקציה להוספת סוגי חפצים מותאמים
        function initCustomItemTypes() {
          var itemTypesContainer = document.getElementById("item-types-list");
          if (!itemTypesContainer) return;

          // נקה את המיכל
          itemTypesContainer.innerHTML = "";

          // הוסף כל סוג חפץ
          for (var typeId in projectData.itemTypes) {
            var type = projectData.itemTypes[typeId];
            var typeItem = document.createElement("div");
            typeItem.className = "item-type";
            typeItem.dataset.typeId = typeId;

            // בנה רשימת תכונות
            var propertiesList = [];
            if (type.collectible) propertiesList.push("ניתן לאיסוף");
            if (type.combinable) propertiesList.push("ניתן לשילוב");
            if (type.usableOn && type.usableOn.length) propertiesList.push("ניתן לשימוש על: " + type.usableOn.join(", "));
            if (type.lockable) propertiesList.push("ניתן לנעילה");
            if (type.container) propertiesList.push("מכיל פריטים");
            if (type.interactive) propertiesList.push("אינטראקטיבי");
            if (type.canHavePuzzle) propertiesList.push("יכול להכיל חידה");
            if (type.canTriggerEvent) propertiesList.push("יכול להפעיל אירוע");
            if (type.readable) propertiesList.push("ניתן לקריאה");
            if (type.canHideItem) propertiesList.push("יכול להסתיר פריטים");
            if (type.isExit) propertiesList.push("יציאה");

            var propertiesStr = propertiesList.length ?
              `<div class="type-properties">${propertiesList.join(", ")}</div>` : "";

            typeItem.innerHTML = `
              <div class="type-name">${type.name}</div>
              ${propertiesStr}
              <div class="type-controls">
                <button class="btn-small edit-type" data-type-id="${typeId}">ערוך</button>
                <button class="btn-small btn-danger delete-type" data-type-id="${typeId}">מחק</button>
              </div>
            `;
            itemTypesContainer.appendChild(typeItem);
          }

          // הוסף אירועים לכפתורים
          var editButtons = itemTypesContainer.querySelectorAll(".edit-type");
          var deleteButtons = itemTypesContainer.querySelectorAll(".delete-type");

          editButtons.forEach(btn => {
            btn.addEventListener("click", function() {
              var typeId = this.dataset.typeId;
              editItemType(typeId);
            });
          });

          deleteButtons.forEach(btn => {
            btn.addEventListener("click", function() {
              var typeId = this.dataset.typeId;
              deleteItemType(typeId);
            });
          });

          // הוסף כפתור להוספת סוג חדש
          var addTypeBtn = document.createElement("button");
          addTypeBtn.className = "btn";
          addTypeBtn.textContent = "+ הוסף סוג חפץ חדש";
          addTypeBtn.addEventListener("click", addNewItemType);
          itemTypesContainer.appendChild(addTypeBtn);
        }

        // פונקציה להוספת סוג חפץ חדש
        function addNewItemType() {
          // פתח מודאל לעריכת סוג חפץ
          var modal = document.getElementById("item-type-modal");
          if (!modal) {
            // יצירת המודאל אם לא קיים
            modal = document.createElement("div");
            modal.id = "item-type-modal";
            modal.className = "modal";
            modal.innerHTML = `
              <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3 id="item-type-modal-title">הוסף סוג חפץ חדש</h3>
                <div class="form-group">
                  <label for="item-type-id">מזהה (באנגלית, ללא רווחים):</label>
                  <input type="text" id="item-type-id" placeholder="לדוגמה: key, book, document">
                </div>
                <div class="form-group">
                  <label for="item-type-name">שם:</label>
                  <input type="text" id="item-type-name" placeholder="שם בעברית">
                </div>
                <div class="form-group">
                  <label for="item-type-category">קטגוריה:</label>
                  <select id="item-type-category">
                    <option value="">ללא קטגוריה</option>
                    ${projectData.inventoryCategories.map(cat =>
                      `<option value="${cat.id}">${cat.name}</option>`
                    ).join('')}
                  </select>
                </div>
                <div class="form-group properties-group">
                  <div class="property-checkbox">
                    <input type="checkbox" id="item-type-collectible">
                    <label for="item-type-collectible">ניתן לאיסוף</label>
                  </div>
                  <div class="property-checkbox">
                    <input type="checkbox" id="item-type-combinable">
                    <label for="item-type-combinable">ניתן לשילוב</label>
                  </div>
                  <div class="property-checkbox">
                    <input type="checkbox" id="item-type-lockable">
                    <label for="item-type-lockable">ניתן לנעילה</label>
                  </div>
                  <div class="property-checkbox">
                    <input type="checkbox" id="item-type-container">
                    <label for="item-type-container">מכיל פריטים</label>
                  </div>
                  <div class="property-checkbox">
                    <input type="checkbox" id="item-type-interactive">
                    <label for="item-type-interactive">אינטראקטיבי</label>
                  </div>
                  <div class="property-checkbox">
                  <input type="checkbox" id="item-type-puzzle">
            <label for="item-type-puzzle">יכול להכיל חידה</label>
          </div>
          <div class="property-checkbox">
            <input type="checkbox" id="item-type-trigger">
            <label for="item-type-trigger">יכול להפעיל אירוע</label>
          </div>
          <div class="property-checkbox">
            <input type="checkbox" id="item-type-readable">
            <label for="item-type-readable">ניתן לקריאה</label>
          </div>
          <div class="property-checkbox">
            <input type="checkbox" id="item-type-hide">
            <label for="item-type-hide">יכול להסתיר פריטים</label>
          </div>
          <div class="property-checkbox">
            <input type="checkbox" id="item-type-exit">
            <label for="item-type-exit">יציאה</label>
          </div>
        </div>
        <div class="form-group" id="usable-on-container" style="display: none;">
          <label for="item-type-usable-on">ניתן לשימוש על (הפרדה בפסיקים):</label>
          <input type="text" id="item-type-usable-on" placeholder="door,safe,lock">
        </div>
        <button type="button" class="btn" id="save-item-type">שמור</button>
      </div>
    `;
    document.body.appendChild(modal);

    // אירוע לסגירת המודאל
    var closeBtn = modal.querySelector(".close-modal");
    if (closeBtn) {
      closeBtn.addEventListener("click", function() {
        modal.style.display = "none";
      });
    }

    // אירוע לשמירת סוג החפץ
    var saveBtn = document.getElementById("save-item-type");
    if (saveBtn) {
      saveBtn.addEventListener("click", saveItemType);
    }

    // הצג את שדה "ניתן לשימוש על" רק אם סומן "ניתן לשילוב"
    var combinableCheckbox = document.getElementById("item-type-combinable");
    if (combinableCheckbox) {
      combinableCheckbox.addEventListener("change", function() {
        var usableOnContainer = document.getElementById("usable-on-container");
        if (usableOnContainer) {
          usableOnContainer.style.display = this.checked ? "block" : "none";
        }
      });
    }
  }

  // פתח את המודאל במצב הוספה
  modal.style.display = "block";
  modal.querySelector("#item-type-modal-title").textContent = "הוסף סוג חפץ חדש";

  // אפס את הטופס
  document.getElementById("item-type-id").value = "";
  document.getElementById("item-type-id").disabled = false;
  document.getElementById("item-type-name").value = "";
  document.getElementById("item-type-category").value = "";
  document.getElementById("item-type-collectible").checked = false;
  document.getElementById("item-type-combinable").checked = false;
  document.getElementById("item-type-lockable").checked = false;
  document.getElementById("item-type-container").checked = false;
  document.getElementById("item-type-interactive").checked = false;
  document.getElementById("item-type-puzzle").checked = false;
  document.getElementById("item-type-trigger").checked = false;
  document.getElementById("item-type-readable").checked = false;
  document.getElementById("item-type-hide").checked = false;
  document.getElementById("item-type-exit").checked = false;
  document.getElementById("item-type-usable-on").value = "";
  document.getElementById("usable-on-container").style.display = "none";

  // הגדר את מצב העריכה הנוכחי
  modal.dataset.mode = "add";
  modal.dataset.editingType = "";
}

// פונקציה לשמירת סוג חפץ
function saveItemType() {
  var modal = document.getElementById("item-type-modal");
  if (!modal) return;

  var mode = modal.dataset.mode;
  var typeId = document.getElementById("item-type-id").value.trim();

  // בדיקת תקינות במצב הוספה
  if (mode === "add") {
    if (!typeId) {
      alert("חובה להזין מזהה לסוג החפץ");
      return;
    }

    if (projectData.itemTypes[typeId]) {
      alert("מזהה זה כבר קיים. אנא בחר מזהה אחר.");
      return;
    }
  } else {
    // במצב עריכה, השתמש במזהה המקורי
    typeId = modal.dataset.editingType;
  }

  var typeName = document.getElementById("item-type-name").value.trim();
  if (!typeName) {
    alert("חובה להזין שם לסוג החפץ");
    return;
  }

  // בנה את אובייקט סוג החפץ
  var itemType = {
    name: typeName,
    category: document.getElementById("item-type-category").value,
    collectible: document.getElementById("item-type-collectible").checked,
    combinable: document.getElementById("item-type-combinable").checked,
    lockable: document.getElementById("item-type-lockable").checked,
    container: document.getElementById("item-type-container").checked,
    interactive: document.getElementById("item-type-interactive").checked,
    canHavePuzzle: document.getElementById("item-type-puzzle").checked,
    canTriggerEvent: document.getElementById("item-type-trigger").checked,
    readable: document.getElementById("item-type-readable").checked,
    canHideItem: document.getElementById("item-type-hide").checked,
    isExit: document.getElementById("item-type-exit").checked
  };

  // הוסף רשימת סוגים לשימוש אם רלוונטי
  if (itemType.combinable) {
    var usableOnStr = document.getElementById("item-type-usable-on").value.trim();
    if (usableOnStr) {
      itemType.usableOn = usableOnStr.split(',').map(type => type.trim());
    }
  }

  // שמור את סוג החפץ
  projectData.itemTypes[typeId] = itemType;

  // סגור את המודאל
  modal.style.display = "none";

  // עדכן את תצוגת סוגי החפצים
  initCustomItemTypes();

  // עדכן את גלריית החפצים
  updateObjectGallery();
}

// פונקציה לעריכת סוג חפץ קיים
function editItemType(typeId) {
  var type = projectData.itemTypes[typeId];
  if (!type) return;

  // פתח את מודאל העריכה
  var modal = document.getElementById("item-type-modal");
  if (!modal) {
    addNewItemType(); // יצור את המודאל אם לא קיים
    modal = document.getElementById("item-type-modal");
  }

  // כותרת המודאל
  modal.querySelector("#item-type-modal-title").textContent = "ערוך סוג חפץ";

  // מילוי הטופס בנתונים קיימים
  document.getElementById("item-type-id").value = typeId;
  document.getElementById("item-type-id").disabled = true; // לא ניתן לשנות מזהה
  document.getElementById("item-type-name").value = type.name || "";
  document.getElementById("item-type-category").value = type.category || "";
  document.getElementById("item-type-collectible").checked = type.collectible || false;
  document.getElementById("item-type-combinable").checked = type.combinable || false;
  document.getElementById("item-type-lockable").checked = type.lockable || false;
  document.getElementById("item-type-container").checked = type.container || false;
  document.getElementById("item-type-interactive").checked = type.interactive || false;
  document.getElementById("item-type-puzzle").checked = type.canHavePuzzle || false;
  document.getElementById("item-type-trigger").checked = type.canTriggerEvent || false;
  document.getElementById("item-type-readable").checked = type.readable || false;
  document.getElementById("item-type-hide").checked = type.canHideItem || false;
  document.getElementById("item-type-exit").checked = type.isExit || false;

  // הצג את שדה "ניתן לשימוש על" אם רלוונטי
  var usableOnContainer = document.getElementById("usable-on-container");
  if (type.combinable) {
    usableOnContainer.style.display = "block";
    document.getElementById("item-type-usable-on").value = type.usableOn ? type.usableOn.join(',') : "";
  } else {
    usableOnContainer.style.display = "none";
  }

  // הגדר את מצב העריכה הנוכחי
  modal.dataset.mode = "edit";
  modal.dataset.editingType = typeId;

  // פתח את המודאל
  modal.style.display = "block";
}

// פונקציה למחיקת סוג חפץ
function deleteItemType(typeId) {
  if (!confirm(`האם אתה בטוח שברצונך למחוק את סוג החפץ "${projectData.itemTypes[typeId].name}"? פעולה זו אינה ניתנת לביטול.`)) {
    return;
  }

  // בדוק אם יש חפצים מסוג זה בשימוש
  var inUse = false;
  for (var roomId in projectData.rooms) {
    var room = projectData.rooms[roomId];
    for (var itemId in room.items) {
      if (room.items[itemId].type === typeId) {
        inUse = true;
        break;
      }
    }
    if (inUse) break;
  }

  if (inUse) {
    var proceed = confirm("סוג חפץ זה נמצא בשימוש בחפצים קיימים. מחיקתו עלולה לגרום לבעיות. האם להמשיך?");
    if (!proceed) return;
  }

  // מחק את סוג החפץ
  delete projectData.itemTypes[typeId];

  // עדכן את תצוגת סוגי החפצים
  initCustomItemTypes();

  // עדכן את גלריית החפצים
  updateObjectGallery();
}

// פונקציה לעדכון גלריית האובייקטים
function updateObjectGallery() {
  var gallery = document.getElementById("object-gallery");
  if (!gallery) return;

  // נקה את הגלריה
  gallery.innerHTML = "";

  // הוסף את כל סוגי החפצים לגלריה
  for (var typeId in projectData.itemTypes) {
    var type = projectData.itemTypes[typeId];

    var thumbnail = document.createElement("div");
    thumbnail.className = "object-thumbnail";
    thumbnail.setAttribute("data-type", typeId);
    thumbnail.textContent = type.name;

    thumbnail.addEventListener("click", function() {
      addNewItem(this.getAttribute("data-type"));
    });

    gallery.appendChild(thumbnail);
  }
}

// פונקציה להוספת אובייקט חדש
function addNewItem(type) {
  console.log("מוסיף אובייקט חדש מסוג:", type);

  // צור מזהה ייחודי
  var newItemId = "item_" + new Date().getTime();

  // קבל את הגדרות סוג החפץ
  var typeSettings = projectData.itemTypes[type] || {};

  // הגדר מידות ברירת מחדל לפי הסוג
  var width = 50, height = 50;
  var name = typeSettings.name || type;

  // התאם את המידות לפי הסוג
  if (type === "door") {
    width = 100;
    height = 200;
  } else if (type === "safe" || type === "container") {
    width = 80;
    height = 80;
  } else if (type === "key") {
    width = 40;
    height = 30;
  }

  // הוסף את האובייקט לנתוני הפרויקט עם המאפיינים המתאימים
  var newItem = {
    id: newItemId,
    name: name,
    type: type,
    x: 200,
    y: 200,
    width: width,
    height: height,
    image: null,
    locked: typeSettings.lockable ? true : false,
    hidden: false
  };

  // הוסף תכונות נוספות בהתאם לסוג
  if (typeSettings.container) {
    newItem.containsItems = [];
  }

  if (typeSettings.interactive && typeSettings.canHavePuzzle) {
    newItem.puzzle = null;
  }

  // הוסף את האובייקט לנתוני החדר
  projectData.rooms[currentRoomId].items[newItemId] = newItem;

  // טען מחדש את החדר
  loadCurrentRoom();

  console.log("אובייקט חדש נוסף בהצלחה:", newItemId);
}

// פונקציה לשמירת הפרויקט
function saveProject() {
  try {
    // עדכן את נתוני הייצוא מהטופס
    var gameTitleInput = document.getElementById("game-title");
    var gameDescriptionInput = document.getElementById("game-description");
    var gameTimeLimitInput = document.getElementById("game-time-limit");
    var gameIntroInput = document.getElementById("game-intro-text");
    var gameEndingInput = document.getElementById("game-ending-text");

    if (gameTitleInput) projectData.settings.title = gameTitleInput.value;
    if (gameDescriptionInput) projectData.settings.description = gameDescriptionInput.value;
    if (gameTimeLimitInput) projectData.settings.timeLimit = parseInt(gameTimeLimitInput.value);
    if (gameIntroInput) projectData.settings.storyTexts.intro = gameIntroInput.value;
    if (gameEndingInput) projectData.settings.storyTexts.ending = gameEndingInput.value;

    // המר את הנתונים למחרוזת JSON
    var projectString = JSON.stringify(projectData, null, 2);

    // שמור בזיכרון המקומי
    localStorage.setItem("escape-room-project", projectString);

    // אפשר גם להוריד כקובץ
    var projectBlob = new Blob([projectString], { type: "application/json" });
    var downloadLink = document.createElement("a");
    downloadLink.download = "escape-room-project.json";
    downloadLink.href = URL.createObjectURL(projectBlob);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    alert("הפרויקט נשמר בהצלחה!");
  } catch (error) {
    console.error("שגיאה בשמירת הפרויקט:", error);
    alert("שגיאה בשמירת הפרויקט: " + error);
  }
}

// פונקציה לטעינת פרויקט
function loadProject() {
  // אפשר טעינה מקובץ
  var fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";

  fileInput.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var loadedData = JSON.parse(e.target.result);

        // בדיקת תקינות בסיסית
        if (!loadedData.rooms) {
          throw new Error("קובץ הפרויקט אינו תקין - חסר שדה 'rooms'");
        }

        // החלף את הנתונים
        projectData = loadedData;

        // ודא שיש את כל השדות הנדרשים במודל הנתונים המורחב
        ensureDataStructure();

        // עדכן את החדר הנוכחי
        currentRoomId = Object.keys(projectData.rooms)[0];

        // עדכן את הממשק
        refreshUI();

        alert("הפרויקט נטען בהצלחה!");
      } catch (error) {
        console.error("שגיאה בטעינת הפרויקט:", error);
        alert("שגיאה בטעינת הפרויקט: " + error);
      }
    };

    reader.readAsText(file);
  };

  fileInput.click();
}

// פונקציה לוידוא שכל שדות המודל המורחב קיימים
function ensureDataStructure() {
  // ודא שיש שדות חובה
  if (!projectData.puzzles) projectData.puzzles = {};
  if (!projectData.connections) projectData.connections = [];
  if (!projectData.scripts) projectData.scripts = {};
  if (!projectData.variables) projectData.variables = {};
  if (!projectData.timedEvents) projectData.timedEvents = [];

  // ודא שיש הגדרות
  if (!projectData.settings) {
    projectData.settings = {
      title: "חדר הבריחה שלי",
      description: "תיאור חדר הבריחה",
      timeLimit: 60,
      storyTexts: {
        intro: "ברוכים הבאים לחדר הבריחה!",
        ending: "כל הכבוד! הצלחת לברוח."
      },
      maxInventorySize: 8
    };
  } else {
    if (!projectData.settings.storyTexts) {
      projectData.settings.storyTexts = {
        intro: "ברוכים הבאים לחדר הבריחה!",
        ending: "כל הכבוד! הצלחת לברוח."
      };
    }
    if (!projectData.settings.maxInventorySize) {
      projectData.settings.maxInventorySize = 8;
    }
  }

  // ודא שיש קטגוריות מלאי
  if (!projectData.inventoryCategories) {
    projectData.inventoryCategories = [
      { id: "keys", name: "מפתחות" },
      { id: "tools", name: "כלים" },
      { id: "documents", name: "מסמכים" }
    ];
  }

  // ודא שיש סוגי חפצים
  if (!projectData.itemTypes) {
    projectData.itemTypes = {
      key: {
        name: "מפתח",
        category: "keys",
        collectible: true,
        combinable: true,
        usableOn: ["door", "chest", "safe"]
      },
      document: {
        name: "מסמך",
        category: "documents",
        collectible: true,
        readable: true
      },
      // הוסף סוגי חפצים נוספים...
      door: {
        name: "דלת",
        isExit: true,
        lockable: true,
        connectsTo: null
      },
      safe: {
        name: "כספת",
        lockable: true,
        container: true
      }
    };
  }

  // ודא שלכל חדר יש את כל השדות הנדרשים
  for (var roomId in projectData.rooms) {
    var room = projectData.rooms[roomId];
    if (!room.description) room.description = "";
    if (!room.onEnter) room.onEnter = [];
    if (!room.onExit) room.onExit = [];
    if (!room.items) room.items = {};

    // ודא שלכל פריט יש את כל השדות הנדרשים
    for (var itemId in room.items) {
      var item = room.items[itemId];
      if (!item.id) item.id = itemId;
      if (!item.name) item.name = "פריט ללא שם";
      if (!item.width) item.width = 50;
      if (!item.height) item.height = 50;
    }
  }
}

// פונקציה לריענון כל הממשק לאחר טעינת פרויקט
function refreshUI() {
  console.log("מרענן ממשק...");

  // עדכן את רשימת החדרים
  var roomsList = document.getElementById("rooms-list");
  if (roomsList) {
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
  }

  // עדכן את רשימת החידות
  var puzzleList = document.getElementById("puzzle-list");
  if (puzzleList) {
    puzzleList.innerHTML = "";

    for (var puzzleId in projectData.puzzles) {
      var puzzle = projectData.puzzles[puzzleId];
      var puzzleItem = document.createElement("div");
      puzzleItem.className = "puzzle-list-item";
      puzzleItem.setAttribute("data-puzzle-id", puzzleId);
      puzzleItem.textContent = puzzle.name;

      // הוסף סימון אם יש לחידה תנאים מקדימים
      if (puzzle.requiredCondition) {
        var conditionBadge = document.createElement("span");
        conditionBadge.className = "condition-badge";
        conditionBadge.title = "יש תנאים מקדימים לחידה זו";
        puzzleItem.appendChild(conditionBadge);
      }

      puzzleItem.addEventListener("click", function() {
        var puzzleId = this.getAttribute("data-puzzle-id");
        showPuzzleForm(puzzleId);
      });

      puzzleList.appendChild(puzzleItem);
    }
  }

  // עדכן את נתוני הייצוא
  var gameTitleInput = document.getElementById("game-title");
  var gameDescriptionInput = document.getElementById("game-description");
  var gameTimeLimitInput = document.getElementById("game-time-limit");
  var gameIntroInput = document.getElementById("game-intro-text");
  var gameEndingInput = document.getElementById("game-ending-text");

  if (gameTitleInput) gameTitleInput.value = projectData.settings.title;
  if (gameDescriptionInput) gameDescriptionInput.value = projectData.settings.description;
  if (gameTimeLimitInput) gameTimeLimitInput.value = projectData.settings.timeLimit;
  if (gameIntroInput) gameIntroInput.value = projectData.settings.storyTexts.intro;
  if (gameEndingInput) gameEndingInput.value = projectData.settings.storyTexts.ending;

  // אתחל את קטגוריות המלאי
  initInventoryCategories();

  // אתחל את סוגי החפצים המותאמים
  initCustomItemTypes();

  // עדכן את גלריית החפצים
  updateObjectGallery();

  // עדכן את החדר הנוכחי
  loadCurrentRoom();

  // עדכן את המפה
  initMapInterface();

  console.log("ממשק רוענן בהצלחה");
}

// פונקציה ליצירת פרויקט חדש
function newProject() {
  if (confirm("האם אתה בטוח שברצונך ליצור פרויקט חדש? כל הנתונים הנוכחיים יימחקו.")) {
    // אפס את נתוני הפרויקט
    projectData = {
      name: "חדר הבריחה שלי",
      rooms: {
        room1: {
          id: "room1",
          name: "חדר 1: מעבדה",
          background: "lab",
          backgroundImage: null,
          description: "מעבדה מסתורית עם מכשירים מדעיים וחפצים מעניינים.",
          items: {},
          onEnter: [],
          onExit: [],
          initiallyLocked: false,
          requiredCondition: null
        }
      },
      puzzles: {},
      connections: [],
      scripts: {},
      variables: {},
      timedEvents: [],
      settings: {
        title: "חדר הבריחה שלי - המעבדה המסתורית",
        description: "ברוכים הבאים לחדר הבריחה המקוון! מצאת את עצמך נעול במעבדה מסתורית. עליך לפתור את החידות ולמצוא את הדרך החוצה.",
        timeLimit: 60,
        storyTexts: {
          intro: "התעוררת בחדר לא מוכר. הדלת נעולה ואתה צריך למצוא דרך החוצה.",
          ending: "הצלחת למצוא את הדרך החוצה! כל הכבוד!"
        },
        maxInventorySize: 8
      },
      inventoryCategories: [
        { id: "keys", name: "מפתחות" },
        { id: "tools", name: "כלים" },
        { id: "documents", name: "מסמכים" }
      ],
      itemTypes: {
        key: {
          name: "מפתח",
          category: "keys",
          collectible: true,
          combinable: true,
          usableOn: ["door", "chest", "safe"]
        },
        document: {
          name: "מסמך",
          category: "documents",
          collectible: true,
          readable: true
        },
        tool: {
          name: "כלי",
          category: "tools",
          collectible: true,
          combinable: true,
          usableOn: ["mechanism", "lock", "device"]
        },
        door: {
          name: "דלת",
          isExit: true,
          lockable: true,
          connectsTo: null
        },
        safe: {
          name: "כספת",
          lockable: true,
          container: true
        },
        computer: {
          name: "מחשב",
          interactive: true,
          canHavePuzzle: true
        }
      }
    };

    // אפס את החדר הנוכחי
    currentRoomId = "room1";

    // רענן את הממשק
    refreshUI();

    alert("פרויקט חדש נוצר בהצלחה!");
  }
}

// אירוע טעינת המסמך - נקודת הכניסה הראשית
document.addEventListener("DOMContentLoaded", function() {
  console.log("המסמך נטען, מאתחל את המחולל המשופר...");

  // טיפול בשגיאות גלובלי
  window.onerror = function(message, source, lineno, colno, error) {
    console.error("שגיאה התרחשה:", message);
    console.error("פרטי השגיאה:", error);
    return true; // מונע מהדפדפן להציג את השגיאה
  };

  // בדיקת אלמנטים קריטיים
  var criticalElements = [
    "room-preview", "rooms-list", "object-gallery"
  ];

  var missingElements = [];
  criticalElements.forEach(function(id) {
    if (!document.getElementById(id)) {
      missingElements.push(id);
    }
  });

  if (missingElements.length > 0) {
    console.error("האלמנטים הבאים חסרים בדף:", missingElements.join(", "));
    alert("חסרים אלמנטים חיוניים בדף: " + missingElements.join(", "));
    return;
  }

  // בדוק אם יש פרויקט שמור
  var savedProject = localStorage.getItem("escape-room-project");
  if (savedProject) {
    try {
      var shouldLoad = confirm("נמצא פרויקט שמור. האם לטעון אותו?");
      if (shouldLoad) {
        projectData = JSON.parse(savedProject);

        // ודא שיש את כל השדות הנדרשים במודל הנתונים המורחב
        ensureDataStructure();

        // עדכן את החדר הנוכחי
        currentRoomId = Object.keys(projectData.rooms)[0];
      }
    } catch (error) {
      console.error("שגיאה בטעינת הפרויקט השמור:", error);
    }
  }

  // אתחול המחולל
  initGenerator();
});
