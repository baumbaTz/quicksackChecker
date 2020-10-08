
console.log('QuickSackChecker starting');

var Twit = require('twit');
var config = require('./config');
var execPhp = require('exec-php');
var mysql = require('mysql');
var db = require('./debe');

var filter;
var filterString;

var T = new Twit(config);

// what to look for
var botname = "quicksack";
var keyword = "?s";

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
      var trigger = execPhp('/var/www/quicksack.li/quicktrigger.php');
		
        filter = msgTXT.replace('@' + msgAT, '');
        filter = filter.replace(keyword, '');
        filter = filter.trim();
	    filterArray = filter.split(" ");
	    filterString = "";
	    filterArray.forEach(createFilterString);
	    filterString = filterString.substr(15);
	    
	    console.log(filterString);
        console.log(filter);

        var con = mysql.createConnection(db);

        con.connect(function(err) {

          var queryString = 'SELECT * FROM qsEpisodeList WHERE title LIKE '+ filterString;

          con.query(queryString, function (err, result, fields) {
            if (err) {
              console.log("Error: " + err);
            }
            else {
              //check to see if the result is empty
              if(result.length == 1){
				var tTitle = result[0].title;
				var tUrl = result[0].url;
				var tPublished = result[0].published;
				var answer = '@' + msgFROM + ' I found this Filmsack Episode:\n' + tTitle + '\nPublished: ' + tPublished + '\n' + tUrl; 
				answerIt(answer, msgID);
			  } else if(result.length > 0) {
				var answer = '@' + msgFROM + ' I found multiple Filmsack episodes that might fit your search:\nhttps://quicksack.li?f=' + encodeURI(filter);
				answerIt(answer, msgID);
              } else {
                console.log('No Results');
				var answer = '@' + msgFROM + ' It seems that Movie/Show has not been sacked, yet. Or at least i could not find it with the provided query.\nhttps://quicksack.li?f=' + encodeURI(filter);
				answerIt(answer, msgID);
              }
            }
          });
        });

    }
  }
}

function answerIt(txt, id) {
  var tweet = {
      status: txt,
      in_reply_to_status_id: id,
  }
  T.post('statuses/update', tweet, function(err, data, response) {
        console.log(err);
  })
  console.log(tweet);
}

function createFilterString(item) {
  filterString = filterString + ' AND title LIKE "%' + item + '%"';
} 
