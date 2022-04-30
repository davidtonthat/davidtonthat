// File: FamilyTrees/FamilyTreesApp.js

var prevFamilyID = 0;
var focalPointsMap = new Map();

angular.module('familyTrees', [])
  .controller('MainCtrl', ['$http', function($http) {
    var self = this;
    self.user = {};
    self.members = [];
    self.families = [];
    self.tab = 'first';
    self.isLoggedIn = false;
    self.selectedFamilyID = 1;

    $http.get('/api/families').then(function(response) {
      self.families = response.data;
      }, function(errResponse) {
      console.error('Error while fetching families from server.');
    });
    self.open = function(tab) {
      self.tab = tab;
      prevFamilyID = 0;
    };
    self.login = function() {
      $http.post('/api/login', self.user).then(
        function(resp) {
          self.isLoggedIn = resp.data.isLoggedIn;
      });
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
      $http.get('/api/members').then(function(response) {
        self.members = response.data;
        drawTree(setUpHierarchy(self.members.filter(m => m.familyId === self.selectedFamilyID)));
        prevFamilyID = self.selectedFamilyID;
        }, function(errResponse) {
        console.error('Error while fetching family members from server.');
      });
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
    let cousinFocuses  = new Map();
    let siblingFocuses = new Array();
    x = calcStart(generation);
    for (let [idx, person] of generation.entries()) {
      grContext.fillText(person.fullName + SPACES + person.spouse, x, y);
      if (focalPointsMap.has(person.id)) {
        saveParentsFocus(person, x, y);
        let pt = focalPointsMap.get(person.id);
        grContext.fillText('.', pt.x, pt.y);
      }
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
    let width = 0, person = null;
    for (let idx = 0; idx < generation.length; idx++) {
      person = generation[idx];
      width += widthOfCouple(person);
      if ((idx + 1 <= generation.length - 1) && (person.parentID !== generation[idx + 1].parentID)) break;
    }
    if (person.parentID > 0) {
      let ref = focalPointsMap.get(person.parentID);
      return ref.x - width/2;
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
