document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const newListNameInput = document.getElementById('new-list-name');
    const createListBtn = document.getElementById('create-list-btn');
    const listsContainer = document.getElementById('lists-container');
    const emptyMessage = document.getElementById('empty-message');
    
    // Array para armazenar as listas
    let lists = [];
    
    // Chave para o localStorage
    const STORAGE_KEY = 'todo-lists-data';
    
    // Carregar dados do localStorage
    function loadFromLocalStorage() {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            try {
                lists = JSON.parse(storedData);
                renderAllLists();
            } catch (e) {
                console.error('Erro ao carregar dados do localStorage:', e);
                lists = [];
            }
        }
        updateEmptyMessage();
    }
    
    // Salvar dados no localStorage
    function saveToLocalStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    }
    
    // Gerar ID único
    function generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    
    // Atualizar mensagem de lista vazia
    function updateEmptyMessage() {
        emptyMessage.style.display = lists.length === 0 ? 'block' : 'none';
    }
    
    // Criar uma nova lista
    function createList() {
        const listName = newListNameInput.value.trim();
        if (!listName) return;
        
        const newList = {
            id: generateId(),
            name: listName,
            items: []
        };
        
        lists.push(newList);
        renderList(newList);
        updateEmptyMessage();
        saveToLocalStorage();
        
        newListNameInput.value = '';
    }
    
    // Renderizar todas as listas
    function renderAllLists() {
        // Limpar o container de listas, exceto a mensagem vazia
        const children = Array.from(listsContainer.children);
        children.forEach(child => {
            if (child !== emptyMessage) {
                child.remove();
            }
        });
        
        // Renderizar cada lista
        lists.forEach(list => {
            renderList(list);
        });
    }
    
    // Renderizar uma lista
    function renderList(list) {
        // Criar o elemento da lista
        const listCard = document.createElement('div');
        listCard.className = 'list-card';
        listCard.dataset.listId = list.id;
        
        // Criar o cabeçalho da lista
        const listHeader = document.createElement('div');
        listHeader.className = 'list-header';
        
        const listTitle = document.createElement('h2');
        listTitle.className = 'list-title';
        listTitle.textContent = list.name;
        
        const headerActions = document.createElement('div');
        headerActions.className = 'header-actions';
        
        const editTitleBtn = document.createElement('button');
        editTitleBtn.className = 'edit-title-btn';
        editTitleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
        editTitleBtn.addEventListener('click', () => startEditTitle(list.id));
        
        const removeListBtn = document.createElement('button');
        removeListBtn.className = 'remove-list-btn';
        removeListBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
        removeListBtn.addEventListener('click', () => removeList(list.id));
        
        headerActions.appendChild(editTitleBtn);
        headerActions.appendChild(removeListBtn);
        
        listHeader.appendChild(listTitle);
        listHeader.appendChild(headerActions);
        
        // Criar o conteúdo da lista
        const listContent = document.createElement('div');
        listContent.className = 'list-content';
        
        const itemsList = document.createElement('ul');
        itemsList.className = 'items-list';
        
        // Renderizar itens existentes
        if (list.items.length > 0) {
            list.items.forEach(item => {
                const itemElement = createItemElement(item, list.id);
                itemsList.appendChild(itemElement);
            });
        }
        
        const emptyItemsMessage = document.createElement('div');
        emptyItemsMessage.className = 'empty-items-message';
        emptyItemsMessage.textContent = 'Nenhum item na lista. Adicione abaixo!';
        emptyItemsMessage.style.display = list.items.length === 0 ? 'block' : 'none';
        
        listContent.appendChild(itemsList);
        listContent.appendChild(emptyItemsMessage);
        
        // Criar o formulário para adicionar novos itens
        const addItemForm = document.createElement('div');
        addItemForm.className = 'add-item';
        
        const newItemInput = document.createElement('input');
        newItemInput.type = 'text';
        newItemInput.className = 'new-item-input';
        newItemInput.placeholder = 'Novo item';
        
        const addItemBtn = document.createElement('button');
        addItemBtn.className = 'add-item-btn';
        addItemBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>';
        
        function addNewItem() {
            const itemText = newItemInput.value.trim();
            if (!itemText) return;
            
            const newItem = {
                id: generateId(),
                text: itemText,
                checked: false
            };
            
            // Adicionar ao array
            const listIndex = lists.findIndex(l => l.id === list.id);
            if (listIndex !== -1) {
                lists[listIndex].items.push(newItem);
                
                // Adicionar ao DOM
                const itemElement = createItemElement(newItem, list.id);
                itemsList.appendChild(itemElement);
                
                // Atualizar mensagem de itens vazios
                emptyItemsMessage.style.display = 'none';
                
                // Salvar no localStorage
                saveToLocalStorage();
                
                // Limpar o input
                newItemInput.value = '';
            }
        }
        
        addItemBtn.addEventListener('click', addNewItem);
        newItemInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                addNewItem();
            }
        });
        
        addItemForm.appendChild(newItemInput);
        addItemForm.appendChild(addItemBtn);
        
        // Montar a lista completa
        listCard.appendChild(listHeader);
        listCard.appendChild(listContent);
        listCard.appendChild(addItemForm);
        
        // Adicionar ao container
        listsContainer.appendChild(listCard);
    }
    
    // Iniciar a edição do título da lista
    function startEditTitle(listId) {
        const listCard = document.querySelector(`.list-card[data-list-id="${listId}"]`);
        if (!listCard) return;
        
        const listHeader = listCard.querySelector('.list-header');
        const listTitle = listCard.querySelector('.list-title');
        const headerActions = listCard.querySelector('.header-actions');
        
        // Encontrar a lista no array
        const list = lists.find(l => l.id === listId);
        if (!list) return;
        
        // Guardar o conteúdo original
        const originalTitle = listTitle.textContent;
        const originalHeader = listHeader.innerHTML;
        
        // Criar o formulário de edição
        const editForm = document.createElement('div');
        editForm.className = 'edit-title-form';
        
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-title-input';
        editInput.value = originalTitle;
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        cancelBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>';
        
        editForm.appendChild(editInput);
        editForm.appendChild(saveBtn);
        editForm.appendChild(cancelBtn);
        
        // Substituir o conteúdo do cabeçalho pelo formulário de edição
        listHeader.innerHTML = '';
        listHeader.appendChild(editForm);
        
        // Focar no input
        editInput.focus();
        
        // Função para salvar a edição
        function saveEdit() {
            const newTitle = editInput.value.trim();
            if (!newTitle) return;
            
            // Atualizar no array
            list.name = newTitle;
            saveToLocalStorage();
            
            // Restaurar o cabeçalho com o novo título
            listHeader.innerHTML = originalHeader;
            listCard.querySelector('.list-title').textContent = newTitle;
            
            // Reconfigurar os event listeners
            listCard.querySelector('.edit-title-btn').addEventListener('click', () => startEditTitle(listId));
            listCard.querySelector('.remove-list-btn').addEventListener('click', () => removeList(listId));
        }
        
        // Função para cancelar a edição
        function cancelEdit() {
            listHeader.innerHTML = originalHeader;
            
            // Reconfigurar os event listeners
            listCard.querySelector('.edit-title-btn').addEventListener('click', () => startEditTitle(listId));
            listCard.querySelector('.remove-list-btn').addEventListener('click', () => removeList(listId));
        }
        
        // Configurar event listeners para o formulário de edição
        saveBtn.addEventListener('click', saveEdit);
        cancelBtn.addEventListener('click', cancelEdit);
        
        editInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    }
    
    // Criar um elemento de item
    function createItemElement(item, listId) {
        const listItem = document.createElement('li');
        listItem.className = 'list-item';
        listItem.dataset.itemId = item.id;
        
        // Conteúdo do item (checkbox e texto)
        const itemContent = document.createElement('div');
        itemContent.className = 'item-content';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'item-checkbox';
        checkbox.checked = item.checked;
        checkbox.addEventListener('change', function() {
            toggleItemCheck(listId, item.id, this.checked);
        });
        
        const itemText = document.createElement('span');
        itemText.className = 'item-text';
        if (item.checked) {
            itemText.classList.add('checked');
        }
        itemText.textContent = item.text;
        
        itemContent.appendChild(checkbox);
        itemContent.appendChild(itemText);
        
        // Botão para remover o item
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item-btn';
        removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>';
        removeBtn.addEventListener('click', function() {
            removeItem(listId, item.id);
        });
        
        // Montar o item completo
        listItem.appendChild(itemContent);
        listItem.appendChild(removeBtn);
        
        return listItem;
    }
    
    // Alternar o estado de um checkbox
    function toggleItemCheck(listId, itemId, isChecked) {
        // Atualizar no DOM
        const listItem = document.querySelector(`.list-card[data-list-id="${listId}"] .list-item[data-item-id="${itemId}"]`);
        if (listItem) {
            const itemText = listItem.querySelector('.item-text');
            if (isChecked) {
                itemText.classList.add('checked');
            } else {
                itemText.classList.remove('checked');
            }
        }
        
        // Atualizar no array
        const list = lists.find(l => l.id === listId);
        if (list) {
            const item = list.items.find(i => i.id === itemId);
            if (item) {
                item.checked = isChecked;
                saveToLocalStorage();
            }
        }
    }
    
    // Remover um item
    function removeItem(listId, itemId) {
        // Remover do DOM
        const listItem = document.querySelector(`.list-card[data-list-id="${listId}"] .list-item[data-item-id="${itemId}"]`);
        if (listItem) {
            listItem.remove();
        }
        
        // Remover do array
        const listIndex = lists.findIndex(l => l.id === listId);
        if (listIndex !== -1) {
            lists[listIndex].items = lists[listIndex].items.filter(i => i.id !== itemId);
            
            // Atualizar mensagem de itens vazios
            const listCard = document.querySelector(`.list-card[data-list-id="${listId}"]`);
            if (listCard) {
                const itemsList = listCard.querySelector('.items-list');
                const emptyItemsMessage = listCard.querySelector('.empty-items-message');
                
                if (itemsList.children.length === 0) {
                    emptyItemsMessage.style.display = 'block';
                }
            }
            
            saveToLocalStorage();
        }
    }
    
    // Remover uma lista
    function removeList(listId) {
        // Remover do DOM
        const listCard = document.querySelector(`.list-card[data-list-id="${listId}"]`);
        if (listCard) {
            listCard.remove();
        }
        
        // Remover do array
        lists = lists.filter(list => list.id !== listId);
        saveToLocalStorage();
        
        // Atualizar mensagem de lista vazia
        updateEmptyMessage();
    }
    
    // Event listeners
    createListBtn.addEventListener('click', createList);
    newListNameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            createList();
        }
    });
    
    // Inicialização - carregar dados do localStorage
    loadFromLocalStorage();
});