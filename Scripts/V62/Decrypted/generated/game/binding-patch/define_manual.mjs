puerTypePatch("NodeJSShim.fs", (type) => {
  type.readFileSync = function(fileName, encoding) {
    return SC.TitanUtil.readFileAsString(fileName);
  };
});
//# sourceMappingURL=define_manual.mjs.map
