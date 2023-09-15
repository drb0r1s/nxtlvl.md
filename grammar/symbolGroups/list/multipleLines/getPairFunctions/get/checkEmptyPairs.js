import Log from "../../../../../../Log.js";
import isSpecial from "../../isSpecial.js";

export default function checkEmptyPairs(content, pairs) {
    const newPairs = pairs;
    
    newPairs.special.forEach(pair => {
        const pairContent = content.substring(pair.start, pair.end);
        
        const lines = pairContent.split("\n");
        lines.shift();

        let status = false;
        lines.forEach(line => { if(line && line !== "<br>") status = true });

        if(status) return;
        
        newPairs.empty.push(pair);
        newPairs.special = newPairs.special.filter(p => p.start !== pair.start && p.end !== pair.end);

        const specialSymbol = isSpecial(pairContent.split("\n")[0]);
        Log.warn("EMPTY.SPECIAL_BLOCK", specialSymbol);
    });

    const updatedEmptyPairs = [];

    newPairs.empty.forEach(pair => {
        const afterEnd = content.substring(pair.end);
        const regex = /(?<=\)\s*)<br>/;

        const positionEnd = pair.end + afterEnd.match(regex).index + 4;
        updatedEmptyPairs.push({...pair, end: positionEnd});
    });

    newPairs.empty = updatedEmptyPairs;

    return newPairs;
}