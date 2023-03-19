import generateTags from "../../../functions/generateTags.js";

export default function multipleLines({ content, symbol, matches, tags }) {
    let parsedContent = content;

    const pairs = { classic: [], special: [] };
    const specialMd = [];
    let formattedPairs = [];
    
    const mdCombinations = getMdCombinations();
    let addingDifference = 0;

    getPairs(matches);
    formatPairs();

    addPairs();

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
        formattedPairs.forEach(pair => {
            const realInnerContent = parsedContent.substring(pair.start + addingDifference, pair.end + addingDifference);
            const specialStatus = isPairSpecial(realInnerContent);
            
            const innerContent = {
                real: realInnerContent,
                parsed: parseList(realInnerContent, specialStatus)
            };

            if(symbol.tag === "ol" && (!innerContent.real.startsWith("1. ") && !innerContent.real.startsWith("(1."))) return;
            
            const realPositions = { start: pair.start + addingDifference, end: pair.end + addingDifference };
            const innerContentDifference = Math.abs(innerContent.real.length - innerContent.parsed.length);

            const validTags = getValidTags(innerContent.real);

            parsedContent = parsedContent.substring(0, realPositions.start) + validTags.opened + innerContent.parsed + validTags.closed + parsedContent.substring(realPositions.end);
            addingDifference += validTags.opened.length + validTags.closed.length + innerContentDifference;
        });

        function parseList(content, specialStatus) {
            if(symbol.tag !== "ol" && symbol.tag !== "ul") return content;

            const mdSymbol = content[0] === "(" ? content[1] : content[0];
            
            let parsedListContent = "";
            const lines = content.split("\n");
            
            lines.forEach((line, index) => {
                if(!line) return;

                const liTags = generateTags(symbol, { tag: "li", md: mdSymbol === "1" ? index + 1 : mdSymbol });
                parsedListContent += `${liTags.opened}${removeListMd(line)}${liTags.closed}`;
            });
            
            return parsedListContent;

            function removeListMd(content) {
                let newContent = "";
    
                let ignore = !specialStatus;
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
        }

        function getValidTags(innerContent) {
            if(symbol.tag !== "ol" &&  symbol.tag !== "ul") return tags;

            const mdSymbol = innerContent[0] === "(" ? innerContent[1] : innerContent[0];
            let tagsMd = mdSymbol;

            if(mdSymbol === "1") {
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
        formattedPairs = [...pairs.classic, ...pairs.special];
        let swap;

        for(let i = 0; i < formattedPairs.length; i++) for(let j = i + 1; j < formattedPairs.length; j++) if(formattedPairs[i].start > formattedPairs[j].start) {
            swap = formattedPairs[i];
            formattedPairs[i] = formattedPairs[j];
            formattedPairs[j] = swap;
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

    return parsedContent;
}