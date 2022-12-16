/*	
	LISP Console
*/

var toOutput;
var input_area =  '#text-box';
var output_area = '#text-box';
var listener_site = "#console";
var lastChar = 0;
var buffer = "";	// actual input

// Creates the event listner. Note: input points to <form>, unlike the rest
function fire() {
    $(listener_site).keypress(function(e) {
	if (e.which == 13) { // enter
    		var j; var func;

		// Input. Reads incrementally until expression is finished
		// Not full parsing. Some expressions dont work. "+\n" breaks
		// Pend: add ctrl-c or something

		var inputVal = $(input_area).val(); 
		var lastVal = inputVal.substr(lastChar).trim();	
		if (lastVal.length==0) return;
		buffer = buffer + lastVal;
		var end = eat(buffer);
		if (!end) { 
			lastChar = $(input_area).val().length;
			return;
		}
		lastVal = buffer; 

		buffer = "";	
		print2 = "";			// see print statement

		// First, commands
		func = command_is(lastVal); 
		if (func!=null) { Output(func()); return; }

		// Normal eval
		//$(listener_site).unbind();	// disconnect, perhaps

		try {
			/* Suspended: '=' inside quotes in print
			// Equals exception to syntax!
			if ((j=lastVal.indexOf('='))!=-1) {
				var left = lastVal.substr(0,j);
				var right = lastVal.substr(j+1);
				lastVal = 'setq(' + left + ',' + right + ')' ;
			}
			*/
			var exp1 = parse(lastVal);	// from '+(1,2)' to "['+',1,2]"
			var exp2 = eval(exp1)
			Output( exp2 );
		 } catch (error) {
			Output(error);
		 }

		variables.setq("$print",print2);		// see print statement
		$(output_area).val( $(output_area).val() + "\n>");
		lastChar = $(input_area).val().length;		// update textarea pointer

		//fire();				// connect again if disconnected
	}
    });
}

var names_commands =	["help","ping","clear","time"];
var commands  =		[ help , pong , clear,  time];

function command_is(inputVal) {
	for (var i=0; i<names_commands.length; i++) 
		if (equal_string(inputVal,names_commands[i])) return commands[i];
	return null;
}

function help() {
	var s = "";
	var commandsArray = ['Help: List of available commands', '>help', '>ping', '>time', '>clear'];
	for (var i = 0; i < commandsArray.length; i++) {
		s = s + commandsArray[i] + '\n';
	}
	return s;
}

function pong() {return 'pong'; }
function time() { return new Date(); }
function clear() { $(output_area).val(""); return ""; }

function Output1(data) {
	Output(data);
	$(output_area).val( $(output_area).val() + "\n>");
	lastChar = $(input_area).val().length;		// update textarea pointer
}

function Output(data) {
	if (data==null) return;
	if (!echo_flag) return;
	var data1;

	// arrays, cosmetic: I want arrays to look on their way out as the do going in
	if (Array.isArray(data)) data = "ar(" + data + ")"; // array brackets disappear
	else data = data + "";				    // force conversion to str

	// shorten
	if (!full_flag)
	try {
		if (data.length>200) {
			data1 = data.substring(0,50) + "..."; // parametrize
			data = data1;
		}
	} catch {}

	// strings come wrapped in stringToken; see LISP2.js
	// exception: print("string") 
	// pend: ar("1","2","3")
	// try {
	//	var data2 = ""; if (data.startsWith(stringToken)) data2 = "\"" ;
	//	data1 = data2 + data.replaceAll(stringToken,"") + data2 ;
	//	data = data1;
	// } catch {}
	try {
		data1 = data.replaceAll(stringToken,"\"")  ;
		data = data1;
	} catch {}

	$(output_area).val( $(output_area).val() + "\n" + data );
	lastChar = $(input_area).val().length;		// update textarea pointer

	// trying to get cursor back one space, in front of ">". none work
	//$(output_area).prop('selectionEnd', $(output_area).prop('selectionEnd')-1); // moves cursor but nver to right place
	//$(output_area).prop('selectionEnd', -1); 					
	//setCaretToPos(document.getElementById('text-box'), -1);				

}

// https://stackoverflow.com/questions/34968174/set-text-cursor-position-in-a-textarea
function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }
    else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

function setCaretToPos (input, pos) {
       setSelectionRange(input, pos, pos);
}


// Expression reader
// Identifies end of expression
// Identifiable unrecoverable expressions throw an exception

function test_eat() {
	var yes = [ "aaaa", "aa(bb)", "aa(bb)cc", "aa(bb'ccccc'bb)", "aa(bb'cc()ccc'bb)"];
	var no = [ "aaa(", "aaa)", "aaa)(", "aaa)aaa(", "aaa)a'aa(" ];
	for (var k in yes) {
		try {
			console.log( yes[k] + " yes " + eat(yes[k]) );
		} catch {
			console.log( yes[k] + " yes " + exception );
		}
	}
	for (var k in no) {
		try {
			console.log( no[k] + " no " + eat(no[k]) );
		} catch (e) {
			console.log( no[k] + " no " + e );
		}
	}
}

function eat(lines) {
	var c; var d; 
	var stack = new Array();
	function top_is(x) { return (stack.length>0 && stack[stack.length-1]==x) ; }
	for (var i=0; i<lines.length; i++) {
		c = lines[i];
		if (closing(c)) {
			if (top_is(close_of(c))) stack.pop();
			else if (open_c(c)) stack.push(c);
			else if (!open_c(c)) throw "Unrecoverable";
			//else stack.push(c);
		} else if (open_c(c)) stack.push(c);
	}
	return (stack.length==0);
}


function open_c(c) {
	if (c=='\'') return true ;
	if (c=='\"') return true ;
	if (c=='{' ) return true ;
	if (c=='[' ) return true ;
	if (c=='(' ) return true ;
	return false;
}

function close_c(c) {
	if (c=='\'') return '\'' ;
	if (c=='\"') return '\"' ;
	if (c=='{' ) return '}'  ;
	if (c=='[' ) return ']'  ;
	if (c=='(' ) return ')'  ;
	return '';
}

function close_of(c) {
	if (c=='\'') return '\'' ;
	if (c=='\"') return '\"' ;
	if (c=='}' ) return '{'  ;
	if (c==']' ) return '['  ;
	if (c==')' ) return '('  ;
	return '';
}

function closing(c) { return  ( c=='\'' || c=='\"' || c=='}' || c==']' || c==')' ) ; }
