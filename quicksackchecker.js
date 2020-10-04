console.log('QuickSackChecker starting');

const admin = require('firebase-admin');
var serviceAccount = require("./filmsack-89483-firebase-adminsdk-1zgsp-028400e9e1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://filmsack-89483.firebaseio.com"
});

const db = admin.firestore();


var Twit = require('twit');
var config = require('./config');


var twit = new Twit(config);

// what to look for
var botname = "quicksack";
var keyword = "?sacked";
var hashtags = ['#filmsackfind'];

var stream = twit.stream('statuses/filter', { track: '@quicksack' });
// var stream = twit.stream('statuses/filter', { track: hashtags, language: 'en' });
// var hashtags = ['#filmsackfind'];

stream.on('tweet', question);

function question(tweet) {
  
  var msgID   = tweet.id_str;
  var msgTXT  = tweet.text.toLowerCase();
  var msgFROM = tweet.user.screen_name.toLowerCase();
  var msgAT   = tweet.in_reply_to_screen_name.toLowerCase();

  // looking for bot name
  if(msgTXT.startsWith("@" + botname)) {
    if(msgTXT.includes(keyword)) {

      filter = msgTXT.replace('@' + msgAT, '');
      filter = filter.replace(keyword, '');
      filter = filter.trim();

      console.log(filter);

      async function run(){
        const docRef = db.collection('user').doc('finding');

        await docRef.set({
          from: msgFROM,
          filter: filter
        });
      }

      run().catch(e => { console.error(e); process.exit(-1); })
          
      var answer = '@' + msgFROM + ' i guess you are looking for ' + filter + '.';
      answerIt(answer, msgID);

    } else {
      console.log('no keywords');
    }
  } else {
    console.log('no bot');
  }
}

function answerIt(txt, id) {
	var retweet = { 
      status: txt,
      in_reply_to_status_id: id,
	}
	twit.post('statuses/update', retweet, function(err, data, response) {
        console.log(".");
	})
	console.log(retweet);
}

