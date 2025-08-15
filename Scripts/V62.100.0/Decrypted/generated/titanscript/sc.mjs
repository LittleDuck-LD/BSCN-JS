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
          for (const patchFn of patches[fullName]) {
            patchFn(cache[name]);
          }
        }
        return cache[name];
      }
    });
  }
  g.SC = createNamespaceProxy("");
  g.DEL = function(obj) {
    if (obj) {
      let cppDestructFunc = obj[Symbol.dispose];
      if (cppDestructFunc) {
        cppDestructFunc.call(obj);
      } else {
        let destructFunc = obj.destruct;
        if (destructFunc) {
          destructFunc.call(obj);
        }
      }
    }
  };
  g.allocWithoutGC = function(cls, ...args) {
    if (!cls) return null;
    let cppConstructor = cls[Symbol.alloc];
    if (cppConstructor) {
      return cppConstructor(...args);
    }
    return null;
  };
  g.isNative = function(obj) {
    return obj && obj[Symbol.dispose] !== void 0;
  };
  const patches = {};
  g.puerTypePatch = function(name, patchFn) {
    if (!name) {
      patchFn(g.SC);
    } else {
      if (patches[name] == null) patches[name] = [];
      patches[name].push(patchFn);
    }
  };
  if (typeof globalThis.PuerhInspector === "undefined") {
    globalThis.PuerhInspector = {};
  }
  function isValid(obj) {
    return obj !== null && obj !== void 0;
  }
  g.isValid = isValid;
  g.tsImport = async function(path) {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return new Promise(async (resolve, reject) => {
        SC.TsDownloadManager.getInstance().downloadFile(path, async (path2, ok) => {
          const modPromise = import(SC.TsDownloadManager.getDownloadPathForHTTPResources(path2));
          resolve(modPromise);
        });
      });
    }
    return import(path);
  };
  g.m = {};
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
  let CommonEventDataProto = SC.CommonEventData.prototype;
  CommonEventDataProto.setDisplayObject = function($index, $v) {
    SC.GameTSUtil.setEventDisplayObject(this, $index, $v);
  };
  CommonEventDataProto.getDisplayObject = function($index) {
    return SC.GameTSUtil.getEventDisplayObject(this, $index);
  };
  CommonEventDataProto.isDisplayObject = function($index) {
    return SC.GameTSUtil.isEventDisplayObject(this, $index);
  };
  CommonEventDataProto.setLogicData = function($index, $v) {
    SC.GameTSUtil.setEventLogicData(this, $index, $v);
  };
  CommonEventDataProto.getLogicData = function($index) {
    return SC.GameTSUtil.getEventLogicData(this, $index);
  };
  CommonEventDataProto.isLogicData = function($index) {
    return SC.GameTSUtil.isEventLogicData(this, $index);
  };
  CommonEventDataProto.setJsObject = function($index, $v) {
    SC.GameTSUtilExt.setEventJsObject(this, $index, $v);
  };
  CommonEventDataProto.getJsObject = function($index) {
    return SC.GameTSUtilExt.getEventJsObject(this, $index);
  };
  CommonEventDataProto.isJsObject = function($index) {
    return SC.GameTSUtilExt.isEventJsObject(this, $index);
  };
  CommonEventDataProto.setNetMessage = function($index, $v) {
    SC.GameTSUtil.setEventPiranhaMessage(this, $index, $v);
  };
  CommonEventDataProto.getNetMessage = function($index) {
    return SC.GameTSUtil.getEventPiranhaMessage(this, $index);
  };
  CommonEventDataProto.isNetMessage = function($index) {
    return SC.GameTSUtil.isEventPiranhaMessage(this, $index);
  };
  SC.ScriptablePopup.prototype.getJsObject = function() {
    return SC.GameTSUtilExt.getJsObject(this.getScriptable());
  };
  SC.ScriptableGenericPopup.prototype.getJsObject = function() {
    return SC.GameTSUtilExt.getJsObject(this.getScriptable());
  };
  SC.ScriptableGameGUIContainer.prototype.getJsObject = function() {
    return SC.GameTSUtilExt.getJsObject(this.getScriptable());
  };
  SC.ScriptableButton.prototype.getJsObject = function() {
    return SC.GameTSUtilExt.getJsObject(this.getScriptable());
  };
  let DisplayObjectPrototype = SC.DisplayObject.prototype;
  Object.defineProperty(DisplayObjectPrototype, "x", {
    get: function() {
      return this.getX();
    },
    set: function(newValue) {
      this.setX(newValue);
    },
    enumerable: true,
    configurable: false
  });
  Object.defineProperty(DisplayObjectPrototype, "y", {
    get: function() {
      return this.getY();
    },
    set: function(newValue) {
      this.setY(newValue);
    },
    enumerable: true,
    configurable: false
  });
  Object.defineProperty(DisplayObjectPrototype, "width", {
    get: function() {
      return this.getWidth();
    },
    set: function(newValue) {
      this.setWidth(newValue);
    },
    enumerable: true,
    configurable: false
  });
  Object.defineProperty(DisplayObjectPrototype, "height", {
    get: function() {
      return this.getHeight();
    },
    set: function(newValue) {
      this.setHeight(newValue);
    },
    enumerable: true,
    configurable: false
  });
  Object.defineProperty(DisplayObjectPrototype, "scale", {
    get: function() {
      return this.getScaleX();
    },
    set: function(newValue) {
      this.setScale(newValue);
    },
    enumerable: true,
    configurable: false
  });
  Object.defineProperty(DisplayObjectPrototype, "scaleX", {
    get: function() {
      return this.getScaleX();
    },
    set: function(newValue) {
      this.setScaleX(newValue);
    },
    enumerable: true,
    configurable: false
  });
  Object.defineProperty(DisplayObjectPrototype, "scaleY", {
    get: function() {
      return this.getScaleY();
    },
    set: function(newValue) {
      this.setScaleY(newValue);
    },
    enumerable: true,
    configurable: false
  });
  Object.defineProperty(DisplayObjectPrototype, "alpha", {
    get: function() {
      return this.getAlpha();
    },
    set: function(newValue) {
      this.setAlpha(newValue);
    },
    enumerable: true,
    configurable: false
  });
  g.assert = function(cond, msg) {
    if (!cond) {
      SC.Debugger.error(msg ? msg : "assert failed");
    }
    return cond;
  };
  g.handleException = function(e, msg) {
    let res = "";
    if (msg) {
      res += msg;
    }
    if (e) {
      if (e.name) {
        res += e.name;
      }
      if (e.message) {
        res += e.message + "\n";
      }
      let stack = e.stack;
      if (stack) {
        stack = stack.substring(stack.indexOf("\n") + 1);
        stack = stack.replace(/^ {4}/gm, "");
        res += stack;
      }
    }
    console.warn("ts [ERROR]", res);
    if (LASER_DEBUG) {
      let popup = SC.K2GUI.show1ButtonPopup("exception", res, () => {
        SC.Application.copyString(res);
      });
    }
  };
  g.cast = cast;
})(globalThis);
