function searchItems() {
    let searchText = document.getElementById("searchInput").value.toLowerCase();

    let products = document.querySelectorAll(".product-card");

    products.forEach(function(product) {

        let productName = product.querySelector("h3").textContent.toLowerCase();

        if (productName.includes(searchText)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }

    });
}

function filterCategory(category) {
    let products = document.querySelectorAll(".product-card");

    products.forEach(function(product) {
        let productCategory = product.getAttribute("data-category");

        if (category === "all" || productCategory === category) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
}

function postItem() {
    let name = document.getElementById("productName").value;
    let price = document.getElementById("productPrice").value;
    let category = document.getElementById("productCategory").value;
    let description = document.getElementById("productDescription").value;

    if (name === "" || price === "" || category === "" || description === "") {
        alert("Please fill all the fields!");
        return;
    }

    let product = {
        name: name,
        price: price,
        category: category,
        description: description
    };

    localStorage.setItem("campusProduct", JSON.stringify(product));

    alert("Item saved successfully!");

    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productCategory").value = "";
    document.getElementById("productDescription").value = "";
}