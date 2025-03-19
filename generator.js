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
      console.log("מוסיף חידה לאובייקט:", item.puzzle);
      itemElement.setAttribute("data-puzzle", item.puzzle);
    }
    if (item.locked) {
      itemElement.setAttribute("data-locked", "true");
    }
    if (item.requiredItem) {
      itemElement.setAttribute("data-required-item", item.requiredItem);
    }
    if (item.nextRoom) {
      itemElement.setAttribute("data-next-room", item.nextRoom);
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
  var nextRoomSelect = document.getElementById("object-next-room");
  if (!nextRoomSelect) {
    console.log("אלמנט object-next-room לא נמצא, דילוג על עדכון יעדים");
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
  var puzzleElement = document.getElementById("object-puzzle");
  var lockedElement = document.getElementById("object-locked");
  var requiredItemElement = document.getElementById("object-required-item");
  var nextRoomElement = document.getElementById("object-next-room");

  if (nameElement) nameElement.value = item.name;
  if (widthElement) widthElement.value = item.width;
  if (heightElement) heightElement.value = item.height;
  
  // עדכן את תפריט בחירת החידות
  if (puzzleElement) {
    // נקה את התפריט קודם
    puzzleElement.innerHTML = '<option value="">ללא</option>';
    
    // הוסף את כל החידות
    for (var puzzleId in projectData.puzzles) {
      var puzzle = projectData.puzzles[puzzleId];
      var option = document.createElement("option");
      option.value = puzzleId;
      option.textContent = puzzle.name;
      puzzleElement.appendChild(option);
    }
    
    // בחר את החידה המקושרת
    puzzleElement.value = item.puzzle || "";
  }
  
  if (lockedElement) lockedElement.checked = item.locked || false;
  if (requiredItemElement) requiredItemElement.value = item.requiredItem || "";
  if (nextRoomElement) nextRoomElement.value = item.nextRoom || "";

  // איפוס שדה העלאת התמונה
  var objectImageElement = document.getElementById("object-image");
  if (objectImageElement) objectImageElement.value = "";
}

// פונקציה להוספת אובייקט חדש
// פונקציה להוספת אובייקט חדש
function addNewItem(type) {
  console.log("מוסיף אובייקט חדש מסוג:", type);

  // צור מזהה ייחודי
  var itemCount = Object.keys(projectData.rooms[currentRoomId].items).length;
  var newItemId = "item" + (new Date().getTime());

  // הגדר מידות ברירת מחדל לפי הסוג
  var width = 50, height = 50;
  var name = "";
  var puzzleId = null;

  switch (type) {
    case "safe":
      width = 60;
      height = 60;
      name = "כספת";
      // בדוק אם יש חידת קוד קיימת
      for (var id in projectData.puzzles) {
        if (projectData.puzzles[id].type === "code") {
          puzzleId = id;
          break;
        }
      }
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
      // בדוק אם יש חידת טקסט קיימת
      for (var id in projectData.puzzles) {
        if (projectData.puzzles[id].type === "text") {
          puzzleId = id;
          break;
        }
      }
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
    image: null,
    puzzle: puzzleId,
    locked: false,
    requiredItem: null,
    nextRoom: null
  };

  // הוסף את האובייקט לנתוני החדר
  projectData.rooms[currentRoomId].items[newItemId] = newItem;

  // טען מחדש את החדר
  loadCurrentRoom();

  console.log("אובייקט חדש נוסף בהצלחה:", newItemId, "עם חידה:", puzzleId);
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

// פונקציה ליצירת טפסי חידות
function createPuzzleForms() {
  // שים לב שהטפסים כבר קיימים ב-HTML
  setupPuzzleFormEvents();
}

// פונקציה להגדרת אירועים לטפסי החידות
// פונקציה להגדרת אירועים לטפסי החידות
function setupPuzzleFormEvents() {
  console.log("מגדיר אירועים לטפסי חידות");

  // אנחנו מגדירים את אירועי השמירה דינמית בפונקציה showPuzzleForm
  // כאשר פותחים חידה לעריכה, כדי שידעו לשמור את החידה הנכונה

  // אירועי לחיצה על פריטי רשימת החידות
  var puzzleListItems = document.querySelectorAll(".puzzle-list-item");
  for (var i = 0; i < puzzleListItems.length; i++) {
    puzzleListItems[i].addEventListener("click", function() {
      var puzzleId = this.getAttribute("data-puzzle-id");
      showPuzzleForm(puzzleId);
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

  // אירועי חידה מקושרת
  var objectPuzzleSelect = document.getElementById("object-puzzle");
  if (objectPuzzleSelect) {
    objectPuzzleSelect.addEventListener("change", function() {
      if (selectedItem) {
        var itemId = selectedItem.element.id;
        projectData.rooms[currentRoomId].items[itemId].puzzle = this.value;
      }
    });
  }

  // אירועי נעילת אובייקט
  var objectLockedInput = document.getElementById("object-locked");
  if (objectLockedInput) {
    objectLockedInput.addEventListener("change", function() {
      if (selectedItem) {
        var itemId = selectedItem.element.id;
        projectData.rooms[currentRoomId].items[itemId].locked = this.checked;
      }
    });
  }

  // אירועי פריט נדרש
  var objectRequiredItemSelect = document.getElementById("object-required-item");
  if (objectRequiredItemSelect) {
    objectRequiredItemSelect.addEventListener("change", function() {
      if (selectedItem) {
        var itemId = selectedItem.element.id;
        projectData.rooms[currentRoomId].items[itemId].requiredItem = this.value;
      }
    });
  }

  // אירועי מעבר לחדר
  var objectNextRoomSelect = document.getElementById("object-next-room");
  if (objectNextRoomSelect) {
    objectNextRoomSelect.addEventListener("change", function() {
      if (selectedItem) {
        var itemId = selectedItem.element.id;
        projectData.rooms[currentRoomId].items[itemId].nextRoom = this.value;
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

  // אירועי לחיצה על פריטי רשימת החידות
  var puzzleListItems = document.querySelectorAll(".puzzle-list-item");
  for (var i = 0; i < puzzleListItems.length; i++) {
    puzzleListItems[i].addEventListener("click", function() {
      var puzzleId = this.getAttribute("data-puzzle-id");
      showPuzzleForm(puzzleId);
    });
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

// פונקציה להצגת טופס חידה
// פונקציה להצגת טופס חידה
function showPuzzleForm(puzzleId) {
  // הסתר את כל טפסי החידות
  var puzzleForms = document.querySelectorAll(".puzzle-form");
  for (var i = 0; i < puzzleForms.length; i++) {
    puzzleForms[i].style.display = "none";
  }

  var puzzle = projectData.puzzles[puzzleId];
  if (!puzzle) {
    console.error("חידה לא נמצאה:", puzzleId);
    return;
  }

  // הצג את הטופס המתאים
  var formId = "";
  if (puzzle.type === "code") {
    formId = "code-puzzle-form";
    var nameInput = document.getElementById("code-puzzle-name");
    var descInput = document.getElementById("code-puzzle-description");
    var answerInput = document.getElementById("code-puzzle-answer");
    var hintInput = document.getElementById("code-puzzle-hint");
    var successInput = document.getElementById("code-puzzle-success");

    if (nameInput) nameInput.value = puzzle.name || "";
    if (descInput) descInput.value = puzzle.description || "";
    if (answerInput) answerInput.value = puzzle.answer || "";
    if (hintInput) hintInput.value = puzzle.hint || "";
    if (successInput) successInput.value = puzzle.successMessage || "";
    
    // עדכן את פונקציות השמירה לשמור את החידה הנוכחית
    var saveBtn = document.getElementById("save-code-puzzle");
    if (saveBtn) {
      saveBtn.onclick = function() {
        puzzle.name = nameInput.value;
        puzzle.description = descInput.value;
        puzzle.answer = answerInput.value;
        puzzle.hint = hintInput.value;
        puzzle.successMessage = successInput.value;
        
        // עדכן את תצוגת רשימת החידות
        var puzzleItem = document.querySelector('.puzzle-list-item[data-puzzle-id="' + puzzleId + '"]');
        if (puzzleItem) {
          puzzleItem.textContent = puzzle.name;
        }
        
        alert("החידה נשמרה בהצלחה!");
      };
    }
  } else if (puzzle.type === "text") {
    formId = "text-puzzle-form";
    var nameInput = document.getElementById("text-puzzle-name");
    var questionInput = document.getElementById("text-puzzle-question");
    var answerInput = document.getElementById("text-puzzle-answer");
    var hintInput = document.getElementById("text-puzzle-hint");
    var successInput = document.getElementById("text-puzzle-success");

    if (nameInput) nameInput.value = puzzle.name || "";
    if (questionInput) questionInput.value = puzzle.question || "";
    if (answerInput) answerInput.value = puzzle.answer || "";
    if (hintInput) hintInput.value = puzzle.hint || "";
    if (successInput) successInput.value = puzzle.successMessage || "";
    
    // עדכן את פונקציות השמירה לשמור את החידה הנוכחית
    var saveBtn = document.getElementById("save-text-puzzle");
    if (saveBtn) {
      saveBtn.onclick = function() {
        puzzle.name = nameInput.value;
        puzzle.question = questionInput.value;
        puzzle.answer = answerInput.value;
        puzzle.hint = hintInput.value;
        puzzle.successMessage = successInput.value;
        
        // עדכן את תצוגת רשימת החידות
        var puzzleItem = document.querySelector('.puzzle-list-item[data-puzzle-id="' + puzzleId + '"]');
        if (puzzleItem) {
          puzzleItem.textContent = puzzle.name;
        }
        
        alert("החידה נשמרה בהצלחה!");
      };
    }
  }

  // הצג את הטופס
  var form = document.getElementById(formId);
  if (form) {
    form.style.display = "block";
  } else {
    console.error("טופס החידה לא נמצא:", formId);
  }
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
  var newPuzzle = {
    id: puzzleId,
    name: puzzleName,
    type: puzzleType
  };

  // הוסף תכונות מיוחדות לפי הסוג
  switch (puzzleType) {
    case "code":
      newPuzzle.description = "מצא את הקוד הנכון";
      newPuzzle.answer = "1234";
      newPuzzle.hint = "חפש רמזים בחדר...";
      newPuzzle.successMessage = "הקוד נכון! הכספת נפתחה.";
      break;

    case "text":
      newPuzzle.question = "ענה על השאלה הבאה";
      newPuzzle.answer = "התשובה";
      newPuzzle.hint = "רמז לתשובה";
      newPuzzle.successMessage = "תשובה נכונה!";
      break;
  }

  // הוסף את החידה לנתוני הפרויקט
  projectData.puzzles[puzzleId] = newPuzzle;

  // הוסף את החידה לרשימה
  var puzzleList = document.getElementById("puzzle-list");
  if (puzzleList) {
    var puzzleItem = document.createElement("div");
    puzzleItem.className = "puzzle-list-item";
    puzzleItem.setAttribute("data-puzzle-id", puzzleId);
    puzzleItem.textContent = puzzleName;
    puzzleItem.addEventListener("click", function() {
      var id = this.getAttribute("data-puzzle-id");
      showPuzzleForm(id);
    });
    puzzleList.appendChild(puzzleItem);
  }

  // סגור את המודאל
  var addPuzzleModal = document.getElementById("add-puzzle-modal");
  if (addPuzzleModal) {
    addPuzzleModal.style.display = "none";
  }

  // עדכן את תפריטי בחירת החידות
  var puzzleSelectElements = document.querySelectorAll("select[id$='puzzle']");
  for (var i = 0; i < puzzleSelectElements.length; i++) {
    var select = puzzleSelectElements[i];
    var option = document.createElement("option");
    option.value = puzzleId;
    option.textContent = puzzleName;
    select.appendChild(option);
  }

  // פתח את הטופס לעריכת החידה החדשה
  showPuzzleForm(puzzleId);

  alert("חידה חדשה נוספה בהצלחה!");
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
      var puzzleItem = document.createElement("div");
      puzzleItem.className = "puzzle-list-item";
      puzzleItem.setAttribute("data-puzzle-id", puzzleId);
      puzzleItem.textContent = puzzle.name;
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

  if (gameTitleInput) gameTitleInput.value = projectData.settings.title;
  if (gameDescriptionInput) gameDescriptionInput.value = projectData.settings.description;
  if (gameTimeLimitInput) gameTimeLimitInput.value = projectData.settings.timeLimit;

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
  console.log("מייצא משחק...");
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
      // הוסף דיבאג לקובץ המיוצא
      console.log("Game data for export:", projectData);
      
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
  
  // צור חידת קוד לדוגמה
  var demoCodePuzzleId = "code-puzzle-" + (new Date().getTime());
  projectData.puzzles[demoCodePuzzleId] = {
    id: demoCodePuzzleId,
    name: "חידת קוד - כספת",
    type: "code",
    description: "מצא את הקוד לפתיחת הכספת!",
    answer: "1234",
    hint: "חפש רמזים בחדר...",
    successMessage: "הכספת נפתחה!"
  };
  
  // צור אובייקט כספת עם חידה מקושרת
  var demoItemId = "item" + (new Date().getTime());
  projectData.rooms[currentRoomId].items[demoItemId] = {
    id: demoItemId,
    name: "כספת",
    type: "safe",
    x: 200,
    y: 300,
    width: 60,
    height: 60,
    image: null,
    puzzle: demoCodePuzzleId,  // קשר לחידה
    locked: false,
    requiredItem: null
  };
  


    projectData.rooms[currentRoomId].items[demoItemId] = {
      id: demoItemId,
      name: "כספת",
      type: "safe",
      x: 200,
      y: 300,
      width: 60,
      height: 60,
      image: null,
      puzzle: "code-puzzle",
      locked: false,
      requiredItem: null
    };
    
    // הוסף חידת קוד לדוגמה
    projectData.puzzles["code-puzzle"] = {
      id: "code-puzzle",
      name: "חידת קוד - כספת",
      type: "code",
      description: "מצא את הקוד לפתיחת הכספת!",
      answer: "1234",
      hint: "חפש רמזים בחדר...",
      successMessage: "הכספת נפתחה!"
    };
    console.log("נוספה חידת קוד:", demoCodePuzzleId);
  console.log("נוסף אובייקט כספת עם חידה מקושרת:", demoItemId);
  }

  // אתחול המחולל
  initGenerator();
});
