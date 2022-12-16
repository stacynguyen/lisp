/*
	Mini LISP interpreter
	To be used with Lisp Console.html

	BM, sept 2022

	=(b,1)
	1
	>
	if(eq(b,1),2)
	2
	>
	if(eq(b,1),2,3)
	2
	>
	if(neq(b,1),2,3)
	3
	>
	if(!(eq(b,1)),22,b)
	1
	>
	if(eq(b,1),3.1416)
	3.1416
	>
	+(1,if(eq(b,1),3.1416))
	4.1416
	>
		
	function(foo,x,y,+(x,y))			
	x,y,+,x,y
	>
	foo(1,2)
	3
	>
	
	NEW SYNTAX
	
	function(foo(x,y),+(x,y))
	ar(x,y,+,x,y)
	>
	foo(7,8)
	15
	>

	map(add1,ar(1,2,3))
	[2,3,4]
	>

	function(add2,x,+(x,2))
	add2
	>
	add2(3)
	5   
	>
	map(add2,ar(1,2,3))
	[3,4,5]
	>


	cut(ar(1,2,3,4,5,6),2,4)

	ar(3,4)

	Table CNSP-Víctimas-2020_dic2020 loaded
	>fold(+,cut(row("CNSP-Víctimas-2020_dic2020","1.1.1"),2,8))
	17545
	>

	a="1"
	"1"
	>
	concat(a,"2")
	"12"
	>
	concat(concat(a,"2"),"3")
	"123"
	>
	eq(a,1)
	false
	>
	eq(a,"1")
	true
	>
	z="a"
	"a"
	>
	z=concat(z,concat(z,z))
	"aaa"
	>
	z
	"aaa"
	>
	
	print("Hello")
	Hello
	>
	print("Hello ","seahorse")
	Hello seahorse
	>
	a="seahorse"
	"seahorse"
	>
	print("Hello ",a)
	Hello seahorse
	>
		

*/


// Another style of tables
// pivots.lookup('a')	null
// pivots.setq('a',1)	1
// pivots.lookup('a')	1

var pivots = new Object({
	table: 	new AList(),
	setq:	function(v,val) { return setq(v,val,this.table); } ,
	lookup: function(v) { return lookup(v,this.table); } 
});

// vars bindings

var variables = new Object({
	table: 	new AList(),
	setq:	function(v,val) { return setq(v,val,this.table); } ,
	lookup: function(v) { return lookup(v,this.table); } 
});

// tables bindings
var tables = new Object({
	table: 	new AList(),
	setq:	function(v,val) { return setq(v,val,this.table); } ,
	lookup: function(v) { return lookup(v,this.table); } 
});

// function defs
var functions = new Object({
	table: 	new AList(),
	setq:	function(v,val) { return setq(v,val,this.table); } ,
	lookup: function(v) { return lookup(v,this.table); } 
});

//

function eval(exp) {
	var r;							//console.log("> "+exp);
	if (isAtom(exp)) {
		r = value(exp);				//console.log("< "+exp+" = "+r);
		return r;
	} else {
		var func = car(exp);
		var args = cdr(exp); 
		r = eval_func(func,args);	//console.log("< "+exp+" = "+r);
		return r;
	}
}

function value(exp) {
	if (isBoolean(exp))			return booleanValue(exp);
	if (isNumber(exp))			return parseFloat(exp);	// also numeric strings
	if (internalString(exp))	return exp; 
	if (isVar(exp))				return variables.lookup(exp);
	if (isGlobalVar(exp))		return variables.lookup(exp);
	throw "Can't eval value "+exp;
}

const stringToken = "ç";

function internalString(s) { 
	try {
		var t = s.split(''); 
		return (t[0]==stringToken && t[t.length-1]==stringToken);
	} catch {
		return false;
	}
}

// Gets rid of stringToken; there might be non-stings as in "ah "+1
function strip(s) { 
	try {
		if (isBasicString(s) && internalString(s)) return s.substring(1,s.length-1) ;
		else return s;
	} catch {
		return s;
	}
}

function eval_func(func,args){
	
	var arg1 = null; try { arg1 = car(args); } catch {}
	var arg2 = null; try { arg2 = cadr(args); } catch {}
	var arg3 = null; try { arg3 = caddr(args); } catch {}

	// Primitives
	
	if (func == "setq") { return variables.setq(arg1, eval(arg2)); } // setq
	if (func == "=")  	{ return variables.setq(arg1, eval(arg2)); }	// setq
	if (func == "if" && arg3==null) { if (eval(arg1)) return eval(arg2); return false;}// if
	if (func == "if" && arg3!=null) { if (eval(arg1)) return eval(arg2); else return eval(arg3);}	// if-else

	if (func == "+")  { return eval(arg1)+eval(arg2); }
	if (func == "-")  { return eval(arg1)-eval(arg2); }
	if (func == "/")  { return eval(arg1)/eval(arg2); }
	if (func == "*")  { return eval(arg1)*eval(arg2); }
	if (func == "~")  { return eval(arg1)*-1; }
	if (func == "^")  { return Math.pow(eval(arg1),eval(arg2)); }

	if (func == "not")  { return !eval(arg1); }
	if (func == "!")  	{ return !eval(arg1); }
	if (func == "and")  { return ( eval(arg1) && eval(arg2) ); }
	if (func == "or")  	{ return ( eval(arg1) || eval(arg2) ); }
	if (func == "eq")  	{ return ( eval(arg1)==eval(arg2) ); }
	if (func == "neq")  { return ( eval(arg1)!=eval(arg2) ); }
	if (func == "gt")  	{ return ( eval(arg1)>eval(arg2) ); }
	if (func == "lt")  	{ return ( eval(arg1)<eval(arg2) ); }
	if (func == "geq")  { return ( eval(arg1)>=eval(arg2) ); }
	if (func == "leq")  { return ( eval(arg1)<=eval(arg2) ); }
	if (func == "number"){ return parseFloat(strip(eval(arg1))); }
	
	// Strings
	if (func == "quote") { return stringToken + arg1 + stringToken; } // might be a bug
	if (func == "concat")  { 
		return stringToken + strip(eval(arg1)) + strip(eval(arg2)) + stringToken; }
	if (func == "substr")  { 
		return stringToken + strip(eval(arg1)).substring(eval(arg2),eval(arg3)) +
			stringToken; } // Java like

	// Compound statement [progn [...] .....[]]
	if (func == "progn")  { 
		var eprogn;
		for (var i=0; i<args.length; i++) eprogn = eval(args[i]);
		return eprogn;
	}
	
	// Functional
	if (func == "map")  { 							// external call: map(add1,ar(1,2,3)),
													// here: [map,add1,[ar,1,2,3]]
			var inner_f = car(args);				// add1
			var inner_args = cadr(args);			// [ar,1,2,3]
			return map(inner_f,eval(inner_args))  ; 
	}

	if (func == "fold")  {						// fold(+,ar(1,2,3)]
												// here [fold,+,[ar,1,2,3]]
		var inner_f = car(args);				// +		MESS
		var inner_args = cadr(args);		// [ar,1,2,3]
		return fold(inner_f,eval(inner_args))  ;
	}
	
	if (func == "add1")	{ return eval(args)+1; }	// not using js' eval implies defining all the way down
	
	// Arrays
	if (func == "lengtht")  { return tables.lookup(eval(arg1)).length ; } // table
	if (func == "lengtha")  { return eval(arg1).length-1 ; }// array
	if (func == "ar")  		{ return newArray(args) ; }		// see below
	if (func == "cut")		{ return subarray(eval(arg1),eval(arg2),eval(arg3)) ; }
	// [at,[ar, 1, 2, 3],0]
	if (func == "at")  		{ return eval(arg1)[eval(arg2)] ; }
	// Matrices
	if ( func == "newm") 	{ return newm( eval(arg1),eval(arg2)			); }	// new matrix	
	if ( func == "cell") 	{ return cell( eval(arg1),eval(arg2),eval(arg3)	); }	// retrieve value in matrix
	if ( func == "pivot")	{ return pivot(eval(arg1),eval(arg2),eval(arg3)	); }	// insert reference point
	if ( func == "row")  	{ return row(  eval(arg1),eval(arg2)			); }	// retrieve row in matrix
	if ( func == "col")  	{ return col(  eval(arg1),eval(arg2)			); }	// retrieve col in matrix


	// function definition 
	// function(foo,x,y,+(x,y))	or [function, foo, x, y, [+,x,y]]  and then [foo,1,2]
	// PEND: make syntax like LISP: function(foo,(x,y),+(x,y)) not admitted
	// Perhaps function(foo(x,y),+(x,y)) 	[function, [foo, x, y], [+,x,y]]
	if ( func == "function" )  { return functions.setq(caar(args), [cdar(args),cadr(args)]); }	
	
	// function evaluation 
	// AUFPASSEN
	var func_def ;
	if ( (func_def=functions.lookup(func))!=null) {		
		var func_args = car(func_def);
		var func_body = cadr(func_def);
		for (var i=0; i<func_args.length; i++) {
			func_body = replace_(func_body,func_args[i],args[i]) ;
		}
		return eval(func_body);
	}

	// loop(x,1,10,body)	part of a more general loop(x,init,final,increment,cond,body)
	if (func=="loop") {
		var l_arg = car(args);
		var l_liminf = eval(cadr(args));
		var l_limsup = eval(caddr(args));
		var l_body = cadddr(args);
		var eloop;
		for (var l_i=l_liminf; l_i<l_limsup; l_i++){	// pend
			var l_body1 = replace_(l_body,l_arg,l_i) ;
			eloop = eval(l_body1);
		}
		return eloop;
	}
	
	// Demoted. Doesnt interact well with rest. Could be some sort of conflict
	// in browser b/een running code and coordinating with display. Phps not
	// using jquery but plain code to update textarea. Or it could be the listener 
	// catching input events while execution takes place. Whatever, not gonna 
	// waste time finding out. Use "delayed" print instead. Problem too for trying  
	// to implement a trace, Prolog style
	// PD. Disconnected listener and doesnt make any diff. It's the other thing then.
	if (func=="print2") {
		var s = "";
		for (var i=0; i<args.length; i++) {
			s = s + strip(eval(args[i]))
		}
		Output(s);
		return null; 
	}

	// Delayed print. Better use this one. 
	// print2 value can be access too with $print (see Console)
	if (func=="print_init")  { print2 = ""; return true; }
	if (func=="print_value") { full_flag=true;Output(print2);full_flag=false;return null; }
	if (func=="print") {
		for (var i=0; i<args.length; i++) {
			print2 = print2 + strip(eval(args[i]))
		}
		print2 = print2 + "\n";
		return null; 
	}
	
	// print
	if (func=="echo") { echo_flag = eval(arg1); return echo_flag; }
	if (func=="full") { full_flag = eval(arg1); return full_flag; }

	throw "Can't eval func "+func;
}
var print2 = "";	
var echo_flag = true; 	// display?
var full_flag = false; 	// display?

// Silly. It'd be simpler to treat function bodies like ordinary lambda exps.
// Instantiating an argument would be... instantianting an argument.
function replace_(list, old_, new_) {
	if (isAtom(list)) {
		if (list==old_) return new_ ; else return list;
	} else {	// assume array
		var r = new Array();
		for (var i=0; i<list.length; i++) r.push(replace_(list[i],old_,new_));
		return r;
	}
}

//

function newArray (args) { 
	var r = new Array();
	for (var i=0; i<args.length; i++) r.push(eval(args[i]));
	return r;
}

function subarray (args,i,j) { 
	var a = args.slice(i,j);	// shallow copy
	return newArray(a);
}

function add1(x) { return x+1; }

function map (f,args) {
	//args = newArray(args);
	var r = new Array();
	for (var i=0; i<args.length; i++) { r.push(eval([f].concat(args[i]))); } 
	return r;
}

// f(args[0], f(args[1], f(args[2],.....))))
function fold (f,args) {
	if (args.length==0) return 0;
	return eval([f].concat(car(args), fold(f,cdr(args))));
}


// Quote functions prolly superseded

function isBoolean(x) { return (isBooleanConstant(x) || isBooleanString(x)); }
function isBooleanConstant(x) { return (x===true || x===false); }
function isBooleanString(x) { return (x=='true' || x=='false'); }
function booleanValue(x) { if (isBooleanString(x)) return (x=='true'); else return x; }
function isAtom(exp) { return !Array.isArray(exp); }
function isNumber(n) { return (!isNaN(parseFloat(n)) && !isNaN(n - 0)); } // BEWARE pF accepts things like "1.1.1" "1 2 3"
function isString(n) { return ( isQuotedString(n) || isBasicString(n) ); }
function isQuotedString(n) { return ( isBasicString(n) && isQuote(n.charAt(0)) && isQuote(n.charAt(n.length-1)) ); }
function isBasicString(n) { return (typeof n === 'string' || n instanceof String); }
function isNumericString(n)  { return (isNumber(n) || isString(n)); }
function isLowerCaseLetter(c) { return "abcdefghijklmnopqrstuvwxyz".indexOf(c)!=-1; }
function isUpperCaseLetter(c) { return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(c)!=-1; }
function isLetter(c) { return (isLowerCaseLetter(c) || isUpperCaseLetter(c) ); }
function isVar(exp) { return exp!=null && exp.length>0 && isLetter(exp.charAt(0)); }
function isDigit(c) { return "1234567890".indexOf(c)!=-1; }
function isNum(c) { return (isDigit(c)||c=='.' ); }
function isOperator(c) { return ( (c=='!') || (c=='~') || (c=='=') ||  
	(c=='+') || (c=='-') || (c=='*') || (c=='/') || (c=='^')  ); }
function isSingleQuote(c) { return (c=="\'"); }	
function isDoubleQuote(c) { return (c=="\""); }	
function isQuote(c) { return (isSingleQuote(c) || isDoubleQuote(c) ); }	
function isIdInit(c) { return (isLetter || c=='$' ); }
function isIdCont(c) { return ( isLetter(c) || isDigit(c)|| c=='_'); }
function isGlobalVar(c) { try{ return c.length>1 && c.charAt(0)=="$"; } catch { return false; } }
	
//

function car(exp) { return exp[0]; }
function cdr (exp) { return exp.slice(1); }		// splice is destructive
function caar(exp) { return car(car(exp)); }
function cadr(exp) { return car(cdr(exp)); }
function cdar(exp) { return cdr(car(exp)); }
function caddr(exp) { return car(cdr(cdr(exp))); }
function cadar(exp) { return car(cdr(car(exp))); }
function cadddr(exp) { return car(cdr(cdr(cdr(exp)))); }

//

function inListVals(x,list,listv) { 
	for (var i=0; i<list.length; i++) {
		if (x==list[i]) return listv[i]; 
	}
	return null; 
}
function inList(x,list) { return (inListVals,list,list)!=null}
    
// Parse input expressions

function parse(exp) { 
	// when input is a single atom, no array is returned but the atom itself
	var a = atom(exp,0);
	var j = a[0]; var c = a[1]; 
	if (j==exp.length) return exp;	
	// otherwise proceed as normal
	var r = new Array(); 
	functor(exp.split(''),0,r); 
	return r; 
}

// Updates result in 3rd argument; returns next position on input
function functor(exp,i,r) {
	var a = atom(exp,i);
	var j = a[0]; // '(' next
	var c = a[1]; // 'foo'
	r.push( c ); 
	if ( j>=exp.length || exp[j]!='(') return r;
	j++;			// (
	var k = argsList(exp,j,r);	// actual Lisp can have list of lists
	k++;	// )
	return k; 
}

function argsList(exp,i,r) {
	while (i<exp.length && exp[i]!=')') {
	//do {
		var a = atom(exp,i);
		var j = a[0]; var c = a[1]; var d = exp[j];
		if (d=='(') {		// new functor
			var r2 = new Array();
			i = functor(exp,i,r2);
			r.push(r2);
		} else {			// atom
			r.push(c); 
			i=j;		
		}
		if (exp[i]==',') i++;
	} //while (i<exp.length && exp[i]!=')');
	return i;
}

// a token, either variable id or number
// no single quotes anywhere, only DOUBLE quotes
function atom(exp,i) {
	var c ;
	if (exp[i]=='\"') {					// no escapes
		c=""; i++; 						// c = "\""; i++; 
		while (i<exp.length && exp[i]!='\"') { c = c+exp[i++]; }
		c = stringToken +c+ stringToken; i++;					// c = c + "\""; i++; 
	} else if ( isOperator(exp[i]) ) {
		c = exp[i++];
	} else if ( isIdInit(exp[i]) ) {
		c = exp[i++];
		while (i<exp.length && isIdCont(exp[i])) { c = c+exp[i++]; }
	} else if ( isDigit(exp[i]) ) {
		c = exp[i++];
		while (i<exp.length && (isNum(exp[i]))) { c = c+exp[i++]; }
	} else throw "Not an atom";
	return [i,c]; 
}


// 

function setq(variable,value,table) { return table.set(variable,value); } 	// does replacing
function lookup(variable,table) {  return table.get(variable); }		// null if nothing there


// Assoc list as linked list
// https://stackoverflow.com/questions/38463229/data-structure-association-list-how-to-create-head-key-value-pairs

function AList() { this.head = null; }

AList.prototype.set = function (key, value) {
    // create node
    function ListN(key, value, next) {
        this.key = key;
        this.value = value;
        this.next = next;
    }
    // search key, either replace or add node
    var node = this.head;
    while (node) {
        if (node.key === key) {
            node.value = value;
            return value;
        }
        node = node.next;
    }
	// insert new pair at beginning list
    this.head = new ListN(key, value, this.head);
	return value;
};

AList.prototype.get = function (key) {
    var node = this.head;
    while (node) {
        if (node.key === key) {
            return node.value;
        }
        node = node.next;
    }
	return null; 
};

/// d3js

function readTable(filename, tname) {
       d3.csv(filename, (t) => {			// "c:/java/test3.csv"
            return readTable_cont(t,tname)
	   });
}

function readTable_cont(table,name) {
	console.log(name + " = " + table);
	tables.setq(name,table);
	return name;
}

/// 

// Load data or program

var read_matrix = null;

function load() {
	var oFReader = new FileReader();
	oFReader.readAsDataURL(document.getElementById("uploadText").files[0]);
	oFReader.onload = function (oFREvent) {
		var text = oFREvent.target.result; 
		//oFREvent.target.result = "";

		var j = text.indexOf("base64,"); //eg 'data:application/vnd.ms-excel;base64,'
		if (j!=1) text = text.replace(text.substring(0,j+"base64,".length),"");	// always? 
        text = atob(text);
		
		var name = $('#uploadText').val();
		//$('#uploadText').val("");
		uploadText.value = "";
		var i = name.lastIndexOf('\\'); 
		if (i==-1) name.lastIndexOf('/'); 
		name = name.substr(i+1);
		
		// matrix
		if (name.endsWith('.csv')) {
			read_matrix = Papa.parse(text);
			name = stringToken + name.substr(0,name.length-4) + stringToken;
			tables.setq(name,dequote(read_matrix.data));// see below
			pivots.setq(name,{delta_rs:0,delta_cs:0});	// default
			variables.setq("$table",name);
			Output1("Table "+name+" loaded");
		
		// program
		} else if (name.endsWith('.pgr')) {
			Output1("Code "+name+" loaded");
			loadCode(text);
			name = stringToken + name.substr(0,name.length-4) + stringToken;
			variables.setq("$program",name);
			Output1("Code executed");

		} else throw ".pgr or .csv expected"
		
		// lastChar = $(input_area).val().length;		// update textarea pointer

	}
}

var blankChar = "§";

// New version, read everything first into one line and then execute
// demands progn
function loadCode(text) {
	var j; 
	var prog = "";
	var progs= new Array();
	// read in
	try {
		var lines = text.split("\r\n");
		for (var k in lines) {
			var line = lines[k];
			line = line.trim();
			j = line.indexOf("//"); // comments
			if (j!=-1) line = line.substr(0,j).trim();
			if (line.length==0)	continue;
			line = replaceBlanks(line).replaceAll(" ","").replaceAll(blankChar," ");
			prog = prog+line;
			if (eat(prog)) {		// finished?
				progs.push(prog);
				prog = "";
			}
		}
	} catch (exc1) {
		throw "Error loading code " + exc1;
	}

	// execute
	var exp1; var exp2; 
	for (var k in progs) {
		try {
			exp1 = parse(progs[k]);
			exp2 = eval(exp1)
			Output( exp2 );
		} catch (exc2) {
			throw "Error executing code " + exc2;
		}
	}
	return exp2;
}

// replaces blanks inside double quotes
function replaceBlanks(text) {
	var inside = false;
	var tout = "";
	for (var i = 0; i<text.length; i++) {
		if (text.charAt(i)=="\"") inside = !inside;
		if (inside && text.charAt(i)==" ") tout = tout+blankChar; 
		else tout = tout+text.charAt(i);
	}
	return tout;
}

// Old version, 1 statement for line, no progn
function loadCode_old(text) {
	var j; 
	var lines = text.split("\r\n");
	for (var k in lines) {
		var line = lines[k];
		line = line.trim();
		j = line.indexOf("//"); 		// comments
		if (j!=-1) line = line.substr(0,j).trim();
		if (line.length==0)	continue;
		try {
			// see Console
			/*
			if ((j=line.indexOf('='))!=-1) {
				var left = line.substr(0,j);
				var right = line.substr(j+1);
				line = 'setq(' + left + ',' + right + ')' ;
			}
			*/
			var exp1 = parse(line);
			var exp2 = eval(exp1)
			Output( exp2 );
		} catch {
			throw "Error executing code in line "+(k+1)+": "+line;
		}
	}
	//lastChar = $(input_area).val().length;		// update textarea pointer
	return true;
}

// Extensions

function equal_string(s,t) { return (s.localeCompare(t)==0); } //?

function inListVals(x,list,listv) { 
	for (var i=0; i<list.length; i++) {
		if (equal_string(x,list[i])) return listv[i]; 
	}
	return null; 
}
function inList(x,list) { return (inListVals,list,list)!=null}


// Basic matrix functions 

// A matrix is a 2-dim js array of ROW arrays 
function newm(m,n) { 				// new matrix m rows x n cols PEND: silly, fix
	var r = new Array(); 
	for (var i=0; i<m; i++) {
		var s = new Array(); 
		for (var j=0; j<n; j++) s.push(0);	// dont use fill
		r.push(s);
	}
	return r;
}


// Puts a reference for refering to points, [i][j] will refer to [i+a][j+b]
function pivot(m,a,b) { pivots.setq(m,{delta_rs:a,delta_cs:b}); }

// x=is(m,i,j)				['is',m,i,j] 				cell(m,i,j)
// x=is(m,row(7))			['is',m,['row',7]] 			row(m,7)
// x=is(m,row("Enero"))		['is',m,['row','Enero']] 	row(m,"Enero")

function row_(m,i) { 												// actual row, primitive
	var ps = pivots.lookup(m); 																
	if (ps!=null) return i+ps.delta_rs; else return i;
}

function col_(m,i) { 								// actual col, primitive
	var ps = pivots.lookup(m); 
	if (ps!=null) return i+ps.delta_cs; else return i;
}

// Strings in matrices. Strings in tables loaded havent been de-stringed
// This is a serious issue. Whole matrix can be de-quoted upon entry or
// it can be done piece-wise when accessing each cell. Gonna go 1st route 
// but 2nd makes more sense for big matrices

function dequote(m) { 
	for (var i=0; i<m.length; i++)
		for (var j=0; j<m[i].length; j++)
			// was isBasicString !isNumber
			if (!isNumber(m[i][j])) m[i][j] = stringToken + m[i][j] + stringToken ;
	return m;
}

function cell(m,i,j) {	
	i = row_(m,i); j = col_(m,j); var t = tables.lookup(m); 
	if (t==null) return null;
	return t[i][j];
}

// return ith row in matrix    
function row(m,x) {
	var matrix = tables.lookup(m);
	if (matrix==null) return null;
	var ps = pivots.lookup(m);
	var r = new Array();
	if (isNumber(x)) {
		var i = row_(m,x);
		for (var j=ps.delta_cs; j<matrix[0].length; j++) 
			r.push(matrix[i][j]);
		return r; 
	} else {
		// assume quoted string x = strip(x);
		for (var i=ps.delta_rs; i<matrix.length; i++) {
			if (matrix[i][ps.delta_cs]==x) {
				for (var j=ps.delta_cs; j<matrix[0].length; j++) 
					r.push(matrix[i][j]);
				return r; 
			}
		}
		return null;	//throw "Can't find row";
	}
}

// return ith col in 
function col(m,x) {
	var matrix = tables.lookup(m);
	if (matrix==null) return null;
	var r = new Array(); 
	var ps = pivots.lookup(m); 
	if (isNumber(x)) {
		var c = x+ps.delta_cs;
		for (var i=ps.delta_rs; i<matrix.length; i++)
				r.push(matrix[i][c]);
		return r;
	} else {
		// assume quoted string x = strip(x);
		for (var j=ps.delta_cs; j<matrix[0].length; j++) {
			if (matrix[ps.delta_rs][j]==x) {
				for (var i=ps.delta_rs; i<matrix.length; i++)
					r.push(matrix[i][j]);
				return r;
			}
		}
		return null;
	}
}

