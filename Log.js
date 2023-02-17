const logs = {
    errors: {
        INVALID_TYPE: {
            CONTENT: "Invalid content type: {type}. Content must be a string.",
            ELEMENT: "Invalid element type: {type}. Element must be an HTML Element (DOM) or an array of elements.",
            RULES: "Invalid rules type: {type}. Rules must be an object.",
            STYLE_BLOCK: "Invalid block of rules type: {type}. Block of rules must be an object.",
            SETTINGS: "Invalid settings configuration type: {type}. Settings configuration param must be an object.",
            INHERIT: "Invalid type of the reserved property \"inherit\": {type}. \"Inherit\" property must be a boolean."
        },

        UNDEFINED: {
            PARAM: "{param} param is not defined.",
            CONTENT: "Content is not defined.\nTo define the content you can:\n1. Provide the content as the first parameter of the NXTLVL class (new NXTLVL(content)).\n2. Provide the content as the first parameter of the md method (.md(content)).",
            STYLE_SELECTOR: "Selector is not defined."
        },

        UNKNOWN: {
            SETTING: "Unkown setting: {setting}. While configuring default settings you should edit only the existing properties."
        }
    },

    warns: {
        EMPTY: {
            SETTINGS: "Settings configuration object is empty.",
            STYLE_ARRAY: "Array of elements is empty.",
            STYLE_BLOCK: "Block of rules for selector \"{selector}\" is empty."
        },

        UNNECESSARY: {
            BLOCKS: "Unnecessary block: {block}.\nIt is unnecessary to nest blocks of the same type."
        },

        UNDEFINED: {
            STYLE_TARGETS: "No targets found for selector \"{selector}\"."
        }
    }
};

const Log = { error, warn };
export default Log;

function error(id, props) {
    return log("error", id, props);
}

function warn(id, props) {
    return log("warn", id, props)
}

function log(type, id, props) {
    const content = getContent(type, id);
    let validContent = content;
    
    const logProps = propFinder();

    if(typeof props === "string" && logProps.length === 1) validContent = validContent.replaceAll(`{${logProps[0]}}`, props);

    if(typeof props === "object") logProps.forEach(logProp => {
        let prop = "";
        
        Object.keys(props).forEach((key, index) => {
            if(logProp === key) prop = Object.values(props)[index];
        });

        if(prop) validContent = validContent.replaceAll(`{${logProp}}`, prop);
    });

    const logContent = `NTLVL.md ${type === "error" ? "Error" : "Warning"}: ${validContent} (${id})`;
    type === "error" ? console.error(logContent) : console.warn(logContent);

    const logContentHTML = logContent.replaceAll("\n", "<br>");
    return logContentHTML;
    
    function propFinder() {
        const regex = /(?<={)[a-zA-Z0-9]+(?=})/gm;
        return validContent.match(regex);
    }
}

function getContent(type, id) {
    let target = type === "error" ? logs.errors : logs.warns;
    const path = id.split(".");

    for(let i = 0; i < path.length; i++) findPath(path[i]);

    return target;

    function findPath(currentPath) {
        const targetKeys = Object.keys(target);
        const newTargetIndex = targetKeys.indexOf(currentPath);

        if(newTargetIndex > -1) target = Object.values(target)[newTargetIndex];
    }
}