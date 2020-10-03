console.log('QuickSackChecker starting');

var Twit = require('twit');
var config = require('./config');
var execPhp = require('exec-php');
var mysql = require('mysql');
var db = require('./debe');

var T = new Twit(config);

// what to look for
var botname = "quicksack";
var keyword = "?sacked";

var stream = T.stream('statuses/filter', { track: '@quicksack' });

stream.on('tweet', question);

function question(eventMsg) {
  
  var msgID   = eventMsg.id_str;
  var msgTXT  = eventMsg.text.toLowerCase();
  var msgFROM = eventMsg.user.screen_name.toLowerCase();
  var msgAT   = eventMsg.in_reply_to_screen_name.toLowerCase();

  if(msgTXT.startsWith("@" + botname)) {
    if(msgTXT.includes(keyword)) {

      execPhp('/var/www/quicksack.li/quicktrigger.php');

      filter = msgTXT.replace('@' + msgAT, '');
      filter = filter.replace(keyword, '');
      filter = filter.trim();
      console.log(filter);
	  
var con = mysql.createConnection(db);

con.connect(function(err) {
 
  var querystring = "SELECT * FROM qsEpisodeList WHERE title CONTAINS " + filter;
  
  con.query(querystring, function (err, result, fields) {
    if (err) {
      console.log("Error: " + err);
    }
    else {
        //check to see if the result is empty
        if(result.length > 0){
            console.log(result);
      }
    }
  });
});
	         
	  var answer = '@' + msgFROM + ' i guess you are looking for ' + filter + '.';
	  answerIt(answer, msgID);
    }
  }
}

function answerIt(txt, id) {
	var tweet = { 
      status: txt,
      in_reply_to_status_id: id,
	}
	T.post('statuses/update', tweet, function(err, data, response) {
        console.log(".");
	})
	console.log(tweet);
}

