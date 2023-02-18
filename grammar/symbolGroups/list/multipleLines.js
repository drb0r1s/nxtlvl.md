import Syntax from "../../Syntax.js";
import Log from "../../../Log.js";

export default function multipleLines({ content, symbol, matches, tags }) {
    let parsedContent = content;

    const pairs = { classic: [], special: [] };

    let specialSymbols = [];
    const clearMd = symbol.md.replace(/\\+/g, "");

    let addingDifference = 0;

    if(symbol.md === ">") {
        const { multipleLines: pattern } = Syntax.patterns.get({ group: "multipleLines", md: ">" });
        let i = 0;

        while(getMatches().length > 0) {
            pairs.classic = [];
            
            const currentMatches = getMatches();
            console.log(currentMatches)

            if(i === 0) {
                checkPairs(currentMatches);
                checkSpecialPairs();

                addPairs();
                addSpecialPairs();
            }

            else {
                checkPairs(currentMatches);
                addPairs();
            }

            removeMd();
            
            i++;
            addingDifference = 0;
        }

        function getMatches() {
            if(i === 0) return matches;

            const newMatches = Syntax.match(parsedContent, symbol, pattern);
            return newMatches;
        }
    }

    else {
        checkPairs(matches);
        checkSpecialPairs();

        addPairs();
        addSpecialPairs();

        removeMd();
    }

    if(symbol.md !== ">") unnecessaryBlocksCheck();

    return parsedContent;

    function addPairs() {
        pairs.classic.forEach(pair => {
            const realPositions = { start: pair.start + addingDifference, end: pair.end + addingDifference };

            parsedContent = parsedContent.substring(0, realPositions.start) + tags.opened + parsedContent.substring(realPositions.start, realPositions.end) + tags.closed + parsedContent.substring(realPositions.end);
            addingDifference += tags.opened.length + tags.closed.length;
        });
    }

    function checkPairs(matches) {
        let pairTemplate = {};
        
        matches.forEach((match, index) => {
            if(match.md === `(${clearMd}<br>` || match.md === `${clearMd})<br>`) return specialSymbols.push({ type: match.md[0] == "(" ? "opened" : "closed", position: match.position });
            
            const eol = match.position + match.md.length;
            const nextMatch = matches[index + 1];
    
            if(Object.keys(pairTemplate).length === 0) pairTemplate = { start: match.position, end: eol };
            
            if(!nextMatch || (eol + 1 !== nextMatch.position)) {
                pairs.classic.push(pairTemplate);
                pairTemplate = {};
            }
            
            else if(eol + 1 === nextMatch.position) pairTemplate = {...pairTemplate, end: nextMatch.position + nextMatch.md.length};
        });
    }

    function addSpecialPairs() {
        pairs.special.forEach(pair => {
            const tag = pair.type === "opened" ? tags.opened : tags.closed;
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
            else pairs.special.push(specialSymbols[i]);
        }

        return pairs.special.reverse();
    }

    function removeMd() {
        const patterns = {
            classicMd: "((?<=<blockquote.+\">)>|^>)(\\s+)?(?!<br>)",
            nxtlvlMd: `(?<=(?<=<${symbol.tag}.+)">)\\(${symbol.md}(\\s+)?<br>|(?<=<\\/${symbol.tag}>)${symbol.md}\\)(\\s+)?<br>`
        };
    
        const remove = {
            classicMd: new RegExp(patterns.classicMd, "gm"),
            nxtlvlMd: new RegExp(patterns.nxtlvlMd, "gm")
        };
    
        parsedContent = parsedContent.replace(remove.classicMd, "");
        parsedContent = parsedContent.replace(remove.nxtlvlMd, "");
    }

    function unnecessaryBlocksCheck() {
        let unnecessaryBlocks = false;

        for(let i = 0; i < pairs.special.length; i++) {
            if(pairs.special[i + 1] && pairs.special[i].type === pairs.special[i + 1].type && !unnecessaryBlocks) unnecessaryBlocks = true;
        }

        if(unnecessaryBlocks) Log.warn("UNNECESSARY.BLOCKS", clearMd);
    }
}