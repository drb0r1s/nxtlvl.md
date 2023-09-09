import Remove from "../../Remove.js";
import generateTags from "../../../../../../functions/generateTags.js";
import isSpecial from "../../isSpecial.js";
import getTagPositions from "./getTagPositions.js";

export default function addLi(pairs, content, addingDifference, symbol) {
    let newContent = content;
    let newAddingDifference = addingDifference;

    const counters = [];

    pairs.forEach(pair => {
        const scheme = makeScheme(pair, pair.inner);
        scheme.forEach(p => setInnerContent(p));
    });

    return { newContent, newAddingDifference };
    
    function makeScheme(pair, inner) {
        const scheme = [];

        if(!inner) scheme.push({ start: pair.start, end: pair.end });
        
        else if(inner.length === 1) scheme.push(
            { start: pair.start, end: inner[0].start },
            ...makeScheme(inner[0], inner[0].inner),
            { start: inner[0].end, end: pair.end }
        );
        
        else {
            scheme.push({ start: pair.start, end: inner[0].start });

            for(let i = 0; i < inner.length; i++) {
                const nextInner = inner[i + 1];
                const innerPair = makeScheme(inner[i], inner[i].inner);

                if(nextInner) scheme.push(
                    ...innerPair,
                    { start: innerPair[innerPair.length - 1].end, end: nextInner.start }
                );

                else scheme.push(...innerPair);
            }

            scheme.push({ start: inner[inner.length - 1].end, end: pair.end });
        }

        return scheme;
    }
    
    function setInnerContent(pair) {            
        const realPositions = { start: pair.start + newAddingDifference, end: pair.end + newAddingDifference };
        
        const innerContent = newContent.substring(realPositions.start, realPositions.end);
        const olMainTag = getOlMainTag();

        const newInnerContent = setLiTags(innerContent, olMainTag);
        const innerContentDifference = Math.abs(innerContent.length - newInnerContent.length);
        
        newContent = newContent.substring(0, realPositions.start) + newInnerContent + newContent.substring(realPositions.end);
        newAddingDifference += innerContentDifference;

        function getOlMainTag() {
            if(symbol.tag !== "ol") return;

            const beforeParsedContent = newContent.substring(0, realPositions.start);
            const lines = beforeParsedContent.split("\n");
            
            const olTag = lines[lines.length - 1];
            const isOlTag = getTagPositions("ol", olTag);

            if(isOlTag) return olTag;
        }
    }
    
    function setLiTags(innerContent, olMainTag) {
        let newInnerContent = "";

        const lines = innerContent.split("\n");
        if(!lines[0]) lines.shift();
        if(!lines[lines.length - 1]) lines.pop();

        const pattern = `<${symbol.tag} class=\"nxtlvl multiple-lines.+\">|<\/${symbol.tag}>`;
        const regex = new RegExp(pattern, "gm");

        lines.forEach((line, index) => {
            let liStatus = true;
            if(line.match(regex)) liStatus = false;

            let tags;
            const specialStatus = line.match(/\s*([0-9]+\.|[*+-])\s/) ? false : true;

            const liNumber = getLiMd(line, index === lines.length - 1, olMainTag, specialStatus);
            
            if(liStatus) tags = generateTags(symbol, { tag: "li", md: liNumber });

            const noMdLine = Remove.md(line, symbol);
            if(isSpecial(noMdLine)) return;

            const liContent = liStatus ? `${tags.opened}${noMdLine}${tags.closed}` : line;
            newInnerContent += `${liContent}${index === lines[lines.length - 1] ? "" : "\n"}`;
        });

        return newInnerContent;

        function getLiMd(line, lastLine, olMainTag, specialStatus) {
            let result = "";
            
            if(symbol.tag === "ol") {                
                const tagStatus = getTagStatus();
                
                if((olMainTag && counters.length === 0) || tagStatus === "opened") {
                    const startValue = parseInt(getStartValue(counters.length === 0 ? olMainTag : line));
                    if(startValue) counters.push(startValue);

                    if(counters.length === 1) {
                        result = counters[0];
                        counters[counters.length - 1]++;
                    }
                }

                else {
                    result = counters[counters.length - 1];
                    counters[counters.length - 1]++;
                }

                if((lastLine && counters.length === 1) || tagStatus === "closed") counters.pop();
                if(lastLine && counters.length === 1 && tagStatus === "closed") counters.pop();

                function getTagStatus() {
                    let result = false;
                    const match = line.match(regex);
                    
                    if(match) {
                        const tag = match[0];
                        result = tag[1] === "/" ? "closed" : "opened";
                    }

                    return result;
                }
                
                function getStartValue(content) {
                    const tagPositions = getTagPositions(symbol.tag, content);
                    if(!tagPositions) return;

                    const tag = (counters.length === 0 ? olMainTag : line).substring(tagPositions.start, tagPositions.end);
                    
                    const startAttributeRegex = /start=".+"/;
                    const startValueMatch = tag.match(startAttributeRegex);
                    
                    const startValue = parseInt(startValueMatch[0].split("\"")[1]);
                    return startValue;
                }
            }

            else {
                if(line.match(regex)) return;

                if(specialStatus) result = specialStatus;

                else {
                    const ulRegex = /[*+-]/;
                    const match = line.match(ulRegex)[0];

                    result = match;
                }
            }

            return result;
        }
    }
}