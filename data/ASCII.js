const ASCII = {
    "A": `
           
     /\\    
    /  \\   
   / /\\ \\  
  / ____ \\ 
 /_/    \\_\\
    `,
    "a": `
        
        
   __ _ 
  / _\` |
 | (_| |
  \\__,_|
    `,
    "B": `
  ____  
 |  _ \\ 
 | |_) |
 |  _ < 
 | |_) |
 |____/ 
    `,
    "b": `
  _     
 | |    
 | |__  
 | '_ \\ 
 | |_) |
 |_.__/ 
    `,
    "C": `
   _____ 
  / ____|
 | |     
 | |     
 | |____ 
  \\_____|
    `,
    "c": `
       
       
   ___ 
  / __|
 | (__ 
  \\___|
    `,
    "D": `
  _____  
 |  __ \\ 
 | |  | |
 | |  | |
 | |__| |
 |_____/ 
    `,
    "d": `
      _ 
     | |
   __| |
  / _\` |
 | (_| |
  \\__,_|
    `,
    "E": `
  ______ 
 |  ____|
 | |__   
 |  __|  
 | |____ 
 |______|
    `,
    "e": `
       
       
   ___ 
  / _ \\
 |  __/
  \\___|
    `,
    "F": `
  ______ 
 |  ____|
 | |__   
 |  __|  
 | |     
 |_|     
    `,
    "f": `
   __ 
  / _|
 | |_ 
 |  _|
 | |  
 |_|  
    `,
    "G": `
   _____ 
  / ____|
 | |  __ 
 | | |_ |
 | |__| |
  \\_____|
    `,
    "g": `
   __ _ 
  / _\` |
 | (_| |
  \\__, |
   __/ |
  |___/ 
    `,
    "H": `
  _    _ 
 | |  | |
 | |__| |
 |  __  |
 | |  | |
 |_|  |_|
    `,
    "h": `
  _     
 | |    
 | |__  
 | '_ \\ 
 | | | |
 |_| |_|
    `,
    "I": `
  _____ 
 |_   _|
   | |  
   | |  
  _| |_ 
 |_____|
    `,
    "i": `
  _ 
 (_)
  _ 
 | |
 | |
 |_|
    `,
    "J": `
       _ 
      | |
      | |
  _   | |
 | |__| |
  \\____/ 
    `,
    "j": `
    _ 
   (_)
    _ 
   | |
  _/ |
 |__/ 
    `,
    "K": `
  _  __
 | |/ /
 | ' / 
 |  <  
 | . \\ 
 |_|\\_\\
    `,
    "k": `
  _    
 | |   
 | | __
 | |/ /
 |   < 
 |_|\\_\\
    `,
    "L": `
  _      
 | |     
 | |     
 | |     
 | |____ 
 |______|
    `,
    "l": `
  _ 
 | |
 | |
 | |
 | |
 |_|
    `,
    "M": `
  __  __ 
 |  \\/  |
 | \\  / |
 | |\\/| |
 | |  | |
 |_|  |_|
    `,
    "m": `
          
           
  _ __ ___  
 | '_ \` _ \\ 
 | | | | | |
 |_| |_| |_|
    `,
    "N": `
  _   _ 
 | \\ | |
 |  \\| |
 | . \` |
 | |\\  |
 |_| \\_|
    `,
    "n": `
        
        
  _ __  
 | '_ \\ 
 | | | |
 |_| |_|
    `,
    "O": `
   ____  
  / __ \\ 
 | |  | |
 | |  | |
 | |__| |
  \\____/ 
    `,
    "o": `
        
        
   ___  
  / _ \\ 
 | (_) |
  \\___/ 
    `,
    "P": `
  _____  
 |  __ \\ 
 | |__) |
 |  ___/ 
 | |     
 |_|     
    `,
    "p": `
  _ __  
 | '_ \\ 
 | |_) |
 | .__/ 
 | |    
 |_|    
    `,
    "Q": `
   ____  
  / __ \\ 
 | |  | |
 | |  | |
 | |__| |
  \\___\\_\\
    `,
    "q": `
   __ _ 
  / _\` |
 | (_| |
  \\__, |
     | |
     |_|
    `,
    "R": `
  _____  
 |  __ \\ 
 | |__) |
 |  _  / 
 | | \\ \\ 
 |_|  \\_\\
    `,
    "r": `
       
       
  _ __ 
 | '__|
 | |   
 |_|   
    `,
    "S": `
   _____ 
  / ____|
 | (___  
  \\___ \\
  ____) |
 |_____/ 
    `,
    "s": `
      
      
  ___ 
 / __|
 \\__ \\
 |___/
    `,
    "T": `
  _______ 
 |__   __|
    | |   
    | |   
    | |   
    |_|   
    `,
    "t": `
  _   
 | |  
 | |_ 
 | __|
 | |_ 
  \\__|
    `,
    "U": `
  _    _ 
 | |  | |
 | |  | |
 | |  | |
 | |__| |
  \\____/ 
    `,
    "u": `
        
        
  _   _ 
 | | | |
 | |_| |
  \\__,_|
    `,
    "V": `
 __      __
 \\ \\    / /
  \\ \\  / / 
   \\ \\/ /  
    \\  /   
     \\/    
    `,
    "v": `
          
        
 __   __
 \\ \ / /
  \\ V / 
   \\_/  
    `,
    "W": ` 
 __          __
 \\ \\        / /
  \ \\  /\\  / / 
   \\ \\/  \\/ /  
    \\  /\\  /   
     \\/  \\/    
    `,
    "w": `
            
           
 __      __
 \\ \\ /\\ / /
  \\ V  V / 
   \\_/\_/  
    `,
    "X": `
 __   __
 \\ \\ / /
  \\ V / 
   > <  
  / . \\ 
 /_/ \\_\\
    `,
    "x": `
       
       
 __  __
 \\ \\/ /
  >  < 
 /_/\\_\\
    `,
    "Y": `
 __     __
 \\ \\   / /
  \\ \\_/ / 
   \\   /  
    | |   
    |_|   
    `,
    "y": `
  _   _ 
 | | | |
 | |_| |
  \\__, |
   __/ |
  |___/ 
    `,
    "Z": `
  ______
 |___  /
    / / 
   / /  
  / /__ 
 /_____| 
    `,
    "z": `
      
      
  ____
 |_  /
  / / 
 /___|
    `,
    "0": `
   ___  
  / _ \\ 
 | | | |
 | | | |
 | |_| |
  \\___/ 
    `,
    "1": `
  __ 
 /_ |
  | |
  | |
  | |
  |_|
    `,
    "2": `
  ___  
 |__ \\ 
    ) |
   / / 
  / /_ 
 |____|
    `,
    "3": `
  ____  
 |___ \\ 
   __) |
  |__ < 
  ___) |
 |____/ 
    `,
    "4": `
  _  _   
 | || |  
 | || |_ 
 |__   _|
    | |  
    |_|  
    `,
    "5": `
  _____ 
 | ____|
 | |__  
 |___ \\ 
  ___) |
 |____/ 
    `,
    "6": `
    __  
   / /  
  / /_  
 | '_ \\ 
 | (_) |
  \\___/ 
    `,
    "7": `
  ______ 
 |____  |
     / / 
    / /  
   / /   
  /_/    
    `,
    "8": `
   ___  
  / _ \\ 
 | (_) |
  > _ < 
 | (_) |
  \\___/ 
    `,
    "9": `
   ___  
  / _ \\ 
 | (_) |
  \\__, |
    / / 
   /_/  
    `,
    "!": `
  _ 
 | |
 | |
 | |
 |_|
 (_)
    `,
    "\"": `
  _ _ 
 ( | )
  V V 
      
      
      
    `,
    "#": `
    _  _   
  _| || |_ 
 |_  __  _|
  _| || |_ 
 |_  __  _|
   |_||_|  
    `,
    "$": ` 
   _  
  | | 
 / __)
 \\__ \\
 (   /
  |_| 
    `,
    "%": `
  _   __
 (_) / /
    / / 
   / /  
  / / _ 
 /_/ (_)
    `,
    "&": `
         
   ___   
  ( _ )  
  / _ \\/\\
 | (_>  <
  \\___/\\/
    `,
    "'": `
  _ 
 ( )
 |/ 
    
    
    
    `,
    "(": `
   __
  / /
 | | 
 | | 
 | | 
  \\_\\
    `,
    ")": `  
 __  
 \\ \\ 
  | |
  | |
  | |
 /_/ 
    `,
    "*": ` 
     _    
  /\\| |/\\ 
  \\ \` ' / 
 |_     _|
  / , . \\ 
  \\/|_|\\/ 
    `,
    "+": `
        
    _   
  _| |_ 
 |_   _|
   |_|  
        
    `,
    ",": `
    
    
    
  _ 
 ( )
 |/ 
    `,
    "-": `
         
         
  ______ 
 |______|
         
         
    `,
    ".": `
    
    
    
    
  _ 
 (_)
    `,
    "/": `
      __
     / /
    / / 
   / /  
  / /   
 /_/    
    `,
    ":": `
    
  _ 
 (_)
    
  _ 
 (_)
    `,
    ";": `
  _ 
 (_)
    
  _ 
 ( )
 |/ 
    `,
    "<": `
    __
   / /
  / / 
 < <  
  \\ \\ 
   \\_\\
    `,
    "=": `

  ______ 
 |______|
  ______ 
 |______|

    `,
    ">": `
 __   
 \\ \\  
  \\ \\ 
   > >
  / / 
 /_/  
    `,
    "?": `
  ___  
 |__ \\ 
    ) |
   / / 
  |_|  
  (_)  
    `,
    "@": `
    ____  
   / __ \\ 
  / / _\` |
 | | (_| |
  \\ \\__,_|
   \\____/ 
    `,
    "[": `
  ___ 
 |  _|
 | |  
 | |  
 | |_ 
 |___|
    `,
    "\\": `
 __     
 \\ \\    
  \\ \\   
   \\ \\  
    \\ \\ 
     \\_\\
    `,
    "]": `
  ___ 
 |_  |
   | |
   | |
  _| |
 |___|
    `,
    "^": `
  /\\ 
 |/\\|
     
     
     
     
    `,
    "_": `
         
         
         
         
  ______ 
 |______|
    `,
    "`": `
  _ 
 ( )
  \\|
    
    
    
    `,
    "{": ` 
    __
   / /
 / /  
 \\ \\  
  | | 
   \\_\\
    `,
    "|": `
  _ 
 | |
 | |
 | |
 | |
 |_|
    `,
    "}": ` 
 __   
 \\ \\  
   \\ \\
   / /
  | | 
 /_/  
    `,
    "~": `
  /\\/|
  |/\\/  
      
      
      
      
    `
};

export default ASCII;