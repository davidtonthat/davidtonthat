// server.js (Express 4.0)
var express        = require('express');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var app            = express();

app.use(express.static(__dirname));
app.use(morgan('dev')); 					// log every request to the console
app.use(bodyParser()); 						// pull information from html in POST
app.use(methodOverride()); 				// simulate DELETE and PUT

var router = express.Router();

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
  {id: 4, familyId: 1, fullName: 'Gareth Harold Smith',  spouse: 'Iris Jane Higginbotham',parentID: 1},
  {id: 5, familyId: 1, fullName: 'Ian Jeremy Smith',     spouse: 'Kay Laura Winterburns', parentID: 2},
  {id: 6, familyId: 1, fullName: 'Kelvin Lance Wilson',  spouse: 'Michelle Nora Prague',  parentID: 3},
  {id: 7, familyId: 1, fullName: 'Michael Norman Wilson',spouse: 'Olivia Patience Smith', parentID: 3},
  {id: 8, familyId: 1, fullName: 'Oliver Patrick Smith', spouse: 'Queen Rachel Edwards', parentID: 4},
  {id: 9, familyId: 1, fullName: 'Quebec Rebecca Smith', spouse: 'Steven Trevor McQueen',parentID: 4},
  {id:10, familyId: 1, fullName: 'Simon Travis Smith',   spouse: 'Ursula Vanessa Rubens',parentID: 4},
  {id:11, familyId: 1, fullName: 'Katherine Lauren Smith',spouse: 'Morris Nathan Attenborough', parentID: 5},
  {id:12, familyId: 1, fullName: 'Olive Patricia Smith',  spouse: 'Quentin Romeo Xavier Guerredrat',parentID: 5},
  {id:13, familyId: 1, fullName: 'Stefan Timothy Smith',  spouse: 'Ursula Veronica Beckenbauer',parentID: 5},

  {id:20, familyId: 2, fullName: 'John Kelvin Baker',     spouse: 'Emily Gwen Willoughby', parentID: -1},
  {id:21, familyId: 2, fullName: 'Marvin Neil Baker',     spouse: 'Eileen Frances McMahon',parentID: 20},
  {id:22, familyId: 2, fullName: 'Oscar Patrick Baker',   spouse: 'Vanessa Wendy Wheeler', parentID: 20},
  {id:30, familyId: 3, fullName: 'Jinping Ming Wang',     spouse: 'Xueli Yingmei Chen-Li', parentID: -3},
  {id:40, familyId: 4, fullName: 'Clifford Derek Hutchinson', spouse: 'Eleanor Daphne Simmons', parentID: -2},
  {id:41, familyId: 4, fullName: 'Ellen Fiona Hutchinson',    spouse: 'Gavin Harold Smiley', parentID: 40},
  {id:42, familyId: 4, fullName: 'George Horatio Hutchinson', spouse: 'Iris Freda Halliday', parentID: 40},
  {id:43, familyId: 4, fullName: 'Ivan Jonathan Hutchinson',  spouse: 'Karen Lydia Ellison', parentID: 42},
  {id:44, familyId: 4, fullName: 'Kenneth Luke Hutchinson',   spouse: 'Michelle Nora Cook',  parentID: 43},
  {id:45, familyId: 4, fullName: 'Maurice Neville Hutchinson',spouse: 'Olive Prudence Baker',parentID: 44},
  {id:46, familyId: 4, fullName: 'Oscar Philip Hutchinson',   spouse: 'Alice Beatrice McKenzie',parentID: 45},
  {id:47, familyId: 4, fullName: 'Queen Rosalind Hutchinson', spouse: 'Randolph Sidney McDonald',parentID: 45}
];

router.get('/families', function(req, res) {
  res.send(families);
});

router.get('/members', function(req, res) {
  res.send(members);
});

router.post('/member/:familyId', function(req, res) {
  let personId = 0;
  // save member specified by req.params.familyId
  // and details specified in req.body
  res.send(personId);
});

router.post('/family/:name', function(req, res) {
  let familyId = 0;
  // save family name specified in req.params.name;
  // and desc specified in req.body
  res.send(familyId);
});

router.get('/note/:id', function(req, res) {
  for (var i = 0; i < notes.length; i++) {
    if (notes[i].id == req.params.id) {
      res.send(notes[i]);
      break;
    }
  }
  res.send({msg: 'Note not found'}, 404);
});

router.post('/login', function(req, res) {
  console.log('API login for ', req.body);
  let isLoggedIn = (req.body.username === 'guest') && (req.body.password === 'password');
  res.send({"isLoggedIn": isLoggedIn});
});

app.use('/api', router);

app.listen(8000);
console.log('Open http://localhost:8000 to access Familytrees app');
