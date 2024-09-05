const api = 'http://localhost:5678/api';

const editSiteModal = document.getElementById('modal-edit-site');
const editSiteButton = document.getElementById('btn-edit-site');
const closeModalButton = document.querySelector('.close');
const addImageForm = document.getElementById('add-image-form');
const galleryModal = document.querySelector('.modal-gallery');
const addImageButton = document.getElementById('btn-add-image');
const cancelAddImageButton = document.getElementById('cancel-add-image');
const imageUploadForm = document.getElementById('image-upload-form');
const figureList = document.querySelector(".figure-list");
const menuLogin = document.querySelector('#menu-login');
const menuLogout = document.querySelector('#menu-logout');

var works = [];
var sectionGalery = null;

// Fonction pour charger et initialiser la galerie principale
async function initializeGallery() {
    try {
        const responseWorks = await fetch(`${api}/works`);
        works = await responseWorks.json();
        sectionGalery = document.querySelector(".gallery");
        listWorks(works, sectionGalery);
    } catch (error) {
        console.error("Erreur lors de la récupération des travaux :", error);
    }
}

// Initialiser la galerie principale
initializeGallery();

// Fonction pour gérer le clic sur les boutons de catégorie
const btnCategories = document.querySelectorAll('.category-item');
btnCategories.forEach(function(btnCategory) {
    btnCategory.addEventListener('click', function() {
        btnCategories.forEach(function(btn) {
            btn.classList.remove('active')
        });
        this.classList.add('active');

        const category = btnCategory.textContent;
        const filteredWorks = filterWorkByCategory(category);
        removeWorks(sectionGalery);
        listWorks(filteredWorks, sectionGalery);
    });
});

// Affichage de l'option d'édition si l'utilisateur est connecté
const editSite = document.querySelector('.edit-site');
const token = localStorage.getItem('token');
if (token !== null) {
    editSite.style.display = 'flex';
    // Menu login et logout
    menuLogin.style.display = 'none';
    menuLogout.style.display = 'flex';
}

// Fonction pour lister les travaux
function listWorks(works, targetElement, caption = true, edit = false) {
    targetElement.innerHTML = ''; // Clear existing content
    works.forEach(function(work) {
        const figureElement = document.createElement("figure");

        const imageElement = document.createElement("img");
        imageElement.src = work.imageUrl;
        imageElement.alt = work.title;
        imageElement.id = work.id;
        figureElement.appendChild(imageElement);
    
        // Afficher la caption de l'image
        if (caption === true) {
            const figcaptionElement = document.createElement("figcaption");
            figcaptionElement.append(work.title);
            figureElement.appendChild(figcaptionElement);
        }

        // Ajouter un bouton supprimer sur chaque image
        if (edit === true) {
            const deleteWorkButton = document.createElement("img");
            deleteWorkButton.src = './assets/images/delete.png';
            deleteWorkButton.classList.add('delete-work-button');
            deleteWorkButton.setAttribute("workId", work.id);
            imageElement.classList.add('main-image');
            figureElement.appendChild(deleteWorkButton);
        }

        targetElement.appendChild(figureElement);
    });

    // Attacher les gestionnaires d'événements (écouteurs d'évenement) de suppression après avoir listé les travaux
    attachDeleteEventListeners(targetElement);
}

// Filtrer les travaux par catégorie
function filterWorkByCategory(category) {
    if (category === 'Tous') {
        return works;
    }

    const filteredWorks = works.filter(function(work) {
        return work.category.name === category;
    });

    return filteredWorks;
}

// Supprimer tous les travaux du DOM
function removeWorks(targetElement) {
    targetElement.innerHTML = '';
}

// Fonction pour afficher le modal
function showModal(modalElement) {
    modalElement.style.display = 'block';
}

// Fonction pour masquer le modal
function hideModal(modalElement) {
    modalElement.style.display = 'none';
}

// Fonction pour mettre à jour le contenu du modal
async function updateModalContent() {
    try {
        const responseWorks = await fetch(`${api}/works`);
        const works = await responseWorks.json();
        listWorks(works, figureList, false, true);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du contenu du modal :", error);
    }
}

// Attacher les gestionnaires d'événements de suppression
function attachDeleteEventListeners(targetElement) {
    const deleteWorkButtons = targetElement.querySelectorAll('.delete-work-button');
    deleteWorkButtons.forEach(function(deleteWorkButton) {
        deleteWorkButton.addEventListener('click', async function(event) {
            event.stopPropagation(); // Empêche la propagation si nécessaire
            const workId = this.getAttribute('workId');
            try {
                const deleteWork = await fetch(`${api}/works/${workId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (deleteWork.status === 204) {
                    // Re-fetch the updated works list and update the modal
                    // Re attribuer la mise à jour des listes travaux (figure) et travaux (modal)
                    await updateModalContent(); // Mise à jour du contenu du modal
                }
            } catch (error) {
                console.error("Erreur lors de la suppression :", error);
            }
        });
    });
}

// Événements pour ouvrir et fermer le modal
editSiteButton.addEventListener('click', function() {
    updateModalContent();  // Mettre à jour le contenu
    showModal(editSiteModal); // Afficher le modal
    addImageForm.style.display = 'none'; // Masquer le formulaire d'ajout d'image au début
    galleryModal.style.display = 'block'; // Afficher la galerie d'images
});
closeModalButton.addEventListener('click', function() {
     hideModal(editSiteModal);
});
window.addEventListener('click', function(event) {
    if (event.target === editSiteModal) {
        hideModal(editSiteModal);
    }
});

// Afficher le formulaire d'ajout d'image
addImageButton.addEventListener('click', async function() {
    galleryModal.style.display = 'none'; // Masquer la galerie d'images
    addImageForm.style.display = 'block'; // Afficher le formulaire d'ajout d'image

    // Générer les options catégories
    const imageCategorySelect = document.getElementById('category');
    imageCategorySelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    imageCategorySelect.appendChild(defaultOption);
    const categoriesResponse = await fetch(`${api}/categories`); 
    const categories = await categoriesResponse.json();
    categories.forEach(function (category) {
        const option = document.createElement('option');
        option.value = category.id;
        option.innerText = category.name;
        imageCategorySelect.appendChild(option);
    });
});

// Gérer la soumission du formulaire d'ajout d'image (l'envoie de nouvelles images à l'API)
imageUploadForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(imageUploadForm);
    try {
        const response = await fetch(`${api}/works`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });
        
        if (response.ok) {
            // Recharger la galerie après l'ajout
            await updateModalContent();
            addImageForm.style.display = 'none'; // Masquer le formulaire d'ajout d'image
            galleryModal.style.display = 'block'; // Afficher la galerie d'images
        } else {
            console.error("Erreur lors de l'ajout de l'image.");
        }
    } catch (error) {
        console.error("Erreur lors de la soumission du formulaire :", error);
    }
});
// Aperçu image avant upload
document.getElementById('file-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.loaded-image').style.backgroundImage = `url(${e.target.result})`;
            document.querySelector('.icon-add-image').style.display = 'none';
            document.querySelector('.btn-add-image').style.display = 'none';
            document.querySelector('#add-image-file span').style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
});

// Se déconnecter
menuLogout.addEventListener('click', function() {
    logout();
});

function logout()
{
    localStorage.removeItem('token');
    location.reload();
}
