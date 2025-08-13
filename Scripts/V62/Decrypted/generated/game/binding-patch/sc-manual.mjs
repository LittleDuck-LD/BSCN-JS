puerTypePatch("NodeJSShim.fs", (type) => {
  type.readFileSync = function(fileName, encoding) {
    return SC.TitanUtil.readFileAsString(fileName);
  };
});
//# sourceMappingURL=sc-manual.mjs.map
