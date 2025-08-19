function load(url, callback) {
  if (url.startsWith("devtool://contents/")) {
    PuerhInspector.callClient("##Puerh_host##", "loadDevtoolContents", { url }).then((res) => {
      callback(res.content);
    }).catch((e) => {
      console.warn(e);
      callback(null);
    });
  } else if (url.startsWith("http://")) {
  }
}
export {
  load
};
