const logs = {
    errors: {
        undefinedParam: "{param} param is not defined.",
        invalidContentType: "Invalid content type: {type}. Content must be a string.",
        invalidElementType: "Invalid element type: {type}. Element must be an HTML Element (DOM).",
        invalidRulesType: "Invalid rules type: {type}. Rules must be an object.",
        noContent: "Content is not defined.\nTo define the content you can:\n1. Provide the content as the first parameter of the NXTLVL class (new NXTLVL(content)).\n2. Provide the content as the first parameter of the md method (.md(content)).",
        noStyleSelector: "Selector is missing."
    },

    warns: {
        noStyleTargets: "No targets found for selector \"{selector}\".",
        unnecessaryBlocks: "Unnecessary block: {block}.\nIt is unnecessary to nest blocks of the same type."
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
    const targetIds = type === "error" ? logs.errors : logs.warns;
    let target = { id: "", content: "" };

    Object.keys(targetIds).forEach((key, index) => {
        if(id === key) target = { id, content: Object.values(targetIds)[index] };
    });

    return logFunction(target);

    function logFunction({ id, content }) {
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
}