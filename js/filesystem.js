var FileLoader = (function() {

    function FileLoader(filename, filesys, create, method) {
        var f = this;
        f.name = filename;
        f.create = create;
        f.filesys = filesys;
        f.method = method || 'getFile';
        return f;
    }

    FileLoader.prototype = {

        load: function(callback) {
            var f = this; 
            f.filesys.root[f.method](f.name, { create: f.create || false }, 
                function(entry) { if (callback) callback(entry); }, 
                function(e) { if (e.code === 1) if (callback) callback();
            });
            return f;
        },

        destroy: function(callback) {
            var f = this;
            f.load(function(entry) {
                if (!entry) return;
                entry.remove(
                    function () { if (callback) callback(entry)}, 
                    function(e) { console.log(e)});
            });
            return f;
        }
    };

    return FileLoader;

})();


var DirLoader = (function() {

    function DirLoader(filename, filesys, create) {
        var parent = FileLoader;
        parent.apply(this, [filename, filesys, create, 'getDirectory']);
    };

    DirLoader.prototype = new FileLoader();

    DirLoader.prototype.destroyRecursively = function(callback) {
        var f = this;
        f.load(function(entry) {
            if (!entry) return;
            entry.removeRecursively(
                function () { if (callback) callback(entry)}, 
                function(e) { console.log(e)});
        });
    }

    return DirLoader;

})();


var Filesystem = (function () {

    function Filesystem() {}

    Filesystem.prototype = {

        ready: function(type, size, callback) {
            var f = this, readyCB = callback;
            window.webkitRequestFileSystem(
            type, size, function (fs) {
                f.filesys = fs; readyCB.call(f);
            }, f.onError);
        },

        getFile: function(filename, callback) {
            var f = this, file;
            file = new FileLoader(filename, f.filesys, true);
            file.load(callback);
            return f;
        },

        removeFile: function(filename, callback) {
            var f = this, file;
            file = new FileLoader(filename, f.filesys);
            file.destroy(callback);
            return f;
        },

        readFile: function(fileEntry, callback) {
            var f = this;
            fileEntry.file(function(file) { 
                var reader = new FileReader();
                reader.onloadend = function(e){ 
                    callback(this.result)};
                reader.readAsText(file)}, 
                function(fileError){ console.log(fileError) });
            return f;
        },

        writeFile: function(fileEntry, content, callback) {
            var f = this, file;
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function(e) {
                    callback('write complete');
                };
                fileWriter.onerror = function(e) {
                    console.log(e.toString);
                };
                var bb = new WebKitBlobBuilder(); 
                bb.append(content);
                fileWriter.write(bb.getBlob('text/plain'));
            }, function(fileErorr) { console.log(fileError) });
            return f;
        },

        getDir: function (dirname, callback) {
            var f = this, dir;
            dir = new DirLoader(dirname, f.filesys, true);
            dir.load(callback);
            return f;
        },

        removeDir: function (dirname, callback) {
            var f = this, dir;
            dir = new DirLoader(dirname, f.filesys);
            dir.destroyRecursively(callback);
            return f;
        },

        getSubDir: function(dirpath, callback) {
            var f = this, temp = [], path, len;
            path = dirpath.split('/'); 
            len = path.length;
            for (var i=0; i<len; i++) {
                temp.push(path.shift() + '/');
                f.getDir(temp.join(''), 
                    (i==len-1 ? callback : null));  
            }
            return f;
        },

        removeSubDir: function(dirpath, callback) {
            var f = this, path, len;
            path = dirpath.split('/'); 
            len = path.length;
            path.push('');
            for (var i=len; i>0; i--) {
                path.pop();
                f.removeDir(path.join('/'), 
                    (i==len-1 ? callback : null));  
            }
            return f;
        },


    }

    return Filesystem;

})();

var filesystem = new Filesystem;

filesystem.ready(window.TEMPORARY, (1024 * 1024), function () {

    var fs = this;

    fs.removeSubDir('d/e/f', function(dirEntry) {
        console.log(dirEntry);
    });

});

















