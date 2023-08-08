import Log from "../../../../Log.js";
import isSpecial from "./isSpecial.js";

export default function checkEmptyPairs(content, symbol, pairs) {
    const newPairs = {...pairs};
    
    newPairs.classic.forEach(pair => replaceEmptyPairs(pair, "classic"));
    newPairs.special.forEach(pair => replaceEmptyPairs(pair, "special"));

    function replaceEmptyPairs(pair, pairType) {
        if(pairType === "classic" && (symbol.tag === "blockquote" || symbol.tag === "details")) return;
        const pairContent = content.substring(pair.start, pair.end);
        
        const lines = pairContent.split("\n");
        if(pairType === "special") lines.shift();

        let status = false;
        lines.forEach(line => { if(line && line !== "<br>") status = true });

        if(!status) {
            let filteredPairs = [];

            if(pairType === "classic") {
                filteredPairs = newPairs.classic.filter(p => p.start !== pair.start && p.end !== pair.end);
                newPairs.classic = filteredPairs;
            }
            
            else {
                filteredPairs = newPairs.special.filter(p => p.start !== pair.start && p.end !== pair.end);
                newPairs.special = filteredPairs;

                const specialSymbol = isSpecial(pairContent.split("\n")[0], symbol);
                Log.warn("EMPTY.SPECIAL_BLOCK", specialSymbol);
            }
        }
    }

    return newPairs;
}