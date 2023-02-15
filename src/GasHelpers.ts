"use strict";

export { parseProp, setScriptArray, setScriptObject };

/**
 * 透過 Properties Service 取得屬性並解析
 */
function parseProp(
  key: string,
  getter:
    | "getScriptProperties"
    | "getScriptProperties"
    | "getUserProperties" = "getScriptProperties"
) {
  const prop = PropertiesService[getter]().getProperty(key);
  if (prop == null) throw new Error("parseProp cannot get property" + key);

  try {
    return JSON.parse(prop);
  } catch (err) {
    if (err instanceof Error && err.name != "SyntaxError") throw err;

    return prop;
  }
}

/**
 * 將指定值添加到 Script Properties 指定的 Array 當中
 */
function setScriptArray(key: string, value: any, allowDuplicate = true) {
  const scriptProps = PropertiesService.getScriptProperties();
  let arr = parseProp(key);

  if (!allowDuplicate && arr?.includes(value)) return arr;

  arr = arr ? arr.concat(value) : [value];
  scriptProps.setProperty(key, JSON.stringify(arr));

  return arr;
}

/**
 * 將指定值添加到 Script Properties 指定的巢狀 Object 當中
 */
function setScriptObject(keys: string[], value: any) {
  if (keys.length < 2) {
    throw new SyntaxError(
      `The first argument of setScriptObject should has at least two elements.`
    );
  }

  const scriptProps = PropertiesService.getScriptProperties();
  const [firstKey, lastKey] = [keys.shift(), keys.pop()];
  const topObj = parseProp(firstKey!) || {};

  keys.reduce((obj, key) => {
    if (!obj[key]) {
      obj[key] = {};
    }

    return obj[key];
  }, topObj)[lastKey!] = value;

  scriptProps.setProperty(firstKey!, JSON.stringify(topObj));

  return topObj;
}
