import { createSlug } from './SlugHelper';

export class Fashion {
  constructor(
    public _id: any = null,
    public IdF: number = 0,
    public style: string = "",
    public fashion_subject: string = "",
    public fashion_detail: string = "",
    public fashion_image: string = "",
    public slug: string = "",
    public created_date: any = null) {}

  // slug of this Fashion, e.g. "street-style-look-p3"
  getSlug(): string {
    return this.slug || createSlug(this.fashion_subject, this.IdF);
  }

  getBase64String()
    {
        if (!this.fashion_image.startsWith("data:image")) {
            return "data:image/png;base64," + this.fashion_image;
        }
        return this.fashion_image;
    }
}