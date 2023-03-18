export default function multipleLines({ content, symbol, matches, tags }) {
    let parsedContent = content;

    const pairs = { classic: [], special: [] };
    const specialMd = [];
    let formattedPairs = [];
    
    const mdCombinations = getMdCombinations();
    let addingDifference = 0;

    console.log(matches)

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
            const innerContent = {
                real: parsedContent.substring(pair.start + addingDifference, pair.end + addingDifference),
                parsed: parseList(parsedContent.substring(pair.start + addingDifference, pair.end + addingDifference))
            };

            if(symbol.tag === "ol" && (!innerContent.real.startsWith("1. ") && !innerContent.real.startsWith("(1."))) return;
            
            const realPositions = { start: pair.start + addingDifference, end: pair.end + addingDifference };
            const innerContentDifference = Math.abs(innerContent.real.length - innerContent.parsed.length);

            parsedContent = parsedContent.substring(0, realPositions.start) + tags.opened + innerContent.parsed + tags.closed + parsedContent.substring(realPositions.end);
            addingDifference += tags.opened.length + tags.closed.length + innerContentDifference;
        });

        function parseList(content) {
            if(symbol.tag !== "ol" && symbol.tag !== "ul") return content;

            let parsedListContent = "";
            const lines = content.split("\n");
            
            lines.forEach(line => {
                if(!line) return;
                parsedListContent += `<li>${removeListMd(line)}</li>`;
            });
            
            return parsedListContent;
        }

        function removeListMd(content) {
            let newContent = "";

            if(symbol.tag === "ol") {
                let ignore = true;
                let dotStatus = false;
                
                for(let i = 0; i < content.length; i++) {
                    if(!ignore) newContent += content[i];
                    
                    else if(ignore && content[i] === ".") dotStatus = true;
                    
                    else if(dotStatus && content[i] !== " ") {
                        ignore = false;
                        newContent += content[i];
                    }
                }
            }

            else {
                let ignore = true;
                let spaceStatus = false;

                if(["*", "+", "-"].indexOf(content[0]) === -1) newContent = content;

                else for(let i = 0; i < content.length; i++) {
                    if(!ignore) newContent += content[i];
                    
                    else if(ignore && content[i] === " ") spaceStatus = true;

                    else if(spaceStatus && content[i] !== " ") {
                        ignore = false;
                        newContent += content[i];
                    }
                }
            }

            return newContent;
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