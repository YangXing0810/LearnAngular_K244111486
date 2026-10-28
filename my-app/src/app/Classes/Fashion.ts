export class Fashion {
  constructor(
    public _id: any = null,
    public style: string = "",
    public fashion_subject: string = "",
    public fashion_detail: string = "",
    public fashion_image: string = "") {}

  getBase64String()
    {
        if (!this.fashion_image.startsWith("data:image")) {
            return "data:image/png;base64," + this.fashion_image;
        }
        return this.fashion_image;
    }
}