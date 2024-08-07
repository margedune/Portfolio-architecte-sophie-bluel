const api = 'http://localhost:5678/api';

const responseWorks = await fetch(`${api}/works`);
const works = await responseWorks.json();

function listWorks(works) {
    for (let i = 0; i < works.length; i++) {
        const sectionGalery = document.querySelector(".gallery");
        
        const figureElement = document.createElement("figure");

        const imageElement = document.createElement("img");
        imageElement.src = works[i].imageUrl;
        imageElement.alt = works[i].title;

        const figcaptionElement = document.createElement("figcaption");
        figcaptionElement.append(works[i].title);
        
        sectionGalery.appendChild(figureElement);
        figureElement.appendChild(imageElement);
        figureElement.appendChild(figcaptionElement);
    }
}

listWorks(works);

const btnCategories = document.querySelectorAll('.category-item');
btnCategories.forEach(btnCategory => {
    btnCategory.addEventListener('click', function() {
        btnCategories.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const worksFiltered = filterWorkByCategory(btnCategory.textContent);
        if (worksFiltered.length > 0) {
            removeWorks();
            listWorks(worksFiltered);
        }
    });
});

function filterWorkByCategory(category)
{
    if (category === 'Tous') {
        return works;
    }

    const worksFiltered = works.filter(function(work) {
        return work.category.name === category;
    });

    return worksFiltered;
}

function removeWorks()
{
    const sectionGalery = document.querySelector(".gallery");
    sectionGalery.innerHTML = '';
}
