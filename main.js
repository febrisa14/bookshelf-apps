const books = [];
let booksResult = [];
let isSearch = false;
const SAVED_EVENT = 'saved-book';
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'books-shelf';

function isStorageExists() {
    return (typeof (Storage) === undefined) ? false : true;
}

document.addEventListener('DOMContentLoaded', function () {
    if (isStorageExists) {
        loadBooksFromStorage();
    }

    const bookForm = document.getElementById("inputBook");
    bookForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook();
    })

    const searchForm = document.getElementById("searchBook");
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        searchBook();
    })

    const checkBox = document.getElementById("inputBookIsComplete");
    checkBox.addEventListener("change", function (event) {
        event.preventDefault();
        if (this.checked) {
            document.getElementById("btnAddBookTeks").innerText = "Selesai dibaca";
        } else {
            document.getElementById("btnAddBookTeks").innerText = "Belum selesai dibaca";
        }
    })
})

function loadBooksFromStorage() {
    const initialData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(initialData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
    const id = +new Date();
    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = document.getElementById("inputBookYear").value;
    const isComplete = document.getElementById("inputBookIsComplete").checked;

    const book = generateBookObject(
        id,
        title,
        author,
        year,
        isComplete
    );

    books.push(book);

    removeValueInput();

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeValueInput() {
    document.getElementById("inputBookTitle").value = "";
    document.getElementById("inputBookAuthor").value = "";
    document.getElementById("inputBookYear").value = "";
    document.getElementById("inputBookIsComplete").checked = false;
    document.getElementById("btnAddBookTeks").innerText = "Belum selesai dibaca";
    document.getElementById("searchBookTitle").value = "";
    isSearch = false;
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function saveData() {
    if (isStorageExists()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const incompletedBooks = document.getElementById("incompleteBookshelfList");
    incompletedBooks.innerHTML = "";
    const completedBooks = document.getElementById("completeBookshelfList");
    completedBooks.innerHTML = "";

    if (isSearch) {
        for (const book of booksResult) {
            const bookElement = makeBook(book);
            if (book.isComplete) {
                completedBooks.append(bookElement);
            } else {
                incompletedBooks.append(bookElement);
            }
        }
    } else {
        for (const book of books) {
            const bookElement = makeBook(book);
            if (book.isComplete) {
                completedBooks.append(bookElement);
            } else {
                incompletedBooks.append(bookElement);
            }
        }
    }
})

function makeBook(book) {
    const container = document.createElement("article");
    container.classList.add("book_item");

    const titleElement = document.createElement("h3");
    titleElement.innerText = book.title;

    const authorElement = document.createElement("p");
    authorElement.innerText = "Penulis: " + book.author;

    const yearElement = document.createElement("p");
    yearElement.innerText = "Tahun: " + book.year;

    container.append(titleElement, authorElement, yearElement);

    const containerAction = document.createElement("div");
    containerAction.classList.add("action");

    const buttonRed = document.createElement("button");
    buttonRed.classList.add("red");
    buttonRed.setAttribute('id', `remove-${book.id}`);
    buttonRed.innerText = "Hapus buku";

    buttonRed.addEventListener("click", function () {
        removeBookFromTask(book.id);
    })

    if (book.isComplete) {
        const buttonIncompleted = document.createElement("button");
        buttonIncompleted.classList.add("green");
        buttonIncompleted.setAttribute('id', `add-${book.id}`);
        buttonIncompleted.innerText = "Belum selesai di Baca";

        buttonIncompleted.addEventListener("click", function () {
            addBookToIncompleted(book.id);
        })

        containerAction.append(buttonIncompleted, buttonRed);
        container.append(containerAction);
    } else {
        const buttonCompleted = document.createElement("button");
        buttonCompleted.classList.add("green");
        buttonCompleted.setAttribute('id', `add-${book.id}`);
        buttonCompleted.innerText = "Selesai dibaca";

        buttonCompleted.addEventListener("click", function () {
            addBookToCompleted(book.id);
        })

        containerAction.append(buttonCompleted, buttonRed);
        container.append(containerAction);
    }

    return container;
}

function findBook(bookId) {
    const index = findBookIndex(bookId);
    return books[index] ?? null;
}

function findBookIndex(bookId) {
    const index = books.map(book => book.id).indexOf(bookId);
    return index ?? -1;
}

function addBookToCompleted(bookId) {
    const book = findBook(bookId);

    if (book === null) return;

    book.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToIncompleted(bookId) {
    const book = findBook(bookId);


    if (book === null) return;

    book.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromTask(bookId) {
    if (confirm("Apakah anda yakin ingin menghapus buku ini ?") !== true) {
        return;
    }

    const book = findBookIndex(bookId);

    if (book === -1) return;

    books.splice(book, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function searchBook() {
    const inputSearch = document.getElementById("searchBookTitle").value;

    if (inputSearch !== "") {
        const searchValue = String(inputSearch.toLowerCase());
        const findBook = books.filter(book => book.title.toLowerCase().includes(searchValue));
        booksResult = findBook;
        isSearch = true;
    } else {
        isSearch = false;
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}