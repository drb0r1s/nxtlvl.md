const Escape = { regex, nxtlvl };
export default Escape;

function regex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/gm, "\\$&");
}

function nxtlvl(string) {
    let noNxtlvl = string;
    
    const markdown = {
        "#": "&#35;",
        "@": "&#64;",
        "=": "&#61;",
        "-": "&#45;",
        "_": "&#95;",
        "+": "&#43;",
        "*": "&#42;",
        ".": "&#46;",
        "%": "&#37;",
        ">": "&gt;",
        "<": "&lt;"
    };

    Object.keys(markdown).forEach((key, index) => {
        const value = Object.values(markdown)[index];
        if(string.indexOf(key) > -1) noNxtlvl = noNxtlvl.replaceAll(key, value);
    });

    return noNxtlvl;
}