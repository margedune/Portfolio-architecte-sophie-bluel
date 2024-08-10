const api = 'http://localhost:5678/api';
var works = [];
var sectionGalery = null;

// Fonction pour charger les travaux et initialiser la galerie
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

// Appel initial pour charger les données
initializeGallery();

// Gestionnaires pour les boutons de catégorie
const btnCategories = document.querySelectorAll('.category-item');
btnCategories.forEach(btnCategory => {
    btnCategory.addEventListener('click', function() {
        btnCategories.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const worksFiltered = filterWorkByCategory(btnCategory.textContent);
        removeWorks(sectionGalery);
        listWorks(worksFiltered, sectionGalery);
    });
});

// Affichage de l'option d'édition si une session est présente
const editSite = document.querySelector('.edit-site');
const params = getQueryParams();
const session = params.session;
if (session !== undefined) {
    editSite.style.display = 'flex';
}

// Fonction pour lister les travaux
function listWorks(works, targetElement, caption = true, edit = false) {
    works.forEach(work => {
        const figureElement = document.createElement("figure");

        const imageElement = document.createElement("img");
        imageElement.src = work.imageUrl;
        imageElement.alt = work.title;
        imageElement.id = work.id;
        figureElement.appendChild(imageElement);

        if (caption) {
            const figcaptionElement = document.createElement("figcaption");
            figcaptionElement.append(work.title);
            figureElement.appendChild(figcaptionElement);
        }

        if (edit) {
            const deleteWorkButton = document.createElement("img");
            deleteWorkButton.src = './assets/images/delete.png';
            deleteWorkButton.classList.add('delete-work-button');
            deleteWorkButton.setAttribute("workId", work.id);
            imageElement.classList.add('main-image');
            figureElement.appendChild(deleteWorkButton);
        }

        targetElement.appendChild(figureElement);
    });

    // Attacher les gestionnaires d'événements de suppression après avoir listé les travaux
    attachDeleteEventListeners(targetElement);
}

// Filtrer les travaux par catégorie
function filterWorkByCategory(category) {
    return category === 'Tous' 
        ? works 
        : works.filter(work => work.category.name === category);
}

// Supprimer tous les travaux du DOM
function removeWorks(targetElement) {
    targetElement.innerHTML = '';
}

// Récupérer les paramètres de l'URL
function getQueryParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const params = {};
    urlParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}

// Gestion du modal d'édition
const editSiteModal = document.getElementById('modal-edit-site');
const editSiteButton = document.getElementById('btn-edit-site');
const closeModalButton = document.querySelector('.close');

// Ouvrir le modal
function openModal() {
    const galleryModal = document.querySelector('.modal-gallery');
    listWorks(works, galleryModal, false, true);
    editSiteModal.style.display = 'block';
}

// Fermer le modal
function closeModal() {
    const galleryModal = document.querySelector('.modal-gallery');
    removeWorks(galleryModal);
    editSiteModal.style.display = 'none';
}

// Événements pour ouvrir et fermer le modal
editSiteButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target === editSiteModal) {
        closeModal();
    }
});

// Attacher les gestionnaires d'événements de suppression
function attachDeleteEventListeners(targetElement) {
    const deleteWorkButtons = targetElement.querySelectorAll('.delete-work-button');
    deleteWorkButtons.forEach(deleteWorkButton => {
        deleteWorkButton.addEventListener('click', async function(event) {
            event.stopPropagation(); // Empêche la propagation si nécessaire
            const workId = this.getAttribute('workId');
            try {
                const deleteWork = await fetch(`${api}/works/${workId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Berear ${session}`
                    }
                });
                if (deleteWork.status === 204) {
                    const galleryModal = document.querySelector('.modal-gallery');
                    const responseWorks = await fetch(`${api}/works`);
                    const updatedWorks = await responseWorks.json();
                    removeWorks(galleryModal);
                    listWorks(updatedWorks, galleryModal, false, true);
                }
            } catch (error) {
                console.error("Erreur lors de la suppression :", error);
            }
        });
    });
}
