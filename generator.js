// מידע אודות הפרויקט
var projectData = {
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
    title: "חדר הבריחה שלי - המעבדה המסתורית",
    description: "ברוכים הבאים לחדר הבריחה המקוון! מצאת את עצמך נעול במעבדה מסתורית. עליך לפתור את החידות ולמצוא את הדרך החוצה תוך 60 דקות.",
    timeLimit: 60
  }
};

// חדר נוכחי שמוצג
var currentRoomId = "room1";

// אובייקט נבחר
var selectedItem = null;

// פרטי הפריט הנבחר לעריכת תוכניות
var selectedProgram = null;

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
  console.log("מאתחל את המחולל...");
  
  try {
    // קישור מאזיני אירועים
    setupEventListeners();
    console.log("מאזיני אירועים הוגדרו בהצלחה");
    
    // יצירת טפסי חידות
    createPuzzleForms();
    console.log("טפסי חידות נוצרו בהצלחה");
    
    // אתחול ממשק המפה
    initMapInterface();
    console.log("ממשק המפה אותחל בהצלחה");
    
    // טעינת החדר הראשון - חייב להיות אחרון כי הוא מסתמך על כל הקודמים
    loadCurrentRoom();
    console.log("החדר הראשון נטען בהצלחה");
    
    console.log("המחולל אותחל בהצלחה!");
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
  }
  
  // עדכן את שם החדר
  var roomNameElement = document.getElementById("room-name");
  if (roomNameElement) {
    roomNameElement.value = room.name;
  }
  
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
  var nextRoomSelect = document.getElementById("next-room");
  if (!nextRoomSelect) {
    console.log("אלמנט next-room לא נמצא, דילוג על עדכון יעדים");
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

// פונקציה לבחירת אובייקט
function selectItem(e) {
  e.preventDefault(); // מנע ברירת מחדל של האירוע
  
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
    evt.stopPropagation(); // חשוב - מונע מאירוע ה-mousedown להתפשט לאובייקט ההורה
    startResize(evt, selectedItem.element);
  });
  
  // התחל גרירה
  document.addEventListener("mousemove", moveItem);
  document.addEventListener("mouseup", stopMovingItem);
  
  // הצג את התכונות שלו
  showItemProperties(this.id);
}

// פונקציה להזזת אובייקט
function moveItem(e) {
  if (selectedItem && selectedItem.moving) {
    var roomPreview = document.getElementById("room-preview");
    var roomRect = roomPreview.getBoundingClientRect();
    
    var newX = e.clientX - roomRect.left - selectedItem.offsetX;
    var newY = e.clientY - roomRect.top - selectedItem.offsetY;
    
    // וודא שהאובייקט נשאר בגבולות החדר
    var width = parseInt(selectedItem.element.style.width);
    var height = parseInt(selectedItem.element.style.height);
    
    newX = Math.max(0, Math.min(newX, roomRect.width - width));
    newY = Math.max(0, Math.min(newY, roomRect.height - height));
    
    // עדכן את המיקום
    selectedItem.element.style.left = newX + "px";
    selectedItem.element.style.top = newY + "px";
    
    // עדכן את מידע האובייקט בפרויקט
    var itemId = selectedItem.element.id;
    projectData.rooms[currentRoomId].items[itemId].x = newX;
    projectData.rooms[currentRoomId].items[itemId].y = newY;
  }
}

// פונקציה לעצירת הזזת אובייקט
function stopMovingItem() {
  if (selectedItem) {
    selectedItem.moving = false;
  }
  
  // הסר את מאזיני האירועים
  document.removeEventListener("mousemove", moveItem);
  document.removeEventListener("mouseup", stopMovingItem);
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
    var widthElement = document.getElementById("object-width");
    var heightElement = document.getElementById("object-height");
    
    if (widthElement) widthElement.value = newWidth;
    if (heightElement) heightElement.value = newHeight;
    
    // עדכן את נתוני האובייקט
    projectData.rooms[currentRoomId].items[itemId].width = newWidth;
    projectData.rooms[currentRoomId].items[itemId].height = newHeight;
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
  var noObjectSelectedElement = document.getElementById("no-object-selected");
  var objectPropertiesElement = document.getElementById("object-properties");
  
  if (!noObjectSelectedElement || !objectPropertiesElement) {
    console.error("אלמנטי פאנל תכונות חסרים");
    return;
  }
  
  noObjectSelectedElement.style.display = "none";
  objectPropertiesElement.style.display = "block";
  
  // מלא את הערכים בטופס הכללי
  var nameElement = document.getElementById("object-name");
  var widthElement = document.getElementById("object-width");
  var heightElement = document.getElementById("object-height");
  
  if (nameElement) nameElement.value = item.name;
  if (widthElement) widthElement.value = item.width;
  if (heightElement) heightElement.value = item.height;
  
  // הסתר את כל התכונות הספציפיות
  var propertyPanels = [
    "safe-properties", "key-properties", "book-properties", 
    "computer-properties", "info-properties", "door-properties"
  ];
  
  propertyPanels.forEach(function(panelId) {
    var panel = document.getElementById(panelId);
    if (panel) panel.style.display = "none";
  });
  
  // הצג את התכונות המתאימות לסוג האובייקט
  var propertyPanel = null;
  
  switch (item.type) {
    case 'safe':
      propertyPanel = document.getElementById("safe-properties");
      if (propertyPanel) {
        propertyPanel.style.display = "block";
        
        // מלא את הערכים בטופס הכספת
        var puzzleElement = document.getElementById("object-puzzle");
        var lockedElement = document.getElementById("object-locked");
        var requiredItemElement = document.getElementById("object-required-item");
        var codeElement = document.getElementById("object-code");
        var contentElement = document.getElementById("object-content");
        
        if (puzzleElement) puzzleElement.value = item.puzzle || "";
        if (lockedElement) lockedElement.checked = item.locked || false;
        if (requiredItemElement) requiredItemElement.value = item.requiredItem || "";
        if (codeElement) codeElement.value = item.correctCode || "";
        if (contentElement) contentElement.value = item.content || "";
      }
      break;
      
    case 'key':
      propertyPanel = document.getElementById("key-properties");
      if (propertyPanel) {
        propertyPanel.style.display = "block";
        
        // מלא את הערכים בטופס המפתח
        var keyTypeElement = document.getElementById("key-type");
        var oneTimeUseElement = document.getElementById("one-time-use");
        var keyHintElement = document.getElementById("key-hint");
        
        if (keyTypeElement) keyTypeElement.value = item.keyType || "regular";
        if (oneTimeUseElement) oneTimeUseElement.checked = item.oneTimeUse || false;
        if (keyHintElement) keyHintElement.value = item.hint || "";
      }
      break;
      
    case 'book':
      propertyPanel = document.getElementById("book-properties");
      if (propertyPanel) {
        propertyPanel.style.display = "block";
        
        // מלא את הערכים בטופס הספר
        var bookContentElement = document.getElementById("book-content");
        var bookStyleElement = document.getElementById("book-style");
        var bookHiddenHintElement = document.getElementById("book-hidden-hint");
        var bookRequiresItemElement = document.getElementById("book-requires-item");
        var bookPagesElement = document.getElementById("book-pages");
        
        if (bookContentElement) bookContentElement.value = item.content || "";
        if (bookStyleElement) bookStyleElement.value = item.style || "regular";
        if (bookHiddenHintElement) bookHiddenHintElement.value = item.hiddenHint || "";
        if (bookRequiresItemElement) bookRequiresItemElement.value = item.requiresItem || "";
        if (bookPagesElement) bookPagesElement.value = item.pages ? Object.keys(item.pages).length : 1;
      }
      break;
      
    case 'computer':
      propertyPanel = document.getElementById("computer-properties");
      if (propertyPanel) {
        propertyPanel.style.display = "block";
        
        // מלא את הערכים בטופס המחשב
        var computerPuzzleElement = document.getElementById("computer-puzzle");
        var computerLockedElement = document.getElementById("computer-locked");
        var computerPasswordElement = document.getElementById("computer-password");
        var computerOffTextElement = document.getElementById("computer-off-text");
        var computerOnTextElement = document.getElementById("computer-on-text");
        
        if (computerPuzzleElement) computerPuzzleElement.value = item.puzzle || "";
        if (computerLockedElement) computerLockedElement.checked = item.locked || false;
        if (computerPasswordElement) computerPasswordElement.value = item.password || "";
        if (computerOffTextElement) computerOffTextElement.value = item.offScreenText || "";
        if (computerOnTextElement) computerOnTextElement.value = item.onScreenText || "";
      }
      break;
      
    case 'info':
      propertyPanel = document.getElementById("info-properties");
      if (propertyPanel) {
        propertyPanel.style.display = "block";
        
        // מלא את הערכים בטופס הערת המידע
        var infoTextElement = document.getElementById("info-text");
        var displayStyleElement = document.getElementById("display-style");
        var autoShowElement = document.getElementById("auto-show");
        var showOnceElement = document.getElementById("show-once");
        var fontSizeElement = document.getElementById("font-size");
        var textColorElement = document.getElementById("text-color");
        
        if (infoTextElement) infoTextElement.value = item.infoText || "";
        if (displayStyleElement) displayStyleElement.value = item.displayStyle || "popup";
        if (autoShowElement) autoShowElement.checked = item.autoShow || false;
        if (showOnceElement) showOnceElement.checked = item.showOnce || false;
        if (fontSizeElement) fontSizeElement.value = item.fontSize || "medium";
        if (textColorElement) textColorElement.value = item.textColor || "#000000";
      }
      break;
      
    case 'door':
      propertyPanel = document.getElementById("door-properties");
      if (propertyPanel) {
        propertyPanel.style.display = "block";
        
        // מלא את הערכים בטופס הדלת
        var nextRoomElement = document.getElementById("next-room");
        var doorLockedElement = document.getElementById("door-locked");
        var doorRequiredItemElement = document.getElementById("door-required-item");
        var doorRequiredPuzzleElement = document.getElementById("door-required-puzzle");
        var doorMessageElement = document.getElementById("door-message");
        
        if (nextRoomElement) nextRoomElement.value = item.nextRoom || "";
        if (doorLockedElement) doorLockedElement.checked = item.locked || false;
        if (doorRequiredItemElement) doorRequiredItemElement.value = item.requiredItem || "";
        if (doorRequiredPuzzleElement) doorRequiredPuzzleElement.value = item.requiredPuzzle || "";
        if (doorMessageElement) doorMessageElement.value = item.message || "";
      }
      break;
  }
  
  // איפוס שדה העלאת התמונה
  var objectImageElement = document.getElementById("object-image");
  if (objectImageElement) objectImageElement.value = "";
}

// פונקציה להוספת אובייקט חדש
function addNewItem(type) {
  console.log("מוסיף אובייקט חדש מסוג:", type);
  
  // צור מזהה ייחודי
  var itemCount = Object.keys(projectData.rooms[currentRoomId].items).length;
  var newItemId = "item" + (new Date().getTime());
  
  // הגדר מידות ברירת מחדל לפי הסוג
  var width = 50, height = 50;
  var name = "";
  
  switch (type) {
    case "safe":
      width = 60;
      height = 60;
      name = "כספת";
      break;
    case "key":
      width = 40;
      height = 40;
      name = "מפתח";
      break;
    case "book":
      width = 50;
      height = 40;
      name = "ספר";
      break;
    case "computer":
      width = 50;
      height = 50;
      name = "מחשב";
      break;
    case "info":
      width = 80;
      height = 40;
      name = "הערת מידע";
      break;
    case "door":
      width = 60;
      height = 80;
      name = "דלת";
      break;
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
    image: null
  };
  
  // הוסף מאפיינים ספציפיים לפי סוג האובייקט
  switch (type) {
    case "safe":
      newItem.puzzle = "";
      newItem.locked = false;
      newItem.requiredItem = null;
      newItem.correctCode = "";
      newItem.content = "";
      newItem.openedImage = null;
      break;
      
    case "key":
      newItem.keyType = "regular";
      newItem.oneTimeUse = false;
      newItem.hint = "";
      newItem.collectSound = null;
      break;
      
    case "book":
      newItem.content = "תוכן הספר";
      newItem.style = "regular";
      newItem.hiddenHint = "";
      newItem.requiresItem = null;
      newItem.pages = {
        "1": "עמוד ראשון של הספר"
      };
      break;
      
    case "computer":
      newItem.puzzle = "";
      newItem.locked = false;
      newItem.password = "";
      newItem.offScreenText = "המחשב כבוי";
      newItem.onScreenText = "ברוך הבא למערכת";
      newItem.programs = {};
      break;
      
    case "info":
      newItem.infoText = "הערת מידע";
      newItem.displayStyle = "popup";
      newItem.autoShow = false;
      newItem.showOnce = false;
      newItem.fontSize = "medium";
      newItem.textColor = "#000000";
      break;
      
    case "door":
      newItem.nextRoom = "";
      newItem.locked = false;
      newItem.requiredItem = null;
      newItem.requiredPuzzle = null;
      newItem.message = "עובר לחדר הבא...";
      break;
  }
  
  // הוסף את האובייקט לנתוני החדר
  projectData.rooms[currentRoomId].items[newItemId] = newItem;
  
  // טען מחדש את החדר
  loadCurrentRoom();
  
  console.log("אובייקט חדש נוסף בהצלחה:", newItemId);
}

// פונקציה למחיקת אובייקט נבחר
function deleteSelectedItem() {
  if (selectedItem) {
    var itemId = selectedItem.element.id;
    delete projectData.rooms[currentRoomId].items[itemId];
    
    // טען מחדש את החדר
    loadCurrentRoom();
    
    // הסתר את תכונות האובייקט
    var objectPropertiesElement = document.getElementById("object-properties");
    var noObjectSelectedElement = document.getElementById("no-object-selected");
    
    if (objectPropertiesElement) objectPropertiesElement.style.display = "none";
    if (noObjectSelectedElement) noObjectSelectedElement.style.display = "block";
    
    selectedItem = null;
  }
}

// פונקציה ליצירת טפסי חידות (חייבת להופיע לפני setupPuzzleFormEvents)
function createPuzzleForms() {
  var formsContainer = document.getElementById("puzzle-forms-container");
  if (!formsContainer) {
    console.error("מיכל טפסי החידות לא נמצא");
    return;
  }
  
  // יצירת טופס לחידת קוד
  var codeForm = document.createElement("div");
  codeForm.id = "code-puzzle-form";
  codeForm.className = "puzzle-form";
  codeForm.style.display = "none";
  codeForm.innerHTML = `
    <h4>עריכת חידת קוד</h4>
    <div class="form-group">
      <label for="code-puzzle-name">שם החידה:</label>
      <input type="text" id="code-puzzle-name">
    </div>
    <div class="form-group">
      <label for="code-puzzle-description">תיאור החידה:</label>
      <textarea id="code-puzzle-description" rows="3"></textarea>
    </div>
    <div class="form-group">
      <label for="code-puzzle-answer">הקוד הנכון:</label>
      <input type="text" id="code-puzzle-answer">
    </div>
    <div class="form-group">
      <label for="code-puzzle-hint">רמז:</label>
      <input type="text" id="code-puzzle-hint">
    </div>
    <div class="form-group">
      <label for="code-puzzle-success">הודעת הצלחה:</label>
      <input type="text" id="code-puzzle-success">
    </div>
    <button class="btn" id="save-code-puzzle">שמור</button>
    <button class="btn btn-danger" id="delete-code-puzzle" style="float: left;">מחק חידה</button>
  `;
  
  // יצירת טופס לחידת טקסט
  var textForm = document.createElement("div");
  textForm.id = "text-puzzle-form";
  textForm.className = "puzzle-form";
  textForm.style.display = "none";
  textForm.innerHTML = `
    <h4>עריכת חידת טקסט</h4>
    <div class="form-group">
      <label for="text-puzzle-name">שם החידה:</label>
      <input type="text" id="text-puzzle-name">
    </div>
    <div class="form-group">
      <label for="text-puzzle-question">שאלה:</label>
      <textarea id="text-puzzle-question" rows="3"></textarea>
    </div>
    <div class="form-group">
      <label for="text-puzzle-answer">תשובה נכונה:</label>
      <input type="text" id="text-puzzle-answer">
    </div>
    <div class="form-group">
      <label for="text-puzzle-hint">רמז:</label>
      <input type="text" id="text-puzzle-hint">
    </div>
    <div class="form-group">
      <label for="text-puzzle-success">הודעת הצלחה:</label>
      <input type="text" id="text-puzzle-success">
    </div>
    <button class="btn" id="save-text-puzzle">שמור</button>
    <button class="btn btn-danger" id="delete-text-puzzle" style="float: left;">מחק חידה</button>
  `;
  
  // יצירת טופס לחידת רצף
  var sequenceForm = document.createElement("div");
  sequenceForm.id = "sequence-puzzle-form";
  sequenceForm.className = "puzzle-form";
  sequenceForm.style.display = "none";
  sequenceForm.innerHTML = `
  <h4>עריכת חידת רצף</h4>
    <div class="form-group">
      <label for="sequence-puzzle-name">שם החידה:</label>
      <input type="text" id="sequence-puzzle-name">
    </div>
    <div class="form-group">
      <label for="sequence-puzzle-description">תיאור החידה:</label>
      <textarea id="sequence-puzzle-description" rows="3"></textarea>
    </div>
    <div class="form-group">
      <label>צעדים ברצף:</label>
      <div id="sequence-steps-editor" class="sequence-editor">
        <!-- צעדים יתווספו דינמית -->
        <button class="btn" id="add-sequence-step">+ הוסף צעד</button>
      </div>
    </div>
    <div class="form-group">
      <label>
        <input type="checkbox" id="sequence-reset-on-error">
        איפוס הרצף בטעות
      </label>
    </div>
    <div class="form-group">
      <label for="sequence-puzzle-hint">רמז:</label>
      <input type="text" id="sequence-puzzle-hint">
    </div>
    <div class="form-group">
      <label for="sequence-puzzle-success">הודעת הצלחה:</label>
      <input type="text" id="sequence-puzzle-success">
    </div>
    <button class="btn" id="save-sequence-puzzle">שמור</button>
    <button class="btn btn-danger" id="delete-sequence-puzzle" style="float: left;">מחק חידה</button>
  `;
  
  // יצירת טופס לחידת התאמה
  var matchingForm = document.createElement("div");
  matchingForm.id = "matching-puzzle-form";
  matchingForm.className = "puzzle-form";
  matchingForm.style.display = "none";
  matchingForm.innerHTML = `
    <h4>עריכת חידת התאמה</h4>
    <div class="form-group">
      <label for="matching-puzzle-name">שם החידה:</label>
      <input type="text" id="matching-puzzle-name">
    </div>
    <div class="form-group">
      <label for="matching-puzzle-description">תיאור החידה:</label>
      <textarea id="matching-puzzle-description" rows="3"></textarea>
    </div>
    <div class="form-group">
      <label>זוגות להתאמה:</label>
      <div id="matching-pairs-editor" class="elements-container">
        <!-- זוגות יתווספו דינמית -->
      </div>
      <button class="btn" id="add-matching-pair">+ הוסף זוג</button>
    </div>
    <div class="form-group">
      <label for="matching-puzzle-hint">רמז:</label>
      <input type="text" id="matching-puzzle-hint">
    </div>
    <div class="form-group">
      <label for="matching-puzzle-success">הודעת הצלחה:</label>
      <input type="text" id="matching-puzzle-success">
    </div>
    <button class="btn" id="save-matching-puzzle">שמור</button>
    <button class="btn btn-danger" id="delete-matching-puzzle" style="float: left;">מחק חידה</button>
  `;
  
  // יצירת טופס לחידת סידור
  var arrangeForm = document.createElement("div");
  arrangeForm.id = "arrange-puzzle-form";
  arrangeForm.className = "puzzle-form";
  arrangeForm.style.display = "none";
  arrangeForm.innerHTML = `
    <h4>עריכת חידת סידור</h4>
    <div class="form-group">
      <label for="arrange-puzzle-name">שם החידה:</label>
      <input type="text" id="arrange-puzzle-name">
    </div>
    <div class="form-group">
      <label for="arrange-puzzle-description">תיאור החידה:</label>
      <textarea id="arrange-puzzle-description" rows="3"></textarea>
    </div>
    <div class="form-group">
      <label>פריטים לסידור:</label>
      <div id="arrange-items-editor" class="elements-container">
        <!-- פריטים יתווספו דינמית -->
      </div>
      <button class="btn" id="add-arrange-item">+ הוסף פריט</button>
    </div>
    <div class="form-group">
      <label for="arrange-puzzle-hint">רמז:</label>
      <input type="text" id="arrange-puzzle-hint">
    </div>
    <div class="form-group">
      <label for="arrange-puzzle-success">הודעת הצלחה:</label>
      <input type="text" id="arrange-puzzle-success">
    </div>
    <button class="btn" id="save-arrange-puzzle">שמור</button>
    <button class="btn btn-danger" id="delete-arrange-puzzle" style="float: left;">מחק חידה</button>
  `;
  
  // יצירת טופס לחידת חיפוש
  var searchForm = document.createElement("div");
  searchForm.id = "search-puzzle-form";
  searchForm.className = "puzzle-form";
  searchForm.style.display = "none";
  searchForm.innerHTML = `
    <h4>עריכת חידת חיפוש</h4>
    <div class="form-group">
      <label for="search-puzzle-name">שם החידה:</label>
      <input type="text" id="search-puzzle-name">
    </div>
    <div class="form-group">
      <label for="search-puzzle-description">תיאור החידה:</label>
      <textarea id="search-puzzle-description" rows="3"></textarea>
    </div>
    <div class="form-group">
      <label>פריטים למציאה:</label>
      <div id="search-items-container" class="search-items-container">
        <!-- פריטים יתווספו דינמית -->
      </div>
      <button class="btn" id="add-search-item">+ הוסף פריט</button>
    </div>
    <div class="form-group">
      <label for="search-puzzle-hint">רמז כללי:</label>
      <input type="text" id="search-puzzle-hint">
    </div>
    <div class="form-group">
      <label for="search-puzzle-success">הודעת הצלחה:</label>
      <input type="text" id="search-puzzle-success">
    </div>
    <button class="btn" id="save-search-puzzle">שמור</button>
    <button class="btn btn-danger" id="delete-search-puzzle" style="float: left;">מחק חידה</button>
  `;
  
  // יצירת טופס לחידת הרכבה
  var assemblyForm = document.createElement("div");
  assemblyForm.id = "assembly-puzzle-form";
  assemblyForm.className = "puzzle-form";
  assemblyForm.style.display = "none";
  assemblyForm.innerHTML = `
    <h4>עריכת חידת הרכבה</h4>
    <div class="form-group">
      <label for="assembly-puzzle-name">שם החידה:</label>
      <input type="text" id="assembly-puzzle-name">
    </div>
    <div class="form-group">
      <label for="assembly-puzzle-description">תיאור החידה:</label>
      <textarea id="assembly-puzzle-description" rows="3"></textarea>
    </div>
    <div class="form-group">
      <label>חלקים להרכבה:</label>
      <div id="assembly-parts-editor" class="elements-container">
        <!-- חלקים יתווספו דינמית -->
      </div>
      <button class="btn" id="add-assembly-part">+ הוסף חלק</button>
    </div>
    <div class="form-group">
      <label for="assembly-puzzle-hint">רמז:</label>
      <input type="text" id="assembly-puzzle-hint">
    </div>
    <div class="form-group">
      <label for="assembly-puzzle-success">הודעת הצלחה:</label>
      <input type="text" id="assembly-puzzle-success">
    </div>
    <button class="btn" id="save-assembly-puzzle">שמור</button>
    <button class="btn btn-danger" id="delete-assembly-puzzle" style="float: left;">מחק חידה</button>
  `;
  
  // הוספת כל הטפסים למיכל
  formsContainer.appendChild(codeForm);
  formsContainer.appendChild(textForm);
  formsContainer.appendChild(sequenceForm);
  formsContainer.appendChild(matchingForm);
  formsContainer.appendChild(arrangeForm);
  formsContainer.appendChild(searchForm);
  formsContainer.appendChild(assemblyForm);
  
  console.log("טפסי חידות נוצרו");
  
  // הוספת מאזיני אירועים לטפסים
  setupPuzzleFormEvents();
}

// פונקציה להגדרת אירועים לטפסי החידות
function setupPuzzleFormEvents() {
  console.log("מגדיר אירועים לטפסי חידות");
  
  // אירועים לחידת רצף
  var addSequenceStepBtn = document.getElementById("add-sequence-step");
  if (addSequenceStepBtn) {
    addSequenceStepBtn.addEventListener("click", function() {
      var stepsEditor = document.getElementById("sequence-steps-editor");
      if (!stepsEditor) return;
      
      var stepIndex = stepsEditor.querySelectorAll(".sequence-step").length;
      
      var stepContainer = document.createElement("div");
      stepContainer.className = "sequence-step";
      
      var stepInput = document.createElement("input");
      stepInput.type = "text";
      stepInput.placeholder = "צעד " + (stepIndex + 1);
      stepInput.className = "sequence-step-input";
      stepInput.setAttribute("data-index", stepIndex);
      
      var deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger";
      deleteBtn.textContent = "X";
      deleteBtn.style.marginRight = "5px";
      deleteBtn.addEventListener("click", function() {
        stepsEditor.removeChild(stepContainer);
        // עדכון האינדקסים
        var steps = stepsEditor.querySelectorAll(".sequence-step-input");
        for (var i = 0; i < steps.length; i++) {
          steps[i].setAttribute("data-index", i);
          steps[i].placeholder = "צעד " + (i + 1);
        }
      });
      
      stepContainer.appendChild(stepInput);
      stepContainer.appendChild(deleteBtn);
      
      // הוסף לפני כפתור הוספת הצעד
      stepsEditor.insertBefore(stepContainer, addSequenceStepBtn);
    });
  }
  
  // אירועים לחידת התאמה
  var addMatchingPairBtn = document.getElementById("add-matching-pair");
  if (addMatchingPairBtn) {
    addMatchingPairBtn.addEventListener("click", function() {
      var pairsEditor = document.getElementById("matching-pairs-editor");
      if (!pairsEditor) return;
      
      var pairIndex = pairsEditor.querySelectorAll(".matching-pair").length;
      
      var pairContainer = document.createElement("div");
      pairContainer.className = "matching-pair";
      
      var leftInput = document.createElement("input");
      leftInput.type = "text";
      leftInput.placeholder = "פריט שמאל";
      leftInput.className = "matching-item";
      leftInput.setAttribute("data-side", "left");
      leftInput.setAttribute("data-index", pairIndex);
      
      var rightInput = document.createElement("input");
      rightInput.type = "text";
      rightInput.placeholder = "פריט ימין";
      rightInput.className = "matching-item";
      rightInput.setAttribute("data-side", "right");
      rightInput.setAttribute("data-index", pairIndex);
      
      var deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger";
      deleteBtn.textContent = "X";
      deleteBtn.addEventListener("click", function() {
        pairsEditor.removeChild(pairContainer);
      });
      
      pairContainer.appendChild(leftInput);
      pairContainer.appendChild(rightInput);
      pairContainer.appendChild(deleteBtn);
      
      pairsEditor.appendChild(pairContainer);
    });
  }
  
  // אירועים לחידת סידור
  var addArrangeItemBtn = document.getElementById("add-arrange-item");
  if (addArrangeItemBtn) {
    addArrangeItemBtn.addEventListener("click", function() {
      var itemsEditor = document.getElementById("arrange-items-editor");
      if (!itemsEditor) return;
      
      var itemIndex = itemsEditor.querySelectorAll(".element-item").length;
      
      var itemContainer = document.createElement("div");
      itemContainer.className = "element-item";
      
      var itemInput = document.createElement("input");
      itemInput.type = "text";
      itemInput.placeholder = "פריט " + (itemIndex + 1);
      itemInput.setAttribute("data-index", itemIndex);
      
      var deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger";
      deleteBtn.textContent = "X";
      deleteBtn.addEventListener("click", function() {
        itemsEditor.removeChild(itemContainer);
      });
      
      itemContainer.appendChild(itemInput);
      itemContainer.appendChild(deleteBtn);
      
      itemsEditor.appendChild(itemContainer);
    });
  }
  
  // אירועים לחידת חיפוש
  var addSearchItemBtn = document.getElementById("add-search-item");
  if (addSearchItemBtn) {
    addSearchItemBtn.addEventListener("click", function() {
      var itemsContainer = document.getElementById("search-items-container");
      if (!itemsContainer) return;
      
      var itemIndex = itemsContainer.querySelectorAll(".search-item").length;
      
      var itemDiv = document.createElement("div");
      itemDiv.className = "search-item";
      
      var nameGroup = document.createElement("div");
      nameGroup.className = "form-group";
      
      var nameLabel = document.createElement("label");
      nameLabel.textContent = "שם הפריט:";
      
      var nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.placeholder = "פריט " + (itemIndex + 1);
      nameInput.className = "search-item-name";
      
      nameGroup.appendChild(nameLabel);
      nameGroup.appendChild(nameInput);
      
      var hintGroup = document.createElement("div");
      hintGroup.className = "form-group";
      
      var hintLabel = document.createElement("label");
      hintLabel.textContent = "רמז לפריט:";
      
      var hintInput = document.createElement("input");
      hintInput.type = "text";
      hintInput.placeholder = "רמז לפריט " + (itemIndex + 1);
      hintInput.className = "search-item-hint";
      
      hintGroup.appendChild(hintLabel);
      hintGroup.appendChild(hintInput);
      
      var deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger";
      deleteBtn.textContent = "הסר פריט";
      deleteBtn.addEventListener("click", function() {
        itemsContainer.removeChild(itemDiv);
      });
      
      itemDiv.appendChild(nameGroup);
      itemDiv.appendChild(hintGroup);
      itemDiv.appendChild(deleteBtn);
      
      itemsContainer.appendChild(itemDiv);
    });
  }
  
  // אירועים לחידת הרכבה
  var addAssemblyPartBtn = document.getElementById("add-assembly-part");
  if (addAssemblyPartBtn) {
    addAssemblyPartBtn.addEventListener("click", function() {
      var partsEditor = document.getElementById("assembly-parts-editor");
      if (!partsEditor) return;
      
      var partIndex = partsEditor.querySelectorAll(".assembly-part").length;
      
      var partContainer = document.createElement("div");
      partContainer.className = "assembly-part";
      
      var partInput = document.createElement("input");
      partInput.type = "text";
      partInput.placeholder = "חלק " + (partIndex + 1);
      partInput.setAttribute("data-index", partIndex);
      
      var orderInput = document.createElement("input");
      orderInput.type = "number";
      orderInput.placeholder = "סדר";
      orderInput.value = partIndex;
      orderInput.min = "0";
      orderInput.style.width = "60px";
      orderInput.setAttribute("data-index", partIndex);
      
      var deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger";
      deleteBtn.textContent = "X";
      deleteBtn.addEventListener("click", function() {
        partsEditor.removeChild(partContainer);
      });
      
      partContainer.appendChild(partInput);
      partContainer.appendChild(orderInput);
      partContainer.appendChild(deleteBtn);
      
      partsEditor.appendChild(partContainer);
    });
  }
  
  console.log("אירועי טפסי חידות הוגדרו בהצלחה");
}

// פונקציה להגדרת מאזיני אירועים
function setupEventListeners() {
  console.log("מגדיר מאזיני אירועים כלליים");
  
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
      var contentElement = document.getElementById(tabId);
      if (contentElement) {
        contentElement.style.display = "block";
      }
    });
  }
  
  // אירועי לחיצה על אובייקטי הגלריה
  var thumbnails = document.querySelectorAll(".object-thumbnail");
  for (var i = 0; i < thumbnails.length; i++) {
    thumbnails[i].addEventListener("click", function() {
      var objectType = this.getAttribute("data-type");
      if (objectType) {
        addNewItem(objectType);
      }
    });
  }
  
  // אירוע לחיצה על כפתור מחיקת אובייקט
  var deleteObjectBtn = document.getElementById("delete-object-btn");
  if (deleteObjectBtn) {
    deleteObjectBtn.addEventListener("click", deleteSelectedItem);
  }
  
  // אירועי שינוי בטופס תכונות אובייקט בסיסיות
  var objectNameInput = document.getElementById("object-name");
  if (objectNameInput) {
    objectNameInput.addEventListener("change", function() {
      if (selectedItem) {
        var itemId = selectedItem.element.id;
        projectData.rooms[currentRoomId].items[itemId].name = this.value;
        
        // בדוק אם יש תמונה לאובייקט
        if (!projectData.rooms[currentRoomId].items[itemId].image) {
          selectedItem.element.textContent = this.value;
        }
      }
    });
  }
  
  // אירועי עדכון מידות
  var objectWidthInput = document.getElementById("object-width");
  if (objectWidthInput) {
    objectWidthInput.addEventListener("change", function() {
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
  }

  var objectHeightInput = document.getElementById("object-height");
  if (objectHeightInput) {
    objectHeightInput.addEventListener("change", function() {
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
  }
  
  // אירועי העלאת תמונות
  var objectImageInput = document.getElementById("object-image");
  if (objectImageInput) {
    objectImageInput.addEventListener("change", async function(e) {
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
          console.error("שגיאה בטעינת התמונה:", error);
          alert("אירעה שגיאה בטעינת התמונה: " + error);
        }
      }
    });
  }
  
  var removeObjectImageBtn = document.getElementById("remove-object-image");
  if (removeObjectImageBtn) {
    removeObjectImageBtn.addEventListener("click", function() {
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
  }
  
  // אירועי רקע חדר
  var roomBackgroundImageInput = document.getElementById("room-background-image");
  if (roomBackgroundImageInput) {
    roomBackgroundImageInput.addEventListener("change", async function(e) {
      if (this.files && this.files[0]) {
        try {
          // המרת הקובץ ל-Data URL
          var dataURL = await fileToDataURL(this.files[0]);
          
          // עדכון נתוני הפרויקט
          projectData.rooms[currentRoomId].backgroundImage = dataURL;
          
          // עדכון תצוגת החדר
          var roomPreviewElement = document.getElementById("room-preview");
          if (roomPreviewElement) {
            roomPreviewElement.style.backgroundImage = "url('" + dataURL + "')";
            roomPreviewElement.style.backgroundColor = "transparent";
          }
        } catch (error) {
          console.error("שגיאה בטעינת תמונת רקע:", error);
          alert("אירעה שגיאה בטעינת תמונת הרקע: " + error);
        }
      }
    });
  }
  
  var removeRoomBgImageBtn = document.getElementById("remove-room-bg-image");
  if (removeRoomBgImageBtn) {
    removeRoomBgImageBtn.addEventListener("click", function() {
      // הסרת תמונת הרקע והחזרת צבע הרקע המקורי
      delete projectData.rooms[currentRoomId].backgroundImage;
      var room = projectData.rooms[currentRoomId];
      
      var roomPreviewElement = document.getElementById("room-preview");
      if (roomPreviewElement) {
        roomPreviewElement.style.backgroundImage = "none";
        
        // הצג את צבע הרקע המקורי לפי סוג החדר
        if (room.background === "lab") {
          roomPreviewElement.style.backgroundColor = "#243447";
        } else if (room.background === "library") {
          roomPreviewElement.style.backgroundColor = "#4b3621";
        } else if (room.background === "office") {
          roomPreviewElement.style.backgroundColor = "#34515e";
        } else if (room.background === "mansion") {
          roomPreviewElement.style.backgroundColor = "#544e4d";
        }
      }
    });
  }
  
  // אירועי עדכון פרטי חדר
  var roomNameInput = document.getElementById("room-name");
  if (roomNameInput) {
    roomNameInput.addEventListener("change", function() {
      projectData.rooms[currentRoomId].name = this.value;
      var roomItem = document.querySelector('.room-item-list[data-room-id="' + currentRoomId + '"]');
      if (roomItem) {
        roomItem.textContent = this.value;
      }
      
      // עדכן גם את רשימת יעדי הדלת
      updateDoorTargets();
    });
  }
  
  var roomBackgroundSelect = document.getElementById("room-background");
  if (roomBackgroundSelect) {
    roomBackgroundSelect.addEventListener("change", function() {
      projectData.rooms[currentRoomId].background = this.value;
      loadCurrentRoom();
    });
  }
  
  // אירועים לניהול חדרים
  var addRoomBtn = document.getElementById("add-room-btn");
  if (addRoomBtn) {
    addRoomBtn.addEventListener("click", function() {
      var addRoomModal = document.getElementById("add-room-modal");
      if (addRoomModal) {
        addRoomModal.style.display = "block";
      }
    });
  }
  
  var createRoomBtn = document.getElementById("create-room-btn");
  if (createRoomBtn) {
    createRoomBtn.addEventListener("click", addNewRoom);
  }
  
  // אירועים לניהול חידות
  var addPuzzleBtn = document.getElementById("add-puzzle-btn");
  if (addPuzzleBtn) {
    addPuzzleBtn.addEventListener("click", function() {
      var addPuzzleModal = document.getElementById("add-puzzle-modal");
      if (addPuzzleModal) {
        addPuzzleModal.style.display = "block";
      }
    });
  }
  
  var createPuzzleBtn = document.getElementById("create-puzzle-btn");
  if (createPuzzleBtn) {
    createPuzzleBtn.addEventListener("click", addNewPuzzle);
  }
  
  // אירועי שמירה וייצוא
  var saveProjectBtn = document.getElementById("save-project-btn");
  if (saveProjectBtn) {
    saveProjectBtn.addEventListener("click", saveProject);
  }
  
  var loadProjectBtn = document.getElementById("load-project-btn");
  if (loadProjectBtn) {
    loadProjectBtn.addEventListener("click", loadProject);
  }
  
  var newProjectBtn = document.getElementById("new-project-btn");
  if (newProjectBtn) {
    newProjectBtn.addEventListener("click", newProject);
  }
  
  var generateGameBtn = document.getElementById("generate-game");
  if (generateGameBtn) {
    generateGameBtn.addEventListener("click", exportGame);
  }
  
  // אירועי סגירת מודאלים
  var closeButtons = document.querySelectorAll(".close-modal");
  for (var i = 0; i < closeButtons.length; i++) {
    closeButtons[i].addEventListener("click", function() {
      var modal = this.closest(".modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  }
  
  console.log("מאזיני אירועים הוגדרו בהצלחה");
}

// פונקציה לאתחול ממשק המפה
function initMapInterface() {
  console.log("אתחול ממשק מפה");
  
  var mapContainer = document.getElementById("map-container");
  if (!mapContainer) {
    console.error("מיכל המפה לא נמצא");
    return;
  }
  
  // נקה את מיכל המפה
  mapContainer.innerHTML = "";
  
  // הוסף את כל החדרים למפה
  for (var roomId in projectData.rooms) {
    var room = projectData.rooms[roomId];
    addRoomToMap(roomId, room.name);
  }
  // הוסף כפתורי פעולה למפה
    var addMapRoomBtn = document.getElementById("add-map-room");
    if (addMapRoomBtn) {
      addMapRoomBtn.addEventListener("click", function() {
        var addRoomModal = document.getElementById("add-room-modal");
        if (addRoomModal) {
          addRoomModal.style.display = "block";
        }
      });
    }
    
    var createConnectionBtn = document.getElementById("create-connection");
    if (createConnectionBtn) {
      createConnectionBtn.addEventListener("click", startConnectionCreation);
    }
    
    var removeConnectionBtn = document.getElementById("remove-connection");
    if (removeConnectionBtn) {
      removeConnectionBtn.addEventListener("click", startConnectionRemoval);
    }
    
    // עדכן את הקשרים
    updateMapConnections();
    
    console.log("ממשק מפה אותחל בהצלחה");
  }
  
  // פונקציה להוספת חדר למפה
  function addRoomToMap(roomId, roomName) {
    var mapContainer = document.getElementById("map-container");
    if (!mapContainer) return;
    
    var mapRoom = document.createElement("div");
    mapRoom.className = "map-room";
    mapRoom.id = "map-" + roomId;
    mapRoom.setAttribute("data-room-id", roomId);
    mapRoom.textContent = roomName;
    
    // מיקום אקראי בתוך המפה
    var maxX = mapContainer.clientWidth - 150;
    var maxY = mapContainer.clientHeight - 100;
    var randomX = Math.floor(Math.random() * maxX);
    var randomY = Math.floor(Math.random() * maxY);
    
    mapRoom.style.left = randomX + "px";
    mapRoom.style.top = randomY + "px";
    
    // הוסף גרירה לחדר
    mapRoom.addEventListener("mousedown", startDragMapRoom);
    
    mapContainer.appendChild(mapRoom);
  }
  
  // פונקציות גרירה לחדרים במפה
  function startDragMapRoom(e) {
    e.preventDefault();
    
    var room = this;
    var startX = e.clientX;
    var startY = e.clientY;
    var startLeft = parseInt(room.style.left) || 0;
    var startTop = parseInt(room.style.top) || 0;
    
    function dragMapRoom(e) {
      var newLeft = startLeft + (e.clientX - startX);
      var newTop = startTop + (e.clientY - startY);
      
      // הגבל לגבולות המפה
      var mapContainer = document.getElementById("map-container");
      if (!mapContainer) return;
      
      var maxX = mapContainer.clientWidth - room.clientWidth;
      var maxY = mapContainer.clientHeight - room.clientHeight;
      
      newLeft = Math.max(0, Math.min(newLeft, maxX));
      newTop = Math.max(0, Math.min(newTop, maxY));
      
      room.style.left = newLeft + "px";
      room.style.top = newTop + "px";
      
      // עדכן את הקשרים
      updateMapConnections();
    }
    
    function stopDragMapRoom() {
      document.removeEventListener("mousemove", dragMapRoom);
      document.removeEventListener("mouseup", stopDragMapRoom);
    }
    
    document.addEventListener("mousemove", dragMapRoom);
    document.addEventListener("mouseup", stopDragMapRoom);
  }
  
  // פונקציה לעדכון קשרים במפה
  function updateMapConnections() {
    // מחק את כל הקשרים הקיימים
    var existingConnections = document.querySelectorAll(".map-connection");
    for (var i = 0; i < existingConnections.length; i++) {
      existingConnections[i].remove();
    }
    
    // צור את כל הקשרים מחדש
    var mapContainer = document.getElementById("map-container");
    if (!mapContainer) return;
    
    for (var i = 0; i < projectData.connections.length; i++) {
      var connection = projectData.connections[i];
      var fromRoom = document.getElementById("map-" + connection.from);
      var toRoom = document.getElementById("map-" + connection.to);
      
      if (fromRoom && toRoom) {
        // חשב את נקודות החיבור
        var fromRect = fromRoom.getBoundingClientRect();
        var toRect = toRoom.getBoundingClientRect();
        var containerRect = mapContainer.getBoundingClientRect();
        
        var fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
        var fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
        var toX = toRect.left + toRect.width / 2 - containerRect.left;
        var toY = toRect.top + toRect.height / 2 - containerRect.top;
        
        // חשב את הזווית והאורך
        var angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
        var length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        
        // יצירת אלמנט הקשר
        var connectionElement = document.createElement("div");
        connectionElement.className = "map-connection";
        connectionElement.style.width = length + "px";
        connectionElement.style.height = "4px";
        connectionElement.style.left = fromX + "px";
        connectionElement.style.top = fromY - 2 + "px";
        connectionElement.style.transformOrigin = "left center";
        connectionElement.style.transform = "rotate(" + angle + "deg)";
        
        // הוסף מידע על דרישות נעילה אם קיימות
        if (connection.requiredPuzzle) {
          connectionElement.style.backgroundColor = "#e74c3c";
          connectionElement.title = "דורש חידה: " + connection.requiredPuzzle;
        }
        
        mapContainer.appendChild(connectionElement);
      }
    }
  }
  
  // משתנים לניהול יצירת קשרים
  var connectionStart = null;
  var creatingConnection = false;
  
  // פונקציה להתחלת יצירת קשר
  function startConnectionCreation() {
    creatingConnection = true;
    connectionStart = null;
    
    // שנה את המעמד של העכבר
    document.body.style.cursor = "crosshair";
    
    // הוסף מאזיני אירועים לחדרים במפה
    var mapRooms = document.querySelectorAll(".map-room");
    for (var i = 0; i < mapRooms.length; i++) {
      mapRooms[i].addEventListener("click", handleConnectionClick);
    }
    
    // הוסף אפשרות לבטל את היצירה
    document.addEventListener("keydown", function cancelConnection(e) {
      if (e.key === "Escape") {
        endConnectionCreation();
        document.removeEventListener("keydown", cancelConnection);
      }
    });
    
    // הצג הודעה
    alert("בחר את החדר המקור לקשר");
  }
  
  // פונקציה לטיפול בלחיצה על חדרים במפה בזמן יצירת קשר
  function handleConnectionClick() {
    var roomId = this.getAttribute("data-room-id");
    
    if (!connectionStart) {
      // זו הלחיצה הראשונה - שמור את חדר המקור
      connectionStart = roomId;
      this.style.border = "2px solid #e74c3c";
      alert("כעת בחר את חדר היעד");
    } else if (roomId !== connectionStart) {
      // זו הלחיצה השנייה - צור את הקשר
      var connectionFrom = connectionStart;
      var connectionTo = roomId;
      
      // בדוק אם הקשר כבר קיים
      var connectionExists = false;
      for (var i = 0; i < projectData.connections.length; i++) {
        var connection = projectData.connections[i];
        if (connection.from === connectionFrom && connection.to === connectionTo) {
          connectionExists = true;
          break;
        }
      }
      
      if (!connectionExists) {
        // שאל אם נדרשת חידה לקשר
        var requiredPuzzle = prompt("האם נדרשת חידה למעבר? אם כן, הזן את מזהה החידה, אחרת השאר ריק.");
        
        // הוסף את הקשר לפרויקט
        projectData.connections.push({
          from: connectionFrom,
          to: connectionTo,
          requiredPuzzle: requiredPuzzle || null
        });
        
        // עדכן את הקשרים במפה
        updateMapConnections();
      } else {
        alert("קשר זה כבר קיים!");
      }
      
      // סיים את מצב יצירת הקשר
      endConnectionCreation();
    }
  }
  
  // פונקציה לסיום יצירת קשר
  function endConnectionCreation() {
    creatingConnection = false;
    connectionStart = null;
    
    // החזר את מראה הסמן
    document.body.style.cursor = "default";
    
    // הסר מאזיני אירועים מחדרים במפה
    var mapRooms = document.querySelectorAll(".map-room");
    for (var i = 0; i < mapRooms.length; i++) {
      mapRooms[i].removeEventListener("click", handleConnectionClick);
      mapRooms[i].style.border = "";
    }
  }
  
  // פונקציה להתחלת הסרת קשר
  function startConnectionRemoval() {
    // הצג הודעה
    alert("בחר בקשר שברצונך למחוק");
    
    // הוסף מאזיני אירועים לקשרים
    var connections = document.querySelectorAll(".map-connection");
    for (var i = 0; i < connections.length; i++) {
      connections[i].style.cursor = "pointer";
      connections[i].addEventListener("click", handleConnectionRemoval);
    }
    
    // הוסף אפשרות לביטול
    document.addEventListener("keydown", function cancelRemoval(e) {
      if (e.key === "Escape") {
        endConnectionRemoval();
        document.removeEventListener("keydown", cancelRemoval);
      }
    });
    
    // הוסף אפשרות לסיום לאחר לחיצה אחת
    document.addEventListener("click", function endAfterClick() {
      setTimeout(endConnectionRemoval, 100);
      document.removeEventListener("click", endAfterClick);
    });
  }
  
  // פונקציה לטיפול בהסרת קשר
  function handleConnectionRemoval() {
    // מצא את אינדקס הקשר שנבחר
    var connections = document.querySelectorAll(".map-connection");
    var connectionIndex = Array.prototype.indexOf.call(connections, this);
    
    if (connectionIndex !== -1 && connectionIndex < projectData.connections.length) {
      // הסר את הקשר מהנתונים
      projectData.connections.splice(connectionIndex, 1);
      
      // עדכן את הקשרים במפה
      updateMapConnections();
    }
  }
  
  // פונקציה לסיום הסרת קשר
  function endConnectionRemoval() {
    // החזר את מראה הסמן לקשרים
    var connections = document.querySelectorAll(".map-connection");
    for (var i = 0; i < connections.length; i++) {
      connections[i].style.cursor = "default";
      connections[i].removeEventListener("click", handleConnectionRemoval);
    }
  }
  
  // פונקציה להוספת חדר חדש
  function addNewRoom() {
    var newRoomNameInput = document.getElementById("new-room-name");
    var newRoomBackgroundSelect = document.getElementById("new-room-background");
    
    if (!newRoomNameInput || !newRoomBackgroundSelect) {
      console.error("אלמנטי טופס הוספת חדר חסרים");
      return;
    }
    
    var roomName = newRoomNameInput.value;
    var roomBackground = newRoomBackgroundSelect.value;
    
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
    if (roomsList) {
      var li = document.createElement("li");
      li.className = "room-item-list";
      li.setAttribute("data-room-id", newRoomId);
      li.textContent = roomName;
      li.addEventListener("click", function() {
        currentRoomId = this.getAttribute("data-room-id");
        loadCurrentRoom();
      });
      roomsList.appendChild(li);
    }
    
    // סגור את המודאל
    var addRoomModal = document.getElementById("add-room-modal");
    if (addRoomModal) {
      addRoomModal.style.display = "none";
    }
    
    // איפוס שדות
    newRoomNameInput.value = "חדר חדש";
    
    // עדכן את רשימת החדרים בתפריטי היעד
    updateDoorTargets();
    
    // הוסף את החדר למפה
    addRoomToMap(newRoomId, roomName);
    
    console.log("חדר חדש נוסף:", newRoomId);
  }
  
  // פונקציה להוספת חידה חדשה
  function addNewPuzzle() {
    var newPuzzleTypeSelect = document.getElementById("new-puzzle-type");
    var newPuzzleNameInput = document.getElementById("new-puzzle-name");
    
    if (!newPuzzleTypeSelect || !newPuzzleNameInput) {
      console.error("אלמנטי טופס הוספת חידה חסרים");
      return;
    }
    
    var puzzleType = newPuzzleTypeSelect.value;
    var puzzleName = newPuzzleNameInput.value;
    
    // צור מזהה ייחודי
    var puzzleId = puzzleType + "-puzzle-" + (new Date().getTime());
    
    // יצירת חידה חדשה על פי הסוג
    var newPuzzle = createEmptyPuzzle(puzzleType, puzzleId, puzzleName);
    
    // הוסף את החידה לנתוני הפרויקט
    projectData.puzzles[puzzleId] = newPuzzle;
    
    // הוסף את החידה לרשימת החידות
    addPuzzleToList(puzzleId, puzzleName);
    
    // סגור את המודאל
    var addPuzzleModal = document.getElementById("add-puzzle-modal");
    if (addPuzzleModal) {
      addPuzzleModal.style.display = "none";
    }
    
    // איפוס שדות
    newPuzzleNameInput.value = "חידה חדשה";
    
    // עדכן את האפשרויות בתפריטים של חידות מקושרות
    updatePuzzleSelectors();
    
    console.log("חידה חדשה נוספה:", puzzleId);
  }
  
  // פונקציה ליצירת חידה ריקה לפי סוג
  function createEmptyPuzzle(type, id, name) {
    var puzzle = {
      id: id,
      name: name,
      type: type
    };
    
    switch (type) {
      case "code":
        puzzle.description = "הזן את הקוד הנכון";
        puzzle.answer = "1234";
        puzzle.hint = "חפש רמזים בחדר...";
        puzzle.successMessage = "הצלחת!";
        break;
        
      case "text":
        puzzle.question = "ענה על השאלה";
        puzzle.answer = "תשובה";
        puzzle.hint = "רמז...";
        puzzle.successMessage = "תשובה נכונה!";
        break;
        
      case "sequence":
        puzzle.description = "לחץ על האלמנטים בסדר הנכון";
        puzzle.sequence = ["צעד 1", "צעד 2", "צעד 3"];
        puzzle.hint = "חפש את הסדר הנכון...";
        puzzle.resetOnError = true;
        puzzle.successMessage = "הצלחת לפתור את הרצף!";
        break;
        
      case "matching":
        puzzle.description = "התאם את הפריטים הבאים";
        puzzle.pairs = [
          { left: "פריט 1", right: "התאמה 1" },
          { left: "פריט 2", right: "התאמה 2" }
        ];
        puzzle.hint = "חפש רמזים להתאמות...";
        puzzle.successMessage = "כל ההתאמות נכונות!";
        break;
        
      case "arrange":
        puzzle.description = "סדר את הפריטים בסדר הנכון";
        puzzle.items = ["פריט 1", "פריט 2", "פריט 3"];
        puzzle.correctOrder = [0, 1, 2];
        puzzle.hint = "חפש רמזים לסדר הנכון...";
        puzzle.successMessage = "הסידור נכון!";
        break;
        
      case "search":
        puzzle.description = "מצא את הפריטים המוסתרים";
        puzzle.items = [
          { name: "פריט 1", hint: "רמז לפריט 1" },
          { name: "פריט 2", hint: "רמז לפריט 2" }
        ];
        puzzle.hint = "חפש היטב...";
        puzzle.successMessage = "מצאת את כל הפריטים!";
        break;
        
      case "assembly":
        puzzle.description = "הרכב את החלקים ליצירת הכלי";
        puzzle.parts = ["חלק 1", "חלק 2", "חלק 3"];
        puzzle.assemblyOrder = [0, 1, 2];
        puzzle.hint = "חפש רמזים לסדר ההרכבה...";
        puzzle.successMessage = "הרכבת בהצלחה!";
        break;
    }
    
    return puzzle;
  }
  
  // פונקציה להוספת חידה לרשימה
  function addPuzzleToList(puzzleId, puzzleName) {
    var puzzleList = document.getElementById("puzzle-list");
    if (!puzzleList) {
      console.error("רשימת החידות לא נמצאה");
      return;
    }
    
    var div = document.createElement("div");
    div.className = "puzzle-list-item";
    div.setAttribute("data-puzzle-id", puzzleId);
    div.textContent = puzzleName;
    div.addEventListener("click", function() {
      showPuzzleEditor(this.getAttribute("data-puzzle-id"));
    });
    puzzleList.appendChild(div);
  }
  
  // פונקציה לעדכון תפריטי בחירת חידות
  function updatePuzzleSelectors() {
    // עדכן את תפריט החידות בכספת
    var safePuzzleSelect = document.getElementById("object-puzzle");
    if (safePuzzleSelect) {
      safePuzzleSelect.innerHTML = '<option value="">ללא</option>';
    }
    
    // עדכן את תפריט החידות במחשב
    var computerPuzzleSelect = document.getElementById("computer-puzzle");
    if (computerPuzzleSelect) {
      computerPuzzleSelect.innerHTML = '<option value="">ללא</option>';
    }
    
    // עדכן את תפריט החידות בדלת
    var doorPuzzleSelect = document.getElementById("door-required-puzzle");
    if (doorPuzzleSelect) {
      doorPuzzleSelect.innerHTML = '<option value="">ללא</option>';
    }
    
    // בדוק אם יש חידות בכלל
    if (Object.keys(projectData.puzzles).length === 0) {
      return;
    }
    
    // הוסף את כל החידות הקיימות לכל הבוחרים
    for (var puzzleId in projectData.puzzles) {
      var puzzle = projectData.puzzles[puzzleId];
      
      if (safePuzzleSelect) {
        var optionSafe = document.createElement("option");
        optionSafe.value = puzzleId;
        optionSafe.textContent = puzzle.name;
        safePuzzleSelect.appendChild(optionSafe);
      }
      
      if (computerPuzzleSelect) {
        var optionComputer = document.createElement("option");
        optionComputer.value = puzzleId;
        optionComputer.textContent = puzzle.name;
        computerPuzzleSelect.appendChild(optionComputer);
      }
      
      if (doorPuzzleSelect) {
        var optionDoor = document.createElement("option");
        optionDoor.value = puzzleId;
        optionDoor.textContent = puzzle.name;
        doorPuzzleSelect.appendChild(optionDoor);
      }
    }
  }
  
  // פונקציה להצגת עורך החידה
  function showPuzzleEditor(puzzleId) {
    var puzzle = projectData.puzzles[puzzleId];
    if (!puzzle) {
      console.error("החידה לא נמצאה:", puzzleId);
      return;
    }
    
    // סמן את החידה הנבחרת ברשימה
    var puzzleItems = document.querySelectorAll(".puzzle-list-item");
    for (var i = 0; i < puzzleItems.length; i++) {
      puzzleItems[i].classList.remove("active");
      if (puzzleItems[i].getAttribute("data-puzzle-id") === puzzleId) {
        puzzleItems[i].classList.add("active");
      }
    }
    
    // נקה את אזור עריכת החידות
    var formsContainer = document.getElementById("puzzle-forms-container");
    if (!formsContainer) {
      console.error("מיכל טפסי החידות לא נמצא");
      return;
    }
    
    formsContainer.innerHTML = "";
    
    // צור את טופס העריכה המתאים לסוג החידה
    var puzzleForm = null;
    
    switch (puzzle.type) {
      case "code":
        puzzleForm = createCodePuzzleEditForm(puzzle);
        break;
      case "text":
        puzzleForm = createTextPuzzleEditForm(puzzle);
        break;
      case "sequence":
        puzzleForm = createSequencePuzzleEditForm(puzzle);
        break;
      case "matching":
        puzzleForm = createMatchingPuzzleEditForm(puzzle);
        break;
      case "arrange":
        puzzleForm = createArrangePuzzleEditForm(puzzle);
        break;
      case "search":
        puzzleForm = createSearchPuzzleEditForm(puzzle);
        break;
      case "assembly":
        puzzleForm = createAssemblyPuzzleEditForm(puzzle);
        break;
      default:
        console.error("סוג חידה לא מוכר:", puzzle.type);
        return;
    }
    
    if (puzzleForm) {
      formsContainer.appendChild(puzzleForm);
    }
  }
  
  // פונקציה ליצירת טופס עריכה לחידת קוד
  function createCodePuzzleEditForm(puzzle) {
    var formWrapper = document.createElement("div");
    formWrapper.className = "puzzle-form";
    
    var formHeader = document.createElement("h4");
    formHeader.textContent = "עריכת " + puzzle.name;
    formWrapper.appendChild(formHeader);
    
    // שדה שם
    var nameGroup = document.createElement("div");
    nameGroup.className = "form-group";
    
    var nameLabel = document.createElement("label");
    nameLabel.textContent = "שם החידה:";
    nameGroup.appendChild(nameLabel);
    
    var nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = puzzle.name;
    nameInput.addEventListener("change", function() {
      puzzle.name = this.value;
      
      // עדכן את שם החידה ברשימה
      var puzzleItem = document.querySelector('.puzzle-list-item[data-puzzle-id="' + puzzle.id + '"]');
      if (puzzleItem) {
        puzzleItem.textContent = this.value;
      }
      
      updatePuzzleSelectors();
    });
    nameGroup.appendChild(nameInput);
    formWrapper.appendChild(nameGroup);
    
    // שדה תיאור
    var descGroup = document.createElement("div");
    descGroup.className = "form-group";
    
    var descLabel = document.createElement("label");
    descLabel.textContent = "תיאור החידה:";
    descGroup.appendChild(descLabel);
    
    var descInput = document.createElement("textarea");
    descInput.rows = "3";
    descInput.value = puzzle.description || "";
    descInput.addEventListener("change", function() {
      puzzle.description = this.value;
    });
    descGroup.appendChild(descInput);
    formWrapper.appendChild(descGroup);
    
    // שדה תשובה
    var answerGroup = document.createElement("div");
    answerGroup.className = "form-group";
    
    var answerLabel = document.createElement("label");
    answerLabel.textContent = "הקוד הנכון:";
    answerGroup.appendChild(answerLabel);
    
    var answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.value = puzzle.answer || "";
    answerInput.addEventListener("change", function() {
      puzzle.answer = this.value;
    });
    answerGroup.appendChild(answerInput);
    formWrapper.appendChild(answerGroup);
    
    // שדה רמז
    var hintGroup = document.createElement("div");
    hintGroup.className = "form-group";
    
    var hintLabel = document.createElement("label");
    hintLabel.textContent = "רמז:";
    hintGroup.appendChild(hintLabel);
    
    var hintInput = document.createElement("input");
    hintInput.type = "text";
    hintInput.value = puzzle.hint || "";
    hintInput.addEventListener("change", function() {
      puzzle.hint = this.value;
    });
    hintGroup.appendChild(hintInput);
    formWrapper.appendChild(hintGroup);
    
    // שדה הודעת הצלחה
    var successGroup = document.createElement("div");
    successGroup.className = "form-group";
    
    var successLabel = document.createElement("label");
    successLabel.textContent = "הודעת הצלחה:";
    successGroup.appendChild(successLabel);
    
    var successInput = document.createElement("input");
    successInput.type = "text";
    successInput.value = puzzle.successMessage || "";
    successInput.addEventListener("change", function() {
      puzzle.successMessage = this.value;
    });
    successGroup.appendChild(successInput);
    formWrapper.appendChild(successGroup);
    
    // כפתור מחיקה
    var deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger";
    deleteBtn.textContent = "מחק חידה";
    deleteBtn.addEventListener("click", function() {
      if (confirm("האם אתה בטוח שברצונך למחוק את החידה?")) {
        deletePuzzle(puzzle.id);
      }
    });
    formWrapper.appendChild(deleteBtn);
    
    return formWrapper;
  }
  
  // פונקציה ליצירת טופס עריכה לחידת טקסט
  function createTextPuzzleEditForm(puzzle) {
    var formWrapper = document.createElement("div");
    formWrapper.className = "puzzle-form";
    
    var formHeader = document.createElement("h4");
    formHeader.textContent = "עריכת " + puzzle.name;
    formWrapper.appendChild(formHeader);
    
    // שדה שם
    var nameGroup = document.createElement("div");
    nameGroup.className = "form-group";
    
    var nameLabel = document.createElement("label");
    nameLabel.textContent = "שם החידה:";
    nameGroup.appendChild(nameLabel);
    
    var nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = puzzle.name;
    nameInput.addEventListener("change", function() {
      puzzle.name = this.value;
      
      // עדכן את שם החידה ברשימה
      var puzzleItem = document.querySelector('.puzzle-list-item[data-puzzle-id="' + puzzle.id + '"]');
      if (puzzleItem) {
        puzzleItem.textContent = this.value;
      }
      
      updatePuzzleSelectors();
    });
    nameGroup.appendChild(nameInput);
    formWrapper.appendChild(nameGroup);
    
    // שדה שאלה
    var questionGroup = document.createElement("div");
    questionGroup.className = "form-group";
    
    var questionLabel = document.createElement("label");
    questionLabel.textContent = "שאלה:";
    questionGroup.appendChild(questionLabel);
    
    var questionInput = document.createElement("textarea");
    questionInput.rows = "3";
    questionInput.value = puzzle.question || "";
    questionInput.addEventListener("change", function() {
    puzzle.question = this.value;
  });
  questionGroup.appendChild(questionInput);
  formWrapper.appendChild(questionGroup);
  
  // שדה תשובה
  var answerGroup = document.createElement("div");
  answerGroup.className = "form-group";
  
  var answerLabel = document.createElement("label");
  answerLabel.textContent = "תשובה נכונה:";
  answerGroup.appendChild(answerLabel);
  
  var answerInput = document.createElement("input");
  answerInput.type = "text";
  answerInput.value = puzzle.answer || "";
  answerInput.addEventListener("change", function() {
    puzzle.answer = this.value;
  });
  answerGroup.appendChild(answerInput);
  formWrapper.appendChild(answerGroup);
  
  // שדה רמז
  var hintGroup = document.createElement("div");
  hintGroup.className = "form-group";
  
  var hintLabel = document.createElement("label");
  hintLabel.textContent = "רמז:";
  hintGroup.appendChild(hintLabel);
  
  var hintInput = document.createElement("input");
  hintInput.type = "text";
  hintInput.value = puzzle.hint || "";
  hintInput.addEventListener("change", function() {
    puzzle.hint = this.value;
  });
  hintGroup.appendChild(hintInput);
  formWrapper.appendChild(hintGroup);
  
  // שדה הודעת הצלחה
  var successGroup = document.createElement("div");
  successGroup.className = "form-group";
  
  var successLabel = document.createElement("label");
  successLabel.textContent = "הודעת הצלחה:";
  successGroup.appendChild(successLabel);
  
  var successInput = document.createElement("input");
  successInput.type = "text";
  successInput.value = puzzle.successMessage || "";
  successInput.addEventListener("change", function() {
    puzzle.successMessage = this.value;
  });
  successGroup.appendChild(successInput);
  formWrapper.appendChild(successGroup);
  
  // כפתור מחיקה
  var deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger";
  deleteBtn.textContent = "מחק חידה";
  deleteBtn.addEventListener("click", function() {
    if (confirm("האם אתה בטוח שברצונך למחוק את החידה?")) {
      deletePuzzle(puzzle.id);
    }
  });
  formWrapper.appendChild(deleteBtn);
  
  return formWrapper;
}

// תבנית בסיסית לפונקציות עריכת חידות נוספות
function createSequencePuzzleEditForm(puzzle) {
  var formWrapper = document.createElement("div");
  formWrapper.className = "puzzle-form";
  formWrapper.innerHTML = `<h4>עריכת חידת רצף: ${puzzle.name}</h4>
    <p>עורך חידת רצף בהכנה</p>
    <button class="btn btn-danger">מחק חידה</button>`;
    
  formWrapper.querySelector(".btn-danger").addEventListener("click", function() {
    if (confirm("האם אתה בטוח שברצונך למחוק את החידה?")) {
      deletePuzzle(puzzle.id);
    }
  });
  
  return formWrapper;
}

function createMatchingPuzzleEditForm(puzzle) {
  var formWrapper = document.createElement("div");
  formWrapper.className = "puzzle-form";
  formWrapper.innerHTML = `<h4>עריכת חידת התאמה: ${puzzle.name}</h4>
    <p>עורך חידת התאמה בהכנה</p>
    <button class="btn btn-danger">מחק חידה</button>`;
    
  formWrapper.querySelector(".btn-danger").addEventListener("click", function() {
    if (confirm("האם אתה בטוח שברצונך למחוק את החידה?")) {
      deletePuzzle(puzzle.id);
    }
  });
  
  return formWrapper;
}

function createArrangePuzzleEditForm(puzzle) {
  var formWrapper = document.createElement("div");
  formWrapper.className = "puzzle-form";
  formWrapper.innerHTML = `<h4>עריכת חידת סידור: ${puzzle.name}</h4>
    <p>עורך חידת סידור בהכנה</p>
    <button class="btn btn-danger">מחק חידה</button>`;
    
  formWrapper.querySelector(".btn-danger").addEventListener("click", function() {
    if (confirm("האם אתה בטוח שברצונך למחוק את החידה?")) {
      deletePuzzle(puzzle.id);
    }
  });
  
  return formWrapper;
}

function createSearchPuzzleEditForm(puzzle) {
  var formWrapper = document.createElement("div");
  formWrapper.className = "puzzle-form";
  formWrapper.innerHTML = `<h4>עריכת חידת חיפוש: ${puzzle.name}</h4>
    <p>עורך חידת חיפוש בהכנה</p>
    <button class="btn btn-danger">מחק חידה</button>`;
    
  formWrapper.querySelector(".btn-danger").addEventListener("click", function() {
    if (confirm("האם אתה בטוח שברצונך למחוק את החידה?")) {
      deletePuzzle(puzzle.id);
    }
  });
  
  return formWrapper;
}

function createAssemblyPuzzleEditForm(puzzle) {
  var formWrapper = document.createElement("div");
  formWrapper.className = "puzzle-form";
  formWrapper.innerHTML = `<h4>עריכת חידת הרכבה: ${puzzle.name}</h4>
    <p>עורך חידת הרכבה בהכנה</p>
    <button class="btn btn-danger">מחק חידה</button>`;
    
  formWrapper.querySelector(".btn-danger").addEventListener("click", function() {
    if (confirm("האם אתה בטוח שברצונך למחוק את החידה?")) {
      deletePuzzle(puzzle.id);
    }
  });
  
  return formWrapper;
}

// פונקציה למחיקת חידה
function deletePuzzle(puzzleId) {
  // הסר את החידה מהנתונים
  delete projectData.puzzles[puzzleId];
  
  // הסר את החידה מהרשימה
  var puzzleItem = document.querySelector('.puzzle-list-item[data-puzzle-id="' + puzzleId + '"]');
  if (puzzleItem) {
    puzzleItem.remove();
  }
  
  // נקה את אזור העריכה
  var formsContainer = document.getElementById("puzzle-forms-container");
  if (formsContainer) {
    formsContainer.innerHTML = "";
  }
  
  // עדכן את החידות המקושרות בכל האובייקטים
  for (var roomId in projectData.rooms) {
    var room = projectData.rooms[roomId];
    for (var itemId in room.items) {
      var item = room.items[itemId];
      if (item.puzzle === puzzleId) {
        item.puzzle = null;
      }
      if (item.requiredPuzzle === puzzleId) {
        item.requiredPuzzle = null;
      }
    }
  }
  
  // עדכן גם בקשרים
  for (var i = 0; i < projectData.connections.length; i++) {
    if (projectData.connections[i].requiredPuzzle === puzzleId) {
      projectData.connections[i].requiredPuzzle = null;
    }
  }
  
  // עדכן את האפשרויות בתפריטים
  updatePuzzleSelectors();
  
  console.log("חידה נמחקה:", puzzleId);
}

// פונקציה לשמירת הפרויקט
function saveProject() {
  try {
    // עדכן את נתוני הייצוא מהטופס
    var gameTitleInput = document.getElementById("game-title");
    var gameDescriptionInput = document.getElementById("game-description");
    var gameTimeLimitInput = document.getElementById("game-time-limit");
    
    if (gameTitleInput) projectData.settings.title = gameTitleInput.value;
    if (gameDescriptionInput) projectData.settings.description = gameDescriptionInput.value;
    if (gameTimeLimitInput) projectData.settings.timeLimit = parseInt(gameTimeLimitInput.value);
    
    // המר את הנתונים למחרוזת JSON
    var projectString = JSON.stringify(projectData);
    
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
        
        // ודא שיש שדות חובה
        if (!projectData.puzzles) projectData.puzzles = {};
        if (!projectData.connections) projectData.connections = [];
        if (!projectData.settings) {
          projectData.settings = {
            title: "חדר הבריחה שלי",
            description: "תיאור חדר הבריחה",
            timeLimit: 60
          };
        }
        
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
      addPuzzleToList(puzzleId, puzzle.name);
    }
  }
  
  // עדכן את נתוני הייצוא
  var gameTitleInput = document.getElementById("game-title");
  var gameDescriptionInput = document.getElementById("game-description");
  var gameTimeLimitInput = document.getElementById("game-time-limit");
  
  if (gameTitleInput) gameTitleInput.value = projectData.settings.title;
  if (gameDescriptionInput) gameDescriptionInput.value = projectData.settings.description;
  if (gameTimeLimitInput) gameTimeLimitInput.value = projectData.settings.timeLimit;
  
  // עדכן את החדר הנוכחי
  loadCurrentRoom();
  
  // עדכן את רשימת החידות בתפריטים
  updatePuzzleSelectors();
  
  // רענן את המפה
  var mapContainer = document.getElementById("map-container");
  if (mapContainer) {
    mapContainer.innerHTML = "";
    initMapInterface();
  }
  
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
          items: {}
        }
      },
      puzzles: {},
      connections: [],
      settings: {
        title: "חדר הבריחה שלי - המעבדה המסתורית",
        description: "ברוכים הבאים לחדר הבריחה המקוון! מצאת את עצמך נעול במעבדה מסתורית. עליך לפתור את החידות ולמצוא את הדרך החוצה תוך 60 דקות.",
        timeLimit: 60
      }
    };
    
    // אפס את החדר הנוכחי
    currentRoomId = "room1";
    
    // רענן את הממשק
    refreshUI();
    
    alert("פרויקט חדש נוצר בהצלחה!");
  }
}

// פונקציה לייצוא המשחק
function exportGame() {
  // עדכן את נתוני הייצוא מהטופס
  var gameTitleInput = document.getElementById("game-title");
  var gameDescriptionInput = document.getElementById("game-description");
  var gameTimeLimitInput = document.getElementById("game-time-limit");
  
  if (gameTitleInput) projectData.settings.title = gameTitleInput.value;
  if (gameDescriptionInput) projectData.settings.description = gameDescriptionInput.value;
  if (gameTimeLimitInput) projectData.settings.timeLimit = parseInt(gameTimeLimitInput.value);
  
  // אם פחות מ-10 דקות, עדכן ל-10 דקות כדי למנוע משחק קצר מדי
  if (projectData.settings.timeLimit < 10) {
    projectData.settings.timeLimit = 10;
    if (gameTimeLimitInput) gameTimeLimitInput.value = "10";
  }
  
  // בדוק תקינות בסיסית
  if (Object.keys(projectData.rooms).length === 0) {
    alert("לא ניתן לייצא משחק ללא חדרים!");
    return;
  }
  
  // טען את תבנית המשחק
  fetch('game-template.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('התבנית לא נמצאה. ודא שקובץ game-template.html נמצא בתיקייה הנוכחית.');
      }
      return response.text();
    })
    .then(template => {
      // החלף את המקומות השמורים בתבנית
      var gameHTML = template
        .replace('{{GAME_TITLE}}', projectData.settings.title)
        .replace('{{GAME_DESCRIPTION}}', projectData.settings.description)
        .replace(/{{GAME_TIME_LIMIT}}/g, projectData.settings.timeLimit)
        .replace('{{GAME_DATA_JSON}}', JSON.stringify(projectData));
      
      // הצג את מודאל ייצוא המשחק
      var exportGameModal = document.getElementById("export-game-modal");
      if (exportGameModal) {
        exportGameModal.style.display = "block";
        
        // הגדר אירוע לכפתור ההורדה
        var downloadGameBtn = document.getElementById("download-game-btn");
        if (downloadGameBtn) {
          downloadGameBtn.onclick = function() {
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
        }
      }
    })
    .catch(error => {
      console.error('שגיאה בטעינת תבנית המשחק:', error);
      alert('אירעה שגיאה בטעינת תבנית המשחק: ' + error.message);
    });
}

// האזנה לטעינת המסמך - נקודת הכניסה הראשית
document.addEventListener("DOMContentLoaded", function() {
  console.log("המסמך נטען, מאתחל את המחולל...");
  window.onerror = function(message, source, lineno, colno, error) {
    console.error("שגיאה התרחשה:", message);
    console.error("בקובץ:", source);
    console.error("בשורה:", lineno, "עמודה:", colno);
    console.error("פרטי השגיאה:", error);
    
    // אם רוצים להפעיל את הדיבגר באופן אוטומטי בשגיאות
    // debugger;
    
    return true; // מונע מהדפדפן להציג את השגיאה
  };
  
  // בדוק שכל האלמנטים החיוניים קיימים
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
  
  // מלא את החדר באובייקט אחד לדוגמה
  if (Object.keys(projectData.rooms[currentRoomId].items).length === 0) {
    console.log("מוסיף אובייקט דוגמה לחדר הראשון");
    var demoItemId = "item1";
    projectData.rooms[currentRoomId].items[demoItemId] = {
      id: demoItemId,
      name: "כספת",
      type: "safe",
      x: 200,
      y: 300,
      width: 60,
      height: 60,
      image: null,
      puzzle: "",
      locked: false,
      requiredItem: null,
      correctCode: "1234",
      content: "מצאת מפתח!"
    };
  }
  
  // אתחול המחולל
  initGenerator();
});
