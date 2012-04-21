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
                function(entry) { callback(entry); }, 
                function(e) { if (e.code === 1) callback();
            });
            return f;
        },

        destroy: function(callback) {
            var f = this;
            f.load(function(entry) {
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

    return DirLoader;

})();


var Filesystem = (function () {

    function Filesystem() {}

    Filesystem.prototype = {

        ready: function (type, size, callback) {
            var f = this, readyCB = callback;
            f.onError.bind(f);
            window.webkitRequestFileSystem(
            type, size, function (fs) {
                f.filesys = fs; readyCB.call(f);
            }, f.onError);
        },

        getFile: function (filename, callback) {
            var f = this, file;
            file = new FileLoader(filename, f.filesys, true);
            file.load(callback);
            return f;
        },

        removeFile: function (filename, callback) {
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

        writeFile: function (fileEntry, content, callback) {
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
            dir.destroy(callback);
            return f;
        },

        onError: function (e) {
            var f = this;
            var msg = '';

            switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
            };

            console.log('Error: ' + msg);
        }

    }

    return Filesystem;

})();

var filesystem = new Filesystem;

filesystem.ready(window.TEMPORARY, (1024 * 1024), function () {

    var fs = this;

    fs.removeDir('logas', function(dirEntry) {
        console.log(dirEntry);
    });


});

















