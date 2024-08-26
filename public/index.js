// Final Project index.js file
"use strict";

(function() {

  window.addEventListener("load", init);

  let searchTerm = "";
  let searchBtn = "";
  const threeThousand = 3000;

  /** Initiator function */
  function init() {
    setupLoginListener();
  }

  function setupLoginListener() {
    document.getElementById('login').addEventListener('click', function(event) {
      event.preventDefault(); // Prevent the form from submitting traditionally
      performLogin();
    });
  }

  function performLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    }).then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('login-form-container').style.display = 'none'; // Hide login form
            document.getElementById('main-content').classList.remove('hidden'); // Show the rest of the content
            load();
        } else {
            document.getElementById('login-error').textContent = data.message;
        }
    })
    .catch(error => {
        console.error('Login Error:', error);
        document.getElementById('login-error').textContent = 'Login failed, please try again.';
    });
}

  /** Load page */
  function load() {
    setEventListeners();
    fetchIntroImg();
    fetchCategory("mens");
    fetchCategory("womens");
    fetchCategory("childrens");
    document.body.style.display = 'block';
  }

  /**
   * Sets up event listeners for the home button, search bar, and various categories.
   */
  function setEventListeners() {
    qs("#home-btn").addEventListener('click', reset);
    searchBtn = document.getElementById('search-btn');
    searchTerm = document.getElementById('search-term');

    qs("#account-btn").addEventListener('click', handleAccountBtn);
    qs("#mens-btn").addEventListener('click', handleCategoryBtn.bind(null, "#mens"));
    qs("#womens-btn").addEventListener('click', handleCategoryBtn.bind(null, "#womens"));
    qs("#childrens-btn").addEventListener('click', handleCategoryBtn.bind(null, "#childrens"));
    qs("#toggleView-btn").addEventListener("click", toggleView);

    search();
    filterEvents();

    const modeSwitch = document.getElementById("modeSwitch");
    const body = document.body;

    modeSwitch.addEventListener("change", function() {
      body.classList.toggle("dark-mode");
    });
  }

  function toggleView() {
    let categorySections = document.querySelectorAll(".category");
    let toggleButton = document.getElementById("toggleView-btn");

    categorySections.forEach(section => {
      section.classList.toggle("block-view");
    });

    let isBlockView = categorySections[0].classList.contains("block-view");

    if(isBlockView) {
      toggleButton.textContent = "Block View";
    } else {
      toggleButton.textContent = "List View";
    }
  }

  /**
   * Calls two functions, one hides all sections and one fetches the purchase history.
   */
  function handleAccountBtn() {
    hideAllSections();
    fetchPurchaseHistory();
    qs(".hide-title1").classList.remove("hidden");
    qs(".hide-title2").classList.remove("hidden");
    qs("#recommendations").classList.remove("hidden");
  }

  /**
   * Checks which category is chosen, then hides all other categories.
   * @param {string} category The category chosen
   */
  function handleCategoryBtn(category) {
    const categories = ["#mens", "#womens", "#childrens"];
    hideAllSections();

    categories.forEach(cat => {
      if (cat === category) {
        qs(cat).classList.remove("hidden");
        qs(`${cat}-section`).classList.remove("hidden");
      } else {
        qs(cat).classList.add("hidden");
        qs(`${cat}-section`).classList.add("hidden");
      }
    });

    qs("#intro").classList.add("hidden");
    qs("#search-section").classList.add("hidden");
    qs("#search").classList.add("hidden");
    qs(".hide-title1").classList.add("hidden");
    qs(".hide-title2").classList.add("hidden");
    qs("#recommendations").classList.add("hidden");

    qs('#history-section').innerHTML = "";
  }

  /**
   * Hides all sections.
   */
  function hideAllSections() {
    const sections = ["#mens", "#womens", "#childrens", "#mens-section", "#womens-section",
      "#childrens-section", "#intro", "#search-section", "#search", "#filter-nav"];
    sections.forEach(section => {
      qs(section).classList.add("hidden");
    });
  }

  /** Fetches and sets the intro image */
  async function fetchIntroImg() {
    try {
      const response = await fetch('http://localhost:3000/images/winter-fashion.webp');

      const blob = await response.blob();

      const imageUrl = URL.createObjectURL(blob);

      let imgElement = qs("#intro-img");
      imgElement.src = imageUrl;
      imgElement.alt = "intro image";
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * This function fetches a speficied category, then calls the populate() function to
   * populate the page with items.
   * @param {string} category The category that is to be loaded
   */
  async function fetchCategory(category) {
    try {
      let response = await fetch('/api/products/' + category);
      await statusCheck(response);
      response = await response.json();
      populate(response, category, "");
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * This function populates the page with items. It will first select all category sections, and
   * for each item in the json, it will append the details of that item to the section.
   * The details include id, description, name, price, and type.
   * @param {JSON} res JSON response
   * @param {string} category Item category
   * @param {string} type Item type
   */
   function populate(res, category, type) {
    const container = document.querySelector('.category#' + category);
    res.forEach(item => {
      const newItem = document.createElement('section');
      newItem.classList.add('item');
      newItem.classList.add(item.type);

      if (type === "") {
        newItem.dataset.itemId = item.id;
      } else {
        newItem.dataset.searchItemId = item.id;
      }

      const descriptionSection = document.createElement('section');
      descriptionSection.classList.add('des');

      const itemName = document.createElement('h2');
      itemName.textContent = item.name;

      const itemPrice = document.createElement('p');
      itemPrice.textContent = `Price: $${item.price}`;

      descriptionSection.appendChild(itemName);
      descriptionSection.appendChild(itemPrice);

      newItem.appendChild(descriptionSection);

      container.appendChild(newItem);
      setImg(item.id, type);

      newItem.addEventListener('click', async () => {
        console.log('Clicked Item Name:', item.name); // Log the item name
        console.log('Product ID:', item.id);
        const productId = await fetchProductIdByName(item.name);
        if (productId) {
          item.id = productId;
          displayItemDetails(item);
          qs("#popup").classList.add("open");
        }
      });
    });
  }

  async function fetchProductIdByName(name) {
    try {
      const response = await fetch(`/api/product-id?name=${encodeURIComponent(name)}`);
      const data = await response.json();
      if (data.success) {
        return data.id;
      } else {
        console.error('Product not found:', data.message);
        return null;
      }
    } catch (err) {
      console.error('Error fetching product ID:', err);
      return null;
    }
  }

  // Sets item image ABOVE everything else
  /**
   * Sets the image according to it's item id. It will fetch the image by id, and then append it
   * above the description and price.
   * @param {string} id Item id
   * @param {string} type Item type
   */
  async function setImg(id, type) {
    try {
      const response = await fetch('http://localhost:3000/images/' + id + '.jpg');

      const blob = await response.blob();

      const imageUrl = URL.createObjectURL(blob);

      const imgElement = document.createElement('img');
      imgElement.src = imageUrl;
      imgElement.alt = id + " image";

      if (type === "") {
        let card = qs(`.item[data-item-id="${id}"]`);
        const firstChild = card.firstChild;
        card.insertBefore(imgElement, firstChild);
      } else {
        let card = qs(`.item[data-search-item-id="${id}"]`);
        const firstChild = card.firstChild;
        card.insertBefore(imgElement, firstChild);
      }
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Displays item details in the DOM
   * @param {Object} data - The item data to display
   */
  function displayItemDetails(data, productId) {
    //const productId = document.getElementById('item-name').dataset.productId;
    const itemNameElement = document.getElementById('item-name');
    itemNameElement.textContent = data.name;
    itemNameElement.dataset.productId = productId;
    document.getElementById('item-name').textContent = data.name;
    document.getElementById('item-description').textContent = data.description;
    document.getElementById('item-price').textContent = data.price;

    let item = qs(`.item[data-item-id="${data.id}"] img`);
    document.getElementById('item-image').src = item.src;

    fetchReviews(productId);

    const submitReviewButton = document.getElementById('submit-review-btn');
    submitReviewButton.removeEventListener('click', submitReview); // Remove any existing listener
    submitReviewButton.addEventListener('click', submitReview);

    qs('#buy').removeEventListener('click', handleBuyClick);
    qs('#buy').addEventListener('click', () => handleBuyClick(productId));

    qs('#close-popup').addEventListener('click', () => {
      qs('#popup').classList.remove('open');
    });
  }

  function handleBuyClick(productId) {
    const confirmationModal = document.getElementById('confirmation-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');

    if (!confirmationModal || !modalBackdrop) {
      console.error('Confirmation modal or backdrop not found');
      return;
    }
    confirmationModal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
    console.log("Confirmation modal displayed");

    const confirmPurchaseBtn = document.getElementById('confirm-purchase-btn');
    const cancelPurchaseBtn = document.getElementById('cancel-purchase-btn');

    const confirmHandler = function() {
      console.log("Confirm purchase clicked for product ID:", productId);
      handlePurchase(productId);
      confirmationModal.classList.add('hidden');
      modalBackdrop.classList.add('hidden');
      confirmPurchaseBtn.removeEventListener('click', confirmHandler);
    };

    const cancelHandler = function() {
      console.log("Cancel purchase clicked");
      confirmationModal.classList.add('hidden');
      modalBackdrop.classList.add('hidden');
      cancelPurchaseBtn.removeEventListener('click', cancelHandler);
    };

    confirmPurchaseBtn.addEventListener('click', confirmHandler);
    cancelPurchaseBtn.addEventListener('click', cancelHandler);

    document.getElementById('buy').addEventListener('click', function() {
      const productId = document.getElementById('item-name').dataset.productId;
      handleBuyClick(productId);
    });
  }


  /**
   * This function searches the database for an inputted request. It will fetch all items that
   * fit the searched term. The search will display all items with the search request.
   */
  function search() {
    searchTerm.addEventListener('input', () => {
      searchBtn.disabled = searchTerm.value.trim() === '';
    });

    searchBtn.addEventListener('click', async () => {
      const trimmedSearchTerm = searchTerm.value.trim();
      if (trimmedSearchTerm !== '') {
        try {
          searchBtn.disabled = true; // disable search button during the request

          // make API request
          let response =
            await fetch(`/api/products?search=${encodeURIComponent(trimmedSearchTerm)}`);
          await statusCheck(response);
          response = await response.json();
          displaySearch(response, "search");

          // clear search term and enable search button after successful request
          searchTerm.value = '';
          searchBtn.disabled = false;
        } catch (error) {
          const errorMessageElement = qs("#error-message");
          errorMessageElement.textContent = "Oops! Product not found:(";
          errorMessageElement.classList.add("visible");

          setTimeout(() => {
            errorMessageElement.textContent = "";
            errorMessageElement.classList.remove("visible");
          }, threeThousand);
          handleError(error);
        }
      }
    });
  }

  /**
   * Adds event listeners to the various filters. Each function calls filters();
   */
  function filterEvents() {
    qs('#shirts-check').addEventListener('change', filters);
    qs('#pants-check').addEventListener('change', filters);
    qs('#outer-check').addEventListener('change', filters);
  }

  /**
   * This function checks which filter is chosen, and then hides all other items that do not fit
   * the filter while keeping the filtered items visible.
   */
  function filters() {
    const shirtFilter = qs('#shirts-check').checked;
    const pantsFilter = qs('#pants-check').checked;
    const outerwearFilter = qs('#outer-check').checked;

    const items = document.querySelectorAll('.item');

    items.forEach(item => {
      const isShirt = item.classList.contains('shirt');
      const isPants = item.classList.contains('pant');
      const isOuterwear = item.classList.contains('outer');

      let isVisible = true;

      if ((shirtFilter && !isShirt) || (pantsFilter && !isPants) ||
        (outerwearFilter && !isOuterwear)) {
        isVisible = false;
      }

      if (isVisible) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });

    resetFilters();
  }

  /**
   * Resets the filters to an unchecked state. All items are for that specific category or search
   * are automatically visible, as resetting filters resets it to the default state.
   */
  function resetFilters() {
    document.getElementById('resetButton').addEventListener('click', function() {
      const radioButtons = document.querySelectorAll('input[name="category"]');
      radioButtons.forEach(button => {
        button.checked = false;
      });

      const items = document.querySelectorAll('.item');
      items.forEach(item => {
        item.classList.remove("hidden");
      });
    });
  }

  /**
   * Displays the items from the search bar.
   * @param {JSON} response JSON response
   * @param {string} container Container containing searched items
   */
  function displaySearch(response, container) {
    qs("#search-section").classList.remove("hidden");
    qs("#search").classList.remove("hidden");
    qs("#intro").classList.add("hidden");
    qs("#mens").classList.add("hidden");
    qs("#womens").classList.add("hidden");
    qs("#childrens").classList.add("hidden");
    qs("#mens-section").classList.add("hidden");
    qs("#womens-section").classList.add("hidden");
    qs("#childrens-section").classList.add("hidden");
    qs("#search").innerHTML = "";
    populate(response, container); // populate with searched items
    qs('#history-section').innerHTML = "";
  }

  /**
   * Resets the page back to the home page. Removes and adds hidden class. Clears search container.
   */
  function reset() {
    qs("#mens").classList.remove("hidden");
    qs("#womens").classList.remove("hidden");
    qs("#childrens").classList.remove("hidden");
    qs("#mens-section").classList.remove("hidden");
    qs("#womens-section").classList.remove("hidden");
    qs("#childrens-section").classList.remove("hidden");
    qs("#search-section").classList.add("hidden");
    qs("#search").classList.add("hidden");
    qs("#search").innerHTML = "";
    qs("#intro").classList.remove("hidden");
    qs('#history-section').innerHTML = "";
  }

  // handles the purchase of the items
  async function handlePurchase(itemId) {
    if (!productId) return;
    const userId = "cooluser";

    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId, itemId})
      });

      const data = await response.json();
      if (data.success) {
        showPopupMessage('Purchase successful!');
        qs('#popup').classList.remove('open');
      } else {
        showPopupMessage('Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      showPopupMessage('An error occurred. Please try again.');
    }
  }

  function cancelPurchase() {
  const confirmationModal = document.getElementById('confirmation-modal');
  confirmationModal.classList.add('hidden');
}

  async function fetchPurchaseHistory() {
    const username = "cooluser"; // Hardcoded for now, replace with dynamic username if needed
    try {
      const response = await fetch(`/api/purchase-history/${username}`);
      await statusCheck(response);
      const data = await response.json();
      if (data.success) {
        displayPurchaseHistory(data.purchaseHistory);
        fetchRecommendations(data.purchaseHistory);
      } else {
        console.error('Failed to fetch purchase history');
      }
    } catch (error) {
      handleError(error);
    }
  }

  function displayPurchaseHistory(purchaseHistory) {
    const container = document.createElement('div');
    container.id = 'purchase-history';

    purchaseHistory.forEach(order => {
      const orderElement = document.createElement('div');
      orderElement.classList.add('order');

      const orderIdElement = document.createElement('h3');
      orderIdElement.textContent = `Order ID: ${order.orderid}`;

      const itemsList = document.createElement('ul');
      order.items.forEach(item => {
        const itemElement = document.createElement('li');

        const itemImage = document.createElement('img');
        itemImage.src = `/images/${item.id}.jpg`; // Assuming image naming convention is based on product ID
        itemImage.alt = item.name;
        itemImage.style.width = '50px'; // Adjust size as needed

        const itemDetails = document.createElement('span');
        itemDetails.textContent = `${item.name} - $${item.price}`;

        itemElement.appendChild(itemImage);
        itemElement.appendChild(itemDetails);
        itemsList.appendChild(itemElement);
      });

      orderElement.appendChild(orderIdElement);
      orderElement.appendChild(itemsList);
      container.appendChild(orderElement);
    })

    qs('#history-section').appendChild(container);
  }

  function showPopupMessage(message) {
    const popupMessage = document.createElement('div');
    popupMessage.id = 'purchase-popup-message';
    popupMessage.textContent = message;
    popupMessage.classList.add('popup-message'); // Add this class to style the popup
    document.body.appendChild(popupMessage);

    // Automatically remove the popup after a delay
    setTimeout(() => {
      document.body.removeChild(popupMessage);
    }, 3000); // Adjust time as needed
  }

    /**
   * Submits a review for a product.
   */
     async function submitReview() {
      try {
        const productId = document.getElementById('item-name').dataset.productId;
        const rating = document.getElementById('review-rating').value;
        const comment = document.getElementById('review-comment').value;

        console.log('Product ID:', productId);
        console.log('Rating:', rating);
        console.log('Comment:', comment);

        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            product_id: productId,
            username: 'cooluser', // Replace with dynamic username if available
            rating: rating,
            comment: comment
          })
        });

        const data = await response.json();

        if (data.success) {
          console.log('Review submitted successfully:', data);
          fetchReviews(productId);
        } else {
          console.error('Error submitting review:', data);
        }
      } catch (err) {
        console.error('Error submitting review:', err);
      }
    }
  /**
   * Fetches reviews for a product.
   * @param {number} productId - The ID of the product to fetch reviews for.
   */
   async function fetchReviews(productId) {
    try {
      const response = await fetch(`/api/reviews/${productId}`);
      const reviews = await response.json();
      console.log('Fetched reviews:', reviews); // Add this line for debugging

      const reviewsList = document.getElementById('reviews-list');
      reviewsList.innerHTML = ''; // Clear existing reviews

      reviews.forEach(review => {
        const li = document.createElement('li');
        li.textContent = `${review.rating} stars - ${review.comment}`;
        reviewsList.appendChild(li);
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  }

  /**
   * Fetches recommendations based on user's purchase history
   * @param {Array} purchaseHistory User's purchase history
   */
  async function fetchRecommendations(purchaseHistory) {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({itemIds: extractItemIdsFromHistory(purchaseHistory)})
      });

      const data = await response.json();
      if (data.success) {
        displayRecommendations(data.recommendations);
      } else {
        console.error('Failed to fetch recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }

  /**
   * Extracts item IDs from the user's purchase history
   * @param {Array} purchaseHistory User's purchase history
   * @returns {Array} Array of item IDs
   */
  function extractItemIdsFromHistory(purchaseHistory) {
    const itemIds = [];

    purchaseHistory.forEach(order => {
      order.items.forEach(item => {
        itemIds.push(item.id);
      });
    });

    return itemIds;
  }

  /**
   * Displays the recommended items on the page
   * @param {Array} recommendations Array of recommended items
   */
  function displayRecommendations(recommendations) {
    const recommendationsContainer = qs('#recommendations');
    recommendationsContainer.innerHTML = '';

    recommendations.forEach(item => {
      const recommendationElement = document.createElement('div');
      recommendationElement.classList.add('recommendation');

      const itemName = document.createElement('h2');
      itemName.textContent = item.name;

      const itemPrice = document.createElement('p');
      itemPrice.textContent = `Price: $${item.price}`;

      recommendationElement.appendChild(itemName);
      recommendationElement.appendChild(itemPrice);

      recommendationsContainer.appendChild(recommendationElement);
    });
  }

  /**
   * Handles errors
   * @param {Error} err error object
   */
  function handleError(err) {
    qs(".error").innerHTML = err;
    qs(".error").classList.remove("hidden");

    setTimeout(() => {
      qs(".error").classList.add("hidden");
      qs(".error").innerHTML = "";
    }, threeThousand);
  }

  /**
   * Checks the status of the response
   * @param {Response} res response object
   * @returns {Response} response object
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Helper functions
   * @param {selector} selector - selector of querySelector
   * @returns {Element} query of selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }
})();
