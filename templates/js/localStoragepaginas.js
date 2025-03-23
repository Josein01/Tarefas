document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('shopping-list')) {
        loadItems();
    }

    if (document.getElementById('add-item-btn')) {
        document.getElementById('add-item-btn').addEventListener('click', addItem);
    }
});

function loadItems() {
    const items = JSON.parse(localStorage.getItem('shoppingList')) || [];
    items.forEach(item => addItemToDOM(item));
}

function addItem() {
    const descInput = document.getElementById('desc-input');
    const descText = descInput.value.trim();
    if (descText === '') return;

    const item = { description: descText };
    saveItem(item);
    descInput.value = '';
    window.location.href = "pagina2.html";
}

function addItemToDOM(item) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card mb-3';
    cardContainer.style.maxWidth = '18rem';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.style.backgroundColor = '#ffffff';
    cardBody.style.border.style = 'groove';

    const cardText = document.createElement('p');
    cardText.className = 'card-text';
    cardText.textContent = item.description || 'Sem descrição';

    const editButton = document.createElement('button');
    editButton.className = 'btn btn-warning btn-sm mr-2';
    editButton.textContent = '✏️';
    editButton.onclick = () => {
        const newDescText = prompt('Editar descrição:', item.description);
        if (newDescText !== null && newDescText.trim() !== '') {
            item.description = newDescText.trim();
            cardText.textContent = item.description || 'Sem descrição';
            updateItem(item);
        }
    };

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = '🗑️';
    deleteButton.onclick = () => {
        cardContainer.remove();
        removeItem(item);
    };

    cardBody.appendChild(cardText);
    cardBody.appendChild(editButton);
    cardBody.appendChild(deleteButton);
    cardContainer.appendChild(cardBody);

    document.getElementById('shopping-list').appendChild(cardContainer);
}

function saveItem(item) {
    const items = JSON.parse(localStorage.getItem('shoppingList')) || [];
    items.push(item);
    localStorage.setItem('shoppingList', JSON.stringify(items));
}

function updateItem(updatedItem) {
    const items = JSON.parse(localStorage.getItem('shoppingList')) || [];
    const itemIndex = items.findIndex(item => item.description === updatedItem.description);
    if (itemIndex > -1) {
        items[itemIndex] = updatedItem;
        localStorage.setItem('shoppingList', JSON.stringify(items));
    }
}

function removeItem(item) {
    const items = JSON.parse(localStorage.getItem('shoppingList')) || [];
    const filteredItems = items.filter(i => i.description !== item.description);
    localStorage.setItem('shoppingList', JSON.stringify(filteredItems));
}
