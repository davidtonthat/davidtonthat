// File: FamilyTrees/FamilyTreesApp.js

var families = [
  {id: 1, name: 'Smith', description: 'Most common English name'},
  {id: 2, name: 'Baker', description: 'Another common English name'},
  {id: 3, name: 'Wang', description: 'Most common Chinese name'},
  {id: 4, name: 'Hutchinson', description: 'Made up name for app testing'},
];

var members = [
  {id: 1, familyId: 1, fullName: 'Adam Benjamin Smith', spouse: 'Eve Frances Smith', parentID: 0},
  {id: 2, familyId: 1, fullName: 'Charles Derek Smith', spouse: 'Elaine Florence Smith', parentID: 1},
  {id: 3, familyId: 1, fullName: 'Eleanor Felicity Smith', spouse: 'Gavin Henry Wilson', parentID: 1},
  {id: 4, familyId: 1, fullName: 'Gareth Harold Smith', spouse: 'Iris Jane Higginbotham',parentID: 1},
  {id: 5, familyId: 1, fullName: 'Ian Jeremy Smith',    spouse: 'Kay Laura Winterburns', parentID: 2},
  {id: 6, familyId: 1, fullName: 'Kelvin Lance Wilson', spouse: 'Michelle Nora Prague',  parentID: 3},
  {id: 7, familyId: 1, fullName: 'Michael Norman Wilson',spouse: 'Olivia Patience Smith',parentID: 3},
  {id: 8, familyId: 1, fullName: 'Oliver Patrick Smith', spouse: 'Queen Rachel Edwards', parentID: 4},
  {id: 9, familyId: 1, fullName: 'Quebec Rebecca Smith', spouse: 'Steven Trevor McQueen',parentID: 4},
  {id:10, familyId: 1, fullName: 'Simon Travis Smith',   spouse: 'Ursula Vanessa Rubens',parentID: 4},

  {id:11, familyId: 2, fullName: 'John Kelvin Baker', spouse: 'Emily Gwen Willoughby', parentID: -1},
  {id:12, familyId: 4, fullName: 'Clifford Derek Hutchinson', spouse: 'Eleanor Daphne Simmons', parentID: -2},
  {id:13, familyId: 4, fullName: 'Ellen Fiona Hutchinson',    spouse: 'Gavin Harold Smiley', parentID: 12},
  {id:14, familyId: 4, fullName: 'George Horatio Hutchinson', spouse: 'Iris Freda Halliday', parentID: 12}
];

var prevFamilyID = 0;
var focalPointsMap = new Map();

angular.module('familyTrees', [])
  .controller('MainCtrl', [function() {
    var self = this;
    self.tab = 'first';
    self.isLoggedIn = false;
    self.families = families;
    self.selectedFamilyID = 1;

    self.open = function(tab) {
      self.tab = tab;
      prevFamilyID = 0;
    };
    self.login = function() {
      console.log('User: ', self.user);
      self.isLoggedIn = (self.user.username === 'guest') && (self.user.password === 'password');
      if (!self.isLoggedIn) {
        let invalid = (self.user.username !== 'guest');
        document.getElementById('usenameErrorMsg').innerHTML = invalid ? 'Incorrect Username' : '';
        invalid = (self.user.password !== 'password');
        document.getElementById('pwdErrorMsg').innerHTML = invalid ? 'Invalid password' : '';
      }
    }
    self.displayTree = function() {
      if (self.selectedFamilyID === prevFamilyID) return;
      focalPointsMap.clear();
      drawTree(setUpHierarchy(members.filter(m => m.familyId === self.selectedFamilyID)));
      prevFamilyID = self.selectedFamilyID;
    }
  }]);

function setUpHierarchy(familyMembers) {
  let ancestor = familyMembers[0],
      generation = [ancestor];
  let generations = [];

  while (generation.length > 0) {
    generations.push(generation);
    let nextGeneration = [];
    for (let person of generation) {
      let children = familyMembers.filter(m => m.parentID === person.id);
      nextGeneration.push(children);
      if (children.length > 0)
          focalPointsMap.set(person.id, {});
    }
    generation = Array.from(nextGeneration.flat());
  }
  return generations;
}

function drawTree(generations) {
  const LEADING = 40, GAP = 20, SPACES = "  ";
  const CANVAS_WIDTH = 1400, CANVAS_HEIGHT = 650;
  const grContext = initGraphics();

  let x = 0, y = LEADING;
  grContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let generation of generations) {
    x = calcStart(generation);
    for (let person of generation) {
      grContext.fillText(person.fullName + SPACES + person.spouse, x, y);
      if (focalPointsMap.has(person.id)) {
          saveParentsFocus(person, x, y);
          let pt = focalPointsMap.get(person.id);
          grContext.fillText('.', pt.x, pt.y);
        }
      x += widthOfCouple(person);
    }
    y += LEADING;
  }
  x = 0, y = LEADING;
  for (let generation of generations) {
    let cousinFocuses  = new Map();
    let siblingFocuses = new Array();
    x = calcStart(generation);
    for (let [idx, person] of generation.entries()) {
      if (person.parentID > 0) {
        let {x1, y1} = drawVertLineAbove(person, x, y);
        siblingFocuses.push({"x": x1, "y": y1});
      }
      let otherParent = (idx + 1 <= generation.length - 1) && (person.parentID !== generation[idx + 1].parentID);
      if ((idx === generation.length - 1) || otherParent) {
        cousinFocuses.set(person.parentID, siblingFocuses);
        siblingFocuses = [];
      }
      x += widthOfCouple(person);
    }
    y += LEADING;
    let parentIds = new Set(cousinFocuses.keys());
    for (let parentId of parentIds) {
      let midPts = cousinFocuses.get(parentId);
      console.log(parentId);
      console.log(midPts);
      joinChildrenToParents(parentId, midPts);
    }
  }

  function initGraphics() {
    let canvas  = document.getElementById("treeCanvas");
    let context = canvas.getContext("2d");
    context.font = "8pt Helvetica";
    return context;
  }
  function widthOfCouple(person) {
    let text = (person.fullName + SPACES + person.spouse);
    return grContext.measureText(text).width + GAP;
  }
  function calcStart(generation) {
    let width = 0;
    for (let person of generation) {
      width += widthOfCouple(person);
    }
    return (CANVAS_WIDTH - width)/2;
  }
  function saveParentsFocus(parent, x, y) {
    focalPointsMap.set(parent.id, {"x": x + widthOfCouple(parent)/2, "y": y + LEADING/5});
  }
  function drawVertLineAbove(person, x, y) {
    grContext.strokeStyle = "#a9a9a9";   // dark grey
    grContext.beginPath();
    let x1 = x + widthOfCouple(person)/2, y1 = y - LEADING/4;
    grContext.moveTo(x1, y1);
    grContext.lineTo(x1, y1 -= LEADING/5);
    grContext.stroke();
    return {x1, y1};
  }
  function joinChildrenToParents(parentId, midPoints) {
    if (midPoints === undefined || midPoints.length === 0) return;
    let pt1 = midPoints[0], pt2 = midPoints[midPoints.length - 1];
    grContext.strokeStyle = "#a9a9a9";   // dark grey
    grContext.beginPath();
    grContext.moveTo(pt1.x, pt1.y);
    grContext.lineTo(pt2.x, pt2.y);
    grContext.stroke();
    let ctr = {"x": (pt1.x + pt2.x)/2, "y": pt1.y};
    let dst = focalPointsMap.get(parentId);
    grContext.strokeStyle = "#00ced1";   // dark turquoise
    grContext.beginPath();
    grContext.moveTo(ctr.x, ctr.y);
    grContext.lineTo(dst.x, dst.y);
    grContext.stroke();
  }
}
