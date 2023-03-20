import Syntax from "../../Syntax.js";
import generateTags from "../../../functions/generateTags.js";

export default function multipleLines({ content, symbol, matches, tags }) {
    let parsedContent = content;

    const pairs = { classic: [], special: [] };
    let specialMd = [];
    let formattedPairs = [];
    
    const mdCombinations = getMdCombinations();
    let addingDifference = 0;

    if(symbol.md === ">") {
        const { multipleLines: pattern } = Syntax.patterns.get({ group: "multipleLines", md: ">" });
        let i = 0;

        while(getMatches().length > 0) {
            pairs.classic = [];
            pairs.special = [];
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
        formattedPairs.forEach(pair => {
            const specialStatus = parsedContent[pair.start + addingDifference] === "(" ? parsedContent[pair.start + addingDifference + 1] : false;
            const skipSpecialMd = specialStatus ? `(${specialStatus.length}${specialStatus === "1" ? "." : ""}<br>`.length : 0;
            
            const realInnerContent = parsedContent.substring(pair.start + addingDifference + skipSpecialMd, pair.end + addingDifference);
            
            const innerContent = {
                real: realInnerContent,
                parsed: parseList(realInnerContent, specialStatus)
            };

            if(symbol.tag === "ol" && (!innerContent.real.startsWith("1. ") && specialStatus !== "1" )) return;
            
            const realPositions = { start: pair.start + addingDifference + skipSpecialMd, end: pair.end + addingDifference };
            const innerContentDifference = Math.abs(innerContent.real.length - innerContent.parsed.length);

            const validTags = getValidTags(innerContent.real, specialStatus);

            parsedContent = parsedContent.substring(0, realPositions.start) + validTags.opened + innerContent.parsed + validTags.closed + parsedContent.substring(realPositions.end);
            addingDifference += validTags.opened.length + validTags.closed.length + innerContentDifference;
        });

        function parseList(content, specialStatus) {
            if(symbol.tag !== "ol" && symbol.tag !== "ul") return content;
            
            let parsedListContent = "";

            const lines = content.split("\n");
            let lineCounter = 0;
            
            lines.forEach(line => {
                if(!line) return;
                lineCounter++;

                const tagsMd = specialStatus ? specialStatus : symbol.tag === "ol" ? lineCounter : line[0];
                const liTags = generateTags(symbol, { tag: "li", md: tagsMd === "1" ? lineCounter : tagsMd });

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