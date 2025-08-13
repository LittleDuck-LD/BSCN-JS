const allNodes = {};

const handler = {};
function defineMethodHandler(method, callback) {
    handler[method] = callback
}

defineMethodHandler("DOM.enable", function (wsProxy, params) {
    globalThis.unsafeInspectorDocumentReload = function () {
        wsProxy.SendPayload(
            JSON.stringify({
                "method": "DOM.documentUpdated",
                "params": {}
            })
        )
    }
    return {};
});
defineMethodHandler('DOM.getDocument', function (wsProxy, params) {
    return {
        root: transferTitanTreeToCDPTree()
    }
});
defineMethodHandler('DOM.getTopLayerElements', function (wsProxy, params) {
    return {
        nodeIds: []
    }
});
defineMethodHandler('Overlay.highlightNode', function (wsProxy, params) {
    const bgColor = convertToCppColor(params.highlightConfig?.contentColor);
    const borderColor = convertToCppColor(params.highlightConfig?.contentColor);
    SC.TSDevtool.getInstance().highlightElement(allNodes[params.nodeId], bgColor, borderColor);
    return {};
});
defineMethodHandler('Overlay.hideHighlight', function (wsProxy, params) {
    SC.TSDevtool.getInstance().highlightElement(null, 0, 0);
    return {};
});
defineMethodHandler('Overlay.setInspectMode', function (wsProxy, params) {
    if (params.mode == "searchForNode") {
        SC.TSDevtool.getInstance().startInspect((node) => {
            const nodeId = parseInt(SC.TitanUtil.getAddr(node));
            wsProxy.SendPayload(
                JSON.stringify({
                    "method": "Overlay.inspectNodeRequested",
                    "params": { backendNodeId: nodeId }
                })
            );
        })

    } else if (params.mode == "none") {
        SC.TSDevtool.getInstance().finishInspect();
    }
    return {};
});
defineMethodHandler('DOM.pushNodesByBackendIdsToFrontend', function (wsProxy, params) {
    return { nodeIds: params.backendNodeIds }
});
defineMethodHandler('DOM.setInspectedNode', function (wsProxy, params) {
    globalThis.$4 = globalThis.$3
    globalThis.$3 = globalThis.$2
    globalThis.$2 = globalThis.$1
    globalThis.$1 = globalThis.$0
    globalThis.$0 = allNodes[params.nodeId]
    return {};
});
defineMethodHandler('Page.getResourceTree', emptyHandler);
defineMethodHandler('Page.setAdBlockingEnabled', emptyHandler);
defineMethodHandler('Emulation.setFocusEmulationEnabled', emptyHandler);
defineMethodHandler('DOMDebugger.setBreakOnCSPViolation', emptyHandler);
defineMethodHandler("Page.enable", emptyHandler);
defineMethodHandler("CSS.enable", emptyHandler);
defineMethodHandler('CSS.trackComputedStyleUpdates', emptyHandler);
defineMethodHandler('CSS.takeComputedStyleUpdates', emptyHandler);
defineMethodHandler("CSS.getMatchedStylesForNode", emptyHandler);
defineMethodHandler("CSS.getComputedStyleForNode", emptyHandler);
defineMethodHandler("CSS.getInlineStylesForNode", emptyHandler);
defineMethodHandler("Overlay.enable", emptyHandler);
defineMethodHandler('Overlay.setShowGridOverlays', emptyHandler);
defineMethodHandler('Overlay.setShowFlexOverlays', emptyHandler);
defineMethodHandler('Overlay.setShowScrollSnapOverlays', emptyHandler);
defineMethodHandler('Overlay.setShowContainerQueryOverlays', emptyHandler);
defineMethodHandler('Overlay.setShowIsolatedElements', emptyHandler);
defineMethodHandler('Overlay.setShowViewportSizeOnResize', emptyHandler);
defineMethodHandler('Autofill.enable', emptyHandler);
defineMethodHandler('Autofill.setAddresses', emptyHandler);
function emptyHandler() {
    return;
}

function transferTitanTreeToCDPTree() {
    const mainSprite = SC.Stage.getInstance().getMainSprite();
    const nodeId = parseInt(SC.TitanUtil.getAddr(SC.Stage.getInstance()))
    return {
        nodeId,
        backendNodeId: nodeId,
        nodeType: 1,
        nodeName: 'Stage',
        name: 'Stage',
        localName: "StageLocal",
        nodeValue: "StageValue",
        children: [iterate(mainSprite, 0)],
        attributes: []
    };

    function iterate(sprite, level) {
        const children = [];
        if (sprite.isSprite()) {
            sprite.__proto__ = SC.Sprite.prototype
            const length = sprite.getNumChildren();
            for (let i = 0; i < length; i++) {
                const dobj = sprite.getChildAt(i);

                children.push(iterate(dobj, level + 1));
            }
        }
        const attributes = [];
        let instanceName;
        if (instanceName = SC.GameTSUtil.getDisplayObjectInstanceName(sprite)) {
            attributes.push('instanceName')
            attributes.push(instanceName)
        }
        let exportName;
        if (exportName = SC.GameTSUtil.getDisplayObjectExportName(sprite)) {
            attributes.push('exportName')
            attributes.push(exportName)
        }
        const nodeId = parseInt(SC.TitanUtil.getAddr(sprite));
        allNodes[nodeId] = sprite
        return {
            // probably loss
            nodeId,
            backendNodeId: nodeId,
            nodeType: 1,
            nodeName: SC.GameTSUtil.getDisplayObjectClassName(sprite),
            name: SC.GameTSUtil.getDisplayObjectClassName(sprite),
            localName: SC.GameTSUtil.getDisplayObjectClassName(sprite) + "Local",
            nodeValue: SC.GameTSUtil.getDisplayObjectClassName(sprite) + "Value",
            children,
            attributes
        }
    }
}

function convertToCppColor(color) {
    if (!color) return 0xa96fa8dc;
    const alpha = Math.floor(color.a * 256) << 24
    const red = Math.floor(color.r) << 16
    const green = Math.floor(color.g) << 8
    const blue = Math.floor(color.b);
    return alpha | red | green | blue
}


let incHostCallID = 0;
const hostCallCallbacks = {}
defineMethodHandler("K2.returnHostCall", (wsProxy, payload) => {
    const { callID, error, result } = payload;
    const callback = hostCallCallbacks[callID];
    if (callback) {
        if (error) {
            callback(error)
        } else {
            callback(null, JSON.parse(result))
        }
    }
})
async function callHost(action, params) {
    // TODO use the enthroneAsHost one
    const callID = incHostCallID++;
    return await new Promise((resolve, reject) => {
        hostCallCallbacks[callID] = function (error, result) {
            delete hostCallCallbacks[callID];
            error ? reject(error) : resolve(result);
        }
        hostProxy.SendPayload(
            JSON.stringify({
                method: 'K2.hostCalled', 
                params: {
                    action, params, callID
                }
            })
        );
    })
}

let hostProxy = null
const allProxy = new Set();
export const devtool = {
    broadcastMessage(method, params) {
        // broadcast message
        for (const proxy of allProxy) {
            proxy.SendPayload(
                JSON.stringify({
                    method, params
                })
            );
        }
    },

    defineMethodHandler,

    callHost
}
defineMethodHandler('K2.enthroneAsHost', (wsProxy) => {
    hostProxy = wsProxy
})

export function _internal_onConnect_(wsProxy) {
    allProxy.add(wsProxy)
}
export function _internal_onDisconnect_(wsProxy) {
    allProxy.delete(wsProxy);
}
export function _internal_onMessage_(wsProxy, jsonstr) {
    try {
        const obj = JSON.parse(jsonstr);
        const method = obj.method;
        if (!handler[method]) return false;
        const result = handler[method](wsProxy, obj.params);

        if (result === false)
            return false;
        else {
            wsProxy.SendPayload(JSON.stringify({ "id": obj.id, "result": result }));
            return true
        }

    } catch (e) {
        console.warn(e);
        return false;

    }
}