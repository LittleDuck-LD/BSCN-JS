puerTypePatch("NodeJSShim.fs", (type) => {
  type.readFileSync = function(fileName, encoding) {
    return SC.TitanUtil.readFileAsString(fileName);
  };
});
puerTypePatch("LogicSkinAlbumData", (type) => {
  let tLocation = {};
  type.AcquireLocation = tLocation;
  tLocation["AcquireLocation_None"] = 0;
  tLocation["AcquireLocation_BrawlPass"] = 1;
  tLocation["AcquireLocation_EventGacha"] = 2;
  tLocation["AcquireLocation_NormalShop"] = 3;
  tLocation["AcquireLocation_EventShop"] = 4;
  tLocation["AcquireLocation_EventMenu"] = 5;
  tLocation["AcquireLocation_ClubChallenge"] = 6;
  tLocation["AcquireLocation_HeroScreen"] = 7;
});
puerTypePatch("LogicSkinAlbumData", (type) => {
  console.log("puerTypePatch LogicSkinAlbumData.AlbumType");
  let t = {};
  type.AlbumType = t;
  t["AlbumType_None"] = 0;
  t["AlbumType_Collab"] = 1;
  t["AlbumType_Trio"] = 2;
});
//# sourceMappingURL=define_manual.mjs.map
