import Convert from "../Convert.js";
import parseSelector from "./parseSelector.js";

export default function toString(rules) {
    let convertedRules = "";

    Object.keys(rules).forEach((selector, index) => {
        const parsedSelector = parseSelector(selector);
        if(parsedSelector.length === 0) return Log.error("UNDEFINED.STYLE_SELECTOR");

        const block = Object.values(rules)[index];
        
        if(typeof block !== "object") return Log.error("INVALID_TYPE.STYLE_BLOCK", typeof block);
        if(Object.keys(block).length === 0) return Log.warn("EMPTY.STYLE_BLOCK", selector);

        const parsedBlock = parseBlock(block);

        convertedRules += `${parsedSelector} {${parsedBlock}}`;
    });

    return convertedRules;
}

function parseBlock(block) {
    let parsedBlock = "";

    if(Object.keys(block).length === 0) return parsedBlock;

    Object.keys(block).forEach((property, index) => {
        const value = Object.values(block)[index];
        parsedBlock += `${Convert.camelToKebab(property)}: ${value};`;
    });

    return parsedBlock;
}