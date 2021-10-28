import pkg from "../../package.json";
import api from './modules/api/index.mjs'
import init from './modules/fs/main.mjs'
import bytecode from './modules/fs/wasmBinary.mjs'
import isEmpty from './modules/isEmpty/isEmpty.mjs'

const CONFIG_DEFAULTS = {
    // Folder to use for mounting the shared filesystem
    dirShared: "/shared",
    // Folder to use for mounting File/Blob objects to the virtual file system
    dirMounted: "/mnt",
    // Folder to use for symlinks (basically, we make a symlink to each file mounted on WORKERFS
    // so that operations like "samtools index" don't crash due to the read-only nature of WORKERS).
    // Also mount URLs lazily in that folder.
    dirData: "/data",
    // Interleave stdout/stderr. If set to false, `.exec()` returns an object { "stdout": <text>, "stderr": <text> }
    printInterleaved: true,

    callback: null,

    // Debugging
    debug: false,
    env: "prd",
    fs: {
        worker: { },
        idbfs: { },
        api: { }
    },
    terminate: () => { }
};

let create = async (object) => {
    if(! await object.fs.api.is.dir(object.dirMounted)) {
        await object.fs.api.mkdir(object.dirMounted);
    }
    if(! await object.fs.api.is.dir(object.dirShared)) {
        await object.fs.api.mkdir(object.dirShared);
    }
    if(! await object.fs.api.is.dir(`${object.dirShared}${object.dirData}`)) {
        await object.fs.api.mkdir(`${object.dirShared}${object.dirData}`);
    }
    if(! await object.fs.api.is.dir(`${object.dirShared}${object.dirMounted}`)) {
        await object.fs.api.mkdir(`${object.dirShared}${object.dirMounted}`);
    }
    return object
}

export let WORKERFS = (object = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            object = Object.assign({}, CONFIG_DEFAULTS, object);
            let Module = await init({ wasmBinary: bytecode })
            object.fs.worker = await Module.FS
            object.fs.api = await api.WORKERFS(object)
            await create(object)
            resolve(new Proxy(object.fs.api, {
                get: (obj, prop) => {
                    console.log((obj[prop]) ? prop : "process")
                    return obj[prop];
                },
                set: (obj, prop, value) => {
                    console.log(prop, (obj[prop]) ? value : "process")
                    if(isEmpty(obj[prop])){
                        obj[prop] = []
                    }
                    obj[prop] = value;
                    return true
                }}))
        } catch (e) {
            reject(e)
        }
    })
}

export let IDBFS = (object = { }) => {
    return new Promise(async (resolve, reject) => {
        try {
            object = Object.assign({}, CONFIG_DEFAULTS, object);
            let Module = await init({ wasmBinary: bytecode })
            object.fs.idbfs = await Module.FS;
            object.fs.api = await api.IDBFS(object);
            await create(object)
            let mount = `${object.dirShared}${object.dirData}`
            await object.fs.api.mount(object.fs.idbfs.filesystems.IDBFS,  mount, {})
            await object.fs.api.fs.load();
            object.terminate = () => {
                if(window) {
                    window.onbeforeunload = function () {
                        object.fs.api.fsSave()
                    };
                } else {
                    console.log('неопределённое поведение')
                }
            }
            resolve(new Proxy(object.fs.api,{
                get: (obj, prop) => {
                    console.log((obj[prop]) ? prop : "process")
                    return obj[prop];
                },
                set: (obj, prop, value) => {
                    console.log(prop, (obj[prop]) ? value : "process")
                    if(isEmpty(obj[prop])){
                        obj[prop] = []
                    }
                    obj[prop] = value;
                    return true
                }}))
        } catch (e) {
            reject(e)
        }
    })
}

export default pkg