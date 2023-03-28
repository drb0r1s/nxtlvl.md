import Syntax from "../../Syntax.js";
import generateTags from "../../../functions/generateTags.js";

export default function multipleLines({ content, symbol, matches, tags }) {
    let parsedContent = content;

    const pairs = { classic: [], special: [], formatted: [] };
    let specialMd = [];
    
    const mdCombinations = getMdCombinations();
    let addingDifference = 0;

    if(symbol.md === ">") {
        const { multipleLines: pattern } = Syntax.patterns.get({ group: "multipleLines", md: ">" });
        let i = 0;

        while(getMatches().length > 0) {
            pairs.classic = [];
            pairs.special = [];
            pairs.formatted = [];

            specialMd = [];
            
            const currentMatches = getMatches();

            getPairs(currentMatches);
            formatPairs();

            addPairs();

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
        getPairs(matches);
        formatPairs();

        addPairs();

        removeMd();
    }

    function getPairs(matches) {
        let pairTemplate = {};

        matches.forEach((match, index) => {
            const specialMdStatus = specialMdSearch(match);
            if(specialMdStatus) return;

            classicSearch(match, matches[index + 1]);
        });

        if(specialMd.length > 0) mergeSpecialMd();

        function specialMdSearch(match) {
            let result = false;
            const specialPair = isPairSpecial(match.md);
            
            if(specialPair) {
                result = true;
                specialMd.push({ type: match.md[0] === "(" ? "opened" : "closed", position: match.position });
            }

            return result;
        }

        function mergeSpecialMd() {
            const counter = { opened: 0, closed: 0 };

            specialMd.forEach(md => {
                if(md.type === "opened") counter.opened++;
                else counter.closed++;
            });

            if(counter.opened !== counter.closed) return;
            
            while(specialMd.length > 0) {
                for(let i = 0; i < specialMd.length; i++) {
                    const current = specialMd[i];
                    const next = specialMd[i + 1];
                    
                    if(current.type === "opened" && next.type === "closed") {
                        pairs.special.push({ start: current.position, end: next.position });
                        specialMd.splice(i, 2);
                    }
                }
            }
        }

        function classicSearch(match, nextMatch) {
            const eol = match.position + match.md.length;
            
            if(Object.keys(pairTemplate).length === 0) pairTemplate = { start: match.position, end: eol };

            if(!nextMatch || (eol + 1 !== nextMatch.position)) {
                pairs.classic.push(pairTemplate);
                pairTemplate = {};
            }

            else if(eol + 1 === nextMatch.position) pairTemplate = {...pairTemplate, end: nextMatch.position + nextMatch.md.length};
        }
    }

    function addPairs() {
        const listContents = [];
        pairs.formatted.forEach(pair => addPair(pair));

        if(symbol.tag === "ol" || symbol.tag === "ul") parseList();

        function addPair(pair) {
            const parsedPair = parsePair(pair);
            if(!parsedPair) return;

            const { realPositions, validTags, innerContent, specialStatus } = parsedPair;

            if(symbol.tag === "ol" || symbol.tag === "ul") {
                const tagsMd = specialStatus ? specialStatus : innerContent[0];
                
                let exists = false;

                listContents.forEach(listContent => {
                    if(listContent.content === innerContent && listContent.md === tagsMd) exists = true;
                });
                
                if(!exists) listContents.push({ content: innerContent, md: tagsMd, isSpecial: specialStatus ? true : false });
            }

            parsedContent = parsedContent.substring(0, realPositions.start) + validTags.opened + innerContent + parsedContent.substring(realPositions.end);
            addingDifference += validTags.opened.length;

            if(pair.inner) pair.inner.forEach(innerPair => addPair(innerPair));

            parsedContent = parsedContent.substring(0, pair.end + addingDifference) + validTags.closed + parsedContent.substring(pair.end + addingDifference);
            addingDifference += validTags.closed.length;
        }
        
        function parsePair(pair) {
            const specialStatus = parsedContent[pair.start + addingDifference] === "(" ? parsedContent[pair.start + addingDifference + 1] : false;
            const skipSpecialMd = specialStatus ? `(${specialStatus.length}${specialStatus === "1" ? "." : ""}<br>`.length : 0;
            
            const innerContent = parsedContent.substring(pair.start + addingDifference + skipSpecialMd, pair.end + addingDifference);

            if(symbol.tag === "ol" && (!innerContent.startsWith("1. ") && specialStatus !== "1")) return false;

            const realPositions = { start: pair.start + addingDifference + skipSpecialMd, end: pair.end + addingDifference };
            const validTags = getValidTags(innerContent, specialStatus);

            return { realPositions, validTags, innerContent, specialStatus };
        }

        function parseList() {
            listContents.forEach(liContent => {
                let parsedLiContent = "";
                
                const lines = liContent.content.split("\n");
                let lineCounter = 0;
                
                lines.forEach(line => {
                    if(!line) return;
                    lineCounter++;

                    const tagsMd = symbol.tag === "ol" ? lineCounter : liContent.md;
                    const liTags = generateTags(symbol, { tag: "li", md: tagsMd });

                    parsedLiContent += `${liTags.opened}${removeListMd(line, liContent.isSpecial)}${liTags.closed}`;
                });

                const liMatches = [...parsedContent.matchAll(escapeRegex(liContent.content))];
                let liAddingDifference = 0;

                liMatches.forEach(liMatch => {
                    console.log(liMatch[0], parsedLiContent)
                    const positions = { start: liMatch.index + liAddingDifference, end: liMatch[0].length + liMatch.index + liAddingDifference };
                    parsedContent = parsedContent.substring(0, positions.start) + parsedLiContent + parsedContent.substring(positions.end);
                    
                    const difference = Math.abs(liContent.content.length - parsedLiContent.length);
                    liAddingDifference += difference;
                });
            });

            function removeListMd(content, isSpecial) {
                let newContent = "";
    
                let ignore = !isSpecial;
                let cancelIgnore = false;
    
                const cancelTarget = symbol.tag === "ol" ? "." : " ";
    
                for(let i = 0; i < content.length; i++) {
                    if(!ignore) newContent += content[i];
                    
                    else if(ignore && content[i] === cancelTarget) cancelIgnore = true;
                    
                    else if(cancelIgnore && content[i] !== " ") {
                        ignore = false;
                        newContent += content[i];
                    }
                }
    
                return newContent;
            }

            function escapeRegex(string) {
                return string.replace(/[.*+?^${}()|[\]\\]/gm, "\\$&");
            }
        }

        function getValidTags(innerContent, specialStatus) {
            if(symbol.tag !== "ol" &&  symbol.tag !== "ul") return tags;

            let tagsMd = specialStatus ? specialStatus : innerContent[0];

            if(tagsMd === "1") {
                const lines = innerContent.split("\n");

                let counter = 0;
                for(let i = 0; i < lines.length; i++) if(lines[i]) counter++;

                tagsMd = `1-${counter}`;
            }

            const listTags = generateTags(symbol, { md: tagsMd });
            return listTags;
        }
    }

    function formatPairs() {
        pairs.formatted = [...pairs.classic, ...pairs.special];
        let swap;

        for(let i = 0; i < pairs.formatted.length; i++) for(let j = i + 1; j < pairs.formatted.length; j++) if(pairs.formatted[i].start > pairs.formatted[j].start) {
            swap = pairs.formatted[i];
            pairs.formatted[i] = pairs.formatted[j];
            pairs.formatted[j] = swap;
        }

        const innerFormatted = [];
        const blocked = [];

        pairs.formatted.forEach((pair, index) => {
            if(checkBlocked(pair)) return;
            innerFormatted.push({...pair, ...checkNestedPairs(index)});
        });

        pairs.formatted = innerFormatted;

        function checkNestedPairs(index) {
            let nested = { inner: [] };
            
            const currentPair = pairs.formatted[index];
            let check = 1;

            while(check !== 0) {
                const nextPair = pairs.formatted[index + check];

                if(nextPair && (currentPair.end > nextPair.start)) {
                    if(!checkBlocked(nextPair)) nested.inner.push({...nextPair, ...checkNestedPairs(index + check)});
                    check++;
                }

                else check = 0;
            }

            blocked.push(...nested.inner);
            
            if(nested.inner.length === 0) return {};
            return nested;
        }

        function checkBlocked(pair) {
            let result = false;
            
            blocked.forEach(block => {
                if(pair.start === block.start && pair.end === block.end) result = true;
            });

            return result;
        }
    }

    function isPairSpecial(content) {
        let result = false;
        
        mdCombinations.forEach(combination => {
            if(content.startsWith(`(${combination}<br>`) || content.startsWith(`${combination})<br>`)) result = combination;
        });

        return result;
    }

    function getMdCombinations() {
        let result = [];
        
        switch(symbol.tag) {
            case "ol": 
                result.push("1.");
                break;
            case "ul":
                result.push("*", "+", "-");
                break;
            default: result.push(symbol.md.replace(/\\+/g, ""));
        }

        return result;
    }

    function removeMd() {
        const patterns = {
            classicMd: "((?<=<blockquote.+\">)>|^>)(\\s+)?(?!<br>)",
            nxtlvlMd: `\\(${symbol.md}(\\s+)?<br>(?=<${symbol.tag}.+">)|(?<=<\\/${symbol.tag}>)${symbol.md}\\)(\\s+)?<br>`
        };
    
        const remove = {
            classicMd: new RegExp(patterns.classicMd, "gm"),
            nxtlvlMd: new RegExp(patterns.nxtlvlMd, "gm")
        };
    
        parsedContent = parsedContent.replace(remove.classicMd, "");
        parsedContent = parsedContent.replace(remove.nxtlvlMd, "");
    }

    return parsedContent;
}