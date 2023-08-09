import checkAllowedEmptyContent from "./checkAllowedEmptyContent.js";

const Search = { classic, special };
export default Search;

function classic(templates, symbol, match, nextMatch) {
    const newTemplates = {...templates};
    let pair;
    
    const eol = match.positions.end;
    const allowedEmptyContent = checkAllowedEmptyContent(match.md, symbol);
            
    if(Object.keys(newTemplates.classic).length === 0) newTemplates.classic = match.positions;
    
    if(allowedEmptyContent && (newTemplates.classic.start === match.positions.start)) newTemplates.classic = {};

    else if(!nextMatch || (eol + 1 !== nextMatch.positions.start)) {
        pair = newTemplates.classic;
        newTemplates.classic = {};
    }

    else if(eol + 1 === nextMatch.positions.start) newTemplates.classic = {...newTemplates.classic, end: nextMatch.positions.end};

    return { list: newTemplates, pair };
}

function special(templates, match) {
    const newTemplates = {...templates};
    newTemplates.special.push({ type: match.md[0] === "(" ? "opened" : "closed", content: match.md, position: match.positions.start });

    return newTemplates;
}