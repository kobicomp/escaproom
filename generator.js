// objects.js - ניהול סוגי האובייקטים במחולל

import { projectData, currentRoomId, selectedItem, loadCurrentRoom, hideAllPropertyPanels, fileToDataURL } from './generator.js';

// מאגר סוגי האובייקטים במשחק
const objectTypes = {
  safe: {
    name: "כספת",
    width: 60,
    height: 60,
    defaultProperties: {
      puzzle: "",
      locked: false,
      requiredItem: null,
      correctCode: "1234",
      content: ""
    },
    propertyPanel: "safe-properties"
  },
  key: {
    name: "מפתח",
    width: 40,
    height: 40,
    defaultProperties: {
      keyType: "regular",
      oneTimeUse: true,
      hint: ""
    },
    propertyPanel: "key-properties"
  },
 book: {
    name: "ספר",
    width: 50,
    height: 40,
    defaultProperties: {
      content: "טקסט הספר כאן...",
      style: "regular",
      hiddenHint: "",
      requiresItem: null
    },
    propertyPanel: "book-properties"
  },
  computer: {
    name: "מחשב",
    width: 50,
    height: 50,
    defaultProperties: {
      puzzle: "",
      locked: false,
      password: "",
      offScreenText: "המחשב כבוי",
      onScreenText: "המחשב פעיל",
      programs: {}
    },
    propertyPanel: "computer-properties"
  },
  info: {
    name: "הערת מידע",
    width: 150,
    height: 80,
    defaultProperties: {
      infoText: "לחץ לקריאת המידע",
      displayStyle: "popup",
      autoShow: false,
      showOnce: false,
      fontSize: 14,
      textColor: "#000000"
    },
    propertyPanel: "info-properties"
  },
  door: {
    name: "דלת/יציאה",
    width: 80,
    height: 120,
    defaultProperties: {
      nextRoom: "",
      locked: false,
      requiredItem: null,
      requiredPuzzle: null,
      message: ""
    },
    propertyPanel: "door-properties"
  }
};

// פונקציה להוספת אובייקט חדש
function addNewItem(type) {
  // צור מזהה ייחודי
  var itemCount = Object.keys(projectData.rooms[currentRoomId].items).length;
  var newItemId = "item" + (itemCount + 1);
  
  // קבל את מאפייני ברירת המחדל מסוג האובייקט
  var objectType = objectTypes[type];
  
  if (!objectType) {
    console.error("סוג אובייקט לא קיים:", type);
    return;
  }
  
  // יצירת אובייקט חדש עם שילוב של מאפיינים בסיסיים ומאפיינים ספציפיים לסוג
  projectData.rooms[currentRoomId].items[newItemId] = {
    id: newItemId,
    name: objectType.name,
    type: type,
    x: 200,
    y: 200,
    width: objectType.width,
    height: objectType.height,
    image: null,
    ...objectType.defaultProperties
  };
  
  // טען מחדש את החדר
  loadCurrentRoom();
}

// פונקציה להצגת תכונות של אובייקט נבחר
function showItemProperties(itemId) {
  var item = projectData.rooms[currentRoomId].items[itemId];
  if (!item) return;
  
  // הסתר את כל הפאנלים של התכונות
  hideAllPropertyPanels();
  
  // הצג את פאנל התכונות הבסיסי
  document.getElementById("object-properties").style.display = "block";
  
  // מלא את הערכים בטופס הבסיסי
  document.getElementById("object-name").value = item.name;
  document.getElementById("object-width").value = item.width;
  document.getElementById("object-height").value = item.height;
  
  // איפוס שדה העלאת התמונה
  document.getElementById("object-image").value = "";
  
  // הצג את פאנל התכונות המתאים לסוג האובייקט
  var objectType = objectTypes[item.type];
  if (objectType && objectType.propertyPanel) {
    var panel = document.getElementById(objectType.propertyPanel);
    if (panel) {
      panel.style.display = "block";
      
      // מלא את התכונות הספציפיות לסוג האובייקט
      switch (item.type) {
        case 'safe':
          document.getElementById("object-puzzle").value = item.puzzle || "";
          document.getElementById("object-locked").checked = item.locked;
          document.getElementById("object-required-item").value = item.requiredItem || "";
          document.getElementById("safe-code").value = item.correctCode || "";
          document.getElementById("safe-content").value = item.content || "";
          break;
          
        case 'key':
          document.getElementById("key-type").value = item.keyType || "regular";
          document.getElementById("key-one-time").checked = item.oneTimeUse;
          document.getElementById("key-hint").value = item.hint || "";
          break;
          
        case 'book':
          document.getElementById("book-content").value = item.content || "";
          document.getElementById("book-style").value = item.style || "regular";
          document.getElementById("book-hidden-hint").value = item.hiddenHint || "";
          document.getElementById("book-requires-item").value = item.requiresItem || "";
          break;
          
        case 'computer':
          document.getElementById("object-puzzle").value = item.puzzle || "";
          document.getElementById("object-locked").checked = item.locked;
          document.getElementById("computer-password").value = item.password || "";
          document.getElementById("computer-off-text").value = item.offScreenText || "";
          document.getElementById("computer-on-text").value = item.onScreenText || "";
          break;
          
        case 'info':
          document.getElementById("info-text").value = item.infoText || "";
          document.getElementById("info-display-style").value = item.displayStyle || "popup";
          document.getElementById("info-auto-show").checked = item.autoShow || false;
          document.getElementById("info-show-once").checked = item.showOnce || false;
          document.getElementById("info-font-size").value = item.fontSize || 14;
          document.getElementById("info-text-color").value = item.textColor || "#000000";
          break;
          
        case 'door':
          document.getElementById("door-next-room").value = item.nextRoom || "";
          document.getElementById("door-locked").checked = item.locked;
          document.getElementById("door-required-item").value = item.requiredItem || "";
          document.getElementById("door-required-puzzle").value = item.requiredPuzzle || "";
          document.getElementById("door-message").value = item.message || "";
          break;
      }
    }
  }
  
  // הסתר את ההודעה "לא נבחר אובייקט"
  document.getElementById("no-object-selected").style.display = "none";
}

// פונקציה למחיקת אובייקט נבחר
function deleteSelectedItem() {
  if (selectedItem) {
    var itemId = selectedItem.element.id;
    delete projectData.rooms[currentRoomId].items[itemId];
    
    // טען מחדש את החדר
    loadCurrentRoom();
    
    // הסתר את תכונות האובייקט
    hideAllPropertyPanels();
    document.getElementById("no-object-selected").style.display = "block";
    
    selectedItem = null;
  }
}

// הגדרת מאזיני אירועים לשדות מיוחדים של סוגי האובייקטים
function setupObjectListeners() {
  // אירועי לחיצה על אובייקטי הגלריה
  var thumbnails = document.querySelectorAll(".object-thumbnail");
  for (var i = 0; i < thumbnails.length; i++) {
    thumbnails[i].addEventListener("click", function() {
      var type = this.getAttribute("data-type");
      addNewItem(type);
    });
  }
  
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
  
  // אירוע מחיקת אובייקט
  document.getElementById("delete-object-btn").addEventListener("click", deleteSelectedItem);
  
  // אירועי העלאת תמונת אובייקט
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
  
  // הוסף מאזיני אירועים לכל שדות התכונות של האובייקטים השונים
  setupSafeProperties();
  setupKeyProperties();
  setupBookProperties();
  setupComputerProperties();
  setupInfoProperties();
  setupDoorProperties();
}

// הגדרת מאזיני אירועים לתכונות כספת
function setupSafeProperties() {
  document.getElementById("object-puzzle").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "safe") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].puzzle = this.value || null;
    }
  });
  
  document.getElementById("object-locked").addEventListener("change", function() {
    if (selectedItem && (selectedItem.element.getAttribute("data-type") === "safe" || selectedItem.element.getAttribute("data-type") === "computer")) {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].locked = this.checked;
    }
  });
  
  document.getElementById("object-required-item").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "safe") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].requiredItem = this.value || null;
    }
  });
  
  document.getElementById("safe-code").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "safe") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].correctCode = this.value;
    }
  });
  
  document.getElementById("safe-content").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "safe") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].content = this.value;
    }
  });
}

// הגדרת מאזיני אירועים לתכונות מפתח
function setupKeyProperties() {
  document.getElementById("key-type").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "key") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].keyType = this.value;
    }
  });
  
  document.getElementById("key-one-time").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "key") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].oneTimeUse = this.checked;
    }
  });
  
  document.getElementById("key-hint").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "key") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].hint = this.value;
    }
  });
}

// הגדרת מאזיני אירועים לתכונות ספר
function setupBookProperties() {
  document.getElementById("book-content").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "book") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].content = this.value;
    }
  });
  
  document.getElementById("book-style").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "book") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].style = this.value;
    }
  });
  
  document.getElementById("book-hidden-hint").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "book") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].hiddenHint = this.value;
    }
  });
  
  document.getElementById("book-requires-item").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "book") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].requiresItem = this.value || null;
    }
  });
}

// הגדרת מאזיני אירועים לתכונות מחשב
function setupComputerProperties() {
  document.getElementById("computer-password").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "computer") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].password = this.value;
    }
  });
  
  document.getElementById("computer-off-text").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "computer") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].offScreenText = this.value;
    }
  });
  
  document.getElementById("computer-on-text").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "computer") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].onScreenText = this.value;
    }
  });
}

// הגדרת מאזיני אירועים לתכונות הערת מידע
function setupInfoProperties() {
  document.getElementById("info-text").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "info") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].infoText = this.value;
    }
  });
  
  document.getElementById("info-display-style").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "info") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].displayStyle = this.value;
    }
  });
  
  document.getElementById("info-auto-show").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "info") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].autoShow = this.checked;
    }
  });
  
  document.getElementById("info-show-once").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "info") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].showOnce = this.checked;
    }
  });
  
  document.getElementById("info-font-size").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "info") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].fontSize = parseInt(this.value);
    }
  });
  
  document.getElementById("info-text-color").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "info") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].textColor = this.value;
    }
  });
}

// הגדרת מאזיני אירועים לתכונות דלת/יציאה
function setupDoorProperties() {
  document.getElementById("door-next-room").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "door") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].nextRoom = this.value;
    }
  });
  
  document.getElementById("door-locked").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "door") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].locked = this.checked;
    }
  });
  
  document.getElementById("door-required-item").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "door") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].requiredItem = this.value || null;
    }
  });
  
  document.getElementById("door-required-puzzle").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "door") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].requiredPuzzle = this.value || null;
    }
  });
  
  document.getElementById("door-message").addEventListener("change", function() {
    if (selectedItem && selectedItem.element.getAttribute("data-type") === "door") {
      var itemId = selectedItem.element.id;
      projectData.rooms[currentRoomId].items[itemId].message = this.value;
    }
  });
}

// אתחול סוגי האובייקטים
function initObjectTypes() {
  console.log("אתחול סוגי האובייקטים...");
  // הכן את פאנלי התכונות לכל סוגי האובייקטים
}

// ייצוא פונקציות לשימוש במודולים אחרים
export {
  objectTypes,
  addNewItem,
  showItemProperties,
  setupObjectListeners,
  initObjectTypes
};
