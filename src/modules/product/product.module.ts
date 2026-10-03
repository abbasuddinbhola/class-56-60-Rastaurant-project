import axios from "axios";
import type { IProduct } from "./product.type";
import Toastify from 'toastify-js'

import api from "../../../lib/api";

let add_product: HTMLElement | null = document.getElementById('add_product');
let product_grid = document.getElementById('product_grid');
let table_body = document.getElementById('table_body');
let edit_product_form: HTMLElement | null = document.getElementById('edit_product_form');
let cart_section: HTMLElement | null = document.getElementById('cart_section');


// Product Rendering
async function productRender() {

    try {
        let res = await api.get('/products');

        if (product_grid) {
            product_grid.innerHTML = makeProductHtmlCode(res.data).HomPageHtml;
        };

        if (table_body) {
            table_body.innerHTML = makeProductHtmlCode(res.data).dashboardPageHtml;
        }


    } catch (error) {
        console.log(error);

    }
}

productRender();




// Create product;
// optional chaining...?..
add_product?.addEventListener('submit', async (event) => {
    event.preventDefault();

    let formData = new FormData(add_product as HTMLFormElement);

    let entries = Object.fromEntries(formData.entries()) as unknown as IProduct;

    let validateFormData = validate(entries);

    // Stop hear if validation fails
    if (!validateFormData) {
        return;
    }

    try {


        let res = await api.post('/products', validateFormData)
        console.log(res);

        if (res.status == 201) {

            Toastify({
                text: "Product added successfully",
                className: "success",
            }).showToast();

            (add_product as HTMLFormElement).reset();

            window.location.replace("/dashboard")
        }



    } catch (error) {
        console.error(error);

    }


    // await axios.post("http://localhost:3000/products", validateFormData)

})


// Delete Product;
table_body?.addEventListener('click', async (event) => {

    const target = event.target;

    if (!(target instanceof Element)) return;

    const deleteBtn = target.closest(".delete_product");
    if (!(deleteBtn instanceof HTMLElement)) return;

    let deleteProductId = deleteBtn.dataset.id;

    let confirmDelete = confirm("Are you sure you want to remove this item permanently?");

    if (!confirmDelete) return;

    let delete_product = await api.delete(`/products/${deleteProductId}`);

    if (delete_product.status == 200) {
        Toastify({
            text: "Product removed successfully",
            className: "success",
        }).showToast();

        productRender();
    }

    console.log(delete_product);

})


// Edit Product;
if (edit_product_form) {

    console.log('Hello edit page');

    let searchParams = new URLSearchParams(window.location.search)

    let productId = searchParams.get("productId");


    // let productId = searchParams.get("productId");


    if (productId) {
        async function getData() {
            let response = await api.get(`/products/${productId}`);

            // console.log(response);

            for (let field in response.data) {
                console.log(field);

                (document.querySelector(`[name="${field}"]`) as HTMLInputElement).value = response.data[field];
            }


            // (document.querySelector(`[name="id"]`) as HTMLInputElement).value = response.data.id;
            // (document.querySelector(`[id="name"]`) as HTMLInputElement).value = response.data.id;
            // (document.querySelector(`[id="price"]`) as HTMLInputElement).value = response.data.price;
            // (document.querySelector(`[id="ratting"]`) as HTMLInputElement).value = response.data.ratting;
            // (document.querySelector(`[name="image"]`) as HTMLInputElement).value = response.data.image;

        }

        getData();
    }

}

edit_product_form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    let formData = new FormData(edit_product_form as HTMLFormElement);

    let entries = Object.fromEntries(formData.entries()) as unknown as IProduct;

    let validateFormData = validate(entries);

    // Stop hear if validation fails
    if (!validateFormData) {
        return;
    }


    let searchParams = new URLSearchParams(window.location.search)

    let productId = searchParams.get("productId");

    if (productId) {
        try {

            let { id, ...updateFormData } = validateFormData;

            let res = await api.put(`/products/${productId}`, validateFormData);

            console.log(res);

            if (res.status == 200) {

                Toastify({
                    text: "Product updated successfully",
                    className: "success",
                }).showToast();

                // (edit_product_form as HTMLFormElement).reset();

                window.location.replace("/dashboard")
            }



        } catch (error) {
            console.error(error);
        }
    }

})

// ============== Helper Function ==================

function validate(formData: IProduct) {


    let conditions =
        formData.name == ""
        || !formData.image
        || Number(formData.price) <= 0
        || !formData.ratting



    if (conditions) {

        Toastify({
            text: "Please fill all required form fields.",
            className: "info",
        }).showToast();

        return null;

    }

    return formData;
}


function makeProductHtmlCode(arr: IProduct[]) {

    let HomPageHtml = "";
    let dashboardPageHtml = "";

    arr.forEach((item, index) => {
        HomPageHtml += `
                 <article
                    class="group overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                     <!-- Image -->
                     <div class="overflow-hidden">
                     <img src="/src/assets/images/foods/${item.image}" alt="Chicken Burger"
                    class="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                      </div>

                      <!-- Content -->
                   <div class="p-5">
                    <h3 class="text-lg font-semibold text-gray-900">
                   ${item.name}
                     </h3>

                  <!-- Rating + Price -->
                    <div class="mt-4 flex items-center justify-between gap-3">

                   <!-- Rating -->
                ${rattingCount(item.ratting)}

                   <span class="text-lg font-bold text-gray-900">
                ${Number(item.price).toFixed(2)}
                   </span>
                 </div>

            <!-- Button -->
                 <button type="button"
                      data-id="${item.id}"
                      class="mt-5 w-full cursor-pointer add_to_cart rounded-lg bg-[#F0A500] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d99400]">
                      Add to Cart
                 </button>
            </div>
                 </article>

             `;

        dashboardPageHtml += `
                            <tr class="transition hover:bg-gray-50">

                            <td class="px-6 py-4">
                           ${index + 1}
                            </td>
                            <td class="px-6 py-4">
                             <img src="/src/assets/images/foods/${item.image}"
                               alt="Nike Shoes" class="h-14 w-14 rounded-lg object-cover" />
                         </td>

                             <td class="px-6 py-4">
                               <p class="font-medium text-gray-800">
                                ${item.name}
                             </p>
                             <p class="text-sm text-gray-400">
                                Running Shoes
                             </p>
                         </td>

                         <td class="px-6 py-4">
                              <span class="font-semibold text-gray-800">
                                       ${Number(item.price).toFixed(2)}
                                </span>
                                </td>
                                <td class="px-6 py-4">
                             <div class="flex items-center gap-1">
                                       
                              <span class="font-medium text-gray-700">${rattingCount(item.ratting)}</span>
                             </div>
                        </td>

                        <td class="px-6 py-4">
                            <div class="flex justify-end gap-2">

                            <a 
                         href="edit-product?productId=${item.id}"
                             class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100">
                             Edit
                         </a>

                        <button data-id=${item.id}
                            class="rounded-lg border delete_product border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100">
                             Delete
                        </button>

                   </div>
                </td>

            </tr>
        `
    })


    function rattingCount(n: number) {
        let starts = "";

        for (let i = 0; i <= 4; i++) {

            if (n > i) {
                starts += ` <span class="text-lg text-[#F0A500]">★</span> `

            }
            else {
                starts += `<span class="text-lg text-gray-400">★</span> `
            }

        }

        return ` <div class="flex items-center gap-0.5">${starts}</div> `
    }


    return {
        HomPageHtml: HomPageHtml,
        dashboardPageHtml: dashboardPageHtml
    };
}

