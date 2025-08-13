function Namespace() {
}
;
(function(g) {
  function createNamespaceProxy(namespace) {
    return new Proxy(new Namespace(), {
      get: function(cache, name) {
        if (cache[name]) return cache[name];
        let fullName = namespace ? namespace + "::" + name : name;
        let cls = loadCppType(fullName);
        if (cls) {
          cache[name] = cls;
        } else {
          cache[name] = createNamespaceProxy(fullName);
        }
        if (patches[fullName]) {
          patches[fullName](cache[name]);
        }
        return cache[name];
      }
    });
  }
  g.SC = createNamespaceProxy("");
  const patches = {};
  g.puerTypePatch = function(name, patchFn) {
    if (!name) {
      patchFn(g.SC);
    } else {
      patches[name] = patchFn;
    }
  };
  function ref(x) {
    return [x];
  }
  function unref(r) {
    return r[0];
  }
  function setref(x, val) {
    x[0] = val;
  }
  g.$ref = ref;
  g.$unref = unref;
  g.$set = setref;
  const cast = function(obj, cppType) {
    Object.setPrototypeOf(obj, cppType.prototype);
    return obj;
  };
  SC.DisplayObject.prototype.as = function(castToType) {
    return cast(this, castToType);
  };
  g.cast = cast;
})(globalThis);
