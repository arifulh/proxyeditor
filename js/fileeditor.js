var Fileeditor = (function() {

    function bindKey(win, mac) {
        return {
            win: win,
            mac: mac
        };
    }

    function Fileeditor() {
    	var f = this;
	    f.editor = ace.edit("editor");
	    f.editor.setTheme("ace/theme/textmate");
	    f.editor.getSession().setMode("ace/mode/javascript");
        f.currentPath = null;
	    return f;
    }

    Fileeditor.prototype = {

        init: function(filesys) {
            var f = this;
            f.filesys = filesys;
            f.editor.commands.addCommand({
                name: "savefile",
                bindKey: bindKey("Ctrl-S", "Command-S"),
                exec: f.save.bind(f)
            });
            return f;
        },

        create: function(path, content) {

            var f = this, a, dir, file;
            (a = document.createElement('a')).href = path;
            dir = (function() { return path.match(/[http:\/\/]*[www.]*(.*?)\//)[1] })();
            file = (function() { return a.pathname.split('/').pop() })();

            f.filesys.getSubDir(dir, function(dirEntry) {
                dirEntry.getFile(file, { create: true }, function(fileEntry) {
                    f.filesys.writeFile(fileEntry, content, function() {
                        f.currentPath = fileEntry.toURL();
                        f.editor.getSession().setValue(content);
                    });
            }, function() { })});

            return f;
        },

        open: function(path) {

        },

        save: function() {
            var f = this, path = f.currentPath,
                    a, dir, file;

            (a = document.createElement('a')).href = path;
            dir = (function() { return path.match(/[http:\/\/]*[www.]*(.*?)\//)[1] })();
            file = (function() { return a.pathname.split('/').pop() })();


            f.filesys.getSubDir(dir, function(dirEntry) {
                dirEntry.getFile(file, { create: true }, function(fileEntry) {
                    f.filesys.writeFile(fileEntry, f.editor.getSession().getValue(), function() {
                        console.log('saved');
                    });
            }, function() { })});

            return f;


        },

        download: function(method, url) {
            var f = this, xhr = new XMLHttpRequest();                 
            xhr.onreadystatechange = function() {
                if(xhr.status == 200 && xhr.readyState == 4)
                    f.create(url, xhr.responseText)
            }
            xhr.open(method, url, true);
            xhr.send(null);
            return f;
        }





    };

    return Fileeditor;

})();



window.onload = function() {

    var filesystem = new Filesystem();
    var fileeditor = new Fileeditor();

    filesystem.ready(window.TEMPORARY, (1024 * 1024), function () {
        fileeditor.init(filesystem);
        
                    

        fileeditor.download('GET', 'http://localhost/proxyeditor/js/testfile.js');

    });






}

