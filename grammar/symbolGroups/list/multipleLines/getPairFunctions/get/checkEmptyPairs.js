import Log from "../../../../../../Log.js";
import isSpecial from "../../isSpecial.js";

export default function checkEmptyPairs(content, specialPairs) {
    const emptyPairs = [];
    let newPairs = specialPairs;
    
    newPairs.forEach(pair => {
        const pairContent = content.substring(pair.start, pair.end);
        
        const lines = pairContent.split("\n");
        lines.shift();

        let status = false;
        lines.forEach(line => { if(line && line !== "<br>") status = true });

        if(status) return;
        
        emptyPairs.push(...newPairs.filter(p => p.start === pair.start && p.end === pair.end));
        newPairs = newPairs.filter(p => p.start !== pair.start && p.end !== pair.end);

        const specialSymbol = isSpecial(pairContent.split("\n")[0]);
        Log.warn("EMPTY.SPECIAL_BLOCK", specialSymbol);
    });

    return { emptyPairs, newPairs };
}