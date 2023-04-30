import Log from "../../Log.js";
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

        const [parsedBlock, innerBlocks] = parseBlock(selector, block);

        convertedRules += `${parsedSelector} {${parsedBlock}}`;
        innerBlocks.forEach(innerBlock => { convertedRules += innerBlock });
    });

    return convertedRules;
}

function parseBlock(selector, block) {
    let parsedBlock = "";
    const innerBlocks = [];

    if(Object.keys(block).length === 0) return parsedBlock;

    Object.keys(block).forEach((property, index) => {
        const value = Object.values(block)[index];
        
        if(typeof value === "object") innerBlocks.push(toString({ [`${selector} ${property}`]: value }));
        else parsedBlock += `${Convert.camelToKebab(property)}: ${value};`;
    });

    return [parsedBlock, innerBlocks];
}