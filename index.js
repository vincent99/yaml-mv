#!/usr/bin/env node

var console = require('console');
var yaml = require('js-yaml');
var fs = require('fs');
var process = require('process');
var pathLib = require('path');

var cwd = process.cwd();

var opts = require('optimist')
    .options('f', {
      alias: 'from',
      describe: 'Source key'
    })
    .options('t', {
      alias: 'to',
      describe: 'Target key'
    })
    .usage('Usage: $0 -from from.key -to to.key file_or_dir [...file_or_dir]');

var from = opts.argv.f;
var to = opts.argv.t;
var sources = opts.argv._||[];

if ( !from || !to || sources.length === 0 ) {
  opts.showHelp(console.error);
  process.exit(1);
}

console.log("From Key:", from);
console.log("To Key:", to);

let toProcess = [];

for ( var i = 0 ; i < sources.length ; i++ ) {
  let source = pathLib.resolve(cwd, sources[i]);

  var stat = fs.statSync(source);
  if ( stat.isFile() ) {
    toProcess.push(source);

  } else if ( stat.isDirectory() ) {
    var files = fs.readdirSync(source);
    for ( var j = 0 ; j < files.length ; j++ ) {
      var path = pathLib.resolve(source,files[j]);
      let ext = pathLib.extname(path).toLowerCase();
      if ( ext === '.yml' || ext === '.yaml' ) {
        toProcess.push(path);
      } else {
//        console.log(path,": SKIP Not YAML")
      }
    }
  }
}

for ( i = 0 ; i < toProcess.length ; i++ ) {
  let path = toProcess[i];
  let ok = rename(from, to, path);
  if ( ok ) {
    console.log(path,': OK');
  }
}

function rename(from, to, path) {
  var source = fs.readFileSync(path,'utf8');
  try {
    var doc = yaml.safeLoad(source);
    var old = valueAt(doc, parentOf(from));
    var oldKey = leafName(from);
    var tmp = (old||{})[oldKey];
    if ( typeof tmp === 'undefined' ) {
      console.warn(path,': ERROR Does not contain',from);
      return false;
    } else {
      delete old[oldKey];
      var neu = mkdirp(doc, parentOf(to));
      var neuKey = leafName(to);
      if ( typeof neu[neuKey] === 'undefined' ) {
        neu[neuKey] = tmp;
        sortKeys(neu);

        var out = yaml.safeDump(doc, { lineWidth: 160, noRefs: true});
        fs.writeFileSync(path, out);
        return true;
      } else {
        console.warn(path,': ERROR Already has data at target path',to);
        return false;
      }
    }
  } catch (e) {
    console.error(path, ": ERROR Parsing:", e);
    return false;
  }
}

// -----------------
//
function parentOf(path) {
  var out = pathToArray(path);
  out.pop();
  return arrayToPath(out);
}

function leafName(path) {
  let ary = pathToArray(path);
  return ary.pop();
}

function valueAt(obj, path) {
  let out = obj;
  let parts = pathToArray(path);
  for ( var i = 0 ; i < parts.length ; i++ ) {
    out = out[parts[i]];
    if ( out === undefined ) {
      break;
    }
  }

  return out;
}

function mkdirp(obj, path) {
  let parts = pathToArray(path);
  for ( var i = 0 ; i < parts.length ; i++ ) {
    let segment = parts[i];
    if ( typeof obj[segment] === 'undefined' ) {
      obj[segment] = {};
    }

    obj = obj[segment];
  }

  return obj;
}

function pathToArray(path) {
  if ( path.length ) {
    return path.split(/\./);
  } else {
    return [];
  }
}

function arrayToPath(ary) {
  if ( ary.length > 0 ) {
    return ary.join('.');
  } else {
    return '';
  }
}

function sortKeys(obj) {
  var keys = Object.keys(obj).sort();
  var tmp, key;
  for ( var i = 0 ; i < keys.length ; i++) {
    key = keys[i];
    tmp = obj[key];
    delete obj[key];
    obj[key] = tmp;
  }
}


// Get document, or throw exception on error
// try {
//   var doc = yaml.safeLoad(fs.readFileSync('/home/ixti/example.yml', 'utf8'));
//     console.log(doc);
//     } catch (e) {
//       console.log(e);
//       }
//
