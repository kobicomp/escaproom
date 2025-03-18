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

// פונקציה לאתחול המחולל
function initGenerator() {
  // טעינת החדר הראשון
  loadCurrentRoom();
  
  // יצירת מאזיני אירועים
  setupEventListeners();
  
  // יצירת טפסי חידות
  createPuzzleForms();
  
  // אתחול ממשק המפה
  initMapInterface();
}

// פונקציה לטעינת החדר הנוכחי
function loadCurrentRoom() {
  // נקה את תצוגת החדר
  var roomPreview = document.getElementById("room-preview");
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
  
  // הסתר את תכונות האובייקט
  document.getElementById("object-properties").style.display = "none";
  document.getElementById("no-object-selected").style.display = "block";
  
  // עדכן את רשימת החדרים בתפריט יעד הדלת
  updateDoorTargets();
}
// פונקציה ליצירת טפסי חידות
function createPuzzleForms() {
  var formsContainer = document.getElementById("puzzle-forms-container");
  
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
  
  // הוספת מאזיני אירועים לטפסים
  setupPuzzleFormEvents();
}

// פונקציה להגדרת אירועים לטפסי החידות
function setupPuzzleFormEvents() {
  // אירועים לחידת רצף
  var addSequenceStepBtn = document.getElementById("add-sequence-step");
  if (addSequenceStepBtn) {
    addSequenceStepBtn.addEventListener("click", function() {
      var stepsEditor = document.getElementById("sequence-steps-editor");
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
}
// פונקציה לעדכון רשימת יעדי הדלת
function updateDoorTargets() {
  var nextRoomSelect = document.getElementById("next-room");
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
    document.getElementById("object-width").value = newWidth;
    document.getElementById("object-height").value = newHeight;
    
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
  document.getElementById("no-object-selected").style.display = "none";
  document.getElementById("object-properties").style.display = "block";
  
  // מלא את הערכים בטופס הכללי
  document.getElementById("object-name").value = item.name;
  document.getElementById("object-width").value = item.width;
  document.getElementById("object-height").value = item.height;
  
  // הסתר את כל התכונות הספציפיות
  document.getElementById("safe-properties").style.display = "none";
  document.getElementById("key-properties").style.display = "none";
  document.getElementById("book-properties").style.display = "none";
  document.getElementById("computer-properties").style.display = "none";
  document.getElementById("info-properties").style.display = "none";
  document.getElementById("door-properties").style.display = "none";
  
  // הצג את התכונות המתאימות לסוג האובייקט
  switch (item.type) {
    case 'safe':
      document.getElementById("safe-properties").style.display = "block";
      // מלא את הערכים בטופס הכספת
      document.getElementById("object-puzzle").value = item.puzzle || "";
      document.getElementById("object-locked").checked = item.locked || false;
      document.getElementById("object-required-item").value = item.requiredItem || "";
      document.getElementById("object-code").value = item.correctCode || "";
      document.getElementById("object-content").value = item.content || "";
      break;
      
    case 'key':
      document.getElementById("key-properties").style.display = "block";
      // מלא את הערכים בטופס המפתח
      document.getElementById("key-type").value = item.keyType || "regular";
      document.getElementById("one-time-use").checked = item.oneTimeUse || false;
      document.getElementById("key-hint").value = item.hint || "";
      break;
      
    case 'book':
      document.getElementById("book-properties").style.display = "block";
      // מלא את הערכים בטופס הספר
      document.getElementById("book-content").value = item.content || "";
      document.getElementById("book-style").value = item.style || "regular";
      document.getElementById("book-hidden-hint").value = item.hiddenHint || "";
      document.getElementById("book-requires-item").value = item.requiresItem || "";
      document.getElementById("book-pages").value = item.pages ? Object.keys(item.pages).length : 1;
      break;
      
    case 'computer':
      document.getElementById("computer-properties").style.display = "block";
      // מלא את הערכים בטופס המחשב
      document.getElementById("computer-puzzle").value = item.puzzle || "";
      document.getElementById("computer-locked").checked = item.locked || false;
      document.getElementById("computer-password").value = item.password || "";
      document.getElementById("computer-off-text").value = item.offScreenText || "";
      document.getElementById("computer-on-text").value = item.onScreenText || "";
      break;
      
    case 'info':
      document.getElementById("info-properties").style.display = "block";
      // מלא את הערכים בטופס הערת המידע
      document.getElementById("info-text").value = item.infoText || "";
      document.getElementById("display-style").value = item.displayStyle || "popup";
      document.getElementById("auto-show").checked = item.autoShow || false;
      document.getElementById("show-once").checked = item.showOnce || false;
      document.getElementById("font-size").value = item.fontSize || "medium";
      document.getElementById("text-color").value = item.textColor || "#000000";
      break;
      
    case 'door':
      document.getElementById("door-properties").style.display = "block";
      // מלא את הערכים בטופס הדלת
      document.getElementById("next-room").value = item.nextRoom || "";
      document.getElementById("door-locked").checked = item.locked || false;
      document.getElementById("door-required-item").value = item.requiredItem || "";
      document.getElementById("door-required-puzzle").value = item.requiredPuzzle || "";
      document.getElementById("door-message").value = item.message || "";
      break;
  }
  
  // איפוס שדה העלאת התמונה
  document.getElementById("object-image").value = "";
}

// פונקציה להוספת אובייקט חדש
function addNewItem(type) {
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
}
// פונקציה למחיקת אובייקט נבחר
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

// פונקציה להגדרת מאזיני אירועים
function setupEventListeners() {
  // אירועי טעינת דף
  document.addEventListener("DOMContentLoaded", function() {
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
  });
  
  // אירוע לחיצה על כפתור מחיקת אובייקט
  document.getElementById("delete-object-btn").addEventListener("click", deleteSelectedItem);
  
  // אירועי שינוי בטופס תכונות אובייקט בסיסיות
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
  
  // אירועי עדכון מידות
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
  
  // אירוע העלאת תמונת אובייקט
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
  
  // אירוע הסרת תמונת אובייקט
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
  
  // אירועי העלאת תמונת רקע
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
  
  // אירוע הסרת תמונת רקע
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
  
  // אירוע עדכון שם חדר
  document.getElementById("room-name").addEventListener("change", function() {
    projectData.rooms[currentRoomId].name = this.value;
    var roomItem = document.querySelector('.room-item-list[data-room-id="' + currentRoomId + '"]');
    if (roomItem) {
      roomItem.textContent = this.value;
    }
    
    // עדכן גם את רשימת יעדי הדלת
    updateDoorTargets();
  });
  
  // אירוע שינוי רקע חדר
  document.getElementById("room-background").addEventListener("change", function() {
    projectData.rooms[currentRoomId].background = this.value;
    loadCurrentRoom();
  });
  
  // אירועים לכפתור הוספת חדר
  document.getElementById("add-room-btn").addEventListener("click", function() {
    document.getElementById("add-room-modal").style.display = "block";
  });
  
  document.getElementById("create-room-btn").addEventListener("click", addNewRoom);
  
  // אירועים לכפתור הוספת חידה
  document.getElementById("add-puzzle-btn").addEventListener("click", function() {
    document.getElementById("add-puzzle-modal").style.display = "block";
  });
  
  document.getElementById("create-puzzle-btn").addEventListener("click", addNewPuzzle);
  
  // אירועי עריכת עמודי ספר
  document.getElementById("edit-pages-btn").addEventListener("click", function() {
    if (!selectedItem) return;
    
    var itemId = selectedItem.element.id;
    var item = projectData.rooms[currentRoomId].items[itemId];
    
    // הצג את המודאל לעריכת עמודים
    displayBookPagesEditor(item);
    document.getElementById("edit-pages-modal").style.display = "block";
  });
  
  // אירועי עריכת תוכניות מחשב
  document.getElementById("edit-programs-btn").addEventListener("click", function() {
    if (!selectedItem) return;
    
    var itemId = selectedItem.element.id;
    var item = projectData.rooms[currentRoomId].items[itemId];
    
    // הצג את המודאל לעריכת תוכניות
    displayComputerProgramsEditor(item);
    document.getElementById("edit-programs-modal").style.display = "block";
  });
  
  // אירועי שמירה וייצוא
  document.getElementById("save-project-btn").addEventListener("click", saveProject);
  document.getElementById("load-project-btn").addEventListener("click", loadProject);
  document.getElementById("new-project-btn").addEventListener("click", newProject);
  document.getElementById("generate-game").addEventListener("click", exportGame);
  
  // אירועי סגירת מודאלים
  var closeButtons = document.querySelectorAll(".close-modal");
  for (var i = 0; i < closeButtons.length; i++) {
    closeButtons[i].addEventListener("click", function() {
      this.closest(".modal").style.display = "none";
    });
  }
  
  // אירועי עדכון תכונות אובייקט לפי סוג
  
  // כספת
  document.getElementById("object-puzzle").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.puzzle = this.value || null;
    }
  });
  
  document.getElementById("object-locked").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.locked = this.checked;
    }
  });
  
  document.getElementById("object-required-item").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.requiredItem = this.value || null;
    }
  });
  
  document.getElementById("object-code").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.correctCode = this.value;
    }
  });
  
  document.getElementById("object-content").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.content = this.value;
    }
  });
  
  // מפתח
  document.getElementById("key-type").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.keyType = this.value;
    }
  });
  
  document.getElementById("one-time-use").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.oneTimeUse = this.checked;
    }
  });
  
  document.getElementById("key-hint").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.hint = this.value;
    }
  });
  
  // ספר
  document.getElementById("book-content").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.content = this.value;
    }
  });
  
  document.getElementById("book-style").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.style = this.value;
    }
  });
  
  document.getElementById("book-hidden-hint").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.hiddenHint = this.value;
    }
  });
  
  document.getElementById("book-requires-item").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.requiresItem = this.value || null;
    }
  });
  
  // מחשב
  document.getElementById("computer-puzzle").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.puzzle = this.value || null;
    }
  });
  
  document.getElementById("computer-locked").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.locked = this.checked;
    }
  });
  
  document.getElementById("computer-password").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.password = this.value;
    }
  });
  
  document.getElementById("computer-off-text").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.offScreenText = this.value;
    }
  });
  
  document.getElementById("computer-on-text").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.onScreenText = this.value;
    }
  });
  
  // הערת מידע
  document.getElementById("info-text").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.infoText = this.value;
    }
  });
  
  document.getElementById("display-style").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.displayStyle = this.value;
    }
  });
  
  document.getElementById("auto-show").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.autoShow = this.checked;
    }
  });
  
  document.getElementById("show-once").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.showOnce = this.checked;
    }
  });
  
  document.getElementById("font-size").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.fontSize = this.value;
    }
  });
  
  document.getElementById("text-color").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.textColor = this.value;
    }
  });
  
  // דלת/יציאה
  document.getElementById("next-room").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.nextRoom = this.value;
    }
  });
  
  document.getElementById("door-locked").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.locked = this.checked;
    }
  });
  
  document.getElementById("door-required-item").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.requiredItem = this.value || null;
    }
  });
  
  document.getElementById("door-required-puzzle").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.requiredPuzzle = this.value || null;
    }
  });
  
  document.getElementById("door-message").addEventListener("change", function() {
    if (selectedItem) {
      var itemId = selectedItem.element.id;
      var item = projectData.rooms[currentRoomId].items[itemId];
      item.message = this.value;
    }
  });
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
  document.getElementById("new-room-name").value = "חדר חדש";
  
  // עדכן את רשימת החדרים בתפריטי היעד
  updateDoorTargets();
  
  // הוסף את החדר למפה
  addRoomToMap(newRoomId, roomName);
}

// פונקציה להוספת חדר למפה
function addRoomToMap(roomId, roomName) {
  var mapContainer = document.getElementById("map-container");
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

// פונקציה לאתחול ממשק המפה
function initMapInterface() {
  // הוסף את כל החדרים למפה
  for (var roomId in projectData.rooms) {
    var room = projectData.rooms[roomId];
    addRoomToMap(roomId, room.name);
  }
  
  // הוסף כפתורי פעולה למפה
  document.getElementById("add-map-room").addEventListener("click", function() {
    document.getElementById("add-room-modal").style.display = "block";
  });
  
  document.getElementById("create-connection").addEventListener("click", startConnectionCreation);
  document.getElementById("remove-connection").addEventListener("click", startConnectionRemoval);
  
  // עדכן את הקשרים
  updateMapConnections();
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

// פונקציה להוספת חידה חדשה
function addNewPuzzle() {
  var puzzleType = document.getElementById("new-puzzle-type").value;
  var puzzleName = document.getElementById("new-puzzle-name").value;
  
  // צור מזהה ייחודי
  var puzzleId = puzzleType + "-puzzle-" + (new Date().getTime());
  
  // יצירת חידה חדשה על פי הסוג
  var newPuzzle = createEmptyPuzzle(puzzleType, puzzleId, puzzleName);
  
  // הוסף את החידה לנתוני הפרויקט
  projectData.puzzles[puzzleId] = newPuzzle;
  
  // הוסף את החידה לרשימת החידות
  addPuzzleToList(puzzleId, puzzleName);
  
  // סגור את המודאל
  document.getElementById("add-puzzle-modal").style.display = "none";
  document.getElementById("new-puzzle-name").value = "חידה חדשה";
  
  // עדכן את האפשרויות בתפריטים של חידות מקושרות
  updatePuzzleSelectors();
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
  safePuzzleSelect.innerHTML = '<option value="">ללא</option>';
  
  // עדכן את תפריט החידות במחשב
  var computerPuzzleSelect = document.getElementById("computer-puzzle");
  computerPuzzleSelect.innerHTML = '<option value="">ללא</option>';
  
  // עדכן את תפריט החידות בדלת
  var doorPuzzleSelect = document.getElementById("door-required-puzzle");
  doorPuzzleSelect.innerHTML = '<option value="">ללא</option>';
  
  // הוסף את כל החידות הקיימות
  for (var puzzleId in projectData.puzzles) {
    var puzzle = projectData.puzzles[puzzleId];
    
    var optionSafe = document.createElement("option");
    optionSafe.value = puzzleId;
    optionSafe.textContent = puzzle.name;
    safePuzzleSelect.appendChild(optionSafe);
    
    var optionComputer = document.createElement("option");
    optionComputer.value = puzzleId;
    optionComputer.textContent = puzzle.name;
    computerPuzzleSelect.appendChild(optionComputer);
    
    var optionDoor = document.createElement("option");
    optionDoor.value = puzzleId;
    optionDoor.textContent = puzzle.name;
    doorPuzzleSelect.appendChild(optionDoor);
  }
}

// פונקציה להצגת עורך החידה
function showPuzzleEditor(puzzleId) {
  var puzzle = projectData.puzzles[puzzleId];
  if (!puzzle) return;
  
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
  formsContainer.innerHTML = "";
  
  // צור את טופס העריכה המתאים לסוג החידה
  var puzzleForm = createPuzzleForm(puzzle);
  formsContainer.appendChild(puzzleForm);
}

// פונקציה ליצירת טופס עריכה לחידה
function createPuzzleForm(puzzle) {
  var formWrapper = document.createElement("div");
  formWrapper.className = "puzzle-form";
  
  var formHeader = document.createElement("h4");
  formHeader.textContent = "עריכת " + puzzle.name;
  formWrapper.appendChild(formHeader);
  
  // יצירת שדה לשם החידה
  var nameGroup = document.createElement("div");
  nameGroup.className = "form-group";
  
  var nameLabel = document.createElement("label");
  nameLabel.textContent = "שם החידה:";
  nameLabel.setAttribute("for", "puzzle-name-" + puzzle.id);
  nameGroup.appendChild(nameLabel);
  
  var nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.id = "puzzle-name-" + puzzle.id;
  nameInput.value = puzzle.name;
  nameInput.addEventListener("change", function() {
    puzzle.name = this.value;
    
    // עדכן את שם החידה ברשימה
    var puzzleItem = document.querySelector('.puzzle-list-item[data-puzzle-id="' + puzzle.id + '"]');
    if (puzzleItem) {
      puzzleItem.textContent = this.value;
    }
    
    // עדכן את שם החידה בתפריטי הבחירה
    updatePuzzleSelectors();
  });
  nameGroup.appendChild(nameInput);
  formWrapper.appendChild(nameGroup);
  
  // הוסף שדות נוספים בהתאם לסוג החידה
  switch (puzzle.type) {
    case "code":
      addCodePuzzleFields(formWrapper, puzzle);
      break;
      
    case "text":
      addTextPuzzleFields(formWrapper, puzzle);
      break;
      
    case "sequence":
      addSequencePuzzleFields(formWrapper, puzzle);
      break;
      
    case "matching":
      addMatchingPuzzleFields(formWrapper, puzzle);
      break;
      
    case "arrange":
      addArrangePuzzleFields(formWrapper, puzzle);
      break;
      
    case "search":
      addSearchPuzzleFields(formWrapper, puzzle);
      break;
      
    case "assembly":
      addAssemblyPuzzleFields(formWrapper, puzzle);
      break;
  }
  
  // הוסף כפתור מחיקה
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

// פונקציה להוספת שדות לחידת קוד
function addCodePuzzleFields(form, puzzle) {
  // שדה תיאור
  var descGroup = document.createElement("div");
  descGroup.className = "form-group";
  
  var descLabel = document.createElement("label");
  descLabel.textContent = "תיאור החידה:";
  descLabel.setAttribute("for", "code-desc-" + puzzle.id);
  descGroup.appendChild(descLabel);
  
  var descInput = document.createElement("textarea");
  descInput.id = "code-desc-" + puzzle.id;
  descInput.rows = "3";
  descInput.value = puzzle.description || "";
  descInput.addEventListener("change", function() {
    puzzle.description = this.value;
  });
  descGroup.appendChild(descInput);
  form.appendChild(descGroup);
  
  // שדה תשובה
  var answerGroup = document.createElement("div");
  answerGroup.className = "form-group";
  
  var answerLabel = document.createElement("label");
  answerLabel.textContent = "הקוד הנכון:";
  answerLabel.setAttribute("for", "code-answer-" + puzzle.id);
  answerGroup.appendChild(answerLabel);
  
  var answerInput = document.createElement("input");
  answerInput.type = "text";
  answerInput.id = "code-answer-" + puzzle.id;
  answerInput.value = puzzle.answer || "";
  answerInput.addEventListener("change", function() {
    puzzle.answer = this.value;
  });
  answerGroup.appendChild(answerInput);
  form.appendChild(answerGroup);
  
  // שדה רמז
  var hintGroup = document.createElement("div");
  hintGroup.className = "form-group";
  
  var hintLabel = document.createElement("label");
  hintLabel.textContent = "רמז:";
  hintLabel.setAttribute("for", "code-hint-" + puzzle.id);
  hintGroup.appendChild(hintLabel);
  
  var hintInput = document.createElement("input");
  hintInput.type = "text";
  hintInput.id = "code-hint-" + puzzle.id;
  hintInput.value = puzzle.hint || "";
  hintInput.addEventListener("change", function() {
    puzzle.hint = this.value;
  });
  hintGroup.appendChild(hintInput);
  form.appendChild(hintGroup);
  
  // שדה הודעת הצלחה
  var successGroup = document.createElement("div");
  successGroup.className = "form-group";
  
  var successLabel = document.createElement("label");
  successLabel.textContent = "הודעת הצלחה:";
  successLabel.setAttribute("for", "code-success-" + puzzle.id);
  successGroup.appendChild(successLabel);
  
  var successInput = document.createElement("input");
  successInput.type = "text";
  successInput.id = "code-success-" + puzzle.id;
  successInput.value = puzzle.successMessage || "";
  successInput.addEventListener("change", function() {
    puzzle.successMessage = this.value;
  });
  successGroup.appendChild(successInput);
  form.appendChild(successGroup);
}

// פונקציה להוספת שדות לחידת טקסט
function addTextPuzzleFields(form, puzzle) {
  // שדה שאלה
  var questionGroup = document.createElement("div");
  questionGroup.className = "form-group";
  
  var questionLabel = document.createElement("label");
  questionLabel.textContent = "שאלה:";
  questionLabel.setAttribute("for", "text-question-" + puzzle.id);
  questionGroup.appendChild(questionLabel);
  
  var questionInput = document.createElement("textarea");
  questionInput.id = "text-question-" + puzzle.id;
  questionInput.rows = "3";
  questionInput.value = puzzle.question || "";
  questionInput.addEventListener("change", function() {
    puzzle.question = this.value;
  });
  questionGroup.appendChild(questionInput);
  form.appendChild(questionGroup);
  
  // שדה תשובה
  var answerGroup = document.createElement("div");
  answerGroup.className = "form-group";
  
  var answerLabel = document.createElement("label");
  answerLabel.textContent = "תשובה נכונה:";
  answerLabel.setAttribute("for", "text-answer-" + puzzle.id);
  answerGroup.appendChild(answerLabel);
  
  var answerInput = document.createElement("input");
  answerInput.type = "text";
  answerInput.id = "text-answer-" + puzzle.id;
  answerInput.value = puzzle.answer || "";
  answerInput.addEventListener("change", function() {
    puzzle.answer = this.value;
  });
  answerGroup.appendChild(answerInput);
  form.appendChild(answerGroup);
  
  // שדה רמז
  var hintGroup = document.createElement("div");
  hintGroup.className = "form-group";
  
  var hintLabel = document.createElement("label");
  hintLabel.textContent = "רמז:";
  hintLabel.setAttribute("for", "text-hint-" + puzzle.id);
  hintGroup.appendChild(hintLabel);
  
  var hintInput = document.createElement("input");
  hintInput.type = "text";
  hintInput.id = "text-hint-" + puzzle.id;
  hintInput.value = puzzle.hint || "";
  hintInput.addEventListener("change", function() {
    puzzle.hint = this.value;
  });
  hintGroup.appendChild(hintInput);
  form.appendChild(hintGroup);
  
  // שדה הודעת הצלחה
  var successGroup = document.createElement("div");
  successGroup.className = "form-group";
  
  var successLabel = document.createElement("label");
  successLabel.textContent = "הודעת הצלחה:";
  successLabel.setAttribute("for", "text-success-" + puzzle.id);
  successGroup.appendChild(successLabel);
  
  var successInput = document.createElement("input");
  successInput.type = "text";
  successInput.id = "text-success-" + puzzle.id;
  successInput.value = puzzle.successMessage || "";
  successInput.addEventListener("change", function() {
    puzzle.successMessage = this.value;
  });
  successGroup.appendChild(successInput);
  form.appendChild(successGroup);
}

// פונקציה להוספת שדות לחידת רצף
function addSequencePuzzleFields(form, puzzle) {
  // שדה תיאור
  var descGroup = document.createElement("div");
  descGroup.className = "form-group";
  
  var descLabel = document.createElement("label");
  descLabel.textContent = "תיאור החידה:";
  descLabel.setAttribute("for", "sequence-desc-" + puzzle.id);
  descGroup.appendChild(descLabel);
  
  var descInput = document.createElement("textarea");
  descInput.id = "sequence-desc-" + puzzle.id;
  descInput.rows = "3";
  descInput.value = puzzle.description || "";
  descInput.addEventListener("change", function() {
    puzzle.description = this.value;
  });
  descGroup.appendChild(descInput);
  form.appendChild(descGroup);
  
  // רצף צעדים
  var sequenceGroup = document.createElement("div");
  sequenceGroup.className = "form-group";
  
  var sequenceLabel = document.createElement("label");
  sequenceLabel.textContent = "צעדים ברצף:";
  sequenceGroup.appendChild(sequenceLabel);
  
  var sequenceEditor = document.createElement("div");
  sequenceEditor.className = "sequence-editor";
  
  // הוסף את הצעדים הקיימים
  if (puzzle.sequence && puzzle.sequence.length > 0) {
    for (var i = 0; i < puzzle.sequence.length; i++) {
      var stepContainer = createSequenceStep(puzzle, i);
      sequenceEditor.appendChild(stepContainer);
    }
  }
  
  // כפתור להוספת צעד חדש
  var addStepBtn = document.createElement("button");
  addStepBtn.className = "btn";
  addStepBtn.textContent = "+ הוסף צעד";
  addStepBtn.addEventListener("click", function() {
    puzzle.sequence.push("צעד חדש");
    var stepContainer = createSequenceStep(puzzle, puzzle.sequence.length - 1);
    sequenceEditor.insertBefore(stepContainer, this);
  });
  sequenceEditor.appendChild(addStepBtn);
  
  sequenceGroup.appendChild(sequenceEditor);
  form.appendChild(sequenceGroup);
  
  // אפשרות לאיפוס בטעות
  var resetGroup = document.createElement("div");
  resetGroup.className = "form-group";
  
  var resetLabel = document.createElement("label");
  
  var resetCheckbox = document.createElement("input");
  resetCheckbox.type = "checkbox";
  resetCheckbox.id = "sequence-reset-" + puzzle.id;
  resetCheckbox.checked = puzzle.resetOnError || false;
  resetCheckbox.addEventListener("change", function() {
    puzzle.resetOnError = this.checked;
  });
  
  resetLabel.appendChild(resetCheckbox);
  resetLabel.appendChild(document.createTextNode(" איפוס הרצף בטעות"));
  resetLabel.setAttribute("for", "sequence-reset-" + puzzle.id);
  
  resetGroup.appendChild(resetLabel);
  form.appendChild(resetGroup);
  
  // שדה רמז
  var hintGroup = document.createElement("div");
  hintGroup.className = "form-group";
  
  var hintLabel = document.createElement("label");
  hintLabel.textContent = "רמז:";
  hintLabel.setAttribute("for", "sequence-hint-" + puzzle.id);
  hintGroup.appendChild(hintLabel);
  
  var hintInput = document.createElement("input");
  hintInput.type = "text";
  hintInput.id = "sequence-hint-" + puzzle.id;
  hintInput.value = puzzle.hint || "";
  hintInput.addEventListener("change", function() {
    puzzle.hint = this.value;
  });
  hintGroup.appendChild(hintInput);
  form.appendChild(hintGroup);
  
  // שדה הודעת הצלחה
  var successGroup = document.createElement("div");
  successGroup.className = "form-group";
  
  var successLabel = document.createElement("label");
  successLabel.textContent = "הודעת הצלחה:";
  successLabel.setAttribute("for", "sequence-success-" + puzzle.id);
  successGroup.appendChild(successLabel);
  
  var successInput = document.createElement("input");
  successInput.type = "text";
  successInput.id = "sequence-success-" + puzzle.id;
  successInput.value = puzzle.successMessage || "";
  successInput.addEventListener("change", function() {
    puzzle.successMessage = this.value;
  });
  successGroup.appendChild(successInput);
  form.appendChild(successGroup);
}

// פונקציה ליצירת צעד ברצף
function createSequenceStep(puzzle, index) {
  var stepContainer = document.createElement("div");
  stepContainer.className = "sequence-step";
  
  var stepInput = document.createElement("input");
  stepInput.type = "text";
  stepInput.value = puzzle.sequence[index];
  stepInput.addEventListener("change", function() {
    puzzle.sequence[index] = this.value;
  });
  stepContainer.appendChild(stepInput);
  
  var moveUpBtn = document.createElement("button");
  moveUpBtn.className = "btn btn-secondary";
  moveUpBtn.textContent = "↑";
  moveUpBtn.title = "הזז למעלה";
  moveUpBtn.style.marginRight = "5px";
  moveUpBtn.addEventListener("click", function() {
    if (index > 0) {
      // החלף את הצעד עם הצעד מעליו
      var temp = puzzle.sequence[index];
      puzzle.sequence[index] = puzzle.sequence[index - 1];
      puzzle.sequence[index - 1] = temp;
      
      // רענן את העורך
      var parent = stepContainer.parentNode;
      parent.innerHTML = "";
      
      for (var i = 0; i < puzzle.sequence.length; i++) {
        var newStepContainer = createSequenceStep(puzzle, i);
        parent.appendChild(newStepContainer);
      }
      
      // הוסף מחדש את כפתור הוספת הצעד
      var addStepBtn = document.createElement("button");
      addStepBtn.className = "btn";
      addStepBtn.textContent = "+ הוסף צעד";
      addStepBtn.addEventListener("click", function() {
        puzzle.sequence.push("צעד חדש");
        var newStep = createSequenceStep(puzzle, puzzle.sequence.length - 1);
        parent.insertBefore(newStep, this);
      });
      parent.appendChild(addStepBtn);
    }
  });
  stepContainer.appendChild(moveUpBtn);
  
  var moveDownBtn = document.createElement("button");
  moveDownBtn.className = "btn btn-secondary";
  moveDownBtn.textContent = "↓";
  moveDownBtn.title = "הזז למטה";
  moveDownBtn.style.marginRight = "5px";
  moveDownBtn.addEventListener("click", function() {
    if (index < puzzle.sequence.length - 1) {
      // החלף את הצעד עם הצעד מתחתיו
      var temp = puzzle.sequence[index];
      puzzle.sequence[index] = puzzle.sequence[index + 1];
      puzzle.sequence[index + 1] = temp;
      
      // רענן את העורך
      var parent = stepContainer.parentNode;
      parent.innerHTML = "";
      
      for (var i = 0; i < puzzle.sequence.length; i++) {
        var newStepContainer = createSequenceStep(puzzle, i);
        parent.appendChild(newStepContainer);
      }
      
      // הוסף מחדש את כפתור הוספת הצעד
      var addStepBtn = document.createElement("button");
      addStepBtn.className = "btn";
      addStepBtn.textContent = "+ הוסף צעד";
      addStepBtn.addEventListener("click", function() {
        puzzle.sequence.push("צעד חדש");
        var newStep = createSequenceStep(puzzle, puzzle.sequence.length - 1);
        parent.insertBefore(newStep, this);
      });
      parent.appendChild(addStepBtn);
    }
  });
  stepContainer.appendChild(moveDownBtn);
  
  var deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger";
  deleteBtn.textContent = "X";
  deleteBtn.title = "מחק צעד";
  deleteBtn.addEventListener("click", function() {
    // מחק את הצעד מהמערך
    puzzle.sequence.splice(index, 1);
    
    // רענן את העורך
    var parent = stepContainer.parentNode;
    parent.innerHTML = "";
    
    for (var i = 0; i < puzzle.sequence.length; i++) {
      var newStepContainer = createSequenceStep(puzzle, i);
      parent.appendChild(newStepContainer);
    }
    
    // הוסף מחדש את כפתור הוספת הצעד
    var addStepBtn = document.createElement("button");
    addStepBtn.className = "btn";
    addStepBtn.textContent = "+ הוסף צעד";
    addStepBtn.addEventListener("click", function() {
      puzzle.sequence.push("צעד חדש");
      var newStep = createSequenceStep(puzzle, puzzle.sequence.length - 1);
      parent.insertBefore(newStep, this);
    });
    parent.appendChild(addStepBtn);
  });
  stepContainer.appendChild(deleteBtn);
  
  return stepContainer;
}

// פונקציות להוספת שדות לסוגי החידות הנוספים יכולות להיות מוסיפות בהמשך

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
  document.getElementById("puzzle-forms-container").innerHTML = "";
  
 // עדכן את החידות המקושרות
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
}

// פונקציה להצגת עורך עמודי ספר
function displayBookPagesEditor(item) {
  var pagesEditor = document.getElementById("book-pages-editor");
  pagesEditor.innerHTML = "";
  
  // ודא שיש אובייקט עמודים
  if (!item.pages) {
    item.pages = { "1": "עמוד ראשון של הספר" };
  }
  
  // הוסף כל עמוד לעורך
  for (var pageNum in item.pages) {
    var pageContainer = document.createElement("div");
    pageContainer.className = "book-page";
    
    var pageHeader = document.createElement("div");
    pageHeader.className = "page-number";
    pageHeader.textContent = "עמוד " + pageNum;
    pageContainer.appendChild(pageHeader);
    
    var pageContent = document.createElement("textarea");
    pageContent.rows = "5";
    pageContent.value = item.pages[pageNum];
    pageContent.setAttribute("data-page", pageNum);
    pageContent.addEventListener("change", function() {
      var pageNumber = this.getAttribute("data-page");
      item.pages[pageNumber] = this.value;
    });
    pageContainer.appendChild(pageContent);
    
    pagesEditor.appendChild(pageContainer);
  }
  
  // כפתור שמירה
  document.getElementById("save-pages-btn").onclick = function() {
    document.getElementById("edit-pages-modal").style.display = "none";
  };
}

// פונקציה להצגת עורך תוכניות מחשב
function displayComputerProgramsEditor(item) {
  // ודא שיש אובייקט תוכניות
  if (!item.programs) {
    item.programs = {};
  }
  
  // רענן את רשימת התוכניות
  refreshProgramsList(item);
  
  // מאזיני אירועים לכפתורים
  document.getElementById("add-program-btn").onclick = function() {
    // הצג את טופס העריכה
    document.getElementById("program-form").style.display = "block";
    document.getElementById("program-name").value = "";
    document.getElementById("program-content").value = "";
    document.getElementById("program-action").value = "none";
    document.getElementById("program-target").value = "";
    
    // שמור את הפרטים של התוכנית החדשה
    selectedProgram = {
      id: "program-" + (new Date().getTime()),
      isNew: true
    };
  };
  
  document.getElementById("save-program-btn").onclick = function() {
    if (!selectedProgram) return;
    
    var programName = document.getElementById("program-name").value;
    var programContent = document.getElementById("program-content").value;
    var programAction = document.getElementById("program-action").value;
    var programTarget = document.getElementById("program-target").value;
    
    if (!programName) {
      alert("יש להזין שם לתוכנית");
      return;
    }
    
    // שמור את התוכנית במחשב
    item.programs[selectedProgram.id] = {
      name: programName,
      content: programContent,
      action: programAction,
      target: programTarget
    };
    
    // רענן את הרשימה
    refreshProgramsList(item);
    
    // הסתר את הטופס
    document.getElementById("program-form").style.display = "none";
    selectedProgram = null;
  };
}

// פונקציה לריענון רשימת התוכניות במחשב
function refreshProgramsList(item) {
  var programsList = document.getElementById("programs-list");
  programsList.innerHTML = "";
  
  // בדוק אם יש תוכניות
  if (Object.keys(item.programs).length === 0) {
    var emptyMsg = document.createElement("div");
    emptyMsg.textContent = "אין תוכניות. לחץ על הוסף תוכנית כדי ליצור את התוכנית הראשונה.";
    emptyMsg.style.padding = "10px";
    programsList.appendChild(emptyMsg);
    return;
  }
  
  // הוסף כל תוכנית לרשימה
  for (var programId in item.programs) {
    var program = item.programs[programId];
    
    var programItem = document.createElement("div");
    programItem.className = "program-item";
    programItem.setAttribute("data-program-id", programId);
    programItem.textContent = program.name;
    
    // אירוע לחיצה לעריכת התוכנית
    programItem.addEventListener("click", function() {
      var progId = this.getAttribute("data-program-id");
      var prog = item.programs[progId];
      
      // סמן את התוכנית הנבחרת
      var items = document.querySelectorAll(".program-item");
      for (var i = 0; i < items.length; i++) {
        items[i].classList.remove("active");
      }
      this.classList.add("active");
      
      // הצג את הטופס עם הפרטים
      document.getElementById("program-form").style.display = "block";
      document.getElementById("program-name").value = prog.name;
      document.getElementById("program-content").value = prog.content;
      document.getElementById("program-action").value = prog.action || "none";
      document.getElementById("program-target").value = prog.target || "";
      
      // שמור את הפרטים של התוכנית
      selectedProgram = {
        id: progId,
        isNew: false
      };
    });
    
    // כפתור מחיקה
    var deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger";
    deleteBtn.textContent = "X";
    deleteBtn.style.float = "left";
    deleteBtn.style.marginLeft = "5px";
    deleteBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      var programElement = this.parentNode;
      var progId = programElement.getAttribute("data-program-id");
      
      if (confirm("האם אתה בטוח שברצונך למחוק את התוכנית?")) {
        delete item.programs[progId];
        refreshProgramsList(item);
        
        // הסתר את הטופס אם התוכנית הנוכחית נמחקה
        if (selectedProgram && selectedProgram.id === progId) {
          document.getElementById("program-form").style.display = "none";
          selectedProgram = null;
        }
      }
    });
    
    programItem.appendChild(deleteBtn);
    programsList.appendChild(programItem);
  }
}

// פונקציה לשמירת הפרויקט
function saveProject() {
  try {
    // הוסף נתוני הייצוא
    projectData.settings.title = document.getElementById("game-title").value;
    projectData.settings.description = document.getElementById("game-description").value;
    projectData.settings.timeLimit = parseInt(document.getElementById("game-time-limit").value);
    
    // המר את הנתונים למחרוזת JSON
    var projectString = JSON.stringify(projectData);
    
    // שמור בזיכרון המקומי
    localStorage.setItem("escape-room-project", projectString);
    
    // אפשר גם להוריד כקובץ
    var projectBlob = new Blob([projectString], { type: "application/json" });
    var downloadLink = document.createElement("a");
    downloadLink.download = "escape-room-project.json";
    downloadLink.href = URL.createObjectURL(projectBlob);
    downloadLink.click();
    
    alert("הפרויקט נשמר בהצלחה!");
  } catch (error) {
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
        if (!loadedData.rooms || !loadedData.puzzles) {
          throw new Error("קובץ הפרויקט אינו תקין");
        }
        
        // החלף את הנתונים
        projectData = loadedData;
        
        // עדכן את החדר הנוכחי
        currentRoomId = Object.keys(projectData.rooms)[0];
        
        // עדכן את הממשק
        refreshUI();
        
        alert("הפרויקט נטען בהצלחה!");
      } catch (error) {
        alert("שגיאה בטעינת הפרויקט: " + error);
      }
    };
    
    reader.readAsText(file);
  };
  
  fileInput.click();
}

// פונקציה לריענון כל הממשק לאחר טעינת פרויקט
function refreshUI() {
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
  
  // עדכן את רשימת החידות
  var puzzleList = document.getElementById("puzzle-list");
  puzzleList.innerHTML = "";
  
  for (var puzzleId in projectData.puzzles) {
    var puzzle = projectData.puzzles[puzzleId];
    addPuzzleToList(puzzleId, puzzle.name);
  }
  
  // עדכן את נתוני הייצוא
  document.getElementById("game-title").value = projectData.settings.title;
  document.getElementById("game-description").value = projectData.settings.description;
  document.getElementById("game-time-limit").value = projectData.settings.timeLimit;
  
  // עדכן את החדר הנוכחי
  loadCurrentRoom();
  
  // עדכן את רשימת החידות בתפריטים
  updatePuzzleSelectors();
  
  // רענן את המפה
  document.getElementById("map-container").innerHTML = "";
  initMapInterface();
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
  // עדכן את נתוני הייצוא
  projectData.settings.title = document.getElementById("game-title").value;
  projectData.settings.description = document.getElementById("game-description").value;
  projectData.settings.timeLimit = parseInt(document.getElementById("game-time-limit").value);
  
  // אם פחות מ-10 דקות, עדכן ל-10 דקות כדי למנוע משחק קצר מדי
  if (projectData.settings.timeLimit < 10) {
    projectData.settings.timeLimit = 10;
    document.getElementById("game-time-limit").value = "10";
  }
  
  // בדוק תקינות בסיסית
  if (Object.keys(projectData.rooms).length === 0) {
    alert("לא ניתן לייצא משחק ללא חדרים!");
    return;
  }
  
  // טען את תבנית המשחק
  fetch('game-template.html')
    .then(response => response.text())
    .then(template => {
      // החלף את המקומות השמורים בתבנית
      var gameHTML = template
        .replace('{{GAME_TITLE}}', projectData.settings.title)
        .replace('{{GAME_DESCRIPTION}}', projectData.settings.description)
        .replace(/{{GAME_TIME_LIMIT}}/g, projectData.settings.timeLimit)
        .replace('{{GAME_DATA_JSON}}', JSON.stringify(projectData));
      
      // הצג את מודאל ייצוא המשחק
      document.getElementById("export-game-modal").style.display = "block";
      
      // הגדר אירוע לכפתור ההורדה
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

// אתחול המחולל בטעינת הדף
document.addEventListener("DOMContentLoaded", initGenerator);
