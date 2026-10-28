import { Component } from '@angular/core';
import { Product } from '../Classes/IProduct';

@Component({
  selector: 'app-product-list-component',
  standalone: false,
  templateUrl: './product-list-component.html',
  styleUrl: './product-list-component.css',
})
export class ProductListComponent {
  //products:Product[]=[]
  products:Product[]=[
    {id:1,name:"Coca",price:15,image_link:"https://static.vecteezy.com/system/resources/thumbnails/044/307/959/small_2x/cola-soda-isolated-on-transparent-background-png.png"},
    {id:2,name:"Pepsi",price:-10,image_link:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSQBIxIYvUNDgQoFz9kSPD7NIF39GJHrTni6jUstI1ew&s=10"},
    {id:3,name:"Redbull",price:20,image_link:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuBIErhlLPjiadVzOG6gth2TMe3GF1ssyeBI0kxnZxWg&s=10"},
    {id:4,name:"Aqua",price:-17,image_link:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPlcmBMOWAhZ-crmzZkYNPbTQthdects9wPCKXNdsnrw&s=10"},
    {id:5,name:"Lavie",price:12,image_link:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjVH0ldgSGrKm4eGrXS6Csjqi0etNYHPd9NCuj3C68Rw&s=10"}
  ]
}
