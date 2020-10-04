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

  // looking for bot name
  if(msgTXT.startsWith("@" + botname)) {
    if(msgTXT.includes(keyword)) {

      execPhp('/var/www/quicksack.li/quicktrigger.php');

      filter = msgTXT.replace('@' + msgAT, '');
      filter = filter.replace(keyword, '');
      filter = filter.trim();
      console.log(filter);
	  
      var con = mysql.createConnection(db);

      con.connect(function(err) {
      
        var queryString = 'SELECT * FROM `qsEpisodeList` WHERE `title` LIKE "%' + filter + '%"';
        
        con.query(queryString, function (err, result, fields) {
          if (err) {
            console.log("Error: " + err);
          }
          else {
            //check to see if the result is empty
            if(result.length > 0){
              console.log(result);
            } else {
              console.log('No Results');
            }
          }
        });
      });
	         
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
	var tweet = { 
      status: txt,
      in_reply_to_status_id: id,
	}
	T.post('statuses/update', tweet, function(err, data, response) {
        console.log(".");
	})
	console.log(tweet);
}

