import api from "../../../lib/api";
import Toastify from "toastify-js";
import type { IProduct } from "../product/product.type";
import type { ICart, ICartstore } from "./cart.type";

let cart_section = document.getElementById('cart_section');
let cart_togglers = document.querySelectorAll('.cart_toggler');
let cart_count = document.getElementById('cart_count');
let product_grid = document.getElementById('product_grid');
let cart_container = document.getElementById('cart_container');
let clear_btn = document.getElementById('clear_btn');



clear_btn?.addEventListener('click', () => {
    const emptyCart: ICartstore = { data: [], totalPrice: 0 };
    localStorage.setItem('cart', JSON.stringify(emptyCart));
    renderCartItems();
})




cart_togglers.forEach(element => {
    element?.addEventListener("click", () => {
        cart_section?.classList.toggle('hidden')
    })
})


// Add item to cart;
if (product_grid) {
    product_grid.addEventListener("click", async (event) => {

        let addToCartBtn = ((event.target) as HTMLElement).classList.contains('add_to_cart');

        if (addToCartBtn) {
            let dataId = ((event.target) as HTMLElement).dataset.id;

            let res = await api.get(`/products/${dataId}`);
            // console.log(res);

            if (res.status == 200) {
                let myCartProduct = res.data;
                // console.log(myCartProduct);
                addCartToLocalStorage(myCartProduct);

                renderCartItems();

            }

        }
    })
}

// Remove item from cart;
if (cart_container) {


    cart_container.addEventListener('click', (event => {
        let deleteBtn = ((event.target) as HTMLElement).classList.contains('delete-btn');
        let incrementBtn = ((event.target) as HTMLElement).classList.contains('increment-btn');
        let decrementBtn = ((event.target) as HTMLElement).classList.contains('decrement-btn');
        if (deleteBtn && !confirm("Are you sure you want to remove it?")) return;
        // if (!deleteBtn) return;


        // Delete item from cart;
        if (deleteBtn) {

            let dataId = ((event.target) as HTMLElement).dataset.id;

            //   let oldCartFromLocalStorage = localStorage.getItem('cart');

            let oldCartData = JSON.parse(localStorage.getItem('cart') as string).data

            // let ifExist = oldCartData.find((item: ICart) => item.id == product.id);
            // if (ifExist) return;

            // console.log(oldCartData);
            let updateCartDataWithOldProductItem = oldCartData.filter((item: ICart) => item.id != dataId);
            // ...oldCartData,
            // {
            //     id: product.id,
            //     name: product.name,
            //     image: product.image,
            //     price: product.price,
            //     quantity: 1,
            //     totalPrice: product.price,
            // }



            let grandTotalPriceCalculation = updateCartDataWithOldProductItem.reduce((total: number, current: ICart) => {
                return total + Number(current.totalPrice || 0);
            }, 0);

            let updateCartdata: ICartstore = {
                data: updateCartDataWithOldProductItem,
                totalPrice: grandTotalPriceCalculation
            }

            localStorage.setItem('cart', JSON.stringify(updateCartdata))

            renderCartItems();
        }

        if (deleteBtn) {
            Toastify({
                text: "product removed succesfully",
                className: "succes",
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast();
        }


        // Increment quantity;
        if (incrementBtn) {
            let dataId = ((event.target) as HTMLElement).dataset.id;

            let oldCartData = JSON.parse(localStorage.getItem('cart') as string).data

            let updateCartDataWithOldProductItem = oldCartData.map((item: ICart) => {
                if (item.id == dataId) {
                    return {
                        ...item,
                        quantity: Number(item.quantity) + 1,
                        totalPrice: Number(item.price) * (Number(item.quantity) + 1)
                    }
                }
                return item;
            })

            let grandTotalPriceCalculation = updateCartDataWithOldProductItem.reduce((total: number, current: ICart) => {
                return total + Number(current.totalPrice || 0);
            }, 0);

            let updateCartdata: ICartstore = {
                data: updateCartDataWithOldProductItem,
                totalPrice: grandTotalPriceCalculation
            }

            localStorage.setItem('cart', JSON.stringify(updateCartdata))

            renderCartItems();
        }


        // Decrement quantity;
        if (decrementBtn) {
            let dataId = ((event.target) as HTMLElement).dataset.id;

            let oldCartData = JSON.parse(localStorage.getItem('cart') as string).data

            let updateCartDataWithOldProductItem = oldCartData.map((item: ICart) => {
                if (item.id == dataId) {
                    return {
                        ...item,
                        quantity: item.quantity == 1 ? 1 : Number(item.quantity) - 1,
                        totalPrice: Number(item.price) * (item.quantity == 1 ? 1 : Number(item.quantity) - 1)
                    }
                }
                return item;
            })

            let grandTotalPriceCalculation = updateCartDataWithOldProductItem.reduce((total: number, current: ICart) => {
                return total + Number(current.totalPrice || 0);
            }, 0);

            let updateCartdata: ICartstore = {
                data: updateCartDataWithOldProductItem,
                totalPrice: grandTotalPriceCalculation
            }

            localStorage.setItem('cart', JSON.stringify(updateCartdata))

            renderCartItems();
        }
    }))
}

// ================ Helper Function ================

function addCartToLocalStorage(product: IProduct) {
    // console.log(product);

    let checkLocalStorage = localStorage.getItem('cart');


    // Add new cart;
    if (!checkLocalStorage) {
        let newCartData: ICartstore = {
            data: [
                {
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    quantity: 1,
                    totalPrice: product.price,
                }
            ],
            totalPrice: product.price
        }
        localStorage.setItem('cart', JSON.stringify(newCartData))
    }

    // Update cart;
    else {
        let oldCartFromLocalStorage = localStorage.getItem('cart');

        let oldCartData = JSON.parse(oldCartFromLocalStorage as string).data

        let ifExist = oldCartData.find((item: ICart) => item.id == product.id);
        if (ifExist) return;

        // console.log(oldCartData);
        let updateCartDataWithOldProductItem = [
            ...oldCartData,
            {
                id: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: 1,
                totalPrice: product.price,
            }
        ]


        let grandTotalPriceCalculation = updateCartDataWithOldProductItem.reduce((total, current) => {
            return total + Number(current.totalPrice || 0);
        }, 0);

        let updateCartdata: ICartstore = {
            data: updateCartDataWithOldProductItem,
            totalPrice: grandTotalPriceCalculation
        }

        localStorage.setItem('cart', JSON.stringify(updateCartdata))
    }

}

function renderCartItems(): void {

    let sub_total = document.getElementById('sub_total');
    let cart_total_count = document.getElementById('cart_total_count');

    let cartHTML = "";

    let getCartDataFromLocalStorage = localStorage.getItem('cart');

    if (!getCartDataFromLocalStorage) return;

    let getDataItems = JSON.parse(getCartDataFromLocalStorage as string).data;
    getDataItems.forEach((item: ICart) => {
        cartHTML += `<div class="flex items-center gap-4 p-5">

         
          <img src="/src/assets/images/foods/${item.image}" alt="Product" class="h-20 w-20 shrink-0 rounded-lg object-cover" />

          <!-- Product Info -->
          <div class="min-w-0 flex-1">
            <h3 class="truncate font-medium text-gray-900">
              Premium Cotton T-Shirt
            </h3>

            <p class="mt-1 text-sm text-gray-500">
              $${Number(item.price).toFixed(2)} each
            </p>
          </div>

          <!-- Quantity -->
          <div class="flex items-center rounded-lg border border-gray-200">
            <button type="button"
            data-id="${item.id}"
              class="flex h-9 w-9 decrement-btn items-center justify-center text-lg text-gray-600 transition hover:bg-gray-100">
              −
            </button>

            <span class="w-10 text-center text-sm font-medium text-gray-900">
              ${item.quantity}
            </span>

            <button type="button"
            data-id="${item.id}"
              class="flex h-9 w-9 increment-btn items-center justify-center text-lg text-gray-600 transition hover:bg-gray-100">
              +
            </button>
          </div>

          <!-- Price -->
          <div class="w-24 text-right">
            <p class="text-xs text-gray-500">Price</p>
            <p class="mt-1 font-medium text-gray-700">$${Number(item.price).toFixed(2)}</p>
          </div>

          <!-- Total -->
          <div class="w-24 text-right">
            <p class="text-xs text-gray-500">Total</p>
            <p class="mt-1 font-semibold text-gray-900">$${Number(item.totalPrice).toFixed(2)}</p>
          </div>

          <!-- Action -->
          <div class="w-24 text-right">
            <button class="text-red-500 delete-btn cursor-pointer" data-id="${item.id}">Delete</button>
          </div>

        </div>
       

            `
    });

    if (cart_container) cart_container.innerHTML = cartHTML;

    if (sub_total) sub_total.innerHTML = JSON.parse(getCartDataFromLocalStorage as string).totalPrice;

    if (cart_total_count) cart_total_count.innerHTML = getDataItems.length

}

renderCartItems();



