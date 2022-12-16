## Little LISP interpreter for online calculations

This example contains a small, self-contained code for a LISP interpeter.
There is a very specific purpose: to be able to load EXCEL-like tables from official sources
and do quick calculations online. I've done it manually so many times (fire up the
Excel, load tables, do the calculations by hand...) that it seemed worth it to go 
the extra mile and do it once and for all.

There is a more general purpose, and it it to build little models of what a public service
of collecting official data and running simple calculations on them might look like. A sort
of "data Wikipedia". 


## Use

The ">" signals the interpreter is ready to eval a statement (BUG: 1st time it doesn't 
appear). Every statement is written in the notation `function(op1, op2...)`. For assignment
the `=` or `setq` can be used. Examples can be found in the interpreter comments. 

There is no notion of type and there are only global variables, with the exception of local 
scopes used to define functions and loops.

An important feature is the ability to load CSV tables (ending .csv) and programs (ending .pgr).
Examples can be found in the [CSV directory](https://github.com/stacynguyen/lisp). 

The programs is where the "memory" of the calculations are: a program for say, computing the
3-month rolling murder average per 100,000 can be saved in a public place and reused many times 
for everyone needing the statistic. 


## Syntax

Syntax is clunky. Strings come with double quotes (no single quotes allowed). Numbers should work 
along the lines of JS. Arrays are denoted as `ar(1,2,3....)` for `[1,2,3...]`.


## Status

Proof of concept. Programming was kept to a minimum. 

* Streamlined version of lisp for react
* JS example
* Next: fix input, cursor gets lost everyonce in a while. Revise syntax. Strings and arrays too clunky.


## Runs on

Render(https://lisp.onrender.com/)