export interface IBook{
    BookId:string,
    BookName:string,
    Price:number,
    Image:String
}
export class Book{
    constructor(
        public BookId:string="",
        public BookName:string="",
        public Price:number=0,
        public Image:String="",
        public ImageBase64:String="")
    {}
}