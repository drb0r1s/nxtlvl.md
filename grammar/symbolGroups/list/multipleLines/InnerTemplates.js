import StartSpaces from "../../../../functions/StartSpaces.js";

const InnerTemplates = { format, reset };
export default InnerTemplates;

function format(templates, content, nextMatch, addNew) {
    const newTemplates = {...templates};
    
    if(newTemplates.classicInner.templates.length === 0 || addNew) {
        newTemplates.classicInner.templates.push(nextMatch.positions);
        if(!addNew) return newTemplates.classicInner;
    }
    
    if(newTemplates.classicInner.starts.length === 0 || addNew) newTemplates.classicInner.starts.push(addNew || newTemplates.classicInner.templates[newTemplates.classicInner.templates.length - 1].start);
    
    const line = {
        prev: StartSpaces.count(content.substring(newTemplates.classicInner.templates[newTemplates.classicInner.templates.length - 1].start, newTemplates.classicInner.templates[newTemplates.classicInner.templates.length - 1].end)),
        current: StartSpaces.count(content.substring(nextMatch.positions.start, nextMatch.positions.end))
    };
    
    if(line.prev === line.current) appendPairs();
    
    else {
        if(line.prev < line.current) newTemplates.classicInner = format(newTemplates, content, nextMatch, nextMatch.positions.start);

        if(line.prev > line.current) {
            if(newTemplates.classicInner.starts.length > line.current) while(newTemplates.classicInner.starts.length !== line.current) newTemplates.classicInner.starts.pop();
            appendPairs();
        }
    }

    return newTemplates.classicInner;

    function appendPairs() {
        newTemplates.classicInner.starts.forEach(start => {
            let newInnerTemplates = [];
    
            for(let i = 0; i < newTemplates.classicInner.templates.length; i++) {
                if(start === newTemplates.classicInner.templates[i].start) newInnerTemplates.push({...newTemplates.classicInner.templates[i], end: nextMatch.positions.end});
                else newInnerTemplates.push(newTemplates.classicInner.templates[i]);
            }
    
            newTemplates.classicInner.templates = newInnerTemplates;
        });
    }
}

function reset() {
    return { templates: [], starts: [] };
}