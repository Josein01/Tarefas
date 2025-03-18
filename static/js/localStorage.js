document.addEventListener('DOMContentLoaded', loadItems);
document.getElementById('add-item-btn').addEventListener('click', addItem);

function loadItems() {
    const items = JSON.parse(localStorage.getItem('shoppingList')) || [];
    items.forEach(item => addItemToDOM(item));
}

function addItem() {
    const itemInput = document.getElementById('item-input');
    const descInput = document.getElementById('desc-input');
    const itemText = itemInput.value.trim();
    const descText = descInput.value.trim();
    if (itemText === '') return;

    const item = { text: itemText, description: descText };
    addItemToDOM(item);
    saveItem(item);
    itemInput.value = '';
    descInput.value = '';
    $('#staticBackdrop').modal('hide');
}

function addItemToDOM(item) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card mb-3';
    cardContainer.style.maxWidth = '18rem';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.style.backgroundColor = '#ffffff';
    
    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = item.text;

    const cardText = document.createElement('p');
    cardText.className = 'card-text';
    cardText.textContent = item.description || 'Sem descrição';

    const editButton = document.createElement('button');
    editButton.className = 'btn btn-warning btn-sm mr-2';
    editButton.textContent = '✏️';
    editButton.onclick = () => {
        const newItemText = prompt('Editar item:', item.text);
        const newDescText = prompt('Editar descrição:', item.description);
        if (newItemText !== null && newItemText.trim() !== '') {
            item.text = newItemText.trim();
            item.description = newDescText.trim();
            cardTitle.textContent = item.text;
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

    cardBody.appendChild(cardTitle);
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
    const itemIndex = items.findIndex(item => item.text === updatedItem.text);
    if (itemIndex > -1) {
        items[itemIndex] = updatedItem;
        localStorage.setItem('shoppingList', JSON.stringify(items));
    }
}

function removeItem(item) {
    const items = JSON.parse(localStorage.getItem('shoppingList')) || [];
    const filteredItems = items.filter(i => i.text !== item.text);
    localStorage.setItem('shoppingList', JSON.stringify(filteredItems));
}