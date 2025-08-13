
// // node.js style loader
// export async function resolve(specifier, context, nextResolve) {
//   const { parentURL = null } = context;
// }

// export async function load(url, context, nextLoad) {

// }

export function load(url, callback) {
    if (url.startsWith("inspector://")) {
        import('./devtool.mjs')
            .then(({ devtool }) => {
                return devtool.callHost("loadTestCode", { url })
            })
            .then(res => {
                callback(res.content)
            })
            .catch(e => {
                console.warn(e);
                callback(null)
            })

    } else if (url.startsWith("http://")) {
        

    }
}