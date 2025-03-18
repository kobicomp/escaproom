// puzzles.js - ניהול סוגי החידות במחולל

import { projectData, currentRoomId, updateRoomsList } from './generator.js';

// מאגר סוגי החידות במשחק
const puzzleTypes = {
  code: {
    name: "חידת קוד",
    editorTemplate: "code-puzzle-editor",
    defaultProperties: {
      name: "חידת קוד חדשה",
      type: "code",
      description: "הזן את הקוד הנכון",
      answer: "1234",
      hint: "חפש רמזים בחדר...",
      successMessage: "הצלחת!",
      maxAttempts: 3,
      codeFormat: "numeric",
      codeLength: 4,
      failureMessage: "קוד שגוי, נסה שוב."
    }
  },
  text: {
    name: "חידת טקסט",
    editorTemplate: "text-puzzle-editor",
    defaultProperties: {
      name: "חידת טקסט חדשה",
      type: "text",
      question: "ענה על השאלה",
      answer: "תשובה",
      hint: "רמז...",
      successMessage: "תשובה נכונה!",
      caseSensitive: false,
      acceptableAnswers: [],
      partialMatch: false,
      failureMessage: "תשובה שגויה, נסה שוב."
    }
  },
  sequence: {
    name: "חידת רצף",
    editorTemplate: "sequence-puzzle-editor",
    defaultProperties: {
      name: "חידת רצף חדשה",
      type: "sequence",
      description: "לחץ על האלמנטים בסדר הנכון",
      sequence: ["element1", "element2", "element3", "element4"],
      elements: {},
      hint: "חשוב על סדר הפעולות...",
      successMessage: "הסדר נכון!",
      resetOnError: true,
      showProgress: true,
      failureMessage: "סדר שגוי, נסה שוב."
    }
  },
  matching: {
    name: "חידת התאמה",
    editorTemplate: "matching-puzzle-editor",
    defaultProperties: {
      name: "חידת התאמה חדשה",
      type: "matching",
      description: "התאם את הפריטים זה לזה",
      pairs: [],
      elements: {},
      matchMethod: "drag",
      hint: "חשוב על הקשרים הלוגיים...",
      successMessage: "כל ההתאמות נכונות!",
      showPartialSuccess: true,
      shuffleItems: true,
      failureMessage: "חלק מההתאמות שגויות."
    }
  },
  arrange: {
    name: "חידת סידור",
    editorTemplate: "arrange-puzzle-editor",
    defaultProperties: {
      name: "חידת סידור חדשה",
      type: "arrange",
      description: "סדר את הפריטים בסדר הנכון",
      items: [],
      correctPositions: [],
      toleranceRange: 20,
      allowRotation: false,
      hint: "חשוב על המיקום הנכון...",
      successMessage: "הסידור נכון!",
      backgroundImage: null,
      finalImage: null,
      failureMessage: "הסידור עדיין לא נכון."
    }
  },
  search: {
    name: "חידת חיפוש",
    editorTemplate: "search-puzzle-editor",
    defaultProperties: {
      name: "חידת חיפוש חדשה",
      type: "search",
      description: "מצא את כל הפריטים המוסתרים",
      items: [],
      locations: [],
      hint: "חפש היטב...",
      successMessage: "מצאת את כל הפריטים!",
      showItemList: true,
      markFoundItems: true,
      timeLimit: 0,
      requireAllItems: true
    }
  },
  assembly: {
    name: "חידת הרכבה",
    editorTemplate: "assembly-puzzle-editor",
    defaultProperties: {
      name: "חידת הרכבה חדשה",
      type: "assembly",
      description: "הרכב את המכשיר מהחלקים",
      parts: [],
      connections: [],
      assemblyOrder: [],
      finalState: null,
      hint: "חשוב כיצד החלקים מתחברים...",
      successMessage: "המכשיר הורכב בהצלחה!",
      snapToGrid: true,
      showGhostImage: true,
      strictOrder: false,
      failureMessage: "ההרכבה אינה מושלמת."
    }
  }
};

// פונקציה להוספת חידה חדשה
function addNewPuzzle() {
  var puzzleType = document.getElementById("new-puzzle-type").value;
  var puzzleName = document.getElementById("new-puzzle-name").value;
  
  // קבל את מאפייני ברירת המחדל מסוג החידה
  var puzzleTypeObj = puzzleTypes[puzzleType];
  
  if (!puzzleTypeObj) {
    console.error("סוג חידה לא קיים:", puzzleType);
    return;
  }
  
  // צור מזהה ייחודי
  var puzzleCount = Object.keys(projectData.puzzles).length;
  var newPuzzleId = puzzleType + "-puzzle-" + (puzzleCount + 1);
  
  // יצירת חידה חדשה עם מאפייני ברירת המחדל
  projectData.puzzles[newPuzzleId] = {
    id: newPuzzleId,
    name: puzzleName || puzzleTypeObj.defaultProperties.name,
    ...puzzleTypeObj.defaultProperties
  };
  
  // עדכן את רשימת החידות
  updatePuzzleList();
  
  // סגור את המודאל
  document.getElementById("add-puzzle-modal").style.display = "none";
  
  // הצג את טופס העריכה של החידה החדשה
  showPuzzleForm(newPuzzleId);
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
  switch (puzzle.type) {
    case 'code':
      var form = document.getElementById("code-puzzle-form");
      form.style.display = "block";
      document.getElementById("code-puzzle-name").value = puzzle.name;
      document.getElementById("code-puzzle-description").value = puzzle.description;
      document.getElementById("code-puzzle-answer").value = puzzle.answer;
      document.getElementById("code-puzzle-hint").value = puzzle.hint;
      document.getElementById("code-puzzle-success").value = puzzle.successMessage;
      document.getElementById("code-puzzle-max-attempts").value = puzzle.maxAttempts || 3;
      document.getElementById("code-puzzle-code-format").value = puzzle.codeFormat || "numeric";
      document.getElementById("code-puzzle-code-length").value = puzzle.codeLength || 4;
      document.getElementById("code-puzzle-failure").value = puzzle.failureMessage || "קוד שגוי, נסה שוב.";
      
      // קבע אירוע שמירה לטופס
      document.getElementById("save-code-puzzle").onclick = function() {
        savePuzzle(puzzleId, "code");
      };
      break;
      
    case 'text':
      var form = document.getElementById("text-puzzle-form");
      form.style.display = "block";
      document.getElementById("text-puzzle-name").value = puzzle.name;
      document.getElementById("text-puzzle-question").value = puzzle.question;
      document.getElementById("text-puzzle-answer").value = puzzle.answer;
      document.getElementById("text-puzzle-hint").value = puzzle.hint;
      document.getElementById("text-puzzle-success").value = puzzle.successMessage;
      document.getElementById("text-puzzle-case-sensitive").checked = puzzle.caseSensitive || false;
      document.getElementById("text-puzzle-acceptable-answers").value = (puzzle.acceptableAnswers || []).join(", ");
      document.getElementById("text-puzzle-partial-match").checked = puzzle.partialMatch || false;
      document.getElementById("text-puzzle-failure").value = puzzle.failureMessage || "תשובה שגויה, נסה שוב.";
      
      // קבע אירוע שמירה לטופס
      document.getElementById("save-text-puzzle").onclick = function() {
        savePuzzle(puzzleId, "text");
      };
      break;
      
    case 'sequence':
      // הטופס של חידת רצף
      var form = document.getElementById("sequence-puzzle-form");
      if (form) {
        form.style.display = "block";
        
        // מילוי הטופס בנתוני החידה
        document.getElementById("sequence-puzzle-name").value = puzzle.name;
        document.getElementById("sequence-puzzle-description").value = puzzle.description;
        document.getElementById("sequence-puzzle-hint").value = puzzle.hint;
        document.getElementById("sequence-puzzle-success").value = puzzle.successMessage;
        document.getElementById("sequence-puzzle-reset-on-error").checked = puzzle.resetOnError || true;
        document.getElementById("sequence-puzzle-show-progress").checked = puzzle.showProgress || true;
        document.getElementById("sequence-puzzle-failure").value = puzzle.failureMessage || "סדר שגוי, נסה שוב.";
        
        // עדכון אלמנטי הרצף
        updateSequenceElements(puzzle);
        
        // קבע אירוע שמירה לטופס
        document.getElementById("save-sequence-puzzle").onclick = function() {
          savePuzzle(puzzleId, "sequence");
        };
      }
      break;
      
    case 'matching':
      // הטופס של חידת התאמה
      var form = document.getElementById("matching-puzzle-form");
      if (form) {
        form.style.display = "block";
        
        // מילוי הטופס בנתוני החידה
        document.getElementById("matching-puzzle-name").value = puzzle.name;
        document.getElementById("matching-puzzle-description").value = puzzle.description;
        document.getElementById("matching-puzzle-hint").value = puzzle.hint;
        document.getElementById("matching-puzzle-success").value = puzzle.successMessage;
        document.getElementById("matching-puzzle-match-method").value = puzzle.matchMethod || "drag";
        document.getElementById("matching-puzzle-show-partial").checked = puzzle.showPartialSuccess || true;
        document.getElementById("matching-puzzle-shuffle").checked = puzzle.shuffleItems || true;
        document.getElementById("matching-puzzle-failure").value = puzzle.failureMessage || "חלק מההתאמות שגויות.";
        
        // עדכון זוגות ההתאמה
        updateMatchingPairs(puzzle);
        
        // קבע אירוע שמירה לטופס
        document.getElementById("save-matching-puzzle").onclick = function() {
          savePuzzle(puzzleId, "matching");
        };
      }
      break;
      
    // ועוד סוגי חידות אחרים...
  }
  
  // סמן את החידה הנוכחית ברשימת החידות
  var puzzleItems = document.querySelectorAll(".puzzle-list-item");
  for (var i = 0; i < puzzleItems.length; i++) {
    puzzleItems[i].classList.remove("active");
    if (puzzleItems[i].getAttribute("data-puzzle-id") === puzzleId) {
      puzzleItems[i].classList.add("active");
    }
  }
}

// עדכון אלמנטי רצף בטופס חידת רצף
function updateSequenceElements(puzzle) {
  var elementsContainer = document.getElementById("sequence-elements-container");
  
  if (!elementsContainer) return;
  
  // נקה את התוכן הקיים
  elementsContainer.innerHTML = "";
  
  // הוסף את האלמנטים לרצף
  for (var i = 0; i < puzzle.sequence.length; i++) {
    var elementId = puzzle.sequence[i];
    var element = puzzle.elements[elementId] || { label: elementId };
    
    var elementDiv = document.createElement("div");
    elementDiv.className = "sequence-element";
    elementDiv.innerHTML = `
      <div class="element-order">${i+1}</div>
      <input type="text" class="element-label" value="${element.label}" data-element-id="${elementId}">
      <button type="button" class="btn btn-danger element-remove" data-index="${i}">הסר</button>
    `;
    
    elementsContainer.appendChild(elementDiv);
  }
  
  // הוסף כפתור להוספת אלמנט
  var addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "btn";
  addButton.textContent = "+ הוסף אלמנט";
  addButton.onclick = function() {
    puzzle.sequence.push("element" + (puzzle.sequence.length + 1));
    updateSequenceElements(puzzle);
  };
  
  elementsContainer.appendChild(addButton);
  
  // הוסף מאזיני אירועים לכפתורי הסרה ושדות עריכה
  var removeButtons = elementsContainer.querySelectorAll(".element-remove");
  for (var i = 0; i < removeButtons.length; i++) {
    removeButtons[i].addEventListener("click", function() {
      var index = parseInt(this.getAttribute("data-index"));
      puzzle.sequence.splice(index, 1);
      updateSequenceElements(puzzle);
    });
  }
  
  var labelInputs = elementsContainer.querySelectorAll(".element-label");
  for (var i = 0; i < labelInputs.length; i++) {
    labelInputs[i].addEventListener("change", function() {
      var elementId = this.getAttribute("data-element-id");
      if (!puzzle.elements[elementId]) puzzle.elements[elementId] = {};
      puzzle.elements[elementId].label = this.value;
    });
  }
}

// עדכון זוגות התאמה בטופס חידת התאמה
function updateMatchingPairs(puzzle) {
  var pairsContainer = document.getElementById("matching-pairs-container");
  
  if (!pairsContainer) return;
  
  // נקה את התוכן הקיים
  pairsContainer.innerHTML = "";
  
  // הוסף את זוגות ההתאמה
  for (var i = 0; i < puzzle.pairs.length; i++) {
    var pair = puzzle.pairs[i];
    
    var pairDiv = document.createElement("div");
    pairDiv.className = "matching-pair";
    pairDiv.innerHTML = `
      <input type="text" class="pair-left" value="${pair.left}" placeholder="פריט שמאל">
      <span class="pair-arrow">⟷</span>
      <input type="text" class="pair-right" value="${pair.right}" placeholder="פריט ימין">
      <button type="button" class="btn btn-danger pair-remove" data-index="${i}">הסר</button>
    `;
    
    pairsContainer.appendChild(pairDiv);
  }
  
  // הוסף כפתור להוספת זוג
  var addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "btn";
  addButton.textContent = "+ הוסף זוג";
  addButton.onclick = function() {
    puzzle.pairs.push({ left: "", right: "" });
    updateMatchingPairs(puzzle);
  };
  
  pairsContainer.appendChild(addButton);
  
  // הוסף מאזיני אירועים לכפתורי הסרה ושדות עריכה
  var removeButtons = pairsContainer.querySelectorAll(".pair-remove");
  for (var i = 0; i < removeButtons.length; i++) {
    removeButtons[i].addEventListener("click", function() {
      var index = parseInt(this.getAttribute("data-index"));
      puzzle.pairs.splice(index, 1);
      updateMatchingPairs(puzzle);
    });
  }
  
  var leftInputs = pairsContainer.querySelectorAll(".pair-left");
  var rightInputs = pairsContainer.querySelectorAll(".pair-right");
  
  for (var i = 0; i < leftInputs.length; i++) {
    leftInputs[i].addEventListener("change", function() {
      var index = Array.from(leftInputs).indexOf(this);
      puzzle.pairs[index].left = this.value;
    });
    
    rightInputs[i].addEventListener("change", function() {
      var index = Array.from(rightInputs).indexOf(this);
      puzzle.pairs[index].right = this.value;
    });
  }
}

// פונקציה לשמירת חידה
function savePuzzle(puzzleId, type) {
  switch (type) {
    case 'code':
      projectData.puzzles[puzzleId] = {
        id: puzzleId,
        name: document.getElementById("code-puzzle-name").value,
        type: "code",
        description: document.getElementById("code-puzzle-description").value,
        answer: document.getElementById("code-puzzle-answer").value,
        hint: document.getElementById("code-puzzle-hint").value,
        successMessage: document.getElementById("code-puzzle-success").value,
        maxAttempts: parseInt(document.getElementById("code-puzzle-max-attempts").value) || 3,
        codeFormat: document.getElementById("code-puzzle-code-format").value,
        codeLength: parseInt(document.getElementById("code-puzzle-code-length").value) || 4,
        failureMessage: document.getElementById("code-puzzle-failure").value
      };
      break;
      
    case 'text':
      projectData.puzzles[puzzleId] = {
        id: puzzleId,
        name: document.getElementById("text-puzzle-name").value,
        type: "text",
        question: document.getElementById("text-puzzle-question").value,
        answer: document.getElementById("text-puzzle-answer").value,
        hint: document.getElementById("text-puzzle-hint").value,
        successMessage: document.getElementById("text-puzzle-success").value,
        caseSensitive: document.getElementById("text-puzzle-case-sensitive").checked,
        acceptableAnswers: document.getElementById("text-puzzle-acceptable-answers").value.split(",").map(item => item.trim()).filter(item => item),
        partialMatch: document.getElementById("text-puzzle-partial-match").checked,
        failureMessage: document.getElementById("text-puzzle-failure").value
      };
      break;
      
    case 'sequence':
      // שמור את הערכים מהטופס
      var puzzle = projectData.puzzles[puzzleId];
      
      puzzle.name = document.getElementById("sequence-puzzle-name").value;
      puzzle.description = document.getElementById("sequence-puzzle-description").value;
      puzzle.hint = document.getElementById("sequence-puzzle-hint").value;
      puzzle.successMessage = document.getElementById("sequence-puzzle-success").value;
      puzzle.resetOnError = document.getElementById("sequence-puzzle-reset-on-error").checked;
      puzzle.showProgress = document.getElementById("sequence-puzzle-show-progress").checked;
      puzzle.failureMessage = document.getElementById("sequence-puzzle-failure").value;
      
      // הערכים של הרצף ואלמנטים כבר מתעדכנים באופן דינמי
      break;
      
    case 'matching':
      // שמור את הערכים מהטופס
      var puzzle = projectData.puzzles[puzzleId];
      
      puzzle.name = document.getElementById("matching-puzzle-name").value;
      puzzle.description = document.getElementById("matching-puzzle-description").value;
      puzzle.hint = document.getElementById("matching-puzzle-hint").value;
      puzzle.successMessage = document.getElementById("matching-puzzle-success").value;
      puzzle.matchMethod = document.getElementById("matching-puzzle-match-method").value;
      puzzle.showPartialSuccess = document.getElementById("matching-puzzle-show-partial").checked;
      puzzle.shuffleItems = document.getElementById("matching-puzzle-shuffle").checked;
      puzzle.failureMessage = document.getElementById("matching-puzzle-failure").value;
      
      // הזוגות כבר מתעדכנים באופן דינמי
      break;
      
    // ועוד סוגי חידות אחרים...
  }
  
  // עדכן את רשימת החידות
  updatePuzzleList();
  
  alert("החידה נשמרה בהצלחה!");
}

// פונקציה למחיקת חידה
function deletePuzzle(puzzleId) {
  if (confirm("האם אתה בטוח שברצונך למחוק את החידה?")) {
    delete projectData.puzzles[puzzleId];
    updatePuzzleList();
    
    // הסתר את הטופס הנוכחי
    var puzzleForms = document.querySelectorAll(".puzzle-form");
    for (var i = 0; i < puzzleForms.length; i++) {
      puzzleForms[i].style.display = "none";
    }
  }
}

// פונקציה לעדכון רשימת החידות
function updatePuzzleList() {
  var puzzleList = document.querySelector(".puzzle-list");
  
  if (!puzzleList) return;
  
  // שמור את החידה הנוכחית
  var activeId = "";
  var activeItem = puzzleList.querySelector(".puzzle-list-item.active");
  if (activeItem) {
    activeId = activeItem.getAttribute("data-puzzle-id");
  }
  
  // נקה את הרשימה
  puzzleList.innerHTML = "";
  
  // הוסף את כל החידות
  for (var puzzleId in projectData.puzzles) {
    var puzzle = projectData.puzzles[puzzleId];
    
    var div = document.createElement("div");
    div.className = "puzzle-list-item" + (puzzleId === activeId ? " active" : "");
    div.setAttribute("data-puzzle-id", puzzleId);
    div.textContent = puzzle.name + " (" + getPuzzleTypeName(puzzle.type) + ")";
    
    div.addEventListener("click", function() {
      showPuzzleForm(this.getAttribute("data-puzzle-id"));
    });
    
    puzzleList.appendChild(div);
  }
  
  // עדכן את רשימת החידות בתפריטים
  updatePuzzlesInMenus();
}

// פונקציה לקבלת שם מקוצר לסוג חידה
function getPuzzleTypeName(type) {
  var types = {
    "code": "קוד",
    "text": "טקסט",
    "sequence": "רצף",
    "matching": "התאמה",
    "arrange": "סידור",
    "search": "חיפוש",
    "assembly": "הרכבה"
  };
  
  return types[type] || type;
}

// פונקציה לעדכון רשימת החידות בכל התפריטים
function updatePuzzlesInMenus() {
  var puzzleSelects = document.querySelectorAll(".puzzle-select");
  
  puzzleSelects.forEach(function(select) {
    // שמור את הערך הנוכחי
    var currentValue = select.value;
    
    // נקה את הבחירה הנוכחית
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
    
    // הוסף אפשרות ריקה
    var emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "ללא";
    select.appendChild(emptyOption);
    
    // הוסף את כל החידות
    for (var puzzleId in projectData.puzzles) {
      var puzzle = projectData.puzzles[puzzleId];
      var option = document.createElement("option");
      option.value = puzzleId;
      option.textContent = puzzle.name;
      select.appendChild(option);
    }
    
    // שחזר את הערך הנוכחי אם אפשר
    if (currentValue) {
      select.value = currentValue;
    }
  });
}

// הגדרת מאזיני אירועים לטפסי עריכת החידות
function setupPuzzleEditors() {
  // אירוע לחיצה על כפתור הוספת חידה
  document.getElementById("add-puzzle-btn").addEventListener("click", function() {
    document.getElementById("add-puzzle-modal").style.display = "block";
  });
  
  // אירוע לחיצה על כפתור יצירת חידה חדשה
  document.getElementById("create-puzzle-btn").addEventListener("click", addNewPuzzle);
  
  // אירוע לחיצה על כפתורי מחיקת חידה
  var deleteButtons = document.querySelectorAll(".delete-puzzle-btn");
  for (var i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener("click", function() {
      var puzzleForm = this.closest(".puzzle-form");
      var puzzleId = puzzleForm.getAttribute("data-puzzle-id");
      deletePuzzle(puzzleId);
    });
  }
}

// אתחול סוגי החידות
function initPuzzleTypes() {
  console.log("אתחול סוגי החידות...");
  
  // הכן את הטפסים של כל סוגי החידות
  
  // עדכן את רשימת החידות אם יש כאלה
  updatePuzzleList();
}

// ייצוא פונקציות לשימוש במודולים אחרים
export {
  puzzleTypes,
  addNewPuzzle,
  showPuzzleForm,
  savePuzzle,
  updatePuzzleList,
  setupPuzzleEditors,
  initPuzzleTypes
};
