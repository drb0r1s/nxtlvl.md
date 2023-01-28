import Log from "../../../Log.js";

export default function multipleLines({ content, symbol, matches }) {
    let parsedContent = content;
    
    const pairs = [];
    const specialPairs = [];

    let specialSymbols = [];
    const clearMd = symbol.md.replace(/\\+/g, "");
    
    checkPairs();
    checkSpecialPairs();

    let addingDifference = 0;

    addPairs(pairs);
    addSpecialPairs(specialPairs);

    unnecessaryBlocksCheck();    

    const patterns = {
        classicMd: `(?<=<${symbol.tag}>)${symbol.md}${symbol.tag === "blockquote" ? "(?=<h\\d>|\\s+)" : ""}\\s*(?!<br>)|^${symbol.md}\\s+(?!<br>)`,
        nxtlvlMd: `(?<=<${symbol.tag}>)\\(${symbol.md}(\\s+)?<br>|(?<=<\\/${symbol.tag}>)${symbol.md}\\)(\\s+)?<br>`
    };

    console.log(patterns.classicMd)

    const remove = {
        classicMd: new RegExp(patterns.classicMd, "gm"),
        nxtlvlMd: new RegExp(patterns.nxtlvlMd, "gm")
    };

    parsedContent = parsedContent.replace(remove.classicMd, "");
    parsedContent = parsedContent.replace(remove.nxtlvlMd, "");

    return parsedContent;

    function addPairs(pairs) {
        pairs.forEach(pair => {
            const tags = { opened: `<${symbol.tag}>`, closed: `</${symbol.tag}>` };
            const realPositions = { start: pair.start + addingDifference, end: pair.end + addingDifference };

            parsedContent = parsedContent.substring(0, realPositions.start) + tags.opened + parsedContent.substring(realPositions.start, realPositions.end) + tags.closed + parsedContent.substring(realPositions.end);
            addingDifference += tags.opened.length + tags.closed.length;
        });
    }

    function checkPairs() {
        let pairTemplate = {};
        
        matches.forEach((match, index) => {
            if(match.md === `(${clearMd}<br>` || match.md === `${clearMd})<br>`) return specialSymbols.push({ type: match.md[0] == "(" ? "opened" : "closed", position: match.position });
            
            const eol = match.position + match.md.length;
            const nextMatch = matches[index + 1];
    
            if(Object.keys(pairTemplate).length === 0) pairTemplate = { start: match.position, end: eol };
            
            if(!nextMatch || (eol + 1 !== nextMatch.position)) {
                pairs.push(pairTemplate);
                pairTemplate = {};
            }
            
            else if(eol + 1 === nextMatch.position) pairTemplate = {...pairTemplate, end: nextMatch.position + nextMatch.md.length};
        });
    }

    function addSpecialPairs(pairs) {
        pairs.forEach(pair => {
            const tag = `<${pair.type === "opened" ? "" : "/"}${symbol.tag}>`;
            const realPosition = pair.position + addingDifference;

            parsedContent = parsedContent.substring(0, realPosition) + tag + parsedContent.substring(realPosition);
            addingDifference += tag.length;
        });
    }

    function checkSpecialPairs() {
        if(specialSymbols.length === 0) return;
        
        const counter = { opened: 0, closed: 0 };
        const cut = { type: "", difference: 0 };

        if(specialSymbols[0].type === "closed") specialSymbols = specialSymbols.slice(1);
        if(specialSymbols[specialSymbols.length - 1] === "opened") specialSymbols = specialSymbols.slice(0, specialSymbols.length - 1);

        for(let i = 0; i < specialSymbols.length; i++) {
            if(specialSymbols[i].type === "opened") counter.opened++;
            else counter.closed++;
        }

        if(counter.opened !== counter.closed) {
            const larger = counter.opened > counter.closed ? "opened" : "closed";
            cut.type = larger;
        }

        cut.difference = Math.abs(counter.opened - counter.closed);

        for(let i = specialSymbols.length - 1; i >= 0; i--) {
            if(cut.type === specialSymbols[i].type && cut.difference > 0) cut.difference--;
            else specialPairs.push(specialSymbols[i]);
        }

        return specialPairs.reverse();
    }

    function unnecessaryBlocksCheck() {
        let unnecessaryBlocks = false;

        for(let i = 0; i < specialPairs.length; i++) {
            if(specialPairs[i + 1] && specialPairs[i].type === specialPairs[i + 1].type && !unnecessaryBlocks) unnecessaryBlocks = true;
        }

        if(unnecessaryBlocks) Log.warn("unnecessaryBlocks", clearMd);
    }
}