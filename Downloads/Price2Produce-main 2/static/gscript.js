document.addEventListener('DOMContentLoaded', () => {
    const inputBox = document.getElementById('input-box');
    const suggestionList = document.getElementById('suggestion-list');
    const groceryForm = document.getElementById('grocery-form');
    const groceryListInput = document.getElementById('grocery-list');

    if (!inputBox || !suggestionList || !groceryForm || !groceryListInput) {
        console.error('One or more required elements are missing.');
        return;
    }

    let suggestions = [];
    const usedSuggestions = new Set();
    const groceryItems = [];

    inputBox.addEventListener('input', async () => {
        const inputText = inputBox.value.trim();

        if (inputText === '') {
            clearSuggestions();
            return;
        }

        suggestions = await fetchSuggestions(inputText);
        showSuggestions(suggestions);
    });

    groceryForm.addEventListener('submit', () => {
        groceryListInput.value = JSON.stringify(groceryItems);
    });

    async function fetchSuggestions(inputText) {
        try {
            const appId = 'dbf65c4d'; // Replace with your Nutritionix API app ID
            const appKey = '858d472d39c29740a90c65a8df21630e'; // Replace with your Nutritionix API app key
            const response = await fetch(`https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(inputText)}`, {
                headers: {
                    'x-app-id': appId,
                    'x-app-key': appKey
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }

            const data = await response.json();
            return data.common.map(item => item.food_name.charAt(0).toUpperCase() + item.food_name.slice(1));
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            return [];
        }
    }

    

    function showSuggestions(suggestions) {
        usedSuggestions.clear();
        suggestionList.innerHTML = '';

        suggestions.forEach(suggestion => {
            if (!suggestion) return;

            let normalizedSuggestion = suggestion.toLowerCase();
            if (!usedSuggestions.has(normalizedSuggestion)) {
                usedSuggestions.add(normalizedSuggestion);

                const suggestionItem = document.createElement('li');
                suggestionItem.textContent = suggestion;
                suggestionItem.addEventListener('click', () => {
                    addToList(suggestion);
                    inputBox.value = '';
                    clearSuggestions();
                });

                suggestionList.appendChild(suggestionItem);
            }
        });
    }

    function addToList(item) {
        const listContainer = document.getElementById('list-container');
        const li = document.createElement('li');
        li.textContent = item;

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.value = 1;
        quantityInput.classList.add('quantity-input');
        li.appendChild(quantityInput);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => {
            removeFromList(item, li);
        });
        li.appendChild(deleteButton);

        listContainer.appendChild(li);
        groceryItems.push({ item, quantity: 1 });

        quantityInput.addEventListener('input', () => {
            updateQuantity(item, quantityInput.value);
        });
    }

    function removeFromList(item, element) {
        const index = groceryItems.findIndex(grocery => grocery.item === item);
        if (index !== -1) {
            groceryItems.splice(index, 1);
            element.remove();

            // Send delete request to server
            fetch('/delete_grocery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `item=${encodeURIComponent(item)}&user_id=123` // Replace with dynamic user ID if available
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Item deleted successfully.');
                } else {
                    console.error('Failed to delete item.');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }

    function updateQuantity(item, quantity) {
        const grocery = groceryItems.find(grocery => grocery.item === item);
        if (grocery) {
            grocery.quantity = quantity;
        }
    }

    function clearSuggestions() {
        suggestionList.innerHTML = '';
    }
});
