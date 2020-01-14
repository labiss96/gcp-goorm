var router = require('express').Router();
var dateFormat = require('dateformat');

//firebase admin을 이용한 접속(초기화)방법
//이미 로컬에서 firebase login으로 서버에 접속이 되어있으므로 기존의 apikey 필요x
const admin = require('firebase-admin');
// const functions = require('firebase-functions');
// admin.initializeApp(functions.config().firebase);
const serviceAccount = require('../goorm-project-4d10e-firebase-adminsdk-saz81-5c5408836d.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'goorm-project-4d10e'
});



var db = admin.firestore();

const wrap = asyncFn => {
    return (async (req, res, next) => {
        try {
            return await asyncFn(req, res, next)
        } catch (error) {
            return next(error)
        }
    })  
}

router.get('/goormList', wrap(async function(req, res, next) {
    var rows = [];
    await db.collection('goorm').orderBy("grmRegDate","desc").get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                var childData = doc.data();
                childData.grmRegDate = dateFormat(childData.grmRegDate,"yyyy-mm-dd");
                childData.brdName = childData.grmBrand._path.segments[1];
                 rows.push(childData);
            });
            
        }).catch((err) => {
            console.log('Error getting documents', err);
        });

        res.render('goorm/goormList', {rows: rows});
}));
 
router.get('/goormDetail', async function(req, res, next) {
    await db.collection('goorm').doc(req.query.grmNo).get()
        .then((doc) => {
            var childData = doc.data();
             
            childData.grmRegDate = dateFormat(childData.grmRegDate,"yyyy-mm-dd hh:mm");
            childData.brdName = childData.grmBrand._path.segments[1];
            res.render('goorm/goormDetail', {row: childData});
        }).catch((err) => { console.log('Error getting documents', err); });
});
 
router.get('/goormForm', async function(req,res,next){

    
    // brand 종류 db에서 가져옴
    var brands = [];
    await db.collection('brand').orderBy("brdRegDate","desc").get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            brands.push(doc.data());
        });
    }).catch((err) => { console.log('Error getting documents', err); });

    // new
    if (!req.query.grmNo) {
        res.render('goorm/goormForm', {row:"", brands:brands});
        return;
    }
     
    // update
    db.collection('goorm').doc(req.query.grmNo).get()
          .then((doc) => {
              var childData = doc.data();
              res.render('goorm/goormForm', {row: childData, brands:brands });
          })
});

router.get('/brandForm', function(req, res, next) {
    if(!req.query.brdNo) { //new
        res.render('goorm/brandForm', {row:""});
        return;
    }

    // update
    db.collection('brand').doc(req.query.brdNo).get()
          .then((doc) => {
              var childData = doc.data();
              res.render('goorm/brandForm', {row: childData});
          })
});
 
router.post('/goormSave', async function(req,res,next){
    var postData = req.body;
    var brandRef = postData.grmBrand;

    // await db.collection('brand').doc(brandRef).get()
    // .then( function(){ 
    //     postData.grmBrand = db.doc(`brand/${brandRef}`).ref;
    //     console.log('참조값 성공적으로 저장.');        
    // }).catch((err) => { console.log('Error getting documents', err); });
    console.log(brandRef);
    // postData.grmBrand = db.doc(`brand/${brandRef}`).ref;
    // postData.grmBrand = db.doc('brand/dunhil').ref;
    
    //postData.grmBrand = db.collection('brand').doc('dunhil');
    postData.grmBrand = await db.collection('brand').doc(brandRef);
    
    console.log(postData.grmBrand);
    if (!postData.grmNo) { // new
        postData.grmRegDate = Date.now();
        var doc = db.collection("goorm").doc();
        postData.grmNo = doc.id;
        postData.grmScore = 0;


        await doc.set(postData).catch((err)=> {
            console.log(err);
        });
    }else {               // update
        var doc = db.collection("goorm").doc(postData.grmNo);
        await doc.update(postData);
    }
     
    res.redirect('goormList');
});

router.post('/brandSave',function(req,res,next){
    var postData = req.body;
    if (!postData.brdNo) { // new
        postData.brdRegDate = Date.now();
        var doc = db.collection("brand").doc(postData.brdName);
        postData.brdNo = doc.id;
        doc.set(postData);
    } else {               // update
        var doc = db.collection("brand").doc(postData.brdNo);
        doc.update(postData);
    }
     
    res.redirect('goormList');
});
 
router.get('/goormDelete',async function(req,res,next){
    await db.collection('goorm').doc(req.query.grmNo).delete()
 
    res.redirect('goormList');
});

router.get('/brandDelete',async function(req,res,next){
    await db.collection('brand').doc(req.query.brdNo).delete()
 
    res.redirect('/');
});



 
module.exports = router;