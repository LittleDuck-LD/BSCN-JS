const { defineMethodHandler, callClient, broadcastMessage } = PuerhInspector;
const allNodes = {};
defineMethodHandler("DOM.enable", function(wsProxy, params) {
  globalThis.unsafeInspectorDocumentReload = function() {
    wsProxy.SendPayload(
      JSON.stringify({
        "method": "DOM.documentUpdated",
        "params": {}
      })
    );
  };
  return {};
});
defineMethodHandler("DOM.getDocument", function(wsProxy, params) {
  return {
    root: transferTitanTreeToCDPTree()
  };
});
defineMethodHandler("DOM.getTopLayerElements", function(wsProxy, params) {
  return {
    nodeIds: []
  };
});
defineMethodHandler("Overlay.highlightNode", function(wsProxy, params) {
  const bgColor = convertToCppColor(params.highlightConfig?.contentColor);
  const borderColor = convertToCppColor(params.highlightConfig?.contentColor);
  SC.TSDevtool.getInstance().highlightElement(allNodes[params.nodeId], bgColor, borderColor);
  return {};
});
defineMethodHandler("Overlay.hideHighlight", function(wsProxy, params) {
  SC.TSDevtool.getInstance().highlightElement(null, 0, 0);
  return {};
});
defineMethodHandler("Overlay.setInspectMode", function(wsProxy, params) {
  if (params.mode == "searchForNode") {
    SC.TSDevtool.getInstance().startInspect((node) => {
      const nodeId = Number(SC.TitanUtil.getAddr(node));
      wsProxy.SendPayload(
        JSON.stringify({
          "method": "Overlay.inspectNodeRequested",
          "params": { backendNodeId: nodeId }
        })
      );
    });
  } else if (params.mode == "none") {
    SC.TSDevtool.getInstance().finishInspect();
  }
  return {};
});
defineMethodHandler("DOM.pushNodesByBackendIdsToFrontend", function(wsProxy, params) {
  return { nodeIds: params.backendNodeIds };
});
defineMethodHandler("DOM.setInspectedNode", function(wsProxy, params) {
  globalThis.$4 = globalThis.$3;
  globalThis.$3 = globalThis.$2;
  globalThis.$2 = globalThis.$1;
  globalThis.$1 = globalThis.$0;
  globalThis.$0 = allNodes[params.nodeId];
  return {};
});
defineMethodHandler("Page.getResourceTree", emptyHandler);
defineMethodHandler("Page.setAdBlockingEnabled", emptyHandler);
defineMethodHandler("Emulation.setFocusEmulationEnabled", emptyHandler);
defineMethodHandler("DOMDebugger.setBreakOnCSPViolation", emptyHandler);
defineMethodHandler("Page.enable", emptyHandler);
defineMethodHandler("CSS.enable", emptyHandler);
defineMethodHandler("CSS.trackComputedStyleUpdates", emptyHandler);
defineMethodHandler("CSS.takeComputedStyleUpdates", emptyHandler);
defineMethodHandler("CSS.getMatchedStylesForNode", emptyHandler);
defineMethodHandler("CSS.getComputedStyleForNode", emptyHandler);
defineMethodHandler("CSS.getInlineStylesForNode", emptyHandler);
defineMethodHandler("Overlay.enable", emptyHandler);
defineMethodHandler("Overlay.setShowGridOverlays", emptyHandler);
defineMethodHandler("Overlay.setShowFlexOverlays", emptyHandler);
defineMethodHandler("Overlay.setShowScrollSnapOverlays", emptyHandler);
defineMethodHandler("Overlay.setShowContainerQueryOverlays", emptyHandler);
defineMethodHandler("Overlay.setShowIsolatedElements", emptyHandler);
defineMethodHandler("Overlay.setShowViewportSizeOnResize", emptyHandler);
defineMethodHandler("Autofill.enable", emptyHandler);
defineMethodHandler("Autofill.setAddresses", emptyHandler);
function emptyHandler() {
  return;
}
function transferTitanTreeToCDPTree() {
  const mainSprite = SC.Stage.getInstance().getMainSprite();
  const nodeId = Number(SC.TitanUtil.getAddr(SC.Stage.getInstance()));
  return {
    nodeId,
    backendNodeId: nodeId,
    nodeType: 1,
    nodeName: "Stage",
    name: "Stage",
    localName: "StageLocal",
    nodeValue: "StageValue",
    children: [iterate(mainSprite, 0)],
    attributes: []
  };
  function iterate(sprite, level) {
    const children = [];
    if (sprite.isSprite()) {
      sprite.__proto__ = SC.Sprite.prototype;
      const length = sprite.getNumChildren();
      for (let i = 0; i < length; i++) {
        const dobj = sprite.getChildAt(i);
        children.push(iterate(dobj, level + 1));
      }
    }
    const attributes = [];
    let instanceName;
    if (instanceName = SC.GameTSUtil.getDisplayObjectInstanceName(sprite)) {
      attributes.push("instanceName");
      attributes.push(instanceName);
    }
    let exportName;
    if (exportName = SC.GameTSUtil.getDisplayObjectExportName(sprite)) {
      attributes.push("exportName");
      attributes.push(exportName);
    }
    const nodeId2 = Number(SC.TitanUtil.getAddr(sprite));
    allNodes[nodeId2] = sprite;
    return {
      // probably loss
      nodeId: nodeId2,
      backendNodeId: nodeId2,
      nodeType: 1,
      nodeName: SC.GameTSUtil.getDisplayObjectClassName(sprite),
      name: SC.GameTSUtil.getDisplayObjectClassName(sprite),
      localName: SC.GameTSUtil.getDisplayObjectClassName(sprite) + "Local",
      nodeValue: SC.GameTSUtil.getDisplayObjectClassName(sprite) + "Value",
      children,
      attributes
    };
  }
}
function convertToCppColor(color) {
  if (!color) return 2842667228;
  const alpha = Math.floor(color.a * 256) << 24;
  const red = Math.floor(color.r) << 16;
  const green = Math.floor(color.g) << 8;
  const blue = Math.floor(color.b);
  return alpha | red | green | blue;
}
export {
  broadcastMessage,
  callClient
};
//# sourceMappingURL=devtool.mjs.map
