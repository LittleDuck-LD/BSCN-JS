function Namespace() { }

;(function(g) {
    function createNamespaceProxy(namespace) {
        return new Proxy(new Namespace, {
            get: function (cache, name) {
                let fullName = namespace ? (namespace + '::' + name) : name;
                let cls = loadCppType(fullName);
                if (cls) {
                    cache[name] = cls;
                }
                else {
                    cache[name] = createNamespaceProxy(fullName);
                    //console.log(fullName + ' is a namespace');
                }
                return cache[name];
            }
        });
    }
    g.SC = createNamespaceProxy('');
})(globalThis);