function parseTable(tableType, schemaObj) {
  let table = SC.LogicDataTables.getTable(tableType);
  if (!table) return [];
  let keyArr = [];
  let colIndexArr = [];
  let getterFuncArr = [];
  for (const key in schemaObj) {
    keyArr.push(key);
    colIndexArr.push(table.getCSVTable().getColumnIndexByName(key));
    let val = schemaObj[key];
    const typeStr = typeof val;
    switch (typeStr) {
      case "string":
        getterFuncArr.push(SC.LogicData.prototype.getValueAt);
        break;
      case "number":
        if (!Number.isInteger(val)) {
          SC.Debugger.error(`no support type ${key} float`);
          return [];
        }
        getterFuncArr.push(SC.LogicData.prototype.getIntegerValueAt);
        break;
      case "boolean":
        getterFuncArr.push(SC.LogicData.prototype.getBooleanValueAt);
        break;
      default:
        SC.Debugger.error(`no support type ${key} ${typeStr}`);
        break;
    }
  }
  let result = [];
  let colLength = colIndexArr.length;
  let len = table.getItemCount();
  for (let i = 0; i < len; i++) {
    let item = table.getItemAt(i);
    let obj = {};
    for (let j = 0; j < colLength; j++) {
      let key = keyArr[j];
      obj[key] = getterFuncArr[j].call(item, colIndexArr[j]);
    }
    result.push(obj);
  }
  return result;
}
export {
  parseTable
};
//# sourceMappingURL=datatable.mjs.map
