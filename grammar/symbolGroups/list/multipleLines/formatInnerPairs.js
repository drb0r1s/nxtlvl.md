export default function formatInnerPairs(pairs, content) {
    const newPairs = pairs;
    
    newPairs.forEach(pair => {
        const pairContent = content.substring(pair.start, pair.end);
        
        const lines = pairContent.split("\n");
        if(!lines[lines.length - 1]) lines.pop();

        const realPositions = { start: pair.start, end: pair.start + lines[0].length };
        const validLines = [];

        let level = 1;

        while(levelExist(pairContent, level)) {
            lines.forEach((line, index) => {
                if(levelExist(line, level)) validLines.push({...realPositions});
    
                const nextLine = lines[index + 1];
                if(!nextLine) return;
                
                const length = {
                    current: line.length + 1,
                    next: nextLine.length + 1
                };
                
                realPositions.start += length.current;
                realPositions.end += length.next;
            });

            realPositions.start = pair.start;
            realPositions.end = pair.start + lines[0].length;

            level++;
        }

        newPairs.push(...makeInnerPairs(validLines));
    });

    function levelExist(content, level) {
        const pattern = `^\\s{${level}}`;
        const regex = new RegExp(pattern, "gm");

        if(content.match(regex)) return true;
        return false;
    }

    function makeInnerPairs(lines) {
        const innerPairs = [];
        let template = { start: -1, end: -1 };

        lines.forEach((line, index) => {
            const nextLine = lines[index + 1];

            if(template.start === -1) template.start = line.start;
            if(template.end === -1) template.end = line.end;
            
            if(!nextLine || line.end + 1 !== nextLine.start) {
                innerPairs.push(template);
                template = { start: -1, end: -1 };
            }

            else template.end = nextLine.end;
        });

        return innerPairs;
    }

    return newPairs;
}