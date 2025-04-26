document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const createNoteBtn = document.getElementById('create-note-btn');
    const notesContainer = document.getElementById('notes-container');
    const emptyMessage = document.getElementById('empty-message');

    // Modais
    const noteModal = document.getElementById('note-modal');
    const noteModalTitle = document.getElementById('note-modal-title');
    const noteTitleInput = document.getElementById('note-title-input');
    const noteDescriptionInput = document.getElementById('note-description-input');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const cancelNoteBtn = document.getElementById('cancel-note-btn');

    const confirmModal = document.getElementById('confirm-modal-notes');
    const confirmYesBtn = document.getElementById('confirm-yes-notes');
    const confirmNoBtn = document.getElementById('confirm-no-notes');

    // Variáveis para controle
    let notes = [];
    let currentNoteId = null;
    let isEditingNote = false;
    let noteToDeleteId = null;

    // Chave para o localStorage
    const STORAGE_KEY = 'notes-data';

    // Carregar dados do localStorage
    function loadFromLocalStorage() {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            try {
                notes = JSON.parse(storedData);
                renderAllNotes();
            } catch (e) {
                console.error('Erro ao carregar dados do localStorage:', e);
                notes = [];
            }
        }
        updateEmptyMessage();
    }

    // Salvar dados no localStorage
    function saveToLocalStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }

    // Gerar ID único
    function generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Atualizar mensagem de lista vazia
    function updateEmptyMessage() {
        emptyMessage.style.display = notes.length === 0 ? 'block' : 'none';
    }

    // Abrir modal para criar nova nota
    function openCreateNoteModal() {
        noteModalTitle.textContent = 'Nova Nota';
        noteTitleInput.value = '';
        noteDescriptionInput.value = '';
        isEditingNote = false;
        currentNoteId = null;
        noteModal.classList.add('active');
        noteTitleInput.focus();
    }

    // Abrir modal para editar descrição
    function openEditDescriptionModal(noteId) {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;
        
        noteModalTitle.textContent = 'Editar Descrição';
        noteTitleInput.value = note.title;
        noteDescriptionInput.value = note.description;
        isEditingNote = true;
        currentNoteId = noteId;
        noteModal.classList.add('active');
        noteDescriptionInput.focus();
    }

    // Fechar modal de nota
    function closeNoteModal() {
        noteModal.classList.remove('active');
    }

    // Salvar nota (criar nova ou atualizar existente)
    function saveNote() {
        const title = noteTitleInput.value.trim();
        const description = noteDescriptionInput.value.trim();
        
        if (!title) {
            alert('Por favor, insira um título para a nota.');
            return;
        }
        
        if (isEditingNote && currentNoteId) {
            // Atualizar nota existente
            const noteIndex = notes.findIndex(n => n.id === currentNoteId);
            if (noteIndex !== -1) {
                notes[noteIndex].title = title;
                notes[noteIndex].description = description;
                
                // Atualizar no DOM
                const noteCard = document.querySelector(`.note-card[data-note-id="${currentNoteId}"]`);
                if (noteCard) {
                    noteCard.querySelector('.note-title').textContent = title;
                    noteCard.querySelector('.note-description').textContent = description;
                }
            }
        } else {
            // Criar nova nota
            const newNote = {
                id: generateId(),
                title: title,
                description: description
            };
            
            notes.push(newNote);
            renderNote(newNote);
        }
        
        saveToLocalStorage();
        updateEmptyMessage();
        closeNoteModal();
    }

    // Renderizar todas as notas
    function renderAllNotes() {
        // Limpar o container de notas, exceto a mensagem vazia
        const children = Array.from(notesContainer.children);
        children.forEach(child => {
            if (child !== emptyMessage) {
                child.remove();
            }
        });
        
        // Renderizar cada nota
        notes.forEach(note => {
            renderNote(note);
        });
    }

    // Renderizar uma nota
    function renderNote(note) {
        // Criar o elemento da nota
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.dataset.noteId = note.id;
        
        // Criar o cabeçalho da nota
        const noteHeader = document.createElement('div');
        noteHeader.className = 'note-header';
        
        const noteTitle = document.createElement('h2');
        noteTitle.className = 'note-title';
        noteTitle.textContent = note.title;
        
        const headerActions = document.createElement('div');
        headerActions.className = 'header-actions';
        
        // Removido o botão de editar título
        
        const removeNoteBtn = document.createElement('button');
        removeNoteBtn.className = 'remove-note-btn';
        removeNoteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
        removeNoteBtn.title = "Excluir nota";
        removeNoteBtn.addEventListener('click', () => showDeleteConfirmation(note.id));
        
        headerActions.appendChild(removeNoteBtn);
        
        noteHeader.appendChild(noteTitle);
        noteHeader.appendChild(headerActions);
        
        // Criar o conteúdo da nota
        const noteContent = document.createElement('div');
        noteContent.className = 'note-content';
        
        const noteDescription = document.createElement('div');
        noteDescription.className = 'note-description';
        noteDescription.textContent = note.description;
        
        const editDescriptionBtn = document.createElement('button');
        editDescriptionBtn.className = 'edit-description-btn';
        editDescriptionBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
        editDescriptionBtn.title = "Editar descrição";
        editDescriptionBtn.addEventListener('click', () => openEditDescriptionModal(note.id));
        
        noteContent.appendChild(noteDescription);
        noteContent.appendChild(document.createElement('br'));
        noteContent.appendChild(editDescriptionBtn);
        
        // Montar a nota completa
        noteCard.appendChild(noteHeader);
        noteCard.appendChild(noteContent);
        
        // Adicionar ao container
        notesContainer.appendChild(noteCard);
    }

    // Mostrar confirmação de exclusão
    function showDeleteConfirmation(noteId) {
        noteToDeleteId = noteId;
        confirmModal.classList.add('active');
    }

    // Fechar o modal de confirmação
    function closeConfirmModal() {
        confirmModal.classList.remove('active');
        noteToDeleteId = null;
    }

    // Confirmar exclusão da nota
    function confirmDeleteNote() {
        if (noteToDeleteId) {
            removeNote(noteToDeleteId);
            closeConfirmModal();
        }
    }

    // Remover uma nota
    function removeNote(noteId) {
        // Remover do DOM
        const noteCard = document.querySelector(`.note-card[data-note-id="${noteId}"]`);
        if (noteCard) {
            noteCard.remove();
        }
        
        // Remover do array
        notes = notes.filter(note => note.id !== noteId);
        saveToLocalStorage();
        
        // Atualizar mensagem de nota vazia
        updateEmptyMessage();
    }

    // Event listeners para os modais
    createNoteBtn.addEventListener('click', openCreateNoteModal);
    saveNoteBtn.addEventListener('click', saveNote);
    cancelNoteBtn.addEventListener('click', closeNoteModal);

    confirmYesBtn.addEventListener('click', confirmDeleteNote);
    confirmNoBtn.addEventListener('click', closeConfirmModal);

    // Fechar os modais ao clicar fora deles
    noteModal.addEventListener('click', function(e) {
        if (e.target === noteModal) {
            closeNoteModal();
        }
    });

    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            closeConfirmModal();
        }
    });

    // Tecla Enter para salvar nota
    noteTitleInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            noteDescriptionInput.focus();
        }
    });

    noteDescriptionInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            saveNote();
        }
    });

    // Inicialização - carregar dados do localStorage
    loadFromLocalStorage();
});