import { Injectable } from '@angular/core';
import { Product } from '../Classes/IProduct';

@Injectable({ providedIn: 'root' })
export class ProductService {

        products: Product[] = [
          { id: 1, name: 'Coca Cola', price: 10, image_link: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg' },
          { id: 2, name: 'Pepsi', price: -15, image_link:'https://upload.wikimedia.org/wikipedia/commons/d/dd/Pepsi_Can.jpg' },
          { id: 3, name: 'Sprite', price: 12, image_link:'https://i.pinimg.com/originals/c6/99/c9/c699c918cf736e8efeaa6c55b031ef6d.jpg' },
          { id: 4, name: 'Fanta', price: 8 ,image_link:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Fanta_logo.svg/1200px-Fanta_logo.svg.png'},
          { id: 5, name: 'Mountain Dew', price: 20, image_link:'https://upload.wikimedia.org/wikipedia/commons/6/6d/Mountain_Dew_logo.svg' },
          { id: 6, name: 'Dr Pepper', price: 18, image_link:'https://upload.wikimedia.org/wikipedia/commons/3/3c/Dr_Pepper_logo.svg' },
        ]
        constructor(){}
        getProductList()
        {
            return this.products
        }
  filterProductListByPrice(min:number,max:number)
  {
    return this.products.filter(p=>p.price>=min && p.price<=max)
  }
}
