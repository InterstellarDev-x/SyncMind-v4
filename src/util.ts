


export function RandomHash(len : number) : string {
    let options  : string = "dsfjhdsfjgadksfjhkdsgf47tr78387y347858394nvy83"
    let length : number = options.length
    let ans :string = ""

    for(let i : number = 0 ; i < len ; i++){
          ans += options[  Math.floor(Math.random() *  length)]
    }

    return ans;
    
}