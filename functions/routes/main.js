const router = require('express').Router();
const admin = require('firebase-admin');

const serviceAccount = require('../goorm-project-4d10e-firebase-adminsdk-saz81-5c5408836d.json');

var secondaryAppConfig = {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'goorm-project-4d10e'
  };

var secondary = admin.initializeApp(secondaryAppConfig, "secondary")
var secondaryDB = secondary.firestore();

router.get('/', async (req, res) => {
    var rows = [];
    await secondaryDB.collection('goorm').orderBy("grmRegDate","desc").get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            var childData = doc.data();
            childData.brdName = childData.grmBrand._path.segments[1];
             rows.push(childData);
        });
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
    res.render('main', {title : "Goorm Project", rows: rows});
});

router.get('/login', (req,res, next) => {
    res.render('accounts/login');
});

router.post('/loginChk', (req, res, next) => {

    admin.auth().signInWithEmailAndPassword(req.body.id, req.body.passwd)
    .then(function(firebaseUser) {
        res.redirect('boardList');
    })
    .catch(function(error) {
        res.redirect('loginForm');
    });   


    admin.auth().getUserByEmail(email)
    .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully fetched user data:', userRecord.toJSON());
    })
    .catch(function(error) {
    console.log('Error fetching user data:', error);
    });
})

module.exports = router;