import util from "@/util/util";

const getAllProducts = async () => {
    return await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/products`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${util.getLoggedInCustomer().token}`
            }
        }
    );
};

const getProductByName = async(name: string )=>{
    return await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${name}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
};

const searchProducts = async(name: string )=>{
    return await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/search/${name}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}

const ProductService = {
    getAllProducts,
    getProductByName,
    searchProducts
};

export default ProductService;