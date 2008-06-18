function publish(symbolSet) {
  libName = "ExtMaptypeControl";

  publish.conf = {  // trailing slash expected for dirs
    ext: ".html",
    outDir: JSDOC.opt.d || SYS.pwd+"../out/jsdoc/",
    templatesDir: SYS.pwd+"../templates/jsdoc/",
  };

  // used to check the details of things being linked to
  Link.symbolSet = symbolSet;

  // filters
  function hasNoParent($) {return ($.memberOf == "")}
  function isaFile($) {return ($.is("FILE"))}
  function isaClass($) {return ($.is("CONSTRUCTOR") || $.isNamespace)}

  var symbols = symbolSet.toArray();

  try {
    var referenceTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"reference.tmpl");
  } catch (e) {
    print(e.message);
    quit();
  }


  var classes = symbols.filter(isaClass).sort(makeSortby("alias"));
  Link.base = "../";
  IO.saveFile(publish.conf.outDir, "reference.html", referenceTemplate.process(classes));
	
	// regenrate the index with different relative links
	Link.base = "";
	publish.classesIndex = classesTemplate.process(classes);
	
	try {
		var classesindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"index.tmpl");
	}
	catch(e) { print(e.message); quit(); }
	
	var classesIndex = classesindexTemplate.process(classes);
	IO.saveFile(publish.conf.outDir, "index"+publish.conf.ext, classesIndex);
	classesindexTemplate = classesIndex = classes = null;
	
	try {
		var fileindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"allfiles.tmpl");
	}
	catch(e) { print(e.message); quit(); }
	
	var documentedFiles = symbols.filter(isaFile);
	var allFiles = [];
	
	for (var i = 0; i < files.length; i++) {
		allFiles.push(new JSDOC.Symbol(files[i], [], "FILE", new JSDOC.DocComment("/** */")));
	}
	
	for (var i = 0; i < documentedFiles.length; i++) {
		var offset = files.indexOf(documentedFiles[i].alias);
		allFiles[offset] = documentedFiles[i];
	}
		
	allFiles = allFiles.sort(makeSortby("name"));

	var filesIndex = fileindexTemplate.process(allFiles);
	IO.saveFile(publish.conf.outDir, "files"+publish.conf.ext, filesIndex);
	fileindexTemplate = filesIndex = files = null;
}


/** make a symbol sorter by some attribute */
function makeSortby(attribute) {
	return function(a, b) {
		if (a[attribute] != undefined && b[attribute] != undefined) {
			a = a[attribute].toLowerCase();
			b = b[attribute].toLowerCase();
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		}
	}
}

function include(path) {
	var path = publish.conf.templatesDir+path;
	return IO.readFile(path);
}

/** Find symbol {@link ...} strings in text and turn into html links */
function resolveLinks(str, from) {
	str = str.replace(/\{@link ([^} ]+) ?\}/gi,
		function(match, symbolName) {
			return new Link().toSymbol(symbolName);
		}
	);
	
	return str;
}