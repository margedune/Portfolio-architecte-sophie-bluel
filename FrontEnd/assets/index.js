const response = await fetch('http://localhost:5678/api/works');
const works = await response.json();
console.log(works);

function listWorks() {
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

listWorks();
